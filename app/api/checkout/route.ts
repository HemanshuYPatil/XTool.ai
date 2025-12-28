import { NextResponse } from "next/server";

export async function GET(req: Request) {
  return NextResponse.redirect(new URL("/billing", req.url));
}

export async function POST() {
  return NextResponse.json(
    { error: "Checkout is disabled. Use credits instead." },
    { status: 410 }
  );
}
