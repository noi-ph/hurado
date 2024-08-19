export function normalizeAttachmentPath(filePath: string): string {
  const normalized = unixNormalizePath(filePath);
  const noslashes = normalized.replace(/^\/+/, "").replace(/\/+$/, "");
  return noslashes;
}

function unixNormalizePath(path: string) {
  const parts = path.split("/").filter((part) => part !== "" && part !== ".");
  const stack: string[] = [];

  for (const part of parts) {
    if (part === "..") {
      if (stack.length > 0) {
        stack.pop();
      }
    } else {
      stack.push(part);
    }
  }

  return stack.join("/");
}
