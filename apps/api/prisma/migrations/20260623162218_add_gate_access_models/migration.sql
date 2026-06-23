-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('super_admin', 'estate_manager', 'landlord', 'tenant', 'security_staff', 'maintenance_staff', 'viewer');

-- CreateEnum
CREATE TYPE "IdType" AS ENUM ('ghana_card', 'passport');

-- CreateEnum
CREATE TYPE "OccupancyType" AS ENUM ('self_occupied', 'rented');

-- CreateEnum
CREATE TYPE "ChangeRequestStatus" AS ENUM ('pending', 'approved', 'rejected');

-- CreateEnum
CREATE TYPE "UnitStatus" AS ENUM ('vacant', 'occupied', 'under_maintenance', 'reserved');

-- CreateEnum
CREATE TYPE "UnitType" AS ENUM ('studio', 'one_bed', 'two_bed', 'three_bed', 'penthouse', 'commercial');

-- CreateEnum
CREATE TYPE "LeaseStatus" AS ENUM ('draft', 'pending_signature', 'active', 'expired', 'terminated', 'renewed');

-- CreateEnum
CREATE TYPE "ChargeType" AS ENUM ('fixed', 'per_unit', 'per_sqft', 'percentage_of_rent', 'tiered');

-- CreateEnum
CREATE TYPE "FeeComponentCategory" AS ENUM ('utility', 'security', 'cleaning', 'administration', 'insurance', 'reserve_fund', 'amenity', 'infrastructure', 'special_levy');

-- CreateEnum
CREATE TYPE "BillingFrequency" AS ENUM ('monthly', 'quarterly', 'semi_annually', 'annually', 'one_time');

-- CreateEnum
CREATE TYPE "FeeScheduleStatus" AS ENUM ('draft', 'notice_published', 'active', 'archived');

-- CreateEnum
CREATE TYPE "InvoiceStatus" AS ENUM ('draft', 'sent', 'paid', 'partially_paid', 'overdue', 'cancelled');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('pending', 'completed', 'failed', 'refunded', 'partially_paid');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('bank_transfer', 'card', 'mobile_money', 'cash');

-- CreateEnum
CREATE TYPE "ServiceRequestStatus" AS ENUM ('submitted', 'acknowledged', 'assigned', 'in_progress', 'pending_approval', 'completed', 'closed');

-- CreateEnum
CREATE TYPE "ServiceRequestPriority" AS ENUM ('critical', 'high', 'normal', 'low');

-- CreateEnum
CREATE TYPE "ServiceRequestCategory" AS ENUM ('plumbing', 'electrical', 'structural', 'appliance', 'pest_control', 'hvac', 'general', 'emergency');

-- CreateEnum
CREATE TYPE "ComplaintStatus" AS ENUM ('open', 'investigating', 'action_taken', 'pending_closure', 'closed');

-- CreateEnum
CREATE TYPE "ComplaintCategory" AS ENUM ('noise', 'plumbing_complaint', 'security_complaint', 'neighbor_dispute', 'management_issue', 'billing', 'structural_complaint', 'pest', 'facility', 'staff_behavior', 'other');

-- CreateEnum
CREATE TYPE "StaffRole" AS ENUM ('security_guard', 'cleaner', 'electrician', 'plumber', 'facility_manager', 'receptionist', 'gate_officer');

-- CreateEnum
CREATE TYPE "UtilityType" AS ENUM ('electricity', 'water', 'gas', 'internet', 'waste_collection');

-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('lease_agreement', 'id_document', 'proof_of_income', 'move_in_report', 'notice_letter', 'policy_document', 'vendor_contract', 'insurance_certificate', 'inspection_report');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "phone" TEXT,
    "avatar_url" TEXT,
    "avatar_required" BOOLEAN NOT NULL DEFAULT true,
    "id_type" "IdType",
    "id_number" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'tenant',
    "email_verified" BOOLEAN NOT NULL DEFAULT false,
    "mfa_enabled" BOOLEAN NOT NULL DEFAULT false,
    "mfa_secret" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "last_login_at" TIMESTAMP(3),
    "reset_token" TEXT,
    "reset_token_expiry" TIMESTAMP(3),
    "estate_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "token" TEXT NOT NULL,
    "user_id" UUID NOT NULL,
    "user_agent" TEXT,
    "ip_address" TEXT,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "revoked_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "login_attempts" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID,
    "email" TEXT NOT NULL,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "success" BOOLEAN NOT NULL,
    "reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "login_attempts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invitations" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "email" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "estate_id" UUID NOT NULL,
    "token" TEXT NOT NULL,
    "first_name" TEXT,
    "last_name" TEXT,
    "invited_by" UUID NOT NULL,
    "accepted_at" TIMESTAMP(3),
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "invitations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "estates" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "city" TEXT,
    "state" TEXT,
    "country" TEXT,
    "postal_code" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "logo_url" TEXT,
    "description" TEXT,
    "timezone" TEXT NOT NULL DEFAULT 'UTC',
    "currency" TEXT NOT NULL DEFAULT 'GHS',
    "rules" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_by" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "estates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clusters" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "estate_id" UUID NOT NULL,
    "code" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "clusters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "buildings" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "estate_id" UUID NOT NULL,
    "cluster_id" UUID,
    "address" TEXT,
    "floors" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "buildings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "units" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "unit_number" TEXT NOT NULL,
    "house_number" TEXT,
    "building_id" UUID NOT NULL,
    "floor" INTEGER NOT NULL DEFAULT 1,
    "unit_type" "UnitType" NOT NULL DEFAULT 'one_bed',
    "status" "UnitStatus" NOT NULL DEFAULT 'vacant',
    "size_sqft" DOUBLE PRECISION,
    "bedrooms" INTEGER NOT NULL DEFAULT 1,
    "bathrooms" INTEGER NOT NULL DEFAULT 1,
    "features" JSONB,
    "rent_amount" DECIMAL(12,2),
    "floor_plan_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "units_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "unit_history" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "unit_id" UUID NOT NULL,
    "action" TEXT NOT NULL,
    "details" JSONB,
    "actor_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "unit_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "amenities" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "amenities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "estate_amenities" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "estate_id" UUID NOT NULL,
    "amenity_id" UUID NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "estate_amenities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "landlords" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "estate_id" UUID NOT NULL,
    "bank_name" TEXT,
    "bank_account_no" TEXT,
    "bank_account_name" TEXT,
    "bank_code" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "landlords_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tenants" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "estate_id" UUID NOT NULL,
    "landlord_id" UUID,
    "emergency_contact" TEXT,
    "emergency_phone" TEXT,
    "employer_name" TEXT,
    "employer_phone" TEXT,
    "id_type" "IdType",
    "id_number" TEXT,
    "id_document_url" TEXT,
    "date_of_birth" TIMESTAMP(3),
    "nationality" TEXT DEFAULT 'Ghanaian',
    "occupation" TEXT,
    "added_by_landlord" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "tenants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "family_members" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "relationship" TEXT NOT NULL,
    "date_of_birth" TIMESTAMP(3),
    "phone" TEXT,
    "photo_url" TEXT,
    "id_type" "IdType",
    "id_number" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "family_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tenant_change_requests" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "field" TEXT NOT NULL,
    "old_value" TEXT,
    "new_value" TEXT NOT NULL,
    "reason" TEXT,
    "status" "ChangeRequestStatus" NOT NULL DEFAULT 'pending',
    "reviewed_by" UUID,
    "reviewed_at" TIMESTAMP(3),
    "review_note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tenant_change_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "property_ownerships" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "landlord_id" UUID NOT NULL,
    "unit_id" UUID NOT NULL,
    "occupancy_type" "OccupancyType" NOT NULL DEFAULT 'self_occupied',
    "acquired_date" TIMESTAMP(3),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "property_ownerships_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "leases" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "unit_id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "landlord_id" UUID NOT NULL,
    "status" "LeaseStatus" NOT NULL DEFAULT 'draft',
    "rent_amount" DECIMAL(12,2) NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "terms" TEXT,
    "deposit_amount" DECIMAL(12,2),
    "deposit_status" TEXT,
    "signed_at" TIMESTAMP(3),
    "terminated_at" TIMESTAMP(3),
    "termination_reason" TEXT,
    "created_by" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "leases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fee_components" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "estate_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" "FeeComponentCategory" NOT NULL,
    "charge_type" "ChargeType" NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "frequency" "BillingFrequency" NOT NULL,
    "landlord_split" INTEGER NOT NULL DEFAULT 30,
    "tenant_split" INTEGER NOT NULL DEFAULT 70,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_suspended" BOOLEAN NOT NULL DEFAULT false,
    "suspended_reason" TEXT,
    "justification" TEXT,
    "metadata" JSONB,
    "created_by" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "fee_components_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fee_component_documents" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "fee_component_id" UUID NOT NULL,
    "file_name" TEXT NOT NULL,
    "file_url" TEXT NOT NULL,
    "file_type" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "fee_component_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fee_schedules" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "estate_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "status" "FeeScheduleStatus" NOT NULL DEFAULT 'draft',
    "effective_date" TIMESTAMP(3),
    "notice_date" TIMESTAMP(3),
    "version" INTEGER NOT NULL DEFAULT 1,
    "changelog" TEXT,
    "created_by" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "fee_schedules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fee_schedule_versions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "fee_schedule_id" UUID NOT NULL,
    "version" INTEGER NOT NULL,
    "data" JSONB NOT NULL,
    "changelog" TEXT,
    "created_by" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "fee_schedule_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fee_schedule_components" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "fee_schedule_id" UUID NOT NULL,
    "fee_component_id" UUID NOT NULL,
    "landlord_split" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "tenant_split" DECIMAL(5,2) NOT NULL DEFAULT 100,

    CONSTRAINT "fee_schedule_components_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "unit_fee_assignments" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "unit_id" UUID NOT NULL,
    "fee_schedule_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "unit_fee_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "special_levies" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "estate_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "amount" DECIMAL(12,2) NOT NULL,
    "justification" TEXT,
    "installments" INTEGER NOT NULL DEFAULT 1,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_by" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "special_levies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fee_waivers" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "fee_component_id" UUID NOT NULL,
    "unit_id" UUID NOT NULL,
    "reason" TEXT NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3),
    "created_by" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "fee_waivers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fee_disputes" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "fee_component_id" UUID NOT NULL,
    "raised_by" UUID NOT NULL,
    "query" TEXT NOT NULL,
    "response" TEXT,
    "status" TEXT NOT NULL DEFAULT 'open',
    "resolved_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "fee_disputes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "component_invoices" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "fee_component_id" UUID NOT NULL,
    "vendor_name" TEXT,
    "invoice_number" TEXT,
    "amount" DECIMAL(12,2) NOT NULL,
    "file_url" TEXT,
    "period" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "component_invoices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reserve_fund_transactions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "estate_id" UUID NOT NULL,
    "type" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "description" TEXT,
    "reference" TEXT,
    "created_by" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reserve_fund_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invoices" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "estate_id" UUID NOT NULL,
    "unit_id" UUID,
    "tenant_id" UUID,
    "invoice_number" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" "InvoiceStatus" NOT NULL DEFAULT 'draft',
    "subtotal" DECIMAL(12,2) NOT NULL,
    "tax" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "total" DECIMAL(12,2) NOT NULL,
    "amount_paid" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "due_date" TIMESTAMP(3) NOT NULL,
    "issued_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "paid_date" TIMESTAMP(3),
    "notes" TEXT,
    "created_by" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "invoices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invoice_items" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "invoice_id" UUID NOT NULL,
    "description" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "unit_price" DECIMAL(12,2) NOT NULL,
    "total" DECIMAL(12,2) NOT NULL,

    CONSTRAINT "invoice_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "invoice_id" UUID NOT NULL,
    "tenant_id" UUID,
    "amount" DECIMAL(12,2) NOT NULL,
    "method" "PaymentMethod" NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'pending',
    "reference" TEXT,
    "gateway_ref" TEXT,
    "gateway" TEXT,
    "paid_at" TIMESTAMP(3),
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "receipts" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "payment_id" UUID NOT NULL,
    "number" TEXT NOT NULL,
    "received_from" TEXT,
    "house_number" TEXT,
    "cluster" TEXT,
    "contact_number" TEXT,
    "description" TEXT,
    "payment_period" TEXT,
    "balance_due" DECIMAL(12,2),
    "issued_by" UUID,
    "file_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "receipts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "expenses" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "estate_id" UUID NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "vendor_id" UUID,
    "receipt_url" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "created_by" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "expenses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "landlord_payouts" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "landlord_id" UUID NOT NULL,
    "gross_amount" DECIMAL(12,2) NOT NULL,
    "management_fee" DECIMAL(12,2) NOT NULL,
    "net_amount" DECIMAL(12,2) NOT NULL,
    "period" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "paid_at" TIMESTAMP(3),
    "reference" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "landlord_payouts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service_requests" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "estate_id" UUID NOT NULL,
    "unit_id" UUID,
    "tenant_id" UUID,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" "ServiceRequestCategory" NOT NULL,
    "priority" "ServiceRequestPriority" NOT NULL DEFAULT 'normal',
    "status" "ServiceRequestStatus" NOT NULL DEFAULT 'submitted',
    "assigned_to" UUID,
    "estimated_cost" DECIMAL(12,2),
    "actual_cost" DECIMAL(12,2),
    "rating" INTEGER,
    "rating_comment" TEXT,
    "completed_at" TIMESTAMP(3),
    "created_by" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "service_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service_request_attachments" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "service_request_id" UUID NOT NULL,
    "file_name" TEXT NOT NULL,
    "file_url" TEXT NOT NULL,
    "file_type" TEXT NOT NULL,
    "stage" TEXT NOT NULL DEFAULT 'before',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "service_request_attachments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "maintenance_schedules" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "estate_id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "frequency" TEXT NOT NULL,
    "next_due_date" TIMESTAMP(3) NOT NULL,
    "last_done_at" TIMESTAMP(3),
    "assigned_to" UUID,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "maintenance_schedules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "complaints" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "estate_id" UUID NOT NULL,
    "unit_id" UUID,
    "tenant_id" UUID,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" "ComplaintCategory" NOT NULL,
    "status" "ComplaintStatus" NOT NULL DEFAULT 'open',
    "urgency" TEXT NOT NULL DEFAULT 'normal',
    "is_anonymous" BOOLEAN NOT NULL DEFAULT false,
    "assigned_to" UUID,
    "resolution" TEXT,
    "resolved_at" TIMESTAMP(3),
    "created_by" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "complaints_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "complaint_updates" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "complaint_id" UUID NOT NULL,
    "message" TEXT NOT NULL,
    "is_internal" BOOLEAN NOT NULL DEFAULT false,
    "author_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "complaint_updates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "complaint_attachments" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "complaint_id" UUID NOT NULL,
    "file_name" TEXT NOT NULL,
    "file_url" TEXT NOT NULL,
    "file_type" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "complaint_attachments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "estate_id" UUID,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "data" JSONB,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "read_at" TIMESTAMP(3),
    "channel" TEXT NOT NULL DEFAULT 'in_app',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification_templates" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "type" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "channels" TEXT[],
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notification_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification_preferences" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "type" TEXT NOT NULL,
    "channel" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "notification_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "staff" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "estate_id" UUID NOT NULL,
    "role" "StaffRole" NOT NULL,
    "salary" DECIMAL(12,2),
    "hire_date" TIMESTAMP(3) NOT NULL,
    "photo_url" TEXT,
    "address" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "staff_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shifts" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "start_time" TEXT NOT NULL,
    "end_time" TEXT NOT NULL,
    "days" TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "shifts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shift_assignments" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "staff_id" UUID NOT NULL,
    "shift_id" UUID NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "shift_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "duty_logs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "staff_id" UUID NOT NULL,
    "clock_in" TIMESTAMP(3) NOT NULL,
    "clock_out" TIMESTAMP(3),
    "notes" TEXT,

    CONSTRAINT "duty_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "staff_tasks" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "staff_id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "due_date" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "notes" TEXT,
    "photo_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "staff_tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "staff_leaves" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "staff_id" UUID NOT NULL,
    "type" TEXT NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "reason" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "staff_leaves_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vendors" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "estate_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "specialty" TEXT,
    "contact_name" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "address" TEXT,
    "rating" DOUBLE PRECISION,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "vendors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vendor_contracts" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "vendor_id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3),
    "value" DECIMAL(12,2),
    "file_url" TEXT,
    "sla_terms" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vendor_contracts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "visitor_invites" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "estate_id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "visitor_name" TEXT NOT NULL,
    "visitor_phone" TEXT,
    "purpose" TEXT NOT NULL,
    "expected_arrival" TIMESTAMP(3) NOT NULL,
    "duration" TEXT,
    "qr_code" TEXT,
    "pin" TEXT,
    "is_used" BOOLEAN NOT NULL DEFAULT false,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "visitor_invites_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gate_logs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "estate_id" UUID NOT NULL,
    "visitor_invite_id" UUID,
    "access_pass_id" UUID,
    "gate_id" UUID,
    "person_type" TEXT NOT NULL DEFAULT 'visitor',
    "visitor_name" TEXT NOT NULL,
    "visitor_phone" TEXT,
    "purpose" TEXT,
    "entry_time" TIMESTAMP(3) NOT NULL,
    "exit_time" TIMESTAMP(3),
    "authorized_by" UUID,
    "processed_by" UUID,
    "is_walk_in" BOOLEAN NOT NULL DEFAULT false,
    "vehicle_plate" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "gate_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vehicles" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "estate_id" UUID NOT NULL,
    "license_plate" TEXT NOT NULL,
    "owner_name" TEXT NOT NULL,
    "unit_id" UUID,
    "parking_slot" TEXT,
    "color" TEXT,
    "make" TEXT,
    "model" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "vehicles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blacklist" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "estate_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "reason" TEXT NOT NULL,
    "added_by" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "blacklist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gates" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "estate_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'entry_exit',
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "gates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "guard_shifts" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "estate_id" UUID NOT NULL,
    "gate_id" UUID NOT NULL,
    "guard_id" UUID NOT NULL,
    "start_time" TIMESTAMP(3) NOT NULL,
    "end_time" TIMESTAMP(3),
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "guard_shifts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "access_passes" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "estate_id" UUID NOT NULL,
    "holder_name" TEXT NOT NULL,
    "holder_phone" TEXT,
    "pass_type" TEXT NOT NULL,
    "company" TEXT,
    "pin" TEXT NOT NULL,
    "valid_from" TIMESTAMP(3) NOT NULL,
    "valid_until" TIMESTAMP(3) NOT NULL,
    "allowed_days" TEXT[],
    "allowed_time_start" TEXT,
    "allowed_time_end" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "access_passes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "meters" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "estate_id" UUID NOT NULL,
    "unit_id" UUID NOT NULL,
    "type" "UtilityType" NOT NULL,
    "meter_number" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "meters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "meter_readings" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "meter_id" UUID NOT NULL,
    "reading" DECIMAL(12,2) NOT NULL,
    "reading_date" TIMESTAMP(3) NOT NULL,
    "consumption" DECIMAL(12,2),
    "notes" TEXT,
    "read_by" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "meter_readings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "utility_rates" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "estate_id" UUID NOT NULL,
    "type" "UtilityType" NOT NULL,
    "rate_per_unit" DECIMAL(12,4) NOT NULL,
    "unit" TEXT NOT NULL,
    "effective_from" TIMESTAMP(3) NOT NULL,
    "effective_to" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "utility_rates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "documents" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "estate_id" UUID NOT NULL,
    "unit_id" UUID,
    "type" "DocumentType" NOT NULL,
    "title" TEXT NOT NULL,
    "file_name" TEXT NOT NULL,
    "file_url" TEXT NOT NULL,
    "file_size" INTEGER NOT NULL,
    "mime_type" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "expires_at" TIMESTAMP(3),
    "metadata" JSONB,
    "uploaded_by" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "estate_id" UUID,
    "actor_id" UUID NOT NULL,
    "action" TEXT NOT NULL,
    "resource" TEXT NOT NULL,
    "resource_id" UUID,
    "diff" JSONB,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "integrations" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "provider" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'other',
    "display_name" TEXT NOT NULL,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT false,
    "is_sandbox" BOOLEAN NOT NULL DEFAULT true,
    "is_built_in" BOOLEAN NOT NULL DEFAULT true,
    "credentials" JSONB NOT NULL DEFAULT '{}',
    "config" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "integrations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_estate_id_idx" ON "users"("estate_id");

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens_token_key" ON "refresh_tokens"("token");

-- CreateIndex
CREATE INDEX "refresh_tokens_user_id_idx" ON "refresh_tokens"("user_id");

-- CreateIndex
CREATE INDEX "refresh_tokens_token_idx" ON "refresh_tokens"("token");

-- CreateIndex
CREATE INDEX "login_attempts_email_idx" ON "login_attempts"("email");

-- CreateIndex
CREATE INDEX "login_attempts_user_id_idx" ON "login_attempts"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "invitations_token_key" ON "invitations"("token");

-- CreateIndex
CREATE INDEX "invitations_token_idx" ON "invitations"("token");

-- CreateIndex
CREATE INDEX "invitations_email_idx" ON "invitations"("email");

-- CreateIndex
CREATE INDEX "estates_name_idx" ON "estates"("name");

-- CreateIndex
CREATE INDEX "clusters_estate_id_idx" ON "clusters"("estate_id");

-- CreateIndex
CREATE UNIQUE INDEX "clusters_estate_id_name_key" ON "clusters"("estate_id", "name");

-- CreateIndex
CREATE INDEX "buildings_estate_id_idx" ON "buildings"("estate_id");

-- CreateIndex
CREATE INDEX "buildings_cluster_id_idx" ON "buildings"("cluster_id");

-- CreateIndex
CREATE INDEX "units_building_id_idx" ON "units"("building_id");

-- CreateIndex
CREATE INDEX "units_status_idx" ON "units"("status");

-- CreateIndex
CREATE UNIQUE INDEX "units_building_id_unit_number_key" ON "units"("building_id", "unit_number");

-- CreateIndex
CREATE INDEX "unit_history_unit_id_idx" ON "unit_history"("unit_id");

-- CreateIndex
CREATE UNIQUE INDEX "amenities_name_key" ON "amenities"("name");

-- CreateIndex
CREATE UNIQUE INDEX "estate_amenities_estate_id_amenity_id_key" ON "estate_amenities"("estate_id", "amenity_id");

-- CreateIndex
CREATE UNIQUE INDEX "landlords_user_id_key" ON "landlords"("user_id");

-- CreateIndex
CREATE INDEX "landlords_estate_id_idx" ON "landlords"("estate_id");

-- CreateIndex
CREATE UNIQUE INDEX "tenants_user_id_key" ON "tenants"("user_id");

-- CreateIndex
CREATE INDEX "tenants_estate_id_idx" ON "tenants"("estate_id");

-- CreateIndex
CREATE INDEX "tenants_landlord_id_idx" ON "tenants"("landlord_id");

-- CreateIndex
CREATE INDEX "family_members_tenant_id_idx" ON "family_members"("tenant_id");

-- CreateIndex
CREATE INDEX "tenant_change_requests_tenant_id_idx" ON "tenant_change_requests"("tenant_id");

-- CreateIndex
CREATE INDEX "tenant_change_requests_status_idx" ON "tenant_change_requests"("status");

-- CreateIndex
CREATE INDEX "property_ownerships_landlord_id_idx" ON "property_ownerships"("landlord_id");

-- CreateIndex
CREATE INDEX "property_ownerships_unit_id_idx" ON "property_ownerships"("unit_id");

-- CreateIndex
CREATE UNIQUE INDEX "property_ownerships_landlord_id_unit_id_key" ON "property_ownerships"("landlord_id", "unit_id");

-- CreateIndex
CREATE INDEX "leases_unit_id_idx" ON "leases"("unit_id");

-- CreateIndex
CREATE INDEX "leases_tenant_id_idx" ON "leases"("tenant_id");

-- CreateIndex
CREATE INDEX "leases_landlord_id_idx" ON "leases"("landlord_id");

-- CreateIndex
CREATE INDEX "leases_status_idx" ON "leases"("status");

-- CreateIndex
CREATE INDEX "fee_components_estate_id_idx" ON "fee_components"("estate_id");

-- CreateIndex
CREATE INDEX "fee_components_category_idx" ON "fee_components"("category");

-- CreateIndex
CREATE INDEX "fee_schedules_estate_id_idx" ON "fee_schedules"("estate_id");

-- CreateIndex
CREATE INDEX "fee_schedules_status_idx" ON "fee_schedules"("status");

-- CreateIndex
CREATE INDEX "fee_schedule_versions_fee_schedule_id_idx" ON "fee_schedule_versions"("fee_schedule_id");

-- CreateIndex
CREATE UNIQUE INDEX "fee_schedule_components_fee_schedule_id_fee_component_id_key" ON "fee_schedule_components"("fee_schedule_id", "fee_component_id");

-- CreateIndex
CREATE UNIQUE INDEX "unit_fee_assignments_unit_id_fee_schedule_id_key" ON "unit_fee_assignments"("unit_id", "fee_schedule_id");

-- CreateIndex
CREATE INDEX "special_levies_estate_id_idx" ON "special_levies"("estate_id");

-- CreateIndex
CREATE INDEX "reserve_fund_transactions_estate_id_idx" ON "reserve_fund_transactions"("estate_id");

-- CreateIndex
CREATE UNIQUE INDEX "invoices_invoice_number_key" ON "invoices"("invoice_number");

-- CreateIndex
CREATE INDEX "invoices_estate_id_idx" ON "invoices"("estate_id");

-- CreateIndex
CREATE INDEX "invoices_status_idx" ON "invoices"("status");

-- CreateIndex
CREATE INDEX "invoices_due_date_idx" ON "invoices"("due_date");

-- CreateIndex
CREATE UNIQUE INDEX "payments_reference_key" ON "payments"("reference");

-- CreateIndex
CREATE INDEX "payments_invoice_id_idx" ON "payments"("invoice_id");

-- CreateIndex
CREATE INDEX "payments_tenant_id_idx" ON "payments"("tenant_id");

-- CreateIndex
CREATE INDEX "payments_status_idx" ON "payments"("status");

-- CreateIndex
CREATE UNIQUE INDEX "receipts_payment_id_key" ON "receipts"("payment_id");

-- CreateIndex
CREATE UNIQUE INDEX "receipts_number_key" ON "receipts"("number");

-- CreateIndex
CREATE INDEX "receipts_number_idx" ON "receipts"("number");

-- CreateIndex
CREATE INDEX "expenses_estate_id_idx" ON "expenses"("estate_id");

-- CreateIndex
CREATE INDEX "landlord_payouts_landlord_id_idx" ON "landlord_payouts"("landlord_id");

-- CreateIndex
CREATE INDEX "service_requests_estate_id_idx" ON "service_requests"("estate_id");

-- CreateIndex
CREATE INDEX "service_requests_status_idx" ON "service_requests"("status");

-- CreateIndex
CREATE INDEX "service_requests_priority_idx" ON "service_requests"("priority");

-- CreateIndex
CREATE INDEX "maintenance_schedules_estate_id_idx" ON "maintenance_schedules"("estate_id");

-- CreateIndex
CREATE INDEX "complaints_estate_id_idx" ON "complaints"("estate_id");

-- CreateIndex
CREATE INDEX "complaints_status_idx" ON "complaints"("status");

-- CreateIndex
CREATE INDEX "complaint_updates_complaint_id_idx" ON "complaint_updates"("complaint_id");

-- CreateIndex
CREATE INDEX "notifications_user_id_idx" ON "notifications"("user_id");

-- CreateIndex
CREATE INDEX "notifications_is_read_idx" ON "notifications"("is_read");

-- CreateIndex
CREATE UNIQUE INDEX "notification_templates_type_key" ON "notification_templates"("type");

-- CreateIndex
CREATE UNIQUE INDEX "notification_preferences_user_id_type_channel_key" ON "notification_preferences"("user_id", "type", "channel");

-- CreateIndex
CREATE UNIQUE INDEX "staff_user_id_key" ON "staff"("user_id");

-- CreateIndex
CREATE INDEX "staff_estate_id_idx" ON "staff"("estate_id");

-- CreateIndex
CREATE INDEX "duty_logs_staff_id_idx" ON "duty_logs"("staff_id");

-- CreateIndex
CREATE INDEX "staff_tasks_staff_id_idx" ON "staff_tasks"("staff_id");

-- CreateIndex
CREATE INDEX "vendors_estate_id_idx" ON "vendors"("estate_id");

-- CreateIndex
CREATE INDEX "visitor_invites_estate_id_idx" ON "visitor_invites"("estate_id");

-- CreateIndex
CREATE INDEX "visitor_invites_pin_idx" ON "visitor_invites"("pin");

-- CreateIndex
CREATE UNIQUE INDEX "gate_logs_visitor_invite_id_key" ON "gate_logs"("visitor_invite_id");

-- CreateIndex
CREATE INDEX "gate_logs_estate_id_idx" ON "gate_logs"("estate_id");

-- CreateIndex
CREATE INDEX "gate_logs_entry_time_idx" ON "gate_logs"("entry_time");

-- CreateIndex
CREATE INDEX "gate_logs_person_type_idx" ON "gate_logs"("person_type");

-- CreateIndex
CREATE INDEX "vehicles_estate_id_idx" ON "vehicles"("estate_id");

-- CreateIndex
CREATE INDEX "vehicles_license_plate_idx" ON "vehicles"("license_plate");

-- CreateIndex
CREATE INDEX "blacklist_estate_id_idx" ON "blacklist"("estate_id");

-- CreateIndex
CREATE INDEX "gates_estate_id_idx" ON "gates"("estate_id");

-- CreateIndex
CREATE INDEX "guard_shifts_estate_id_idx" ON "guard_shifts"("estate_id");

-- CreateIndex
CREATE INDEX "guard_shifts_gate_id_idx" ON "guard_shifts"("gate_id");

-- CreateIndex
CREATE INDEX "guard_shifts_guard_id_idx" ON "guard_shifts"("guard_id");

-- CreateIndex
CREATE INDEX "guard_shifts_start_time_idx" ON "guard_shifts"("start_time");

-- CreateIndex
CREATE UNIQUE INDEX "access_passes_pin_key" ON "access_passes"("pin");

-- CreateIndex
CREATE INDEX "access_passes_estate_id_idx" ON "access_passes"("estate_id");

-- CreateIndex
CREATE INDEX "access_passes_pin_idx" ON "access_passes"("pin");

-- CreateIndex
CREATE INDEX "access_passes_valid_from_valid_until_idx" ON "access_passes"("valid_from", "valid_until");

-- CreateIndex
CREATE INDEX "meters_unit_id_idx" ON "meters"("unit_id");

-- CreateIndex
CREATE UNIQUE INDEX "meters_estate_id_meter_number_key" ON "meters"("estate_id", "meter_number");

-- CreateIndex
CREATE INDEX "meter_readings_meter_id_idx" ON "meter_readings"("meter_id");

-- CreateIndex
CREATE INDEX "meter_readings_reading_date_idx" ON "meter_readings"("reading_date");

-- CreateIndex
CREATE INDEX "utility_rates_estate_id_type_idx" ON "utility_rates"("estate_id", "type");

-- CreateIndex
CREATE INDEX "documents_estate_id_idx" ON "documents"("estate_id");

-- CreateIndex
CREATE INDEX "documents_type_idx" ON "documents"("type");

-- CreateIndex
CREATE INDEX "audit_logs_estate_id_idx" ON "audit_logs"("estate_id");

-- CreateIndex
CREATE INDEX "audit_logs_actor_id_idx" ON "audit_logs"("actor_id");

-- CreateIndex
CREATE INDEX "audit_logs_resource_idx" ON "audit_logs"("resource");

-- CreateIndex
CREATE INDEX "audit_logs_created_at_idx" ON "audit_logs"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "integrations_provider_key" ON "integrations"("provider");

-- CreateIndex
CREATE INDEX "integrations_category_idx" ON "integrations"("category");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_estate_id_fkey" FOREIGN KEY ("estate_id") REFERENCES "estates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "login_attempts" ADD CONSTRAINT "login_attempts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invitations" ADD CONSTRAINT "invitations_estate_id_fkey" FOREIGN KEY ("estate_id") REFERENCES "estates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clusters" ADD CONSTRAINT "clusters_estate_id_fkey" FOREIGN KEY ("estate_id") REFERENCES "estates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "buildings" ADD CONSTRAINT "buildings_estate_id_fkey" FOREIGN KEY ("estate_id") REFERENCES "estates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "buildings" ADD CONSTRAINT "buildings_cluster_id_fkey" FOREIGN KEY ("cluster_id") REFERENCES "clusters"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "units" ADD CONSTRAINT "units_building_id_fkey" FOREIGN KEY ("building_id") REFERENCES "buildings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "unit_history" ADD CONSTRAINT "unit_history_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "units"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "estate_amenities" ADD CONSTRAINT "estate_amenities_estate_id_fkey" FOREIGN KEY ("estate_id") REFERENCES "estates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "estate_amenities" ADD CONSTRAINT "estate_amenities_amenity_id_fkey" FOREIGN KEY ("amenity_id") REFERENCES "amenities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "landlords" ADD CONSTRAINT "landlords_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "landlords" ADD CONSTRAINT "landlords_estate_id_fkey" FOREIGN KEY ("estate_id") REFERENCES "estates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenants" ADD CONSTRAINT "tenants_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenants" ADD CONSTRAINT "tenants_estate_id_fkey" FOREIGN KEY ("estate_id") REFERENCES "estates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "family_members" ADD CONSTRAINT "family_members_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant_change_requests" ADD CONSTRAINT "tenant_change_requests_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "property_ownerships" ADD CONSTRAINT "property_ownerships_landlord_id_fkey" FOREIGN KEY ("landlord_id") REFERENCES "landlords"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "property_ownerships" ADD CONSTRAINT "property_ownerships_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "units"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leases" ADD CONSTRAINT "leases_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "units"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leases" ADD CONSTRAINT "leases_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leases" ADD CONSTRAINT "leases_landlord_id_fkey" FOREIGN KEY ("landlord_id") REFERENCES "landlords"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fee_components" ADD CONSTRAINT "fee_components_estate_id_fkey" FOREIGN KEY ("estate_id") REFERENCES "estates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fee_component_documents" ADD CONSTRAINT "fee_component_documents_fee_component_id_fkey" FOREIGN KEY ("fee_component_id") REFERENCES "fee_components"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fee_schedules" ADD CONSTRAINT "fee_schedules_estate_id_fkey" FOREIGN KEY ("estate_id") REFERENCES "estates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fee_schedule_versions" ADD CONSTRAINT "fee_schedule_versions_fee_schedule_id_fkey" FOREIGN KEY ("fee_schedule_id") REFERENCES "fee_schedules"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fee_schedule_components" ADD CONSTRAINT "fee_schedule_components_fee_schedule_id_fkey" FOREIGN KEY ("fee_schedule_id") REFERENCES "fee_schedules"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fee_schedule_components" ADD CONSTRAINT "fee_schedule_components_fee_component_id_fkey" FOREIGN KEY ("fee_component_id") REFERENCES "fee_components"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "unit_fee_assignments" ADD CONSTRAINT "unit_fee_assignments_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "units"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "unit_fee_assignments" ADD CONSTRAINT "unit_fee_assignments_fee_schedule_id_fkey" FOREIGN KEY ("fee_schedule_id") REFERENCES "fee_schedules"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "special_levies" ADD CONSTRAINT "special_levies_estate_id_fkey" FOREIGN KEY ("estate_id") REFERENCES "estates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fee_waivers" ADD CONSTRAINT "fee_waivers_fee_component_id_fkey" FOREIGN KEY ("fee_component_id") REFERENCES "fee_components"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fee_disputes" ADD CONSTRAINT "fee_disputes_fee_component_id_fkey" FOREIGN KEY ("fee_component_id") REFERENCES "fee_components"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "component_invoices" ADD CONSTRAINT "component_invoices_fee_component_id_fkey" FOREIGN KEY ("fee_component_id") REFERENCES "fee_components"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_estate_id_fkey" FOREIGN KEY ("estate_id") REFERENCES "estates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "units"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoice_items" ADD CONSTRAINT "invoice_items_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "invoices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "invoices"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "receipts" ADD CONSTRAINT "receipts_payment_id_fkey" FOREIGN KEY ("payment_id") REFERENCES "payments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "landlord_payouts" ADD CONSTRAINT "landlord_payouts_landlord_id_fkey" FOREIGN KEY ("landlord_id") REFERENCES "landlords"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_requests" ADD CONSTRAINT "service_requests_estate_id_fkey" FOREIGN KEY ("estate_id") REFERENCES "estates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_requests" ADD CONSTRAINT "service_requests_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "units"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_requests" ADD CONSTRAINT "service_requests_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_request_attachments" ADD CONSTRAINT "service_request_attachments_service_request_id_fkey" FOREIGN KEY ("service_request_id") REFERENCES "service_requests"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "complaints" ADD CONSTRAINT "complaints_estate_id_fkey" FOREIGN KEY ("estate_id") REFERENCES "estates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "complaints" ADD CONSTRAINT "complaints_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "units"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "complaints" ADD CONSTRAINT "complaints_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "complaint_updates" ADD CONSTRAINT "complaint_updates_complaint_id_fkey" FOREIGN KEY ("complaint_id") REFERENCES "complaints"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "complaint_attachments" ADD CONSTRAINT "complaint_attachments_complaint_id_fkey" FOREIGN KEY ("complaint_id") REFERENCES "complaints"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_estate_id_fkey" FOREIGN KEY ("estate_id") REFERENCES "estates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "staff" ADD CONSTRAINT "staff_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "staff" ADD CONSTRAINT "staff_estate_id_fkey" FOREIGN KEY ("estate_id") REFERENCES "estates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shift_assignments" ADD CONSTRAINT "shift_assignments_staff_id_fkey" FOREIGN KEY ("staff_id") REFERENCES "staff"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shift_assignments" ADD CONSTRAINT "shift_assignments_shift_id_fkey" FOREIGN KEY ("shift_id") REFERENCES "shifts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "duty_logs" ADD CONSTRAINT "duty_logs_staff_id_fkey" FOREIGN KEY ("staff_id") REFERENCES "staff"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "staff_tasks" ADD CONSTRAINT "staff_tasks_staff_id_fkey" FOREIGN KEY ("staff_id") REFERENCES "staff"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "staff_leaves" ADD CONSTRAINT "staff_leaves_staff_id_fkey" FOREIGN KEY ("staff_id") REFERENCES "staff"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendors" ADD CONSTRAINT "vendors_estate_id_fkey" FOREIGN KEY ("estate_id") REFERENCES "estates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendor_contracts" ADD CONSTRAINT "vendor_contracts_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "vendors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visitor_invites" ADD CONSTRAINT "visitor_invites_estate_id_fkey" FOREIGN KEY ("estate_id") REFERENCES "estates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visitor_invites" ADD CONSTRAINT "visitor_invites_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gate_logs" ADD CONSTRAINT "gate_logs_estate_id_fkey" FOREIGN KEY ("estate_id") REFERENCES "estates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gate_logs" ADD CONSTRAINT "gate_logs_visitor_invite_id_fkey" FOREIGN KEY ("visitor_invite_id") REFERENCES "visitor_invites"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gate_logs" ADD CONSTRAINT "gate_logs_access_pass_id_fkey" FOREIGN KEY ("access_pass_id") REFERENCES "access_passes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gate_logs" ADD CONSTRAINT "gate_logs_gate_id_fkey" FOREIGN KEY ("gate_id") REFERENCES "gates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicles" ADD CONSTRAINT "vehicles_estate_id_fkey" FOREIGN KEY ("estate_id") REFERENCES "estates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blacklist" ADD CONSTRAINT "blacklist_estate_id_fkey" FOREIGN KEY ("estate_id") REFERENCES "estates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gates" ADD CONSTRAINT "gates_estate_id_fkey" FOREIGN KEY ("estate_id") REFERENCES "estates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "guard_shifts" ADD CONSTRAINT "guard_shifts_estate_id_fkey" FOREIGN KEY ("estate_id") REFERENCES "estates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "guard_shifts" ADD CONSTRAINT "guard_shifts_gate_id_fkey" FOREIGN KEY ("gate_id") REFERENCES "gates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "guard_shifts" ADD CONSTRAINT "guard_shifts_guard_id_fkey" FOREIGN KEY ("guard_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "access_passes" ADD CONSTRAINT "access_passes_estate_id_fkey" FOREIGN KEY ("estate_id") REFERENCES "estates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meters" ADD CONSTRAINT "meters_estate_id_fkey" FOREIGN KEY ("estate_id") REFERENCES "estates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meters" ADD CONSTRAINT "meters_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "units"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meter_readings" ADD CONSTRAINT "meter_readings_meter_id_fkey" FOREIGN KEY ("meter_id") REFERENCES "meters"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_estate_id_fkey" FOREIGN KEY ("estate_id") REFERENCES "estates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "units"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_estate_id_fkey" FOREIGN KEY ("estate_id") REFERENCES "estates"("id") ON DELETE SET NULL ON UPDATE CASCADE;
