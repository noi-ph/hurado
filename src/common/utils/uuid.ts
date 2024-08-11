
export function checkUUIDv4(uuid: string): string | null {
  // Checks if a string is a valid uuid and if not, return null
  // Useful for passing strings directly into SQL expressions
  const uuidv4Regex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  // Check if the string matches the UUIDv4 pattern
  if (uuidv4Regex.test(uuid)) {
      return uuid; // It's a valid UUIDv4
  } else {
      return null; // It's not a valid UUIDv4
  }
}
