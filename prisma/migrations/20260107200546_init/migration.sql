-- CreateTable
CREATE TABLE "auth_group" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(150) NOT NULL,

    CONSTRAINT "auth_group_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auth_group_permissions" (
    "id" BIGSERIAL NOT NULL,
    "group_id" INTEGER NOT NULL,
    "permission_id" INTEGER NOT NULL,

    CONSTRAINT "auth_group_permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auth_permission" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "content_type_id" INTEGER NOT NULL,
    "codename" VARCHAR(100) NOT NULL,

    CONSTRAINT "auth_permission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "django_admin_log" (
    "id" SERIAL NOT NULL,
    "action_time" TIMESTAMPTZ(6) NOT NULL,
    "object_id" TEXT,
    "object_repr" VARCHAR(200) NOT NULL,
    "action_flag" SMALLINT NOT NULL,
    "change_message" TEXT NOT NULL,
    "content_type_id" INTEGER,
    "user_id" BIGINT NOT NULL,

    CONSTRAINT "django_admin_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "django_content_type" (
    "id" SERIAL NOT NULL,
    "app_label" VARCHAR(100) NOT NULL,
    "model" VARCHAR(100) NOT NULL,

    CONSTRAINT "django_content_type_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "django_migrations" (
    "id" BIGSERIAL NOT NULL,
    "app" VARCHAR(255) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "applied" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "django_migrations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "django_session" (
    "session_key" VARCHAR(40) NOT NULL,
    "session_data" TEXT NOT NULL,
    "expire_date" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "django_session_pkey" PRIMARY KEY ("session_key")
);

-- CreateTable
CREATE TABLE "vas_data_packages" (
    "id" BIGSERIAL NOT NULL,
    "data_code" VARCHAR(100) NOT NULL,
    "tariff_id" VARCHAR(100),
    "amount" DECIMAL(12,2) NOT NULL,
    "description" TEXT NOT NULL,
    "duration" VARCHAR(100) NOT NULL,
    "value" VARCHAR(100) NOT NULL,
    "network" VARCHAR(100) NOT NULL,
    "plan_name" VARCHAR(100) NOT NULL,
    "short_desc" VARCHAR(100) NOT NULL,
    "payvantage_code" VARCHAR(100) NOT NULL,
    "creditswitch_code" VARCHAR(100) NOT NULL,
    "is_active" BOOLEAN NOT NULL,
    "created_at" TIMESTAMPTZ(6),
    "updated_at" TIMESTAMPTZ(6),
    "product_id" BIGINT NOT NULL,

    CONSTRAINT "vas_data_packages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vas_merchant_discount" (
    "id" BIGSERIAL NOT NULL,
    "discount_type" VARCHAR(100) NOT NULL,
    "discount_value" DOUBLE PRECISION NOT NULL,
    "created_at" TIMESTAMPTZ(6),
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "is_active" BOOLEAN NOT NULL,
    "created_by" BIGINT,
    "merchant_id" BIGINT NOT NULL,
    "product_id" BIGINT NOT NULL,
    "updated_by" BIGINT,

    CONSTRAINT "vas_merchant_discount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vas_merchant_funding" (
    "amount" DECIMAL(12,2) NOT NULL,
    "description" TEXT NOT NULL,
    "funding_ref" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6),
    "is_approved" BOOLEAN NOT NULL,
    "balance_before" DECIMAL(12,2) NOT NULL,
    "balance_after" DECIMAL(12,2) NOT NULL,
    "source" VARCHAR(100) NOT NULL,
    "is_active" BOOLEAN NOT NULL,
    "approved_at" TIMESTAMPTZ(6),
    "is_credited" BOOLEAN NOT NULL,
    "approved_by" BIGINT,
    "created_by" BIGINT NOT NULL,
    "merchant_id" BIGINT NOT NULL,

    CONSTRAINT "vas_merchant_funding_pkey" PRIMARY KEY ("funding_ref")
);

-- CreateTable
CREATE TABLE "vas_merchants" (
    "id" BIGSERIAL NOT NULL,
    "merchant_code" VARCHAR(10) NOT NULL,
    "business_name" VARCHAR(200) NOT NULL,
    "address" TEXT,
    "city" VARCHAR(100),
    "state" VARCHAR(100),
    "country" VARCHAR(100),
    "website" VARCHAR(100),
    "balance_before" DECIMAL(12,2) NOT NULL,
    "current_balance" DECIMAL(12,2) NOT NULL,
    "business_description" TEXT,
    "account_type" VARCHAR(10) NOT NULL,
    "daily_tranx_limit" VARCHAR(200),
    "today_tranx_count" VARCHAR(200),
    "today_tranx_date" DATE,
    "api_secret" TEXT,
    "api_key" TEXT,
    "api_key_updated_at" TIMESTAMPTZ(6),
    "api_secret_updated_at" TIMESTAMPTZ(6),
    "is_active" BOOLEAN NOT NULL,
    "created_at" TIMESTAMPTZ(6),
    "updated_at" TIMESTAMPTZ(6),
    "last_updated_balance_at" TIMESTAMPTZ(6),
    "user_id" BIGINT,
    "api_access_ips" VARCHAR,

    CONSTRAINT "vas_merchants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vas_product_categories" (
    "id" BIGSERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "category_code" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL,
    "created_at" TIMESTAMPTZ(6),
    "updated_at" TIMESTAMPTZ(6),

    CONSTRAINT "vas_product_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vas_products" (
    "id" BIGSERIAL NOT NULL,
    "product_name" VARCHAR(200) NOT NULL,
    "product_code" VARCHAR(50) NOT NULL,
    "description" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL,
    "created_at" TIMESTAMPTZ(6),
    "updated_at" TIMESTAMPTZ(6),
    "backup_provider_account_id" BIGINT,
    "category_id" BIGINT NOT NULL,
    "preferred_provider_account_id" BIGINT,

    CONSTRAINT "vas_products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vas_provider_accounts" (
    "id" BIGSERIAL NOT NULL,
    "account_name" VARCHAR(50) NOT NULL,
    "available_balance" DOUBLE PRECISION NOT NULL,
    "balance_at_provider" DOUBLE PRECISION NOT NULL,
    "vending_sim" VARCHAR(50),
    "config" JSONB,
    "created_at" TIMESTAMPTZ(6),
    "updated_at" TIMESTAMPTZ(6),
    "provider_id" BIGINT NOT NULL,

    CONSTRAINT "vas_provider_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vas_providers" (
    "id" BIGSERIAL NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "provider_code" VARCHAR(50) NOT NULL,
    "description" TEXT,
    "config_schema" JSONB NOT NULL,
    "is_active" BOOLEAN NOT NULL,
    "created_at" TIMESTAMPTZ(6),
    "updated_at" TIMESTAMPTZ(6),

    CONSTRAINT "vas_providers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vas_transactions" (
    "id" BIGSERIAL NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "discount_amount" DECIMAL(12,2) NOT NULL,
    "balance_before" DECIMAL(12,2) NOT NULL,
    "balance_after" DECIMAL(12,2) NOT NULL,
    "beneficiary_account" VARCHAR(50) NOT NULL,
    "description" TEXT NOT NULL,
    "status" VARCHAR(50) NOT NULL,
    "is_reverse" BOOLEAN NOT NULL,
    "reversed_at" TIMESTAMPTZ(6),
    "provider_ref" VARCHAR(230),
    "provider_desc" VARCHAR(230),
    "merchant_ref" VARCHAR(230) NOT NULL,
    "created_at" TIMESTAMPTZ(6),
    "updated_at" TIMESTAMPTZ(6),
    "merchant_id" BIGINT NOT NULL,
    "product_id" BIGINT NOT NULL,
    "product_category_id" BIGINT NOT NULL,
    "provider_account_id" BIGINT,

    CONSTRAINT "vas_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vas_users" (
    "id" BIGSERIAL NOT NULL,
    "password" VARCHAR(128) NOT NULL,
    "last_login" TIMESTAMPTZ(6),
    "is_superuser" BOOLEAN NOT NULL,
    "username" VARCHAR(150) NOT NULL,
    "first_name" VARCHAR(150) NOT NULL,
    "last_name" VARCHAR(150) NOT NULL,
    "is_staff" BOOLEAN NOT NULL,
    "is_active" BOOLEAN NOT NULL,
    "date_joined" TIMESTAMPTZ(6) NOT NULL,
    "email" VARCHAR(254) NOT NULL,
    "phone_number" VARCHAR(15),
    "email_verified" BOOLEAN NOT NULL,
    "email_verified_at" DATE,
    "email_verify_token" VARCHAR(250),

    CONSTRAINT "vas_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vas_users_groups" (
    "id" BIGSERIAL NOT NULL,
    "user_id" BIGINT NOT NULL,
    "group_id" INTEGER NOT NULL,

    CONSTRAINT "vas_users_groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vas_users_user_permissions" (
    "id" BIGSERIAL NOT NULL,
    "user_id" BIGINT NOT NULL,
    "permission_id" INTEGER NOT NULL,

    CONSTRAINT "vas_users_user_permissions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "auth_group_name_key" ON "auth_group"("name");

-- CreateIndex
CREATE INDEX "auth_group_name_a6ea08ec_like" ON "auth_group"("name");

-- CreateIndex
CREATE INDEX "auth_group_permissions_group_id_b120cbf9" ON "auth_group_permissions"("group_id");

-- CreateIndex
CREATE INDEX "auth_group_permissions_permission_id_84c5c92e" ON "auth_group_permissions"("permission_id");

-- CreateIndex
CREATE UNIQUE INDEX "auth_group_permissions_group_id_permission_id_0cd325b0_uniq" ON "auth_group_permissions"("group_id", "permission_id");

-- CreateIndex
CREATE INDEX "auth_permission_content_type_id_2f476e4b" ON "auth_permission"("content_type_id");

-- CreateIndex
CREATE UNIQUE INDEX "auth_permission_content_type_id_codename_01ab375a_uniq" ON "auth_permission"("content_type_id", "codename");

-- CreateIndex
CREATE INDEX "django_admin_log_content_type_id_c4bce8eb" ON "django_admin_log"("content_type_id");

-- CreateIndex
CREATE INDEX "django_admin_log_user_id_c564eba6" ON "django_admin_log"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "django_content_type_app_label_model_76bd3d3b_uniq" ON "django_content_type"("app_label", "model");

-- CreateIndex
CREATE INDEX "django_session_expire_date_a5c62663" ON "django_session"("expire_date");

-- CreateIndex
CREATE INDEX "django_session_session_key_c0390e0f_like" ON "django_session"("session_key");

-- CreateIndex
CREATE UNIQUE INDEX "vas_data_packages_data_code_key" ON "vas_data_packages"("data_code");

-- CreateIndex
CREATE INDEX "vas_data_pa_product_7a9b5e_idx" ON "vas_data_packages"("product_id", "is_active", "data_code");

-- CreateIndex
CREATE INDEX "vas_data_packages_data_code_35729ab9_like" ON "vas_data_packages"("data_code");

-- CreateIndex
CREATE INDEX "vas_data_packages_product_id_998fafbd" ON "vas_data_packages"("product_id");

-- CreateIndex
CREATE INDEX "vas_merchan_discoun_2c75bd_idx" ON "vas_merchant_discount"("discount_type", "is_active");

-- CreateIndex
CREATE INDEX "vas_merchant_discount_created_by_e2156440" ON "vas_merchant_discount"("created_by");

-- CreateIndex
CREATE INDEX "vas_merchant_discount_merchant_id_1c1b1e69" ON "vas_merchant_discount"("merchant_id");

-- CreateIndex
CREATE INDEX "vas_merchant_discount_product_id_9b8982ec" ON "vas_merchant_discount"("product_id");

-- CreateIndex
CREATE INDEX "vas_merchant_discount_updated_by_6caf79b5" ON "vas_merchant_discount"("updated_by");

-- CreateIndex
CREATE INDEX "vas_merchan_funding_64e338_idx" ON "vas_merchant_funding"("funding_ref", "is_approved", "is_active");

-- CreateIndex
CREATE INDEX "vas_merchant_funding_approved_by_c2528eb3" ON "vas_merchant_funding"("approved_by");

-- CreateIndex
CREATE INDEX "vas_merchant_funding_created_by_eedab3c9" ON "vas_merchant_funding"("created_by");

-- CreateIndex
CREATE INDEX "vas_merchant_funding_merchant_id_80cbb2ea" ON "vas_merchant_funding"("merchant_id");

-- CreateIndex
CREATE UNIQUE INDEX "vas_merchants_merchant_code_key" ON "vas_merchants"("merchant_code");

-- CreateIndex
CREATE UNIQUE INDEX "vas_merchants_user_id_key" ON "vas_merchants"("user_id");

-- CreateIndex
CREATE INDEX "merchant_code_index" ON "vas_merchants"("merchant_code");

-- CreateIndex
CREATE INDEX "vas_merchants_merchant_code_357fdfb9_like" ON "vas_merchants"("merchant_code");

-- CreateIndex
CREATE UNIQUE INDEX "vas_product_categories_category_code_key" ON "vas_product_categories"("category_code");

-- CreateIndex
CREATE INDEX "vas_product_categor_e6a532_idx" ON "vas_product_categories"("category_code", "is_active");

-- CreateIndex
CREATE INDEX "vas_product_categories_category_code_7203755a_like" ON "vas_product_categories"("category_code");

-- CreateIndex
CREATE UNIQUE INDEX "vas_products_product_code_key" ON "vas_products"("product_code");

-- CreateIndex
CREATE INDEX "vas_product_product_273ff1_idx" ON "vas_products"("product_code", "preferred_provider_account_id", "backup_provider_account_id", "is_active");

-- CreateIndex
CREATE INDEX "vas_products_backup_provider_account_id_914a974f" ON "vas_products"("backup_provider_account_id");

-- CreateIndex
CREATE INDEX "vas_products_category_id_85b39165" ON "vas_products"("category_id");

-- CreateIndex
CREATE INDEX "vas_products_preferred_provider_account_id_a37422f8" ON "vas_products"("preferred_provider_account_id");

-- CreateIndex
CREATE INDEX "vas_products_product_code_f172055b_like" ON "vas_products"("product_code");

-- CreateIndex
CREATE INDEX "vas_provide_provide_038ab1_idx" ON "vas_provider_accounts"("provider_id", "account_name");

-- CreateIndex
CREATE INDEX "vas_provider_accounts_provider_id_a6894a8d" ON "vas_provider_accounts"("provider_id");

-- CreateIndex
CREATE UNIQUE INDEX "vas_providers_provider_code_key" ON "vas_providers"("provider_code");

-- CreateIndex
CREATE INDEX "vas_provide_provide_729c89_idx" ON "vas_providers"("provider_code", "is_active");

-- CreateIndex
CREATE INDEX "vas_providers_provider_code_a1811428_like" ON "vas_providers"("provider_code");

-- CreateIndex
CREATE UNIQUE INDEX "vas_transactions_merchant_ref_key" ON "vas_transactions"("merchant_ref");

-- CreateIndex
CREATE INDEX "vas_transac_benefic_fd8906_idx" ON "vas_transactions"("beneficiary_account", "status", "product_id", "provider_ref", "merchant_ref", "created_at", "product_category_id", "amount");

-- CreateIndex
CREATE INDEX "vas_transactions_merchant_id_25345eea" ON "vas_transactions"("merchant_id");

-- CreateIndex
CREATE INDEX "vas_transactions_merchant_ref_4a0deec3_like" ON "vas_transactions"("merchant_ref");

-- CreateIndex
CREATE INDEX "vas_transactions_product_category_id_c99b7e24" ON "vas_transactions"("product_category_id");

-- CreateIndex
CREATE INDEX "vas_transactions_product_id_08d3a684" ON "vas_transactions"("product_id");

-- CreateIndex
CREATE INDEX "vas_transactions_provider_account_id_9c1207d9" ON "vas_transactions"("provider_account_id");

-- CreateIndex
CREATE UNIQUE INDEX "vas_users_username_key" ON "vas_users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "vas_users_email_key" ON "vas_users"("email");

-- CreateIndex
CREATE INDEX "vas_users_email_78bdc28b_like" ON "vas_users"("email");

-- CreateIndex
CREATE INDEX "vas_users_username_4408ed50_like" ON "vas_users"("username");

-- CreateIndex
CREATE INDEX "vas_users_groups_group_id_1cbea9df" ON "vas_users_groups"("group_id");

-- CreateIndex
CREATE INDEX "vas_users_groups_user_id_0e9274f0" ON "vas_users_groups"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "vas_users_groups_user_id_group_id_40c1b9aa_uniq" ON "vas_users_groups"("user_id", "group_id");

-- CreateIndex
CREATE INDEX "vas_users_user_permissions_permission_id_46de1d94" ON "vas_users_user_permissions"("permission_id");

-- CreateIndex
CREATE INDEX "vas_users_user_permissions_user_id_ecf93b24" ON "vas_users_user_permissions"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "vas_users_user_permissions_user_id_permission_id_4c525f84_uniq" ON "vas_users_user_permissions"("user_id", "permission_id");

-- AddForeignKey
ALTER TABLE "auth_group_permissions" ADD CONSTRAINT "auth_group_permissio_permission_id_84c5c92e_fk_auth_perm" FOREIGN KEY ("permission_id") REFERENCES "auth_permission"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "auth_group_permissions" ADD CONSTRAINT "auth_group_permissions_group_id_b120cbf9_fk_auth_group_id" FOREIGN KEY ("group_id") REFERENCES "auth_group"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "auth_permission" ADD CONSTRAINT "auth_permission_content_type_id_2f476e4b_fk_django_co" FOREIGN KEY ("content_type_id") REFERENCES "django_content_type"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "django_admin_log" ADD CONSTRAINT "django_admin_log_content_type_id_c4bce8eb_fk_django_co" FOREIGN KEY ("content_type_id") REFERENCES "django_content_type"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "django_admin_log" ADD CONSTRAINT "django_admin_log_user_id_c564eba6_fk_vas_users_id" FOREIGN KEY ("user_id") REFERENCES "vas_users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "vas_data_packages" ADD CONSTRAINT "vas_data_packages_product_id_998fafbd_fk_vas_products_id" FOREIGN KEY ("product_id") REFERENCES "vas_products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "vas_merchant_discount" ADD CONSTRAINT "vas_merchant_discount_created_by_e2156440_fk_vas_users_id" FOREIGN KEY ("created_by") REFERENCES "vas_users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "vas_merchant_discount" ADD CONSTRAINT "vas_merchant_discount_merchant_id_1c1b1e69_fk_vas_merchants_id" FOREIGN KEY ("merchant_id") REFERENCES "vas_merchants"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "vas_merchant_discount" ADD CONSTRAINT "vas_merchant_discount_product_id_9b8982ec_fk_vas_products_id" FOREIGN KEY ("product_id") REFERENCES "vas_products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "vas_merchant_discount" ADD CONSTRAINT "vas_merchant_discount_updated_by_6caf79b5_fk_vas_users_id" FOREIGN KEY ("updated_by") REFERENCES "vas_users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "vas_merchant_funding" ADD CONSTRAINT "vas_merchant_funding_approved_by_c2528eb3_fk_vas_users_id" FOREIGN KEY ("approved_by") REFERENCES "vas_users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "vas_merchant_funding" ADD CONSTRAINT "vas_merchant_funding_created_by_eedab3c9_fk_vas_users_id" FOREIGN KEY ("created_by") REFERENCES "vas_users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "vas_merchant_funding" ADD CONSTRAINT "vas_merchant_funding_merchant_id_80cbb2ea_fk_vas_merchants_id" FOREIGN KEY ("merchant_id") REFERENCES "vas_merchants"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "vas_merchants" ADD CONSTRAINT "vas_merchants_user_id_3d406852_fk_vas_users_id" FOREIGN KEY ("user_id") REFERENCES "vas_users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "vas_products" ADD CONSTRAINT "vas_products_backup_provider_acco_914a974f_fk_vas_provi" FOREIGN KEY ("backup_provider_account_id") REFERENCES "vas_provider_accounts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "vas_products" ADD CONSTRAINT "vas_products_category_id_85b39165_fk_vas_product_categories_id" FOREIGN KEY ("category_id") REFERENCES "vas_product_categories"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "vas_products" ADD CONSTRAINT "vas_products_preferred_provider_a_a37422f8_fk_vas_provi" FOREIGN KEY ("preferred_provider_account_id") REFERENCES "vas_provider_accounts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "vas_provider_accounts" ADD CONSTRAINT "vas_provider_accounts_provider_id_a6894a8d_fk_vas_providers_id" FOREIGN KEY ("provider_id") REFERENCES "vas_providers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "vas_transactions" ADD CONSTRAINT "vas_transactions_merchant_id_25345eea_fk_vas_merchants_id" FOREIGN KEY ("merchant_id") REFERENCES "vas_merchants"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "vas_transactions" ADD CONSTRAINT "vas_transactions_product_category_id_c99b7e24_fk_vas_produ" FOREIGN KEY ("product_category_id") REFERENCES "vas_product_categories"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "vas_transactions" ADD CONSTRAINT "vas_transactions_product_id_08d3a684_fk_vas_products_id" FOREIGN KEY ("product_id") REFERENCES "vas_products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "vas_transactions" ADD CONSTRAINT "vas_transactions_provider_account_id_9c1207d9_fk_vas_provi" FOREIGN KEY ("provider_account_id") REFERENCES "vas_provider_accounts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "vas_users_groups" ADD CONSTRAINT "vas_users_groups_group_id_1cbea9df_fk_auth_group_id" FOREIGN KEY ("group_id") REFERENCES "auth_group"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "vas_users_groups" ADD CONSTRAINT "vas_users_groups_user_id_0e9274f0_fk_vas_users_id" FOREIGN KEY ("user_id") REFERENCES "vas_users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "vas_users_user_permissions" ADD CONSTRAINT "vas_users_user_permi_permission_id_46de1d94_fk_auth_perm" FOREIGN KEY ("permission_id") REFERENCES "auth_permission"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "vas_users_user_permissions" ADD CONSTRAINT "vas_users_user_permissions_user_id_ecf93b24_fk_vas_users_id" FOREIGN KEY ("user_id") REFERENCES "vas_users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
