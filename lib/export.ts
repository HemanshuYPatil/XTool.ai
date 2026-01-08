import { BASE_VARIABLES } from "@/lib/themes";

export type ExportTarget =
  | "html"
  | "react"
  | "react-native"
  | "flutter"
  | "vue"
  | "nextjs"
  | "svelte"
  | "astro"
  | "solid";

type ExportFrame = {
  title: string;
  htmlContent: string;
};

type ExportPayload = {
  projectName?: string | null;
  frames: ExportFrame[];
  themeStyle?: string;
  target: ExportTarget;
};

type ExportFile = {
  path: string;
  content: string;
};

const toFileSafeName = (value: string) =>
  value
    .replace(/[^a-zA-Z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .toLowerCase() || "xtool-export";

const toSnakeCase = (value: string) =>
  value
    .replace(/[^a-zA-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .replace(/_+/g, "_")
    .toLowerCase() || "screen";

const toComponentName = (value: string) => {
  const words = value
    .replace(/[^a-zA-Z0-9]+/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  const base = words
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join("");
  if (!base) return "Screen";
  return /^[A-Za-z]/.test(base) ? base : `Screen${base}`;
};

const escapeTemplateLiteral = (value: string) =>
  value.replace(/\\/g, "\\\\").replace(/`/g, "\\`").replace(/\$\{/g, "\\${");

const escapeDartString = (value: string) =>
  value.replace(/\$/g, "\\$").replace(/"""/g, '\\"""');

const buildHtmlShell = ({
  body,
  title,
  themeStyle,
}: {
  body: string;
  title: string;
  themeStyle?: string;
}) => `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>${title}</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@200;300;400;500;600;700;800&display=swap" rel="stylesheet" />
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://code.iconify.design/iconify-icon/3.0.0/iconify-icon.min.js"></script>
    <style>
      :root {${BASE_VARIABLES}${themeStyle ?? ""}}
      * { box-sizing: border-box; }
      body { margin: 0; font-family: var(--font-sans); background: var(--background); color: var(--foreground); }
      section { padding: 24px; border-bottom: 1px solid var(--border); }
    </style>
  </head>
  <body>
${body}
  </body>
</html>`;

const buildScreenEntries = (frames: ExportFrame[]) => {
  const used = new Set<string>();
  if (frames.length === 0) {
    return [
      {
        title: "Untitled",
        htmlContent: "<div>No frames available.</div>",
        fileBase: "screen",
        componentName: "Screen",
      },
    ];
  }

  return frames.map((frame, index) => {
    const title = frame.title?.trim() || `Screen ${index + 1}`;
    const base = toSnakeCase(title);
    let uniqueBase = base;
    let counter = 2;
    while (used.has(uniqueBase)) {
      uniqueBase = `${base}_${counter}`;
      counter += 1;
    }
    used.add(uniqueBase);
    return {
      title,
      htmlContent: frame.htmlContent || "",
      fileBase: uniqueBase,
      componentName: toComponentName(title),
    };
  });
};

const buildReactFiles = (
  safeName: string,
  frames: ExportFrame[],
  themeStyle?: string
) => {
  const root = `${safeName}-react`;
  const screens = buildScreenEntries(frames);
  const screenImports = screens
    .map(
      (screen) =>
        `import ${screen.componentName} from "./screens/${screen.fileBase}.jsx";`
    )
    .join("\n");
  const screenEntries = screens
    .map(
      (screen) =>
        `  { id: "${screen.fileBase}", title: "${screen.title.replace(
          /"/g,
          '\\"'
        )}", Component: ${screen.componentName} }`
    )
    .join(",\n");
  const appContent = `import React from "react";
import "./styles.css";
${screenImports}

const screens = [
${screenEntries}
];

export default function App() {
  return (
    <main className="app">
      {screens.map(({ id, title, Component }) => (
        <section key={id} className="screen">
          <h2 className="screen-title">{title}</h2>
          <Component />
        </section>
      ))}
    </main>
  );
}
`;

  const screenFiles = screens.map((screen) => {
    const htmlString = escapeTemplateLiteral(screen.htmlContent);
    return {
      path: `${root}/src/screens/${screen.fileBase}.jsx`,
      content: `import React from "react";

const html = \`${htmlString}\`;

export default function ${screen.componentName}() {
  return <div className="screen-content" dangerouslySetInnerHTML={{ __html: html }} />;
}
`,
    };
  });

  return [
    {
      path: `${root}/package.json`,
      content: `{
  "name": "${safeName}-react",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^19.2.1",
    "react-dom": "^19.2.1"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.5.0",
    "vite": "^5.4.10"
  }
}
`,
    },
    {
      path: `${root}/vite.config.js`,
      content: `import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
});
`,
    },
    {
      path: `${root}/index.html`,
      content: `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${safeName} Export</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@200;300;400;500;600;700;800&display=swap" rel="stylesheet" />
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://code.iconify.design/iconify-icon/3.0.0/iconify-icon.min.js"></script>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
`,
    },
    {
      path: `${root}/src/main.jsx`,
      content: `import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./styles.css";

createRoot(document.getElementById("root")).render(<App />);
`,
    },
    {
      path: `${root}/src/App.jsx`,
      content: appContent,
    },
    {
      path: `${root}/src/styles.css`,
      content: `:root {${BASE_VARIABLES}${themeStyle ?? ""}}
* { box-sizing: border-box; }
body { margin: 0; font-family: var(--font-sans); background: var(--background); color: var(--foreground); }
.app { padding: 24px; display: grid; gap: 32px; }
.screen { border: 1px solid var(--border); border-radius: 16px; overflow: hidden; background: var(--card); }
.screen-title { padding: 16px 20px; font-size: 14px; text-transform: uppercase; letter-spacing: 0.12em; color: var(--muted-foreground); border-bottom: 1px solid var(--border); }
.screen-content { padding: 20px; }
`,
    },
    ...screenFiles,
  ];
};

const buildVueFiles = (
  safeName: string,
  frames: ExportFrame[],
  themeStyle?: string
) => {
  const root = `${safeName}-vue`;
  const screens = buildScreenEntries(frames);
  const screenImports = screens
    .map(
      (screen) =>
        `import ${screen.componentName} from "./screens/${screen.fileBase}.vue";`
    )
    .join("\n");
  const screenEntries = screens
    .map(
      (screen) =>
        `  { id: "${screen.fileBase}", title: "${screen.title.replace(
          /"/g,
          '\\"'
        )}", component: ${screen.componentName} }`
    )
    .join(",\n");
  const appContent = `<script setup>
${screenImports}

const screens = [
${screenEntries}
];
</script>

<template>
  <main class="app">
    <section v-for="screen in screens" :key="screen.id" class="screen">
      <h2 class="screen-title">{{ screen.title }}</h2>
      <component :is="screen.component" />
    </section>
  </main>
</template>

<style>
.app { padding: 24px; display: grid; gap: 32px; }
.screen { border: 1px solid var(--border); border-radius: 16px; overflow: hidden; background: var(--card); }
.screen-title { padding: 16px 20px; font-size: 14px; text-transform: uppercase; letter-spacing: 0.12em; color: var(--muted-foreground); border-bottom: 1px solid var(--border); }
</style>
`;

  const screenFiles = screens.map((screen) => {
    const htmlString = escapeTemplateLiteral(screen.htmlContent);
    return {
      path: `${root}/src/screens/${screen.fileBase}.vue`,
      content: `<script setup>
const html = \`${htmlString}\`;
</script>

<template>
  <div class="screen-content" v-html="html"></div>
</template>

<style>
.screen-content { padding: 20px; }
</style>
`,
    };
  });

  return [
    {
      path: `${root}/package.json`,
      content: `{
  "name": "${safeName}-vue",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "vue": "^3.4.21"
  },
  "devDependencies": {
    "@vitejs/plugin-vue": "^5.0.4",
    "vite": "^5.4.10"
  }
}
`,
    },
    {
      path: `${root}/vite.config.js`,
      content: `import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

export default defineConfig({
  plugins: [vue()],
});
`,
    },
    {
      path: `${root}/index.html`,
      content: `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${safeName} Export</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@200;300;400;500;600;700;800&display=swap" rel="stylesheet" />
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://code.iconify.design/iconify-icon/3.0.0/iconify-icon.min.js"></script>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.js"></script>
  </body>
</html>
`,
    },
    {
      path: `${root}/src/main.js`,
      content: `import { createApp } from "vue";
import App from "./App.vue";
import "./styles.css";

createApp(App).mount("#app");
`,
    },
    {
      path: `${root}/src/App.vue`,
      content: appContent,
    },
    {
      path: `${root}/src/styles.css`,
      content: `:root {${BASE_VARIABLES}${themeStyle ?? ""}}
* { box-sizing: border-box; }
body { margin: 0; font-family: var(--font-sans); background: var(--background); color: var(--foreground); }
`,
    },
    ...screenFiles,
  ];
};

const buildNextFiles = (
  safeName: string,
  frames: ExportFrame[],
  themeStyle?: string
) => {
  const root = `${safeName}-nextjs`;
  const screens = buildScreenEntries(frames);
  const screenImports = screens
    .map(
      (screen) =>
        `import ${screen.componentName} from "./screens/${screen.fileBase}";`
    )
    .join("\n");
  const screenEntries = screens
    .map(
      (screen) =>
        `  { id: "${screen.fileBase}", title: "${screen.title.replace(
          /"/g,
          '\\"'
        )}", Component: ${screen.componentName} }`
    )
    .join(",\n");
  const pageContent = `${screenImports}

const screens = [
${screenEntries}
];

export default function Page() {
  return (
    <main className="app">
      {screens.map(({ id, title, Component }) => (
        <section key={id} className="screen">
          <h2 className="screen-title">{title}</h2>
          <Component />
        </section>
      ))}
    </main>
  );
}
`;

  const screenFiles = screens.map((screen) => {
    const htmlString = escapeTemplateLiteral(screen.htmlContent);
    return {
      path: `${root}/app/screens/${screen.fileBase}.jsx`,
      content: `export default function ${screen.componentName}() {
  const html = \`${htmlString}\`;
  return <div className="screen-content" dangerouslySetInnerHTML={{ __html: html }} />;
}
`,
    };
  });

  return [
    {
      path: `${root}/package.json`,
      content: `{
  "name": "${safeName}-nextjs",
  "private": true,
  "version": "0.1.0",
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start"
  },
  "dependencies": {
    "next": "^14.2.5",
    "react": "^19.2.1",
    "react-dom": "^19.2.1"
  }
}
`,
    },
    {
      path: `${root}/next.config.js`,
      content: `/** @type {import('next').NextConfig} */
const nextConfig = {};

module.exports = nextConfig;
`,
    },
    {
      path: `${root}/app/layout.jsx`,
      content: `import "./globals.css";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@200;300;400;500;600;700;800&display=swap" rel="stylesheet" />
        <script src="https://cdn.tailwindcss.com"></script>
        <script src="https://code.iconify.design/iconify-icon/3.0.0/iconify-icon.min.js"></script>
      </head>
      <body>{children}</body>
    </html>
  );
}
`,
    },
    {
      path: `${root}/app/page.jsx`,
      content: pageContent,
    },
    {
      path: `${root}/app/globals.css`,
      content: `:root {${BASE_VARIABLES}${themeStyle ?? ""}}
* { box-sizing: border-box; }
body { margin: 0; font-family: var(--font-sans); background: var(--background); color: var(--foreground); }
.app { padding: 24px; display: grid; gap: 32px; }
.screen { border: 1px solid var(--border); border-radius: 16px; overflow: hidden; background: var(--card); }
.screen-title { padding: 16px 20px; font-size: 14px; text-transform: uppercase; letter-spacing: 0.12em; color: var(--muted-foreground); border-bottom: 1px solid var(--border); }
.screen-content { padding: 20px; }
`,
    },
    ...screenFiles,
  ];
};

const buildSvelteFiles = (
  safeName: string,
  frames: ExportFrame[],
  themeStyle?: string
) => {
  const root = `${safeName}-svelte`;
  const screens = buildScreenEntries(frames);
  const screenImports = screens
    .map(
      (screen) =>
        `import ${screen.componentName} from "./screens/${screen.fileBase}.svelte";`
    )
    .join("\n");
  const screenEntries = screens
    .map(
      (screen) =>
        `  { id: "${screen.fileBase}", title: "${screen.title.replace(
          /"/g,
          '\\"'
        )}", component: ${screen.componentName} }`
    )
    .join(",\n");
  const appContent = `<script>
${screenImports}

const screens = [
${screenEntries}
];
</script>

<main class="app">
  {#each screens as screen (screen.id)}
    <section class="screen">
      <h2 class="screen-title">{screen.title}</h2>
      <svelte:component this={screen.component} />
    </section>
  {/each}
</main>
`;

  const screenFiles = screens.map((screen) => {
    const htmlString = escapeTemplateLiteral(screen.htmlContent);
    return {
      path: `${root}/src/screens/${screen.fileBase}.svelte`,
      content: `<script>
  const html = \`${htmlString}\`;
</script>

<div class="screen-content">
  {@html html}
</div>
`,
    };
  });

  return [
    {
      path: `${root}/package.json`,
      content: `{
  "name": "${safeName}-svelte",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "svelte": "^4.2.19"
  },
  "devDependencies": {
    "@sveltejs/vite-plugin-svelte": "^3.1.0",
    "vite": "^5.4.10"
  }
}
`,
    },
    {
      path: `${root}/vite.config.js`,
      content: `import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";

export default defineConfig({
  plugins: [svelte()],
});
`,
    },
    {
      path: `${root}/index.html`,
      content: `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${safeName} Export</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@200;300;400;500;600;700;800&display=swap" rel="stylesheet" />
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://code.iconify.design/iconify-icon/3.0.0/iconify-icon.min.js"></script>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.js"></script>
  </body>
</html>
`,
    },
    {
      path: `${root}/src/main.js`,
      content: `import App from "./App.svelte";
import "./styles.css";

const app = new App({
  target: document.getElementById("app"),
});

export default app;
`,
    },
    {
      path: `${root}/src/App.svelte`,
      content: appContent,
    },
    {
      path: `${root}/src/styles.css`,
      content: `:root {${BASE_VARIABLES}${themeStyle ?? ""}}
* { box-sizing: border-box; }
body { margin: 0; font-family: var(--font-sans); background: var(--background); color: var(--foreground); }
.app { padding: 24px; display: grid; gap: 32px; }
.screen { border: 1px solid var(--border); border-radius: 16px; overflow: hidden; background: var(--card); }
.screen-title { padding: 16px 20px; font-size: 14px; text-transform: uppercase; letter-spacing: 0.12em; color: var(--muted-foreground); border-bottom: 1px solid var(--border); }
.screen-content { padding: 20px; }
`,
    },
    ...screenFiles,
  ];
};

const buildAstroFiles = (
  safeName: string,
  frames: ExportFrame[],
  themeStyle?: string
) => {
  const root = `${safeName}-astro`;
  const screens = buildScreenEntries(frames);
  const screenImports = screens
    .map(
      (screen) =>
        `import ${screen.componentName} from "../components/screens/${screen.fileBase}.astro";`
    )
    .join("\n");
  const screenEntries = screens
    .map(
      (screen) =>
        `  { id: "${screen.fileBase}", title: "${screen.title.replace(
          /"/g,
          '\\"'
        )}", Component: ${screen.componentName} }`
    )
    .join(",\n");

  const screenFiles = screens.map((screen) => {
    const htmlString = escapeTemplateLiteral(screen.htmlContent);
    return {
      path: `${root}/src/components/screens/${screen.fileBase}.astro`,
      content: `---
const html = \`${htmlString}\`;
---
<div class="screen-content" set:html={html}></div>
`,
    };
  });

  return [
    {
      path: `${root}/package.json`,
      content: `{
  "name": "${safeName}-astro",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview"
  },
  "dependencies": {
    "astro": "^4.15.4"
  }
}
`,
    },
    {
      path: `${root}/astro.config.mjs`,
      content: `import { defineConfig } from "astro/config";

export default defineConfig({});
`,
    },
    {
      path: `${root}/src/styles/global.css`,
      content: `:root {${BASE_VARIABLES}${themeStyle ?? ""}}
* { box-sizing: border-box; }
body { margin: 0; font-family: var(--font-sans); background: var(--background); color: var(--foreground); }
.app { padding: 24px; display: grid; gap: 32px; }
.screen { border: 1px solid var(--border); border-radius: 16px; overflow: hidden; background: var(--card); }
.screen-title { padding: 16px 20px; font-size: 14px; text-transform: uppercase; letter-spacing: 0.12em; color: var(--muted-foreground); border-bottom: 1px solid var(--border); }
.screen-content { padding: 20px; }
`,
    },
    {
      path: `${root}/src/layouts/BaseLayout.astro`,
      content: `---
import "../styles/global.css";
---
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@200;300;400;500;600;700;800&display=swap" rel="stylesheet" />
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://code.iconify.design/iconify-icon/3.0.0/iconify-icon.min.js"></script>
  </head>
  <body>
    <slot />
  </body>
</html>
`,
    },
    {
      path: `${root}/src/pages/index.astro`,
      content: `---
import BaseLayout from "../layouts/BaseLayout.astro";
${screenImports}
const screens = [
${screenEntries}
];
---
<BaseLayout>
  <main class="app">
    {screens.map(({ id, title, Component }) => (
      <section class="screen" key={id}>
        <h2 class="screen-title">{title}</h2>
        <Component />
      </section>
    ))}
  </main>
</BaseLayout>
`,
    },
    ...screenFiles,
  ];
};

const buildSolidFiles = (
  safeName: string,
  frames: ExportFrame[],
  themeStyle?: string
) => {
  const root = `${safeName}-solid`;
  const screens = buildScreenEntries(frames);
  const screenImports = screens
    .map(
      (screen) =>
        `import ${screen.componentName} from "./screens/${screen.fileBase}.jsx";`
    )
    .join("\n");
  const screenEntries = screens
    .map(
      (screen) =>
        `  { id: "${screen.fileBase}", title: "${screen.title.replace(
          /"/g,
          '\\"'
        )}", Component: ${screen.componentName} }`
    )
    .join(",\n");
  const appContent = `import "./styles.css";
${screenImports}

const screens = [
${screenEntries}
];

export default function App() {
  return (
    <main className="app">
      {screens.map(({ id, title, Component }) => (
        <section className="screen" data-id={id}>
          <h2 className="screen-title">{title}</h2>
          <Component />
        </section>
      ))}
    </main>
  );
}
`;

  const screenFiles = screens.map((screen) => {
    const htmlString = escapeTemplateLiteral(screen.htmlContent);
    return {
      path: `${root}/src/screens/${screen.fileBase}.jsx`,
      content: `export default function ${screen.componentName}() {
  const html = \`${htmlString}\`;
  return <div className="screen-content" innerHTML={html} />;
}
`,
    };
  });

  return [
    {
      path: `${root}/package.json`,
      content: `{
  "name": "${safeName}-solid",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "solid-js": "^1.9.2"
  },
  "devDependencies": {
    "vite": "^5.4.10",
    "vite-plugin-solid": "^2.10.2"
  }
}
`,
    },
    {
      path: `${root}/vite.config.js`,
      content: `import { defineConfig } from "vite";
import solid from "vite-plugin-solid";

export default defineConfig({
  plugins: [solid()],
});
`,
    },
    {
      path: `${root}/index.html`,
      content: `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${safeName} Export</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@200;300;400;500;600;700;800&display=swap" rel="stylesheet" />
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://code.iconify.design/iconify-icon/3.0.0/iconify-icon.min.js"></script>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
`,
    },
    {
      path: `${root}/src/main.jsx`,
      content: `import { render } from "solid-js/web";
import App from "./App.jsx";
import "./styles.css";

render(() => <App />, document.getElementById("root"));
`,
    },
    {
      path: `${root}/src/App.jsx`,
      content: appContent,
    },
    {
      path: `${root}/src/styles.css`,
      content: `:root {${BASE_VARIABLES}${themeStyle ?? ""}}
* { box-sizing: border-box; }
body { margin: 0; font-family: var(--font-sans); background: var(--background); color: var(--foreground); }
.app { padding: 24px; display: grid; gap: 32px; }
.screen { border: 1px solid var(--border); border-radius: 16px; overflow: hidden; background: var(--card); }
.screen-title { padding: 16px 20px; font-size: 14px; text-transform: uppercase; letter-spacing: 0.12em; color: var(--muted-foreground); border-bottom: 1px solid var(--border); }
.screen-content { padding: 20px; }
`,
    },
    ...screenFiles,
  ];
};

const buildHtmlFiles = (
  safeName: string,
  frames: ExportFrame[],
  themeStyle?: string
) => {
  const root = `${safeName}-html`;
  const screens = buildScreenEntries(frames);
  const screenFiles = screens.map((screen) => ({
    path: `${root}/screens/${screen.fileBase}.html`,
    content: buildHtmlShell({
      body: screen.htmlContent || "<div>No content.</div>",
      title: screen.title,
      themeStyle,
    }),
  }));

  const links = screens
    .map(
      (screen) =>
        `<li><a href="./screens/${screen.fileBase}.html">${screen.title}</a></li>`
    )
    .join("\n");
  const indexBody = `<section>
  <h1>${safeName} export</h1>
  <p>Open a screen below to view the generated HTML.</p>
  <ul>${links}</ul>
</section>`;

  return [
    {
      path: `${root}/index.html`,
      content: buildHtmlShell({
        body: indexBody,
        title: `${safeName} export`,
        themeStyle,
      }),
    },
    ...screenFiles,
  ];
};

const buildReactNativeFiles = (
  safeName: string,
  frames: ExportFrame[],
  themeStyle?: string
) => {
  const root = `${safeName}-react-native`;
  const screens = buildScreenEntries(frames);
  const screenFiles = screens.map((screen) => {
    const htmlDoc = buildHtmlShell({
      body: screen.htmlContent || "<div>No content.</div>",
      title: screen.title,
      themeStyle,
    });
    const htmlString = escapeTemplateLiteral(htmlDoc);
    return {
      path: `${root}/src/screens/${screen.fileBase}.js`,
      content: `import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { WebView } from "react-native-webview";

const html = \`${htmlString}\`;

export default function ${screen.componentName}() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>${screen.title.replace(/"/g, '\\"')}</Text>
      <WebView originWhitelist={["*"]} source={{ html }} style={styles.webview} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0f172a" },
  title: { color: "#fff", fontSize: 16, fontWeight: "600", padding: 12 },
  webview: { flex: 1, backgroundColor: "#fff" },
});
`,
    };
  });

  const appImports = screens
    .map(
      (screen) =>
        `import ${screen.componentName} from "./src/screens/${screen.fileBase}";`
    )
    .join("\n");
  const screenEntries = screens
    .map(
      (screen) =>
        `  { id: "${screen.fileBase}", title: "${screen.title.replace(
          /"/g,
          '\\"'
        )}", Component: ${screen.componentName} }`
    )
    .join(",\n");

  return [
    {
      path: `${root}/package.json`,
      content: `{
  "name": "${safeName}-react-native",
  "private": true,
  "version": "1.0.0",
  "main": "node_modules/expo/AppEntry.js",
  "scripts": {
    "start": "expo start",
    "android": "expo run:android",
    "ios": "expo run:ios",
    "web": "expo start --web"
  },
  "dependencies": {
    "expo": "~51.0.0",
    "react": "18.2.0",
    "react-native": "0.74.3",
    "react-native-webview": "13.6.4"
  }
}
`,
    },
    {
      path: `${root}/app.json`,
      content: `{
  "expo": {
    "name": "${safeName} Export",
    "slug": "${safeName}-export",
    "version": "1.0.0",
    "orientation": "portrait",
    "platforms": ["ios", "android", "web"]
  }
}
`,
    },
    {
      path: `${root}/babel.config.js`,
      content: `module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
  };
};
`,
    },
    {
      path: `${root}/App.js`,
      content: `import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
${appImports}

const screens = [
${screenEntries}
];

export default function App() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      {screens.map(({ id, Component }) => (
        <View key={id} style={styles.card}>
          <Component />
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: "#0f172a" },
  card: { height: 640, borderRadius: 18, marginBottom: 24, overflow: "hidden", backgroundColor: "#fff" },
});
`,
    },
    ...screenFiles,
  ];
};

const buildFlutterFiles = (
  safeName: string,
  frames: ExportFrame[],
  themeStyle?: string
) => {
  const root = `${safeName}-flutter`;
  const screens = buildScreenEntries(frames);
  const screenFiles = screens.map((screen) => {
    const htmlDoc = buildHtmlShell({
      body: screen.htmlContent || "<div>No content.</div>",
      title: screen.title,
      themeStyle,
    });
    const dartHtml = escapeDartString(htmlDoc);
    return {
      path: `${root}/lib/screens/${screen.fileBase}.dart`,
      content: `import 'package:flutter/material.dart';
import 'package:webview_flutter/webview_flutter.dart';

class ${screen.componentName} extends StatelessWidget {
  const ${screen.componentName}({super.key});

  @override
  Widget build(BuildContext context) {
    final controller = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..loadHtmlString("""${dartHtml}""");

    return WebViewWidget(controller: controller);
  }
}
`,
    };
  });

  const screenImports = screens
    .map(
      (screen) =>
        `import 'screens/${screen.fileBase}.dart';`
    )
    .join("\n");
  const screenSections = screens
    .map(
      (screen) => `ScreenSection(
                title: "${screen.title.replace(/"/g, '\\"')}",
                child: const ${screen.componentName}(),
              ),`
    )
    .join("\n");

  return [
    {
      path: `${root}/pubspec.yaml`,
      content: `name: ${safeName.replace(/-/g, "_")}
description: XTool export
publish_to: "none"
version: 1.0.0

environment:
  sdk: ">=3.0.0 <4.0.0"

dependencies:
  flutter:
    sdk: flutter
  webview_flutter: ^4.7.0

dev_dependencies:
  flutter_test:
    sdk: flutter

flutter:
  uses-material-design: true
`,
    },
    {
      path: `${root}/lib/main.dart`,
      content: `import 'package:flutter/material.dart';
${screenImports}

void main() {
  runApp(const XToolExport());
}

class XToolExport extends StatelessWidget {
  const XToolExport({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: '${safeName} Export',
      theme: ThemeData.dark(),
      home: const ScreenGallery(),
    );
  }
}

class ScreenGallery extends StatelessWidget {
  const ScreenGallery({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('XTool Export')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
${screenSections}
        ],
      ),
    );
  }
}

class ScreenSection extends StatelessWidget {
  const ScreenSection({super.key, required this.title, required this.child});

  final String title;
  final Widget child;

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 24),
      decoration: BoxDecoration(
        color: const Color(0xFF0F172A),
        borderRadius: BorderRadius.circular(18),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.all(12),
            child: Text(
              title,
              style: const TextStyle(
                color: Colors.white,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
          SizedBox(height: 640, child: child),
        ],
      ),
    );
  }
}
`,
    },
    ...screenFiles,
  ];
};

const crcTable = (() => {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i += 1) {
    let c = i;
    for (let k = 0; k < 8; k += 1) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[i] = c >>> 0;
  }
  return table;
})();

const crc32 = (data: Uint8Array) => {
  let crc = 0 ^ -1;
  for (let i = 0; i < data.length; i += 1) {
    crc = (crc >>> 8) ^ crcTable[(crc ^ data[i]) & 0xff];
  }
  return (crc ^ -1) >>> 0;
};

const getDosDateTime = () => {
  const date = new Date();
  const dosTime =
    (date.getHours() << 11) |
    (date.getMinutes() << 5) |
    Math.floor(date.getSeconds() / 2);
  const dosDate =
    ((date.getFullYear() - 1980) << 9) |
    ((date.getMonth() + 1) << 5) |
    date.getDate();
  return { dosDate, dosTime };
};

const concatChunks = (chunks: Uint8Array[]) => {
  const total = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
  const result = new Uint8Array(total);
  let offset = 0;
  chunks.forEach((chunk) => {
    result.set(chunk, offset);
    offset += chunk.length;
  });
  return result;
};

const buildZip = (files: ExportFile[]) => {
  const encoder = new TextEncoder();
  const localParts: Uint8Array[] = [];
  const centralParts: Uint8Array[] = [];
  let offset = 0;
  const { dosDate, dosTime } = getDosDateTime();

  files.forEach((file) => {
    const name = file.path.replace(/\\/g, "/");
    const nameBytes = encoder.encode(name);
    const dataBytes = encoder.encode(file.content);
    const crc = crc32(dataBytes);
    const localHeader = new Uint8Array(30 + nameBytes.length);
    const view = new DataView(localHeader.buffer);
    view.setUint32(0, 0x04034b50, true);
    view.setUint16(4, 20, true);
    view.setUint16(6, 0, true);
    view.setUint16(8, 0, true);
    view.setUint16(10, dosTime, true);
    view.setUint16(12, dosDate, true);
    view.setUint32(14, crc, true);
    view.setUint32(18, dataBytes.length, true);
    view.setUint32(22, dataBytes.length, true);
    view.setUint16(26, nameBytes.length, true);
    view.setUint16(28, 0, true);
    localHeader.set(nameBytes, 30);

    localParts.push(localHeader, dataBytes);

    const centralHeader = new Uint8Array(46 + nameBytes.length);
    const cview = new DataView(centralHeader.buffer);
    cview.setUint32(0, 0x02014b50, true);
    cview.setUint16(4, 20, true);
    cview.setUint16(6, 20, true);
    cview.setUint16(8, 0, true);
    cview.setUint16(10, 0, true);
    cview.setUint16(12, dosTime, true);
    cview.setUint16(14, dosDate, true);
    cview.setUint32(16, crc, true);
    cview.setUint32(20, dataBytes.length, true);
    cview.setUint32(24, dataBytes.length, true);
    cview.setUint16(28, nameBytes.length, true);
    cview.setUint16(30, 0, true);
    cview.setUint16(32, 0, true);
    cview.setUint16(34, 0, true);
    cview.setUint16(36, 0, true);
    cview.setUint32(38, 0, true);
    cview.setUint32(42, offset, true);
    centralHeader.set(nameBytes, 46);

    centralParts.push(centralHeader);
    offset += localHeader.length + dataBytes.length;
  });

  const centralDir = concatChunks(centralParts);
  const endRecord = new Uint8Array(22);
  const endView = new DataView(endRecord.buffer);
  endView.setUint32(0, 0x06054b50, true);
  endView.setUint16(4, 0, true);
  endView.setUint16(6, 0, true);
  endView.setUint16(8, files.length, true);
  endView.setUint16(10, files.length, true);
  endView.setUint32(12, centralDir.length, true);
  endView.setUint32(16, offset, true);
  endView.setUint16(20, 0, true);

  return concatChunks([...localParts, centralDir, endRecord]);
};

export const buildExportFile = ({
  projectName,
  frames,
  themeStyle,
  target,
}: ExportPayload) => {
  const safeName = toFileSafeName(projectName || "xtool-export");
  const files =
    target === "react"
      ? buildReactFiles(safeName, frames, themeStyle)
      : target === "react-native"
      ? buildReactNativeFiles(safeName, frames, themeStyle)
      : target === "flutter"
      ? buildFlutterFiles(safeName, frames, themeStyle)
      : target === "vue"
      ? buildVueFiles(safeName, frames, themeStyle)
      : target === "nextjs"
      ? buildNextFiles(safeName, frames, themeStyle)
      : target === "svelte"
      ? buildSvelteFiles(safeName, frames, themeStyle)
      : target === "astro"
      ? buildAstroFiles(safeName, frames, themeStyle)
      : target === "solid"
      ? buildSolidFiles(safeName, frames, themeStyle)
      : buildHtmlFiles(safeName, frames, themeStyle);

  return {
    filename: `${safeName}-${target}.zip`,
    content: buildZip(files),
    mime: "application/zip",
  };
};
