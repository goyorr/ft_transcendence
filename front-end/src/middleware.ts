import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { cookies } from "next/headers";

const getRefreshToken = async (
  access: string | undefined,
  responseCookies: NextResponse,
  refresh: string | undefined
): Promise<string | undefined> => {
  if (refresh === undefined || access === undefined) {
    return undefined;
  }
  const response = await fetch("https://nginx/api/v1/decode_and_check/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ access_token: access }),
  });

  const data = await response.json();
  if (response.ok) {
    return access;
  }

  if (response.status === 401 && data.message === "expired") {
    const refreshResponse = await fetch("https://nginx/api/v1/refresh/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        refresh: refresh,
      }),
    });
    const accessToken = await refreshResponse.json();
    responseCookies.cookies.set("access", accessToken.access);
    return accessToken.access;
  } else if (response.status === 401) {
    responseCookies.cookies.delete("access");
    responseCookies.cookies.delete("refresh");
  }
  return undefined;
};

export async function middleware(request: NextRequest) {
  const responseCookies = NextResponse.next();

  const isPrivate: boolean =
    request.nextUrl.pathname == "/profile" ||
    request.nextUrl.pathname == "/matchhistory" ||
    request.nextUrl.pathname == "/settings" ||
    request.nextUrl.pathname == "/notifications" ||
    request.nextUrl.pathname.split("/")[1] == "profile" ||
    request.nextUrl.pathname.split("/")[1] == "settings" ||
    request.nextUrl.pathname == "/block" ||
    request.nextUrl.pathname == "/chat" ||
    request.nextUrl.pathname == "game" ||
    request.nextUrl.pathname.split("/")[1] == "game";

  const isPublic: boolean =
    request.nextUrl.pathname === "/login" ||
    request.nextUrl.pathname === "/signup" ||
    request.nextUrl.pathname === "/auth" ||
    request.nextUrl.pathname === "/reset" ||
    request.nextUrl.pathname.split("/")[1] === "forgot-password";

  const cookieStore = cookies();
  const token: string | undefined = cookieStore.get("access")?.value;
  const refresh: string | undefined = cookieStore.get("refresh")?.value;

  if (isPublic && token === undefined) {
    return;
  } else {
    try {
      const getRefresh = await getRefreshToken(token, responseCookies, refresh);
      if (getRefresh !== undefined) {
        if (isPublic) {
          return NextResponse.redirect(new URL("/game", request.url));
        }
      } else if (getRefresh === undefined && isPrivate) {
        return NextResponse.redirect(new URL("/login", request.url));
      }
      return responseCookies;
    } catch (e) {
      return;
    }
  }
}

export const config = {
  matcher: [
    "/",
    "/profile/:path*",
    "/profile",
    "/settings/changepassword",
    "/login",
    "/signup",
    "/matchhistory",
    "/settings",
    "/auth",
    "/notifications",
    "/BlockList",
    "/reset",
    "/forgot-password/:path",
    "/game",
    "/game/:path*",
    "/chat",
  ],
};
