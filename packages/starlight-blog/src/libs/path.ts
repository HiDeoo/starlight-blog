export function stripLeadingSlash(path: string) {
  if (!path.startsWith('/')) {
    return path
  }

  return path.slice(1)
}

export function stripTrailingSlash(path: string) {
  if (!path.endsWith('/')) {
    return path
  }

  return path.slice(0, -1)
}

export function ensureTrailingSlash(path: string): string {
  if (path.endsWith('/')) {
    return path
  }

  return `${path}/`
}
