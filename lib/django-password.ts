import { pbkdf2Sync } from "crypto";
import { compare } from "bcryptjs";

/**
 * Verifies a password against Django's password hash format
 * Django uses format: algorithm$iterations$salt$hash
 * Default algorithm is pbkdf2_sha256
 */
export const verifyDjangoPassword = async (
  password: string,
  hashedPassword: string
): Promise<boolean> => {
  // If password doesn't contain $, it might be plain text or bcrypt
  if (!hashedPassword.includes("$")) {
    // Try bcrypt comparison
    try {
      return await compare(password, hashedPassword);
    } catch {
      return false;
    }
  }

  const parts = hashedPassword.split("$");
  
  if (parts.length < 4) {
    // Try bcrypt comparison as fallback
    try {
      return await compare(password, hashedPassword);
    } catch {
      return false;
    }
  }

  const algorithm = parts[0];
  const iterations = parseInt(parts[1], 10);
  const salt = parts[2];
  const hash = parts[3];

  if (algorithm === "pbkdf2_sha256") {
    // Verify pbkdf2_sha256 hash
    // Django uses 32 bytes (256 bits) for the hash
    const derivedKey = pbkdf2Sync(
      password,
      salt,
      iterations,
      32,
      "sha256"
    );
    // Django uses base64 encoding without padding
    const derivedHash = derivedKey.toString("base64").replace(/=+$/, "");
    return derivedHash === hash;
  }

  // For other algorithms, try bcrypt as fallback
  try {
    return await compare(password, hashedPassword);
  } catch {
    return false;
  }
};

