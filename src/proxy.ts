import { type NextRequest, NextResponse } from "next/server";

// An address whose escapes do not decode (such as /orders/%E0%A4%A) makes the router fail
// before any page runs, which the visitor would see as a bare server error. It is treated
// as what it is, an address that names no page.
export function proxy(request: NextRequest) {
  if (decodes(request.nextUrl.pathname)) return NextResponse.next();
  return NextResponse.rewrite(new URL(UNKNOWN_PAGE, request.url), { status: 404 });
}

// Static files and the framework's own assets never carry a shopper's address.
export const config = {
  matcher: ["/((?!_next/|icon.svg|favicon.ico).*)"],
};

const UNKNOWN_PAGE = "/page-not-found";

function decodes(pathname: string): boolean {
  try {
    decodeURIComponent(pathname);
    return true;
  } catch {
    return false;
  }
}
