import { NextResponse, type NextRequest } from "next/server";

// Auth is now handled client-side (localStorage) in the protected layout.
// This middleware simply passes all requests through.
export function proxy(_request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard", "/dashboard/:path*"],
};
