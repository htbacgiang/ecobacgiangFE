import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { authService } from "../lib/api-services";
import { UserProfile } from "../utils/types";

/**
 * useAuth: Nguồn auth thống nhất theo BE API.
 * - Có token (đăng nhập BE) → user từ authService.getCurrentUser()
 * - Session Google nhưng chưa có token → gọi sync-token BE, lưu token + user rồi dùng storageUser
 */
const useAuth = () => {
  const { data: session, status } = useSession();
  const [synced, setSynced] = useState(0);
  const token = typeof window !== "undefined" ? authService.getToken() : null;
  const storageUser = typeof window !== "undefined" ? authService.getCurrentUser() : null;

  useEffect(() => {
    if (status !== "authenticated" || !session?.user?.email) return;
    if (authService.getToken()) return;
    authService
      .syncTokenFromSession(session.user.email)
      .then(() => setSynced((n) => n + 1))
      .catch(() => {});
  }, [status, session?.user?.email]);

  const user = storageUser || session?.user;
  const isAuthenticated = !!(token || session);

  const normalizedUser: UserProfile | undefined = user
    ? {
        id: (user as { id?: string }).id ?? (user as { _id?: string })?._id?.toString() ?? "",
        name: (user as { name?: string }).name ?? "",
        email: (user as { email?: string }).email ?? "",
        avatar: (user as { image?: string }).image ?? (user as { avatar?: string }).avatar,
        role: ((user as { role?: string }).role as "user" | "admin") ?? "user",
      }
    : undefined;

  return {
    user: normalizedUser,
    /** Raw user object (BE user or session.user) - dùng khi cần image, phone, v.v. */
    rawUser: user,
    session,
    isAuthenticated,
    status,
    token,
  };
};

export default useAuth;
