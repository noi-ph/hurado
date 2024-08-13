export async function computeSHA1(file: File): Promise<string> {
  // This mutates the TaskFileLocal but that's okay. As long as we don't save before
  // all of the destructivelyComputeSHA1s complete, it's fine.
  const arrayBuffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');
  return hashHex;
}
