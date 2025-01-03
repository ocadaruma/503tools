export function join(...paths: string[]): string {
  return paths
    .map((s) => s.replace(/\/$/, "").replace(/^\//, ""))
    .filter((s) => s.length > 0)
    .join("/")
}

export function sanitizeFilename(filename: string, replacement: string): string {
  return filename.replace(/[/\\:*?"<>|]/g, replacement)
}
