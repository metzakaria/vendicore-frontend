"use server";

import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { hash } from "bcryptjs";
import { verifyDjangoPassword } from "@/lib/django-password";

interface ChangePasswordParams {
  currentPassword: string;
  newPassword: string;
}

export const changePassword = async (params: ChangePasswordParams) => {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.id) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    const userId = BigInt(session.user.id);

    // Get user to verify current password
    const user = await prisma.vas_users.findUnique({
      where: { id: userId },
      select: {
        password: true,
      },
    });

    if (!user) {
      return {
        success: false,
        error: "User not found",
      };
    }

    // Verify current password
    const isPasswordValid = await verifyDjangoPassword(
      params.currentPassword,
      user.password
    );

    if (!isPasswordValid) {
      return {
        success: false,
        error: "Current password is incorrect",
      };
    }

    // Validate new password
    if (params.newPassword.length < 8) {
      return {
        success: false,
        error: "New password must be at least 8 characters",
      };
    }

    // Hash and update password
    const hashedPassword = await hash(params.newPassword, 10);

    await prisma.vas_users.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
      },
    });

    return {
      success: true,
    };
  } catch (error) {
    console.error("Error changing password:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unknown error occurred",
    };
  }
};

