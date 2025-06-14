// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getPartnerBySlug } from "./lib/partner";

export async function middleware(req: NextRequest) {
  const host = (req.headers.get("host") || "").split(":")[0];
  const url = req.nextUrl.clone();
  const path = url.pathname;

  // 1) Still skip NextAuth & static assets:
  if (
    path.startsWith("/api/auth") ||
    path.startsWith("/_next/") ||
    path.startsWith("/favicon")
  ) {
    return NextResponse.next();
  }

  // 2) Extract subdomain:
  const [subdomain] = host.split(".");
  const isLocalhost = host === "localhost" || host === "127.0.0.1";
  const isVercelApp = host.endsWith(".vercel.app");
  const isCustomApex =
    host === "optimatesting.co.uk" || host === "www.optimatesting.co.uk";

  // If it’s the apex (no subdomain), just serve your main site:
  if (isLocalhost || isVercelApp || isCustomApex) {
    return NextResponse.next();
  }

  // 3) For any real subdomain, do the lookup:
  const partner = await getPartnerBySlug(subdomain);
  if (!partner || partner.partner_status !== "approved") {
    return new NextResponse(null, { status: 404 });
  }

  // 4) If you want your old GET /api/partner-products?partner_id=… logic to keep working:
  if (req.method === "GET" && path === "/api/partner-products") {
    url.searchParams.set("partner_id", partner.id);
    return NextResponse.rewrite(url);
  }

  // 5) Otherwise inject the header and go:
  const res = NextResponse.next();
  res.headers.set("x-partner-id", partner.id);
  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon).*)"],
};
