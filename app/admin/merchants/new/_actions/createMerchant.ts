"use server";

import prisma from "@/lib/prisma";
import { hash } from "bcryptjs";
import { randomBytes } from "crypto";
import type { CreateMerchantFormData } from "@/lib/validations/merchant";

// Generate unique merchant code
const generateMerchantCode = async (): Promise<string> => {
  let code: string;
  let exists: boolean;
  
  do {
    // Generate a 6-character alphanumeric code
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    code = "MC" + Array.from({ length: 6 }, () => 
      chars.charAt(Math.floor(Math.random() * chars.length))
    ).join("");
    
    // Check if code already exists
    const existing = await prisma.vas_merchants.findUnique({
      where: { merchant_code: code },
    });
    exists = !!existing;
  } while (exists);
  
  return code;
};

// Generate username from email
const generateUsernameFromEmail = (email: string): string => {
  // Extract the part before @ symbol
  const usernamePart = email.split("@")[0];
  // Remove any special characters and make it lowercase
  return usernamePart.toLowerCase().replace(/[^a-z0-9_]/g, "_");
};

// Generate secure API token
const generateApiToken = (): string => {
  // Generate a 32-byte random token and convert to base64url
  const token = randomBytes(32);
  return token.toString("base64url");
};

// Generate secure API secret key
const generateApiSecretKey = (): string => {
  // Generate a 32-byte random secret and convert to base64url
  const secret = randomBytes(32);
  return secret.toString("base64url");
};

export const createMerchant = async (data: CreateMerchantFormData) => {
  try {
    // Check if email already exists
    const existingUser = await prisma.vas_users.findUnique({
      where: {
        email: data.email,
      },
    });

    if (existingUser) {
      return {
        success: false,
        error: "Email already exists",
      };
    }

    // Generate username from email
    let username = generateUsernameFromEmail(data.email);
    
    // Check if username already exists, if so append numbers
    let usernameExists = true;
    let counter = 1;
    let finalUsername = username;
    
    while (usernameExists) {
      const existingUsername = await prisma.vas_users.findUnique({
        where: {
          username: finalUsername,
        },
      });
      
      if (!existingUsername) {
        usernameExists = false;
      } else {
        finalUsername = `${username}_${counter}`;
        counter++;
      }
    }

    // Generate unique merchant code
    const merchantCode = await generateMerchantCode();

    // Generate API credentials
    const apiToken = generateApiToken();
    const apiSecretKey = generateApiSecretKey();
    const apiTokenCreated = new Date();
    // Set token expiration to 1 year from now (optional, can be null)
    const apiTokenExpire = new Date();
    apiTokenExpire.setFullYear(apiTokenExpire.getFullYear() + 1);

    // Hash password
    const hashedPassword = await hash(data.password, 10);

    // Create user first
    const user = await prisma.vas_users.create({
      data: {
        email: data.email,
        username: finalUsername,
        password: hashedPassword,
        first_name: data.first_name || "",
        last_name: data.last_name || "",
        phone_number: data.phone_number || null,
        is_active: data.is_active,
        is_staff: false,
        is_superuser: false,
        date_joined: new Date(),
        email_verified: false,
      },
    });

    // Create merchant
    const initialBalance = parseFloat(data.initial_balance || "0");

    const merchant = await prisma.vas_merchants.create({
      data: {
        merchant_code: merchantCode,
        business_name: data.business_name,
        business_description: data.business_description || null,
        address: data.address || null,
        city: data.city || null,
        state: data.state || null,
        country: data.country || null,
        website: data.website || null,
        account_type: data.account_type,
        balance_before: initialBalance,
        current_balance: initialBalance,
        daily_tranx_limit: data.daily_tranx_limit || null,
        api_access_ips: data.api_access_ip || null,
        api_key: apiToken,
        api_secret: apiSecretKey,
        api_key_updated_at: apiTokenCreated,
        api_secret_updated_at: apiTokenExpire,
        is_active: data.is_active,
        user_id: user.id,
        created_at: new Date(),
      },
    });

    // Serialize BigInt values to strings for JSON
    return {
      success: true,
      merchant: {
        ...merchant,
        id: merchant.id.toString(),
        user_id: merchant.user_id?.toString() || null,
        current_balance: merchant.current_balance.toString(),
        balance_before: merchant.balance_before.toString(),
      },
    };
  } catch (error) {
    console.error("Error creating merchant:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "An unknown error occurred",
    };
  }
};

