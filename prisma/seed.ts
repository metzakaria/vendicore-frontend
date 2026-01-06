import bcrypt from "bcryptjs";
import prisma from "../lib/prisma";

const ADMIN_EMAIL = "admin@example.com";
const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "Admin123!";

const MERCHANT_EMAIL = "merchant@example.com";
const MERCHANT_USERNAME = "merchant";
const MERCHANT_PASSWORD = "Merchant123!";
const MERCHANT_CODE = "MRC0001";

const main = async () => {
  const now = new Date();

  // --- Admin user ---
  let adminUser = await prisma.vas_users.findFirst({
    where: { email: ADMIN_EMAIL },
  });

  if (!adminUser) {
    const adminPasswordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);

    adminUser = await prisma.vas_users.create({
      data: {
        email: ADMIN_EMAIL,
        username: ADMIN_USERNAME,
        password: adminPasswordHash,
        first_name: "Admin",
        last_name: "User",
        phone_number: null,
        is_superuser: true,
        is_staff: true,
        is_active: true,
        email_verified: true,
        email_verified_at: now,
        email_verify_token: null,
        date_joined: now,
        last_login: now,
      },
    });

    console.log("Seeded admin user:");
    console.log({
      id: adminUser.id.toString(),
      email: adminUser.email,
      username: adminUser.username,
    });
  } else {
    console.log("Admin user already exists with email", ADMIN_EMAIL);
  }

  // --- Merchant user ---
  let merchantUser = await prisma.vas_users.findFirst({
    where: { email: MERCHANT_EMAIL },
  });

  if (!merchantUser) {
    const merchantPasswordHash = await bcrypt.hash(MERCHANT_PASSWORD, 10);

    merchantUser = await prisma.vas_users.create({
      data: {
        email: MERCHANT_EMAIL,
        username: MERCHANT_USERNAME,
        password: merchantPasswordHash,
        first_name: "Demo",
        last_name: "Merchant",
        phone_number: null,
        is_superuser: false,
        is_staff: false,
        is_active: true,
        email_verified: true,
        email_verified_at: now,
        email_verify_token: null,
        date_joined: now,
        last_login: now,
      },
    });

    console.log("Seeded merchant user:");
    console.log({
      id: merchantUser.id.toString(),
      email: merchantUser.email,
      username: merchantUser.username,
    });
  } else {
    console.log("Merchant user already exists with email", MERCHANT_EMAIL);
  }

  // --- Merchant record linked to merchant user ---
  if (merchantUser) {
    let merchantRecord = await prisma.vas_merchants.findFirst({
      where: {
        OR: [
          { merchant_code: MERCHANT_CODE },
          { user_id: merchantUser.id },
        ],
      },
    });

    if (!merchantRecord) {
      merchantRecord = await prisma.vas_merchants.create({
        data: {
          merchant_code: MERCHANT_CODE,
          business_name: "Demo Merchant",
          address: "123 Demo Street",
          city: "Lagos",
          state: "Lagos",
          country: "NG",
          balance_before: 0,
          current_balance: 0,
          business_description: "Demo merchant account for testing the portal.",
          account_type: "MERCHANT",
          daily_tranx_limit: "100000",
          today_tranx_count: "0",
          api_secret: null,
          api_key: null,
          is_active: true,
          created_at: now,
          updated_at: now,
          last_updated_balance_at: now,
          user_id: merchantUser.id,
          api_access_ips: null,
        },
      });

      console.log("Seeded merchant record:");
      console.log({
        id: merchantRecord.id.toString(),
        merchant_code: merchantRecord.merchant_code,
        business_name: merchantRecord.business_name,
      });
    } else {
      console.log("Merchant record already exists for demo merchant");
    }
  }
};

main()
  .catch((error) => {
    console.error("Error while seeding database:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


