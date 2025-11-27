"use server";

import prisma from "@/lib/prisma";
import type { UpdateUserFormData } from "@/lib/validations/user";
import bcrypt from "bcryptjs";

export const updateUser = async (userId: string, data: UpdateUserFormData) => {
  try {
    // Check if user exists
    const existingUser = await prisma.vas_users.findUnique({
      where: {
        id: BigInt(userId),
      },
    });

    if (!existingUser) {
      return {
        success: false,
        error: "User not found",
      };
    }

    // Check if username already exists (and it's not the current user)
    if (data.username !== existingUser.username) {
      const userWithSameUsername = await prisma.vas_users.findUnique({
        where: {
          username: data.username,
        },
      });

      if (userWithSameUsername) {
        return {
          success: false,
          error: "Username already exists. Please choose a different username.",
        };
      }
    }

    // Check if email already exists (and it's not the current user)
    if (data.email !== existingUser.email) {
      const userWithSameEmail = await prisma.vas_users.findUnique({
        where: {
          email: data.email,
        },
      });

      if (userWithSameEmail) {
        return {
          success: false,
          error: "Email already exists. Please use a different email.",
        };
      }
    }

    // Prepare update data
    const updateData: any = {
      username: data.username,
      email: data.email,
      first_name: data.first_name || "",
      last_name: data.last_name || "",
      phone_number: data.phone_number || null,
      is_superuser: data.is_superuser,
      is_staff: data.is_staff,
      is_active: data.is_active,
    };

    // Only update password if provided
    if (data.password && data.password.length > 0) {
      updateData.password = await bcrypt.hash(data.password, 10);
    }

    // Update user
    const user = await prisma.vas_users.update({
      where: {
        id: BigInt(userId),
      },
      data: updateData,
    });

    // Serialize BigInt values to strings for JSON
    return {
      success: true,
      user: {
        ...user,
        id: user.id.toString(),
      },
    };
  } catch (error) {
    console.error("Error updating user:", error);
    if (error instanceof Error && error.message.includes("Unique constraint")) {
      return {
        success: false,
        error: "Username or email already exists. Please choose different values.",
      };
    }
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "An unknown error occurred",
    };
  }
};

