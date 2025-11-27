import { getServerSession } from "next-auth";
import { authOptions } from "./auth";
import type { Session } from "next-auth";

export const getSession = async (): Promise<Session | null> => {
  return await getServerSession(authOptions);
};

export const requireAuth = async () => {
  const session = await getSession();
  if (!session) {
    throw new Error("Unauthorized");
  }
  return session;
};

export const requireRole = async (allowedRoles: string[]) => {
  const session = await requireAuth();
  const userRole = session.user.role?.toLowerCase();
  
  if (!userRole || !allowedRoles.includes(userRole)) {
    throw new Error("Forbidden");
  }
  
  return session;
};

