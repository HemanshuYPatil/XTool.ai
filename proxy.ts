import { withAuth } from "@kinde-oss/kinde-auth-nextjs/middleware";

export default withAuth(
  async function middleware(req: any) {
    void req;
    // console.log("look at me", req.kindeAuth);
  },
  {
    isReturnToCurrentPage: true,
    loginPage: "/api/auth/login",
    isAuthorized: ({ token }: { token: any }) => {
      // The user will be considered authorized if they have a valid token
      return token != null;
    },
  }
);

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/account/:path*",
    "/project/:path*",
    "/billing/:path*",
    "/settings/:path*",
  ],
};
