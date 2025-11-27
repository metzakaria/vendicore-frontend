"use server";

import prisma from "@/lib/prisma";
import type { CreateUserFormData } from "@/lib/validations/user";
import bcrypt from "bcryptjs";

export const createUser = async (data: CreateUserFormData) => {
  try {
    // Check if username already exists
    const existingUsername = await prisma.vas_users.findUnique({
      where: {
        username: data.username,
      },
    });

    if (existingUsername) {
      return {
        success: false,
        error: "Username already exists. Please choose a different username.",
      };
    }

    // Check if email already exists
    const existingEmail = await prisma.vas_users.findUnique({
      where: {
        email: data.email,
      },
    });

    if (existingEmail) {
      return {
        success: false,
        error: "Email already exists. Please use a different email.",
      };
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Create user
    const user = await prisma.vas_users.create({
      data: {
        username: data.username,
        email: data.email,
        first_name: data.first_name || "",
        last_name: data.last_name || "",
        phone_number: data.phone_number || null,
        password: hashedPassword,
        is_superuser: data.is_superuser,
        is_staff: data.is_staff,
        is_active: data.is_active,
        email_verified: false,
        date_joined: new Date(),
      },
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
    console.error("Error creating user:", error);
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

