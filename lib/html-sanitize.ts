const markdownImageRegex = /!\[([^\]]*)\]\((https?:\/\/[^\s)]+)\)/g;
const markdownLinkRegex = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g;
const markdownImageRegexNoGlobal = /!\[([^\]]*)\]\((https?:\/\/[^\s)]+)\)/;
const markdownLinkRegexNoGlobal = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/;
const NON_UI_PHRASES = [
  "here is a",
  "you can click the link",
  "view or download the image",
  "this link will dynamically fetch",
  "if you'd like a different style",
  "example of what you might see",
];

export const sanitizeGeneratedHtml = (html: string) => {
  let output = html;

  output = output.replace(
    markdownImageRegex,
    (_match, alt, url) =>
      `<img src="${url}" alt="${alt || "Image"}" class="w-full h-full object-cover" />`
  );
  output = output.replace(
    markdownLinkRegex,
    (_match, alt, url) =>
      `<img src="${url}" alt="${alt || "Image"}" class="w-full h-full object-cover" />`
  );

  output = output.replace(/^.*unsplash.*$/gim, "");
  output = output.replace(/^.*click the link.*$/gim, "");
  output = output.replace(/^.*view or download.*$/gim, "");

  return output.replace(/\n{3,}/g, "\n\n").trim();
};

export const extractHtmlRoot = (text: string) => {
  const match = text.match(/<div[\s\S]*<\/div>/);
  return match ? match[0] : null;
};

export const isLikelyHtml = (text: string) =>
  /<div[\s\S]*<\/div>/.test(text);

export const isLikelyUiHtml = (text: string) => {
  if (!isLikelyHtml(text)) {
    return false;
  }

  const lower = text.toLowerCase();
  if (NON_UI_PHRASES.some((phrase) => lower.includes(phrase))) {
    return false;
  }

  const tagCount = (text.match(/<\w+/g) || []).length;
  if (tagCount < 6) {
    return false;
  }

  if (!/class=/.test(text)) {
    return false;
  }

  if (
    markdownImageRegexNoGlobal.test(text) ||
    markdownLinkRegexNoGlobal.test(text)
  ) {
    return false;
  }

  return true;
};

export const buildFallbackHtml = (options?: {
  title?: string;
  subtitle?: string;
}) => {
  const title = options?.title ?? "Generated Screen";
  const subtitle =
    options?.subtitle ??
    "A modern layout placeholder while your UI is generating.";

  return `
  <div class="relative w-full min-h-screen bg-[var(--background)] text-[var(--foreground)]">
    <div class="absolute inset-0 -z-10">
      <div class="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-[var(--primary)]/15 blur-3xl"></div>
      <div class="absolute bottom-0 left-0 h-80 w-80 rounded-full bg-[var(--accent)]/20 blur-3xl"></div>
    </div>
    <div class="px-6 pt-10 pb-24 space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-xs uppercase tracking-[0.2em] text-[var(--muted-foreground)]">Preview</p>
          <h1 class="mt-2 text-3xl font-semibold tracking-tight">${title}</h1>
          <p class="mt-2 text-sm text-[var(--muted-foreground)]">${subtitle}</p>
        </div>
        <div class="h-12 w-12 rounded-full bg-[var(--primary)]/20"></div>
      </div>
      <div class="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--shadow-lg)]">
        <div class="h-40 w-full rounded-2xl bg-gradient-to-br from-[var(--primary)]/30 via-[var(--accent)]/20 to-[var(--primary)]/10"></div>
        <div class="mt-5 space-y-3">
          <div class="h-3 w-24 rounded-full bg-[var(--muted)]"></div>
          <div class="h-3 w-40 rounded-full bg-[var(--muted)]"></div>
          <div class="h-3 w-32 rounded-full bg-[var(--muted)]"></div>
        </div>
      </div>
      <div class="grid gap-4 sm:grid-cols-2">
        <div class="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4">
          <p class="text-xs uppercase tracking-[0.2em] text-[var(--muted-foreground)]">Highlight</p>
          <p class="mt-2 text-lg font-semibold">Primary metrics</p>
          <div class="mt-4 h-2 w-full rounded-full bg-[var(--muted)]">
            <div class="h-2 w-2/3 rounded-full bg-[var(--primary)]"></div>
          </div>
        </div>
        <div class="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4">
          <p class="text-xs uppercase tracking-[0.2em] text-[var(--muted-foreground)]">Details</p>
          <p class="mt-2 text-lg font-semibold">Secondary actions</p>
          <div class="mt-4 flex gap-2">
            <div class="h-8 w-20 rounded-full bg-[var(--secondary)]"></div>
            <div class="h-8 w-24 rounded-full bg-[var(--primary)]/20"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
  `.trim();
};
