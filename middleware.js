import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const isAuth = !!token;
    const isAuthPage =
      req.nextUrl.pathname.startsWith("/dang-nhap") ||
      req.nextUrl.pathname.startsWith("/dang-ky");
    const isAdminPage =
      req.nextUrl.pathname.startsWith("/dashboard") ||
      req.nextUrl.pathname.startsWith("/admin");
    const isSetupPage = req.nextUrl.pathname.startsWith("/admin/setup");

    // Cho phép truy cập trang setup admin
    if (isSetupPage) {
      return NextResponse.next();
    }

    // Trang đăng nhập/đăng ký: nếu đã đăng nhập thì redirect
    if (isAuthPage) {
      if (isAuth) {
        if (token?.role === "admin") {
          return NextResponse.redirect(new URL("/dashboard", req.url));
        }
        return NextResponse.redirect(new URL("/", req.url));
      }
      return NextResponse.next();
    }

    // Trang admin/dashboard: bắt buộc đăng nhập và role admin
    if (isAdminPage) {
      if (!isAuth) {
        const callbackUrl = req.nextUrl.pathname + req.nextUrl.search;
        return NextResponse.redirect(
          new URL(
            `/dang-nhap?callbackUrl=${encodeURIComponent(callbackUrl)}`,
            req.url
          )
        );
      }
      if (token?.role !== "admin") {
        return NextResponse.redirect(new URL("/", req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      // Cho phép truy cập trang đăng nhập/đăng ký khi chưa có token (tránh vòng lặp redirect)
      authorized: ({ token, req }) => {
        const path = req.nextUrl?.pathname || "";
        if (path.startsWith("/dang-nhap") || path.startsWith("/dang-ky")) {
          return true;
        }
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/admin/:path*",
    "/dang-nhap",
    "/dang-ky",
  ],
};
