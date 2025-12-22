const markdownImageRegex = /!\[([^\]]*)\]\((https?:\/\/[^\s)]+)\)/g;
const markdownLinkRegex = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g;

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
