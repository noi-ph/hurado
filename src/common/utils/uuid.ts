
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

export function generateUUIDv4(): string {
  return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, c =>
    (+c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> +c / 4).toString(16)
  );
}
