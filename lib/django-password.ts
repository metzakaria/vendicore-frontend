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
  console.log("=== Django Password Verification ===");
  console.log("Password length:", password.length);
  console.log("Hash format:", hashedPassword.substring(0, 30) + "...");
  
  // If password doesn't contain $, it might be plain text or bcrypt
  if (!hashedPassword.includes("$")) {
    console.log("No $ found, trying bcrypt...");
    try {
      return await compare(password, hashedPassword);
    } catch {
      return false;
    }
  }

  const parts = hashedPassword.split("$");
  console.log("Hash parts:", parts.length);
  
  if (parts.length < 4) {
    console.log("Less than 4 parts, trying bcrypt fallback...");
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

  console.log("Algorithm:", algorithm);
  console.log("Iterations:", iterations);
  console.log("Salt:", salt);
  console.log("Expected hash:", hash);

  if (algorithm === "pbkdf2_sha256") {
    // Verify pbkdf2_sha256 hash
    // Django uses 32 bytes (256 bits) for the hash
    console.log("Computing PBKDF2-SHA256...");
    const derivedKey = pbkdf2Sync(
      password,
      salt,
      iterations,
      32,
      "sha256"
    );
    
    // Django uses base64 encoding WITH padding
    const derivedHash = derivedKey.toString("base64");
    console.log("Computed hash:", derivedHash);
    console.log("Hashes match:", derivedHash === hash);
    
    return derivedHash === hash;
  }

  console.log("Unsupported algorithm, trying bcrypt fallback...");
  // For other algorithms, try bcrypt as fallback
  try {
    return await compare(password, hashedPassword);
  } catch {
    return false;
  }
};