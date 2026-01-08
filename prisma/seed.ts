// prisma/seed.ts
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  // Check if we should clear the database first
  const shouldClear = process.argv.includes('--clear');
  if (shouldClear) {
    console.log('Clear flag detected. Note: This only works with seed:full script.');
  }

  try {
    // Create auth groups first
    console.log('Creating auth groups...');
    const adminGroup = await prisma.auth_group.upsert({
      where: { name: 'Admin' },
      update: {},
      create: {
        name: 'Admin',
      },
    });

    const merchantGroup = await prisma.auth_group.upsert({
      where: { name: 'Merchant' },
      update: {},
      create: {
        name: 'Merchant',
      },
    });

    const staffGroup = await prisma.auth_group.upsert({
      where: { name: 'Staff' },
      update: {},
      create: {
        name: 'Staff',
      },
    });

    console.log('✅ Auth groups created');

    // Create Django content types
    console.log('Creating Django content types...');
    const userContentType = await prisma.django_content_type.upsert({
      where: { app_label_model: { app_label: 'vas', model: 'vas_users' } },
      update: {},
      create: {
        app_label: 'vas',
        model: 'vas_users',
      },
    });

    const merchantContentType = await prisma.django_content_type.upsert({
      where: { app_label_model: { app_label: 'vas', model: 'vas_merchants' } },
      update: {},
      create: {
        app_label: 'vas',
        model: 'vas_merchants',
      },
    });

    const productContentType = await prisma.django_content_type.upsert({
      where: { app_label_model: { app_label: 'vas', model: 'vas_products' } },
      update: {},
      create: {
        app_label: 'vas',
        model: 'vas_products',
      },
    });

    console.log('✅ Content types created');

    // Create permissions
    console.log('Creating permissions...');
    const permissions = [
      { name: 'Can add user', codename: 'add_vas_users', content_type_id: userContentType.id },
      { name: 'Can change user', codename: 'change_vas_users', content_type_id: userContentType.id },
      { name: 'Can delete user', codename: 'delete_vas_users', content_type_id: userContentType.id },
      { name: 'Can view user', codename: 'view_vas_users', content_type_id: userContentType.id },
      { name: 'Can add merchant', codename: 'add_vas_merchants', content_type_id: merchantContentType.id },
      { name: 'Can change merchant', codename: 'change_vas_merchants', content_type_id: merchantContentType.id },
      { name: 'Can delete merchant', codename: 'delete_vas_merchants', content_type_id: merchantContentType.id },
      { name: 'Can view merchant', codename: 'view_vas_merchants', content_type_id: merchantContentType.id },
    ];

    for (const perm of permissions) {
      await prisma.auth_permission.upsert({
        where: { content_type_id_codename: { content_type_id: perm.content_type_id, codename: perm.codename } },
        update: {},
        create: perm,
      });
    }

    console.log('✅ Permissions created');

    // Hash passwords
    const saltRounds = 10;
    const adminPassword = await bcrypt.hash('Admin123!', saltRounds);
    const merchantPassword = await bcrypt.hash('Merchant123!', saltRounds);
    const staffPassword = await bcrypt.hash('Staff123!', saltRounds);

    // Create users
    console.log('Creating users...');
    const adminUser = await prisma.vas_users.upsert({
      where: { email: 'admin@example.com' },
      update: {},
      create: {
        username: 'admin',
        email: 'admin@example.com',
        password: adminPassword,
        first_name: 'Admin',
        last_name: 'User',
        is_superuser: true,
        is_staff: true,
        is_active: true,
        email_verified: true,
        date_joined: new Date(),
        email_verified_at: new Date(),
      },
    });

    const merchantUser = await prisma.vas_users.upsert({
      where: { email: 'merchant@example.com' },
      update: {},
      create: {
        username: 'merchant1',
        email: 'merchant@example.com',
        password: merchantPassword,
        first_name: 'John',
        last_name: 'Merchant',
        is_superuser: false,
        is_staff: false,
        is_active: true,
        email_verified: true,
        date_joined: new Date(),
        email_verified_at: new Date(),
        phone_number: '+1234567890',
      },
    });

    const staffUser = await prisma.vas_users.upsert({
      where: { email: 'staff@example.com' },
      update: {},
      create: {
        username: 'staff1',
        email: 'staff@example.com',
        password: staffPassword,
        first_name: 'Jane',
        last_name: 'Staff',
        is_superuser: false,
        is_staff: true,
        is_active: true,
        email_verified: true,
        date_joined: new Date(),
        email_verified_at: new Date(),
      },
    });

    console.log('✅ Users created');

    // Assign users to groups
    console.log('Assigning users to groups...');
    await prisma.vas_users_groups.upsert({
      where: { user_id_group_id: { user_id: adminUser.id, group_id: adminGroup.id } },
      update: {},
      create: {
        user_id: adminUser.id,
        group_id: adminGroup.id,
      },
    });

    await prisma.vas_users_groups.upsert({
      where: { user_id_group_id: { user_id: merchantUser.id, group_id: merchantGroup.id } },
      update: {},
      create: {
        user_id: merchantUser.id,
        group_id: merchantGroup.id,
      },
    });

    await prisma.vas_users_groups.upsert({
      where: { user_id_group_id: { user_id: staffUser.id, group_id: staffGroup.id } },
      update: {},
      create: {
        user_id: staffUser.id,
        group_id: staffGroup.id,
      },
    });

    console.log('✅ Group assignments completed');

    // Create providers
    console.log('Creating providers...');
    const mtnProvider = await prisma.vas_providers.upsert({
      where: { provider_code: 'MTN' },
      update: {},
      create: {
        name: 'MTN Nigeria',
        provider_code: 'MTN',
        description: 'MTN Nigeria provider',
        config_schema: { baseUrl: 'https://api.mtn.com', apiKey: 'required' },
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
    });

    const airtelProvider = await prisma.vas_providers.upsert({
      where: { provider_code: 'AIRTEL' },
      update: {},
      create: {
        name: 'Airtel Nigeria',
        provider_code: 'AIRTEL',
        description: 'Airtel Nigeria provider',
        config_schema: { baseUrl: 'https://api.airtel.com', apiKey: 'required' },
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
    });

    console.log('✅ Providers created');

    // Create provider accounts
    console.log('Creating provider accounts...');
    const mtnAccount = await prisma.vas_provider_accounts.upsert({
      where: { id: 1 },
      update: {},
      create: {
        account_name: 'MTN Main Account',
        available_balance: 1000000.00,
        balance_at_provider: 1000000.00,
        vending_sim: '08012345678',
        config: { accountId: 'MTN001', priority: 1 },
        provider_id: mtnProvider.id,
        created_at: new Date(),
        updated_at: new Date(),
      },
    });

    const airtelAccount = await prisma.vas_provider_accounts.upsert({
      where: { id: 2 },
      update: {},
      create: {
        account_name: 'Airtel Main Account',
        available_balance: 500000.00,
        balance_at_provider: 500000.00,
        vending_sim: '08087654321',
        config: { accountId: 'AIRTEL001', priority: 1 },
        provider_id: airtelProvider.id,
        created_at: new Date(),
        updated_at: new Date(),
      },
    });

    console.log('✅ Provider accounts created');

    // Create product categories
    console.log('Creating product categories...');
    const dataCategory = await prisma.vas_product_categories.upsert({
      where: { category_code: 'DATA' },
      update: {},
      create: {
        name: 'Mobile Data',
        category_code: 'DATA',
        description: 'Mobile data bundles',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
    });

    const airtimeCategory = await prisma.vas_product_categories.upsert({
      where: { category_code: 'AIRTIME' },
      update: {},
      create: {
        name: 'Airtime',
        category_code: 'AIRTIME',
        description: 'Mobile airtime',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
    });

    console.log('✅ Product categories created');

    // Create products
    console.log('Creating products...');
    const mtnDataProduct = await prisma.vas_products.upsert({
      where: { product_code: 'MTN_DATA' },
      update: {},
      create: {
        product_name: 'MTN Data Bundles',
        product_code: 'MTN_DATA',
        description: 'MTN Nigeria data bundles',
        is_active: true,
        category_id: dataCategory.id,
        preferred_provider_account_id: mtnAccount.id,
        backup_provider_account_id: airtelAccount.id,
        created_at: new Date(),
        updated_at: new Date(),
      },
    });

    const mtnAirtimeProduct = await prisma.vas_products.upsert({
      where: { product_code: 'MTN_AIRTIME' },
      update: {},
      create: {
        product_name: 'MTN Airtime',
        product_code: 'MTN_AIRTIME',
        description: 'MTN Nigeria airtime',
        is_active: true,
        category_id: airtimeCategory.id,
        preferred_provider_account_id: mtnAccount.id,
        created_at: new Date(),
        updated_at: new Date(),
      },
    });

    console.log('✅ Products created');

    // Create data packages
    console.log('Creating data packages...');
    await prisma.vas_data_packages.upsert({
      where: { data_code: 'MTN_1GB' },
      update: {},
      create: {
        data_code: 'MTN_1GB',
        amount: 500.00,
        description: '1GB data bundle for MTN',
        duration: '30 days',
        value: '1GB',
        network: 'MTN',
        plan_name: 'MTN 1GB Monthly',
        short_desc: '1GB Monthly',
        payvantage_code: 'MTN1GB',
        creditswitch_code: 'MTN001GB',
        is_active: true,
        product_id: mtnDataProduct.id,
        created_at: new Date(),
        updated_at: new Date(),
      },
    });

    await prisma.vas_data_packages.upsert({
      where: { data_code: 'MTN_2GB' },
      update: {},
      create: {
        data_code: 'MTN_2GB',
        amount: 1000.00,
        description: '2GB data bundle for MTN',
        duration: '30 days',
        value: '2GB',
        network: 'MTN',
        plan_name: 'MTN 2GB Monthly',
        short_desc: '2GB Monthly',
        payvantage_code: 'MTN2GB',
        creditswitch_code: 'MTN002GB',
        is_active: true,
        product_id: mtnDataProduct.id,
        created_at: new Date(),
        updated_at: new Date(),
      },
    });

    console.log('✅ Data packages created');

    // Create merchant
    console.log('Creating merchant...');
    const merchant = await prisma.vas_merchants.upsert({
      where: { merchant_code: 'MER001' },
      update: {},
      create: {
        merchant_code: 'MER001',
        business_name: 'Sample Merchant Ltd',
        address: '123 Business Street',
        city: 'Lagos',
        state: 'Lagos',
        country: 'Nigeria',
        website: 'https://samplemerchant.com',
        balance_before: 0.00,
        current_balance: 100000.00,
        business_description: 'A sample merchant business',
        account_type: 'CORPORATE',
        daily_tranx_limit: '1000000',
        today_tranx_count: '0',
        is_active: true,
        user_id: merchantUser.id,
        created_at: new Date(),
        updated_at: new Date(),
      },
    });

    console.log('✅ Merchant created');

    // Create merchant discount
    console.log('Creating merchant discount...');
    await prisma.vas_merchant_discount.upsert({
      where: { id: 1 },
      update: {},
      create: {
        discount_type: 'PERCENTAGE',
        discount_value: 5.0,
        is_active: true,
        merchant_id: merchant.id,
        product_id: mtnDataProduct.id,
        created_at: new Date(),
        updated_at: new Date(),
        created_by: adminUser.id,
      },
    });

    console.log('✅ Merchant discount created');

    console.log('\n🎉 Seed completed successfully!');
    console.log('\n🔑 Default login credentials:');
    console.log('Admin: admin@example.com / Admin123!');
    console.log('Merchant: merchant@example.com / Merchant123!');
    console.log('Staff: staff@example.com / Staff123!');
    console.log('\n📊 Summary of what was created:');
    console.log('- 3 Auth groups (Admin, Merchant, Staff)');
    console.log('- 3 Users with hashed passwords');
    console.log('- 2 Providers (MTN, Airtel)');
    console.log('- 2 Provider accounts');
    console.log('- 2 Product categories (Data, Airtime)');
    console.log('- 2 Products');
    console.log('- 2 Data packages (1GB, 2GB)');
    console.log('- 1 Merchant with discount');

  } catch (error) {
    console.error('❌ Error during seeding:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });