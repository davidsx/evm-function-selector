"use client";

import { useState, useCallback, useEffect } from "react";
import {
  selectorToHex,
  normalizeSignature,
  normalizeHexSelector,
} from "@/lib/selector";

const EXAMPLES = [
  "transfer(address,uint256)",
  "balanceOf(address)",
  "approve(address,uint256)",
  "Transfer(address,address,uint256)",
  "Error(string)",
  "transfer(address to, uint256 amount)",
];

export default function Decoder() {
  const [signature, setSignature] = useState("");
  const [hex, setHex] = useState<string | null>(null);
  const [normalized, setNormalized] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Reverse lookup: hex → signatures
  const [hexInput, setHexInput] = useState("");
  const [signatures, setSignatures] = useState<string[] | null>(null);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupError, setLookupError] = useState<string | null>(null);

  const decode = useCallback(() => {
    setError(null);
    const trimmed = signature.trim();
    if (!trimmed) {
      setHex(null);
      setNormalized(null);
      return;
    }
    try {
      const norm = normalizeSignature(trimmed);
      setNormalized(norm);
      setHex(selectorToHex(trimmed));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Invalid signature");
      setHex(null);
      setNormalized(null);
    }
  }, [signature]);

  const lookupHex = useCallback(async () => {
    setLookupError(null);
    setSignatures(null);
    const trimmed = hexInput.trim();
    if (!trimmed) return;
    const norm = normalizeHexSelector(trimmed);
    if (!norm) {
      setLookupError("Invalid hex: use 4 bytes (8 hex chars), e.g. 0xa9059cbb");
      return;
    }
    setLookupLoading(true);
    try {
      const res = await fetch(`/api/lookup?hex=${encodeURIComponent(norm)}`);
      const data = await res.json();
      if (!res.ok) {
        setLookupError(data.error ?? "Lookup failed");
        return;
      }
      setSignatures(data.signatures ?? []);
      if ((data.signatures ?? []).length === 0) {
        setLookupError("No known signatures for this selector.");
      }
    } catch {
      setLookupError("Lookup failed");
    } finally {
      setLookupLoading(false);
    }
  }, [hexInput]);

  // Auto-decode when hex input is valid (e.g. after paste or typing full selector)
  useEffect(() => {
    const trimmed = hexInput.trim();
    if (!trimmed || !normalizeHexSelector(trimmed)) return;
    const t = setTimeout(() => lookupHex(), 400);
    return () => clearTimeout(t);
  }, [hexInput, lookupHex]);

  return (
    <div className="flex w-full max-w-2xl flex-col gap-8">
      <section className="flex flex-col gap-6">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
          Signature → Hex
        </h2>
        <div className="flex flex-col gap-2">
          <label
            htmlFor="signature"
            className="text-sm font-medium text-zinc-600 dark:text-zinc-400"
          >
            Function or error signature
          </label>
          <textarea
            id="signature"
            placeholder="e.g. transfer(address,uint256)"
            value={signature}
            onChange={(e) => setSignature(e.target.value)}
            onBlur={decode}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && decode()}
            className="min-h-[120px] w-full resize-y rounded-lg border border-zinc-300 bg-white px-4 py-3 font-mono text-sm text-zinc-900 placeholder-zinc-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder-zinc-500"
            spellCheck={false}
          />
          <button
            type="button"
            onClick={decode}
            className="self-start rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 dark:focus:ring-offset-zinc-900"
          >
            Decode to hex
          </button>
        </div>

        {error && (
          <p className="text-sm text-red-600 dark:text-red-400" role="alert">
            {error}
          </p>
        )}

        {(normalized ?? hex) && (
          <div className="flex flex-col gap-3 rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-800/50">
            {normalized && (
              <div>
                <span className="text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  Normalized
                </span>
                <p className="mt-1 break-all font-mono text-sm text-zinc-800 dark:text-zinc-200">
                  {normalized}
                </p>
              </div>
            )}
            {hex && (
              <div>
                <span className="text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  Selector (4 bytes)
                </span>
                <p className="mt-1 font-mono text-lg font-semibold text-emerald-600 dark:text-emerald-400">
                  {hex}
                </p>
                <button
                  type="button"
                  onClick={() => navigator.clipboard.writeText(hex)}
                  className="mt-2 text-xs text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300"
                >
                  Copy
                </button>
              </div>
            )}
          </div>
        )}
      </section>

      <section className="flex flex-col gap-6 border-t border-zinc-200 pt-8 dark:border-zinc-700">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
          Hex → Signature
        </h2>
        <div className="flex flex-col gap-2">
          <label
            htmlFor="hex-input"
            className="text-sm font-medium text-zinc-600 dark:text-zinc-400"
          >
            4-byte selector (hex)
          </label>
          <div className="flex flex-wrap items-center gap-2">
            <input
              id="hex-input"
              type="text"
              placeholder="0xa9059cbb"
              value={hexInput}
              onChange={(e) => setHexInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && lookupHex()}
              className="w-full min-w-[200px] flex-1 rounded-lg border border-zinc-300 bg-white px-4 py-3 font-mono text-sm text-zinc-900 placeholder-zinc-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder-zinc-500"
              spellCheck={false}
            />
            <button
              type="button"
              onClick={lookupHex}
              disabled={lookupLoading}
              className="rounded-lg bg-zinc-800 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-700 dark:hover:bg-zinc-600"
            >
              {lookupLoading ? "Looking up…" : "Decode to signature"}
            </button>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Resolves known function/error names via 4byte.directory. Multiple
            signatures can share the same selector.
          </p>
        </div>

        {lookupError && (
          <p className="text-sm text-red-600 dark:text-red-400" role="alert">
            {lookupError}
          </p>
        )}

        {signatures && signatures.length > 0 && (
          <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-800/50">
            <span className="text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Known signatures
            </span>
            <ul className="mt-2 flex flex-col gap-1.5">
              {signatures.map((sig) => (
                <li key={sig}>
                  <code className="break-all font-mono text-sm text-zinc-800 dark:text-zinc-200">
                    {sig}
                  </code>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      <div className="border-t border-zinc-200 pt-4 dark:border-zinc-700">
        <p className="text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
          Try an example
        </p>
        <ul className="mt-2 flex flex-wrap gap-2">
          {EXAMPLES.map((ex) => (
            <li key={ex}>
              <button
                type="button"
                onClick={() => {
                  setSignature(ex);
                  setError(null);
                  const norm = normalizeSignature(ex);
                  setNormalized(norm);
                  setHex(selectorToHex(ex));
                }}
                className="rounded bg-zinc-200 px-2 py-1 font-mono text-xs text-zinc-700 hover:bg-zinc-300 dark:bg-zinc-600 dark:text-zinc-200 dark:hover:bg-zinc-500"
              >
                {ex}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
