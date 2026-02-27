import { NextRequest, NextResponse } from "next/server";
import { normalizeHexSelector } from "@/lib/selector";

const FOURBYTE_API = "https://www.4byte.directory/api/v1/signatures/";

export async function GET(request: NextRequest) {
  const hex = request.nextUrl.searchParams.get("hex");
  if (!hex) {
    return NextResponse.json(
      { error: "Missing hex query parameter" },
      { status: 400 }
    );
  }
  const normalized = normalizeHexSelector(hex);
  if (!normalized) {
    return NextResponse.json(
      { error: "Invalid hex: must be 4 bytes (8 hex chars), e.g. 0xa9059cbb" },
      { status: 400 }
    );
  }
  try {
    const res = await fetch(
      `${FOURBYTE_API}?hex_signature=${encodeURIComponent(normalized)}`,
      { next: { revalidate: 86400 } }
    );
    if (!res.ok) {
      return NextResponse.json(
        { error: "Lookup service unavailable" },
        { status: 502 }
      );
    }
    const data = (await res.json()) as {
      results?: { text_signature: string }[];
    };
    const signatures = (data.results ?? []).map((r) => r.text_signature);
    return NextResponse.json({ hex: normalized, signatures });
  } catch {
    return NextResponse.json(
      { error: "Lookup failed" },
      { status: 502 }
    );
  }
}
