#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const os = require("os");
const { exec } = require("child_process");
const React = require("react");
const { render, Box, Text, useInput, useApp, useStdout } = require("ink");
const TextInputModule = require("ink-text-input");
const TextInput = TextInputModule.default || TextInputModule;
const h = React.createElement;

const MODELS = [
  { rank: 1, id: "openai/gpt-4.1-mini", label: "Xcode 3 Pro" },
  { rank: 2, id: "openai/gpt-4o-mini", label: "Xcode 2.5 Flash" },
  { rank: 3, id: "qwen/qwen-2.5-7b-instruct", label: "Xcode 2.5 Core" },
  { rank: 4, id: "mistralai/mistral-small-latest", label: "Xcode 2 Lite" },
];

const DEFAULT_MODEL = MODELS[0].id;
const CLI_VERSION = "v0.1.2";
const API_URL = "https://openrouter.ai/api/v1/chat/completions";

const helpText = `Xcode CLI

Usage:
  xcode                 Start interactive agent session
  xcode help            Show help
  xcode init            Initialize a workspace config in the current folder
  xcode model           Show current model
  xcode model list      List available models
  xcode model set NAME  Set model (use --global to save to global config)
  xcode plan TASK       Generate a short plan for a task
  xcode usage           Show usage totals for this session

Interactive slash commands:
  /help /model /plan /usage /exit
`;

const SLASH_COMMANDS = [
  { cmd: "/help", desc: "Show help" },
  { cmd: "/model", desc: "Show or set the model" },
  { cmd: "/plan", desc: "Generate a short plan" },
  { cmd: "/usage", desc: "Show usage totals" },
  { cmd: "/exit", desc: "Exit the session" },
];

const BANNER_LINES = [
  ">>>   XX   XX  CCCCC   OOOOO   DDDDD   EEEEE",
  ">>    XX   XX C     C O     O  D    D  E    ",
  ">     XX X XX C       O     O  D     D EEEE ",
  ">     XXX XXX C       O     O  D     D EEEE ",
  ">>    XX   XX C     C O     O  D    D  E    ",
  ">>>   XX   XX  CCCCC   OOOOO   DDDDD   EEEEE",
];

const LOADER_FRAMES = ["[#    ]", "[ #   ]", "[  #  ]", "[   # ]", "[    #]"];
const BANNER_IMAGE_PATH = path.resolve(__dirname, "..", "assets", "xcode.png");

function readPngSize(filePath) {
  try {
    const fd = fs.openSync(filePath, "r");
    const header = Buffer.alloc(24);
    fs.readSync(fd, header, 0, 24, 0);
    fs.closeSync(fd);
    const width = header.readUInt32BE(16);
    const height = header.readUInt32BE(20);
    if (!width || !height) return null;
    return { width, height };
  } catch (error) {
    return null;
  }
}

const SYSTEM_PROMPT =
  "You are Xcode, an agentic programming CLI. Use tools to read, write, edit files, list directories, and run commands when needed. Ask clarifying questions when unsure. Keep responses concise.";

const THEME = {
  text: "#cbd5f5",
  muted: "#8b93a7",
  accent: "#b189ff",
  prompt: "#c17dff",
  warning: "#f2c94c",
  border: "#55607a",
  badge: "#d8d16c",
  banner: ["#5ea1ff", "#6e9bff", "#878dfb", "#9d7ff1", "#b273e0", "#c36ccc"],
};

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  const raw = fs.readFileSync(filePath, "utf8");
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const idx = trimmed.indexOf("=");
    if (idx === -1) continue;
    const key = trimmed.slice(0, idx).trim();
    const value = trimmed.slice(idx + 1).trim();
    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

function getPaths(cwd) {
  const globalDir = path.join(os.homedir(), ".xcode");
  return {
    globalDir,
    globalConfigPath: path.join(globalDir, "config.json"),
    workspaceConfigPath: path.join(cwd, ".xcode", "config.json"),
    usagePath: path.join(globalDir, "usage.json"),
  };
}

function readJson(filePath) {
  if (!fs.existsSync(filePath)) return null;
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (error) {
    return null;
  }
}

function writeJson(filePath, data) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

function loadConfig(cwd) {
  const paths = getPaths(cwd);
  const workspace = readJson(paths.workspaceConfigPath);
  if (workspace) {
    return { config: workspace, scope: "workspace", paths };
  }
  const globalConfig = readJson(paths.globalConfigPath);
  if (globalConfig) {
    return { config: globalConfig, scope: "global", paths };
  }
  return {
    config: { model: DEFAULT_MODEL, allowExec: false },
    scope: "default",
    paths,
  };
}

function saveConfig(cwd, config, scope) {
  const paths = getPaths(cwd);
  if (scope === "global") {
    writeJson(paths.globalConfigPath, config);
    return paths.globalConfigPath;
  }
  writeJson(paths.workspaceConfigPath, config);
  return paths.workspaceConfigPath;
}

function loadUsage(cwd) {
  const { usagePath } = getPaths(cwd);
  return readJson(usagePath) || { totalRequests: 0, totalTokens: 0 };
}

function saveUsage(cwd, usage) {
  const { usagePath } = getPaths(cwd);
  writeJson(usagePath, usage);
}

function printModels(currentModel) {
  process.stdout.write("Available models:\n");
  for (const model of MODELS) {
    const marker = model.id === currentModel ? " * " : "   ";
    process.stdout.write(`${marker}${model.label} (${model.id})\n`);
  }
}

function findModelById(id) {
  return MODELS.find((model) => model.id === id) || null;
}

function findModelByLabel(label) {
  const needle = String(label || "").toLowerCase();
  return MODELS.find((model) => model.label.toLowerCase() === needle) || null;
}

function resolveModelInput(input) {
  if (!input) return null;
  return findModelById(input) || findModelByLabel(input);
}

function ensureApiKey(cwd) {
  if (process.env.OPENROUTER_API_KEY) return true;
  loadEnvFile(path.join(cwd, ".env"));
  loadEnvFile(path.join(os.homedir(), ".xcode", ".env"));
  return Boolean(process.env.OPENROUTER_API_KEY);
}

function resolvePath(inputPath, cwd) {
  if (!inputPath) return null;
  if (path.isAbsolute(inputPath)) return path.normalize(inputPath);
  return path.resolve(cwd, inputPath);
}

function createTools(cwd, allowExec, confirmRun) {
  const tools = [
    {
      type: "function",
      function: {
        name: "read_file",
        description: "Read a text file from disk.",
        parameters: {
          type: "object",
          properties: {
            path: { type: "string", description: "Path to the file." },
            max_bytes: { type: "number", description: "Max bytes to read." },
          },
          required: ["path"],
        },
      },
    },
    {
      type: "function",
      function: {
        name: "write_file",
        description: "Write content to a file, creating directories as needed.",
        parameters: {
          type: "object",
          properties: {
            path: { type: "string", description: "Path to the file." },
            content: { type: "string", description: "File content." },
            overwrite: { type: "boolean", description: "Overwrite existing file." },
          },
          required: ["path", "content"],
        },
      },
    },
    {
      type: "function",
      function: {
        name: "edit_file",
        description: "Find and replace text in a file.",
        parameters: {
          type: "object",
          properties: {
            path: { type: "string", description: "Path to the file." },
            search: { type: "string", description: "Text to find." },
            replace: { type: "string", description: "Replacement text." },
            match_all: { type: "boolean", description: "Replace all matches." },
          },
          required: ["path", "search", "replace"],
        },
      },
    },
    {
      type: "function",
      function: {
        name: "list_dir",
        description: "List a directory and its contents.",
        parameters: {
          type: "object",
          properties: {
            path: { type: "string", description: "Directory path." },
            depth: { type: "number", description: "Depth to traverse." },
          },
          required: ["path"],
        },
      },
    },
    {
      type: "function",
      function: {
        name: "run_command",
        description: "Run a shell command in a working directory.",
        parameters: {
          type: "object",
          properties: {
            command: { type: "string", description: "Command to execute." },
            cwd: { type: "string", description: "Working directory." },
          },
          required: ["command"],
        },
      },
    },
  ];

  async function runTool(name, args) {
    try {
      switch (name) {
        case "read_file": {
          const filePath = resolvePath(args.path, cwd);
          const maxBytes = Number(args.max_bytes) || 20000;
          const data = fs.readFileSync(filePath, "utf8");
          return data.slice(0, maxBytes);
        }
        case "write_file": {
          const filePath = resolvePath(args.path, cwd);
          if (!args.overwrite && fs.existsSync(filePath)) {
            throw new Error("File exists and overwrite is false.");
          }
          fs.mkdirSync(path.dirname(filePath), { recursive: true });
          fs.writeFileSync(filePath, args.content, "utf8");
          return `Wrote ${args.content.length} bytes to ${filePath}`;
        }
        case "edit_file": {
          const filePath = resolvePath(args.path, cwd);
          const original = fs.readFileSync(filePath, "utf8");
          const matchAll = Boolean(args.match_all);
          const replaced = matchAll
            ? original.split(args.search).join(args.replace)
            : original.replace(args.search, args.replace);
          if (replaced === original) {
            return "No changes made (search text not found).";
          }
          fs.writeFileSync(filePath, replaced, "utf8");
          return "File updated.";
        }
        case "list_dir": {
          const dirPath = resolvePath(args.path, cwd);
          const depth = Number(args.depth) || 1;
          const lines = [];
          function walk(current, level) {
            if (level > depth) return;
            const entries = fs.readdirSync(current, { withFileTypes: true });
            for (const entry of entries) {
              const entryPath = path.join(current, entry.name);
              const rel = path.relative(dirPath, entryPath);
              lines.push(`${entry.isDirectory() ? "dir " : "file"} ${rel}`);
              if (entry.isDirectory()) walk(entryPath, level + 1);
            }
          }
          walk(dirPath, 1);
          return lines.join("\n");
        }
        case "run_command": {
          const command = args.command;
          const runCwd = args.cwd ? resolvePath(args.cwd, cwd) : cwd;
          if (!allowExec) {
            const approved = await confirmRun(command);
            if (!approved) {
              return "Command execution blocked by user.";
            }
          }
          return await new Promise((resolve) => {
            exec(command, { cwd: runCwd, maxBuffer: 1024 * 1024 }, (error, stdout, stderr) => {
              if (error) {
                resolve(`Command failed: ${error.message}\n${stderr || ""}`);
                return;
              }
              resolve(`${stdout}${stderr ? `\n${stderr}` : ""}`.trim());
            });
          });
        }
        default:
          return `Unknown tool: ${name}`;
      }
    } catch (error) {
      return `Tool error: ${error.message}`;
    }
  }

  return { tools, runTool };
}

function formatElapsed(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const pad = (value) => String(value).padStart(2, "0");
  return `${pad(minutes)}:${pad(seconds)}`;
}

async function callModel({ model, messages, tools, signal }) {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "http://localhost",
      "X-Title": "Xcode CLI",
    },
    body: JSON.stringify({
      model,
      messages,
      tools,
      tool_choice: "auto",
      temperature: 0.2,
    }),
    signal,
  });

  if (!response.ok) {
    const errorText = await response.text();
    const toolSupportError = response.status === 404 && /support tool use/i.test(errorText || "");
    if (toolSupportError && tools && tools.length > 0) {
      throw new Error(
        "Model request failed: this model does not support tool use on OpenRouter. " +
          "Pick a tools-capable model with `xcode model set <name>` (e.g. openai/gpt-4o-mini, " +
          "openai/gpt-4.1-mini, anthropic/claude-3.5-sonnet)."
      );
    }
    throw new Error(`Model request failed: ${response.status} ${errorText}`);
  }

  return response.json();
}

async function runAgentCore({ cwd, model, messages, confirmRun, signal }) {
  const { tools, runTool } = createTools(cwd, model.allowExec, confirmRun);
  const systemPrompt = { role: "system", content: SYSTEM_PROMPT };
  const maxIterations = 6;
  let iteration = 0;
  const usageTotals = { totalRequests: 0, totalTokens: 0 };
  const toolOutputs = [];

  while (iteration < maxIterations) {
    iteration += 1;
    const payloadMessages = [systemPrompt, ...messages];
    const data = await callModel({ model: model.model, messages: payloadMessages, tools, signal });
    usageTotals.totalRequests += 1;
    usageTotals.totalTokens += data.usage?.total_tokens || 0;
    const message = data.choices?.[0]?.message;
    if (!message) {
      throw new Error("Model returned no message.");
    }

    if (message.tool_calls && message.tool_calls.length > 0) {
      messages.push({
        role: "assistant",
        content: message.content || "",
        tool_calls: message.tool_calls,
      });
      for (const toolCall of message.tool_calls) {
        const name = toolCall.function?.name;
        const rawArgs = toolCall.function?.arguments || "{}";
        let args = {};
        try {
          args = JSON.parse(rawArgs);
        } catch (error) {
          args = {};
        }
        const result = await runTool(name, args);
        toolOutputs.push({ name, content: String(result) });
        messages.push({
          role: "tool",
          tool_call_id: toolCall.id,
          name,
          content: String(result),
        });
      }
      continue;
    }

    return { content: message.content || "", usage: usageTotals, toolOutputs };
  }

  return { content: "Reached tool iteration limit.", usage: usageTotals, toolOutputs };
}

async function runPlan({ model, task, usage }) {
  const systemPrompt = {
    role: "system",
    content: "You are a planning assistant. Provide a concise, actionable plan.",
  };
  const messages = [systemPrompt, { role: "user", content: task }];
  const data = await callModel({ model: model.model, messages, tools: [] });
  if (usage) {
    usage.totalRequests += 1;
    usage.totalTokens += data.usage?.total_tokens || 0;
  }
  const message = data.choices?.[0]?.message?.content || "";
  return message.trim();
}

function Banner({ InkImage }) {
  const { stdout } = useStdout();
  const columns = stdout && stdout.columns ? stdout.columns : 120;
  const targetWidth = Math.min(Math.max(Math.floor(columns * 0.9), 60), 160);
  const imageSize = fs.existsSync(BANNER_IMAGE_PATH) ? readPngSize(BANNER_IMAGE_PATH) : null;
  const aspectRatio = imageSize ? imageSize.width / imageSize.height : 4.2;
  const cellAspect = Number(process.env.XCODE_CELL_ASPECT || 1);
  const targetHeight = Math.max(Math.round((targetWidth / aspectRatio) / cellAspect), 6);
  const protocol =
    process.env.XCODE_IMAGE_PROTOCOL || (process.env.WT_SESSION ? "halfBlock" : "auto");
  if (InkImage && fs.existsSync(BANNER_IMAGE_PATH)) {
    return h(
      Box,
      { flexDirection: "column", marginBottom: 1 },
      h(InkImage, {
        src: BANNER_IMAGE_PATH,
        alt: "Xcode",
        width: targetWidth,
        height: targetHeight,
        protocol,
      })
    );
  }

  return h(
    Box,
    { flexDirection: "column", marginBottom: 1 },
    BANNER_LINES.map((line, idx) =>
      h(Text, { key: `banner-${idx}`, color: THEME.banner[idx % THEME.banner.length] }, line)
    )
  );
}

function Tips() {
  return h(
    Box,
    { flexDirection: "column", marginBottom: 1 },
    h(Text, { color: THEME.muted }, "Tips for getting started:"),
    h(Text, { color: THEME.muted }, "1. Ask questions, edit files, or run commands."),
    h(Text, { color: THEME.muted }, "2. Be specific for the best results."),
    h(
      Text,
      { color: THEME.muted },
      "3. ",
      h(Text, { color: THEME.accent }, "/help"),
      " for more information."
    )
  );
}

function getCommandMatches(input) {
  if (!input.startsWith("/")) return [];
  const token = input.slice(1).trim().split(/\s+/)[0].toLowerCase();
  if (!token) return SLASH_COMMANDS;
  return SLASH_COMMANDS.filter((item) => item.cmd.slice(1).startsWith(token));
}

function MiniLabel() {
  return h(Text, { color: THEME.badge, bold: true }, "xcode");
}

function UsageLine({ cwd }) {
  const files = ["XCODE.md", "xcode.md", "GEMINI.md", "gemini.md"].filter((name) =>
    fs.existsSync(path.join(cwd, name))
  );
  if (files.length === 0) {
    return h(Text, { color: THEME.muted }, "Using: 0 context files");
  }
  const fileLabel = files.length === 1 ? "file" : "files";
  return h(Text, { color: THEME.muted }, `Using: ${files.length} ${files[0]} ${fileLabel}`);
}

function InputPrefix() {
  return h(Text, { color: THEME.muted }, "(r:)");
}

function MessageLine({ role, content }) {
  const lines = String(content).trim().split(/\r?\n/);
  if (role === "user") {
    return h(
      Box,
      { flexDirection: "column", marginBottom: 1 },
      lines.map((line, idx) =>
        h(Text, { key: `${role}-${idx}`, color: THEME.prompt }, `${idx === 0 ? "> " : "  "}${line}`)
      )
    );
  }
  if (role === "tool") {
    const label = lines.shift() || "";
    return h(
      Box,
      { flexDirection: "column", marginBottom: 1 },
      h(Text, { color: THEME.muted }, `tool: ${label}`),
      h(
        Box,
        { borderStyle: "classic", paddingLeft: 1, paddingRight: 1, marginTop: 0 },
        h(
          Box,
          { flexDirection: "column" },
          lines.length > 0
            ? lines.map((line, idx) =>
                h(Text, { key: `tool-${idx}`, color: THEME.text }, line || " ")
              )
            : h(Text, { color: THEME.text }, "(no output)")
        )
      )
    );
  }
  return h(
    Box,
    { flexDirection: "column", marginBottom: 1 },
    lines.map((line, idx) =>
      h(Text, { key: `${role}-${idx}`, color: THEME.text }, `${idx === 0 ? "* " : "  "}${line}`)
    )
  );
}

function Suggestions({ items, showNotFound }) {
  return h(
    Box,
    { flexDirection: "column", marginTop: 1 },
    items.length > 0
      ? items.map((item) =>
          h(
            Box,
            { key: item.cmd, flexDirection: "row" },
            h(Text, { color: THEME.accent }, `  ${item.cmd.padEnd(8)}`),
            h(Text, { color: THEME.muted }, ` ${item.desc}`)
          )
        )
      : h(Text, { color: THEME.warning }, showNotFound ? "Command not found." : " ")
  );
}

function Loader({ elapsedMs, frameIndex }) {
  const frame = LOADER_FRAMES[frameIndex % LOADER_FRAMES.length];
  return h(
    Box,
    { marginTop: 1 },
    h(
      Text,
      { color: THEME.accent },
      `${frame} Under Progress... (${formatElapsed(elapsedMs)}, esc to cancel)`
    )
  );
}

function ConfirmPrompt({ command }) {
  return h(
    Box,
    { marginTop: 1 },
    h(Text, { color: THEME.warning }, `Allow command execution? "${command}" (y/N)`)
  );
}

function InputHint({ visible }) {
  if (!visible) return null;
  return h(
    Box,
    { marginTop: 1 },
    h(Text, { color: THEME.muted }, "Type your message or @path/to/file")
  );
}

function InputBar({ value, onChange, onSubmit, disabled }) {
  return h(
    Box,
    {
      borderStyle: "single",
      borderColor: THEME.border,
      paddingLeft: 1,
      paddingRight: 1,
    },
    h(InputPrefix),
    h(Text, null, " "),
    h(TextInput, { value, onChange, onSubmit, focus: !disabled, placeholder: "Type your message" })
  );
}

function StatusBar({ model, cwd, allowExec }) {
  const { stdout } = useStdout();
  const width = stdout && stdout.columns ? Math.max(stdout.columns - 2, 20) : 60;
  const left = `${cwd.replace(/^(.{2}).+(.{30})$/, "$1...$2")}`.padEnd(Math.floor(width / 2));
  const center = "no sandbox (see /docs)";
  const modelName = findModelById(model)?.label || model;
  const right = `Auto (${modelName}) /model`;
  return h(
    Box,
    { marginTop: 1 },
    h(
      Box,
      { width: "100%", justifyContent: "space-between" },
      h(Text, { color: THEME.muted }, left.trimEnd()),
      h(Text, { color: THEME.warning }, center),
      h(Text, { color: THEME.muted }, right)
    )
  );
}

function ModelPicker({ models, selectedIndex }) {
  return h(
    Box,
    { flexDirection: "column", marginTop: 1 },
    h(Text, { color: THEME.muted }, "Select a model (↑/↓, Enter to apply, Esc to cancel):"),
    models.map((model, idx) => {
      const selected = idx === selectedIndex;
      return h(
        Text,
        {
          key: model.id,
          color: selected ? THEME.text : THEME.muted,
          backgroundColor: selected ? "#2b3147" : undefined,
        },
        `${selected ? "▸ " : "  "}${model.label}`
      );
    })
  );
}

function App({ cwd, configState, usage, InkImage }) {
  const { exit } = useApp();
  const [input, setInput] = React.useState("");
  const [messages, setMessages] = React.useState([]);
  const [sessionUsage, setSessionUsage] = React.useState({ totalRequests: 0, totalTokens: 0 });
  const [config, setConfig] = React.useState(configState.config);
  const [loading, setLoading] = React.useState(false);
  const [spinnerIndex, setSpinnerIndex] = React.useState(0);
  const [elapsedMs, setElapsedMs] = React.useState(0);
  const [confirmRequest, setConfirmRequest] = React.useState(null);
  const [modelPickerActive, setModelPickerActive] = React.useState(false);
  const [modelPickerIndex, setModelPickerIndex] = React.useState(0);
  const modelMessagesRef = React.useRef([]);
  const abortRef = React.useRef(null);

  const matches = getCommandMatches(input);
  const showSuggestions =
    input.startsWith("/") && input.length > 0 && !confirmRequest && !loading && !modelPickerActive;

  React.useEffect(() => {
    if (!loading) return undefined;
    const start = Date.now();
    abortRef.current = new AbortController();
    const id = setInterval(() => {
      setSpinnerIndex((value) => value + 1);
      setElapsedMs(Date.now() - start);
    }, 120);
    return () => clearInterval(id);
  }, [loading]);

  const appendAssistant = React.useCallback((content) => {
    setMessages((prev) => [...prev, { role: "assistant", content }]);
  }, []);

  const appendUser = React.useCallback((content) => {
    setMessages((prev) => [...prev, { role: "user", content }]);
  }, []);

  const appendToolOutputs = React.useCallback((outputs) => {
    if (!outputs || outputs.length === 0) return;
    setMessages((prev) => [
      ...prev,
      ...outputs.map((item) => ({
        role: "tool",
        content: `${item.name}\n${String(item.content || "")}`.trim(),
      })),
    ]);
  }, []);

  useInput((char, key) => {
    if (key.ctrl && key.c) {
      const updatedUsage = {
        totalRequests: usage.totalRequests + sessionUsage.totalRequests,
        totalTokens: usage.totalTokens + sessionUsage.totalTokens,
      };
      saveUsage(cwd, updatedUsage);
      exit();
      return;
    }

    if (modelPickerActive) {
      if (key.escape) {
        setModelPickerActive(false);
        return;
      }
      if (key.upArrow) {
        setModelPickerIndex((prev) => (prev - 1 + MODELS.length) % MODELS.length);
        return;
      }
      if (key.downArrow) {
        setModelPickerIndex((prev) => (prev + 1) % MODELS.length);
        return;
      }
      if (key.return) {
        const selected = MODELS[modelPickerIndex];
        const nextConfig = { ...config, model: selected.id };
        setConfig(nextConfig);
        saveConfig(cwd, nextConfig, configState.scope === "default" ? "workspace" : configState.scope);
        appendAssistant(`Model set to ${selected.label}`);
        setModelPickerActive(false);
      }
      return;
    }
    if (confirmRequest) {
      if (char.toLowerCase() === "y") {
        confirmRequest.resolve(true);
        setConfirmRequest(null);
      } else if (char.toLowerCase() === "n" || key.escape) {
        confirmRequest.resolve(false);
        setConfirmRequest(null);
      }
      return;
    }

    if (loading && key.escape) {
      if (abortRef.current) {
        abortRef.current.abort();
      }
    }
  });

  const confirmRun = React.useCallback(
    (command) =>
      new Promise((resolve) => {
        setConfirmRequest({ command, resolve });
      }),
    []
  );

  const handleSlashCommand = React.useCallback(
    async (commandLine) => {
      const parts = commandLine.slice(1).trim().split(/\s+/).filter(Boolean);
      const cmd = parts[0] || "";
      const rest = parts.slice(1);

      if (!cmd || cmd === "help") {
        appendAssistant(helpText.trim());
        return;
      }

      if (cmd === "exit" || cmd === "quit") {
        const updatedUsage = {
          totalRequests: usage.totalRequests + sessionUsage.totalRequests,
          totalTokens: usage.totalTokens + sessionUsage.totalTokens,
        };
        saveUsage(cwd, updatedUsage);
        exit();
        return;
      }

      if (cmd === "usage") {
        appendAssistant(
          `Session: ${sessionUsage.totalRequests} requests, ${sessionUsage.totalTokens} tokens\n` +
            `All-time: ${usage.totalRequests} requests, ${usage.totalTokens} tokens`
        );
        return;
      }

      if (cmd === "model") {
        if (!rest.length || rest[0] === "list") {
          setModelPickerIndex(0);
          setModelPickerActive(true);
          return;
        }
        if (rest[0] === "set" && rest.slice(1).length > 0) {
          const modelName = rest.slice(1).join(" ");
          const resolved = resolveModelInput(modelName);
          if (!resolved) {
            appendAssistant("Unknown model. Use /model to pick from the list.");
            return;
          }
          const nextConfig = { ...config, model: resolved.id };
          setConfig(nextConfig);
          saveConfig(cwd, nextConfig, configState.scope === "default" ? "workspace" : configState.scope);
          appendAssistant(`Model set to ${resolved.label}`);
          return;
        }
        const current = findModelById(config.model);
        appendAssistant(
          `Current model: ${current ? current.label : config.model}\n` +
            MODELS.map((m) => `- ${m.label} (${m.id})`).join("\n")
        );
        return;
      }

      if (cmd === "plan") {
        const task = rest.join(" ");
        if (!task) {
          appendAssistant("Usage: /plan <task>");
          return;
        }
        setLoading(true);
        try {
          const result = await runPlan({ model: config, task, usage: sessionUsage });
          appendAssistant(result || "No plan returned.");
        } catch (error) {
          appendAssistant(error.message || "Plan failed.");
        } finally {
          setLoading(false);
        }
        return;
      }

      appendAssistant("Unknown slash command. Try /help.");
    },
    [appendAssistant, config, configState.scope, cwd, exit, sessionUsage, usage]
  );

  const handleSubmit = React.useCallback(
    async (value) => {
      const trimmed = value.trim();
      if (!trimmed) return;
      setInput("");

      if (trimmed.startsWith("/")) {
        await handleSlashCommand(trimmed);
        return;
      }

      appendUser(trimmed);
      modelMessagesRef.current.push({ role: "user", content: trimmed });
      setLoading(true);
      try {
        const result = await runAgentCore({
          cwd,
          model: config,
          messages: modelMessagesRef.current,
          confirmRun,
          signal: abortRef.current?.signal,
        });
        if (result?.usage) {
          setSessionUsage((prev) => ({
            totalRequests: prev.totalRequests + result.usage.totalRequests,
            totalTokens: prev.totalTokens + result.usage.totalTokens,
          }));
        }
        appendToolOutputs(result.toolOutputs || []);
        modelMessagesRef.current.push({ role: "assistant", content: result.content || "" });
        appendAssistant(result.content || "");
      } catch (error) {
        appendAssistant(error.message || "Request failed.");
      } finally {
        setLoading(false);
      }
    },
    [appendAssistant, appendUser, config, confirmRun, cwd, handleSlashCommand]
  );

  return h(
    Box,
    { flexDirection: "column", paddingLeft: 1, paddingRight: 1 },
    h(MiniLabel),
    h(Banner, { InkImage }),
    h(Tips),
    h(UsageLine, { cwd }),
    h(
      Box,
      { flexDirection: "column", marginTop: 1 },
      messages.map((message, idx) =>
        h(MessageLine, { key: `${message.role}-${idx}`, role: message.role, content: message.content })
      )
    ),
    loading ? h(Loader, { elapsedMs, frameIndex: spinnerIndex }) : null,
    confirmRequest ? h(ConfirmPrompt, { command: confirmRequest.command }) : null,
    modelPickerActive ? h(ModelPicker, { models: MODELS, selectedIndex: modelPickerIndex }) : null,
    h(InputHint, { visible: !input && !loading && !confirmRequest && !modelPickerActive }),
    h(InputBar, {
      value: input,
      onChange: setInput,
      onSubmit: handleSubmit,
      disabled: !!confirmRequest || modelPickerActive,
    }),
    showSuggestions
      ? h(Suggestions, { items: matches, showNotFound: matches.length === 0 })
      : null,
    h(StatusBar, { model: config.model, cwd, allowExec: config.allowExec })
  );
}

async function startRepl() {
  const cwd = process.cwd();
  if (!ensureApiKey(cwd)) {
    process.stderr.write("Missing OPENROUTER_API_KEY. Set it in your environment or .env.\n");
    process.exit(1);
  }

  const configState = loadConfig(cwd);
  const usage = loadUsage(cwd);
  let InkImage = null;
  let TerminalInfoProvider = null;
  try {
    const mod = await import("ink-picture");
    InkImage = mod.default || mod;
    TerminalInfoProvider = mod.TerminalInfoProvider || null;
  } catch (error) {
    InkImage = null;
    TerminalInfoProvider = null;
  }
  if (!TerminalInfoProvider) {
    InkImage = null;
  }
  const appElement = h(App, { cwd, configState, usage, InkImage });
  if (TerminalInfoProvider && InkImage) {
    render(h(TerminalInfoProvider, null, appElement));
    return;
  }
  render(appElement);
}

async function main() {
  const args = process.argv.slice(2);
  const cwd = process.cwd();

  if (args.length === 0) {
    await startRepl();
    return;
  }

  if (args.includes("help") || args.includes("--help") || args.includes("-h")) {
    process.stdout.write(`${helpText}\n`);
    return;
  }

  const command = args[0];
  const configState = loadConfig(cwd);
  const config = configState.config;
  const usage = loadUsage(cwd);
  const sessionUsage = { totalRequests: 0, totalTokens: 0 };

  if (command === "init") {
    const targetPath = saveConfig(cwd, { model: DEFAULT_MODEL, allowExec: false }, "workspace");
    process.stdout.write(`Workspace config created at ${targetPath}\n`);
    return;
  }

  if (command === "model") {
    if (args[1] === "list") {
      printModels(config.model);
      return;
    }
    if (args[1] === "set") {
      const modelName = args.slice(2).join(" ");
      if (!modelName) {
        process.stderr.write("Usage: xcode model set <name> [--global]\n");
        return;
      }
      const resolved = resolveModelInput(modelName);
      if (!resolved) {
        process.stderr.write("Unknown model. Run 'xcode model list' to see available models.\n");
        return;
      }
      const isGlobal = args.includes("--global");
      config.model = resolved.id;
      const targetPath = saveConfig(cwd, config, isGlobal ? "global" : "workspace");
      process.stdout.write(`Model set to ${resolved.label}\nSaved to ${targetPath}\n`);
      return;
    }
    const current = findModelById(config.model);
    process.stdout.write(`Current model: ${current ? current.label : config.model}\n`);
    printModels(config.model);
    return;
  }

  if (command === "plan") {
    const task = args.slice(1).join(" ");
    if (!task) {
      process.stderr.write("Usage: xcode plan <task>\n");
      return;
    }
    if (!ensureApiKey(cwd)) {
      process.stderr.write("Missing OPENROUTER_API_KEY. Set it in your environment or .env.\n");
      return;
    }
    const result = await runPlan({ model: config, task, usage: sessionUsage });
    process.stdout.write(`${result}\n`);
    usage.totalRequests += sessionUsage.totalRequests;
    usage.totalTokens += sessionUsage.totalTokens;
    saveUsage(cwd, usage);
    return;
  }

  if (command === "usage") {
    process.stdout.write(
      `Session: ${sessionUsage.totalRequests} requests, ${sessionUsage.totalTokens} tokens\n`
    );
    process.stdout.write(`All-time: ${usage.totalRequests} requests, ${usage.totalTokens} tokens\n`);
    return;
  }

  process.stderr.write(`Unknown command: ${command}\n`);
  process.stderr.write("Run 'xcode help' for usage.\n");
  process.exit(1);
}

main().catch((error) => {
  process.stderr.write(`${error.message}\n`);
  process.exit(1);
});
