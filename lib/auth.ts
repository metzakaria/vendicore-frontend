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
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required");
        }

        const user = await prisma.vas_users.findFirst({
          where: {
            email: credentials.email,
            is_active: true,
          },
        });

        if (!user) {
          throw new Error("Invalid email or password");
        }

        // Verify password (supports Django pbkdf2_sha256 and bcrypt)
        const isPasswordValid = await verifyDjangoPassword(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          throw new Error("Invalid email or password");
        }

        // Determine user role
        let role = "user";
        let merchantId: string | undefined;
        
        if (user.is_superuser) {
          role = "superadmin";
        } else if (user.is_staff) {
          role = "admin";
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
          }
        }

        return {
          id: user.id.toString(),
          email: user.email || user.username,
          name: `${user.first_name} ${user.last_name}`.trim() || user.username,
          role,
          merchantId,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: string }).role;
        token.merchantId = (user as { merchantId?: string }).merchantId;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.merchantId = token.merchantId as string | undefined;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

