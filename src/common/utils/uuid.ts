export function checkUUIDv4(uuid: string | null): string | null {
  if (uuid == null) {
    return null;
  }

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

export function uuidToHuradoID(uuid: string): string | null {
  try {
    // Remove hyphens from the UUID
    const hex = uuid.replace(/-/g, "");

    // Convert hex string to an array of bytes
    const matches = hex.match(/.{1,2}/g)!;
    const epal = matches.map((byte) => parseInt(byte, 16));
    const bytes = new Uint8Array(epal);

    // Convert the byte array to a binary string
    let binary = "";
    bytes.forEach((byte) => {
      binary += String.fromCharCode(byte);
    });

    // Encode the binary string to Base64
    const base64 = btoa(binary)
      .replace(/\+/g, "-") // Replace + with -
      .replace(/\//g, "_") // Replace / with _
      .replace(/=+$/, ""); // Remove trailing =

    return base64;
  } catch {
    return null;
  }
}

export function huradoIDToUUID(huradoid: string) {
  try {
    // Convert URL-safe Base64 to standard Base64
    const replaced = (huradoid = huradoid
      .replace(/-/g, "+")
      .replace(/_/g, "/")
      .padEnd(huradoid.length + ((4 - (huradoid.length % 4)) % 4), "=")); // Add padding back if necessary

    // Decode Base64 to binary string
    const binary = atob(replaced);

    // Convert binary string to hex string
    let hex = "";
    for (let i = 0; i < binary.length; i++) {
      let byteHex = binary.charCodeAt(i).toString(16);
      if (byteHex.length === 1) byteHex = "0" + byteHex; // Add leading zero if needed
      hex += byteHex;
    }

    // Format the hex string into a UUID with hyphens
    const uuid = [
      hex.substring(0, 8),
      hex.substring(8, 12),
      hex.substring(12, 16),
      hex.substring(16, 20),
      hex.substring(20),
    ].join("-");

    return checkUUIDv4(uuid);
  } catch {
    return null;
  }
}
