import prisma from "./prisma";
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { verifyDjangoPassword } from "./django-password";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            console.error("Missing credentials");
            throw new Error("Email and password are required");
          }

          console.log("Attempting to find user with email:", credentials.email);

          const user = await prisma.vas_users.findFirst({
            where: {
              email: credentials.email,
              is_active: true,
            },
          });

          if (!user) {
            console.error("User not found or inactive:", credentials.email);
            throw new Error("Invalid email or password");
          }

          console.log("User found:", {
            id: user.id,
            email: user.email,
            username: user.username,
            is_superuser: user.is_superuser,
            is_staff: user.is_staff,
            is_active: user.is_active,
          });

          console.log("Verifying password...");
          console.log("Password hash from DB:", user.password);
          console.log("Password length:", credentials.password.length);
          console.log("Hash format:", user.password.substring(0, 20) + "...");
          
          const isPasswordValid = await verifyDjangoPassword(
            credentials.password,
            user.password
          );

          console.log("Password valid:", isPasswordValid);

          if (!isPasswordValid) {
            console.error("Invalid password for user:", credentials.email);
            throw new Error("Invalid email or password");
          }

          // Update last_login timestamp
          await prisma.vas_users.update({
            where: { id: user.id },
            data: { last_login: new Date() },
          });

          // Determine user role
          let role = "user";
          let merchantId: string | undefined;
          
          if (user.is_superuser) {
            role = "superadmin";
            console.log("User is superadmin");
          } else if (user.is_staff) {
            role = "admin";
            console.log("User is admin");
          } else {
            // Check if user is associated with a merchant
            const merchant = await prisma.vas_merchants.findFirst({
              where: {
                user_id: user.id,
              },
            });
            if (merchant) {
              role = "merchant";
              merchantId = merchant.id.toString();
              console.log("User is merchant, merchantId:", merchantId);
            }
          }

          const userResponse = {
            id: user.id.toString(),
            email: user.email || user.username,
            name: `${user.first_name} ${user.last_name}`.trim() || user.username,
            role,
            merchantId,
          };

          console.log("Authorization successful, returning user:", userResponse);

          return userResponse;
        } catch (error) {
          console.error("Authorization error:", error);
          throw error;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: string }).role;
        token.merchantId = (user as { merchantId?: string }).merchantId;
        console.log("JWT callback - token updated:", {
          id: token.id,
          role: token.role,
          merchantId: token.merchantId,
        });
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.merchantId = token.merchantId as string | undefined;
        console.log("Session callback - session updated:", {
          id: session.user.id,
          role: session.user.role,
          merchantId: session.user.merchantId,
        });
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    signOut: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: true, // Enable debug mode
};