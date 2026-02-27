import { keccak_256 } from "@noble/hashes/sha3.js";
import { bytesToHex } from "@noble/hashes/utils.js";

/**
 * Normalize an EVM function/error signature to canonical form:
 * - No spaces
 * - No parameter names (only types)
 * e.g. "transfer(address to, uint256 amount)" -> "transfer(address,uint256)"
 */
export function normalizeSignature(signature: string): string {
  let s = signature.trim().replace(/\s+/g, " ");
  // Remove parameter names: "type name" -> "type" for known ABI types
  const typePattern =
    /\b(address|uint\d*|int\d*|bool|string|bytes\d*|bytes|fixed\d+x\d*|ufixed\d+x\d*)\s+([a-zA-Z_][a-zA-Z0-9_]*)/g;
  s = s.replace(typePattern, "$1");
  return s.replace(/\s/g, "");
}

/**
 * Compute the 4-byte selector (method id) for an EVM function or error signature.
 * Selector = first 4 bytes of keccak256(normalized_signature).
 */
export function selectorToHex(signature: string): string {
  const normalized = normalizeSignature(signature);
  const bytes = new TextEncoder().encode(normalized);
  const hash = keccak_256(bytes);
  const selector = hash.slice(0, 4);
  return "0x" + bytesToHex(selector);
}

/** Normalize hex selector to 0x + 8 lowercase hex chars (4 bytes). Returns null if invalid. */
export function normalizeHexSelector(hex: string): string | null {
  const cleaned = hex.trim().toLowerCase().replace(/^0x/, "");
  if (!/^[0-9a-f]{8}$/.test(cleaned)) return null;
  return "0x" + cleaned;
}
