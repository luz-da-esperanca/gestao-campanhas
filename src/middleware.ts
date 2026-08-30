import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import type { UserRole } from "@/lib/auth/types";

const PUBLIC_PATHS = [
  "/login",
  "/consulta",
  "/cadastro",
  "/participar",
  "/campanhas",
];

function getRoleFromUser(user: {
  app_metadata?: Record<string, unknown>;
}): UserRole | null {
  const role = user.app_metadata?.role;
  if (
    role === "admin" ||
    role === "caravaneiro" ||
    role === "visitante"
  ) {
    return role;
  }
  return null;
}

function isActive(user: { app_metadata?: Record<string, unknown> }): boolean {
  return user.app_metadata?.active !== false;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".") ||
    pathname === "/manifest.webmanifest"
  ) {
    return NextResponse.next();
  }

  const isPublic =
    PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));

  const session = await updateSession(request);

  if (!session.configured) {
    if (isPublic || pathname === "/") {
      if (pathname === "/") {
        const url = request.nextUrl.clone();
        url.pathname = "/login";
        url.searchParams.set("error", "config");
        return NextResponse.redirect(url);
      }
      return session.supabaseResponse;
    }

    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("error", "config");
    return NextResponse.redirect(url);
  }

  const { supabaseResponse, user: authUser } = session;

  if (isPublic) {
    if (authUser && pathname === "/login") {
      const role = getRoleFromUser(authUser);
      if (role && isActive(authUser)) {
        return redirectByRole(role, request);
      }
    }
    return supabaseResponse;
  }

  if (!authUser) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  const role = getRoleFromUser(authUser);

  if (!role || !isActive(authUser)) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("error", "conta_inativa");
    return NextResponse.redirect(url);
  }

  if (pathname.startsWith("/admin") && role !== "admin") {
    return NextResponse.redirect(new URL("/app", request.url));
  }

  if (pathname.startsWith("/app") && role !== "caravaneiro") {
    if (role === "visitante") {
      return NextResponse.redirect(new URL("/campanhas", request.url));
    }
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  if (pathname === "/") {
    return redirectByRole(role, request);
  }

  return supabaseResponse;
}

function redirectByRole(role: UserRole, request: NextRequest): NextResponse {
  const url = request.nextUrl.clone();
  if (role === "admin") url.pathname = "/admin";
  else if (role === "caravaneiro") url.pathname = "/app";
  else url.pathname = "/campanhas";
  url.search = "";
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
