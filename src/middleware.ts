export { default } from "next-auth/middleware";

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/policy-packs/:path*/workspace",
  ],
};
