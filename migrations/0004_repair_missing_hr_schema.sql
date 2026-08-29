-- Repairs the stale Drizzle journal scenario where 0000-0003 are recorded
-- but the HR objects are absent. This migration is intentionally idempotent.

CREATE TABLE IF NOT EXISTS "hr_agents" (
  "id" serial PRIMARY KEY NOT NULL,
  "name" text NOT NULL,
  "email" text,
  "personal_email" text,
  "company_email" text,
  "phone" text NOT NULL,
  "phone_normalized" text,
  "start_date" text NOT NULL,
  "subscription_status" text DEFAULT 'Trial' NOT NULL,
  "payout_method_type" text DEFAULT '',
  "payout_details" text DEFAULT '',
  "sofi_referral_status" text DEFAULT 'Not Invited' NOT NULL,
  "sofi_referral_link" text DEFAULT '',
  "performance_notes" text DEFAULT '',
  "crm_record_id" text DEFAULT '',
  "crm_pipeline_stage" text DEFAULT 'Applicant' NOT NULL,
  "onboarding_step" integer DEFAULT 1 NOT NULL,
  "onboarding_complete" boolean DEFAULT false NOT NULL,
  CONSTRAINT "hr_agents_email_unique" UNIQUE ("email")
);

CREATE TABLE IF NOT EXISTS "hr_onboarding_tasks" (
  "id" serial PRIMARY KEY NOT NULL,
  "agent_id" integer NOT NULL,
  "step_number" integer NOT NULL,
  "task_key" text NOT NULL,
  "status" text DEFAULT 'pending' NOT NULL,
  "completed_at" text DEFAULT '',
  "notes" text DEFAULT ''
);

CREATE TABLE IF NOT EXISTS "hr_documents" (
  "id" serial PRIMARY KEY NOT NULL,
  "agent_id" integer NOT NULL,
  "doc_type" text NOT NULL,
  "file_name" text NOT NULL,
  "file_url" text NOT NULL,
  "uploaded_at" text NOT NULL,
  "status" text DEFAULT 'Pending Review' NOT NULL
);

CREATE TABLE IF NOT EXISTS "hr_ica_signatures" (
  "id" serial PRIMARY KEY NOT NULL,
  "agent_id" integer NOT NULL,
  "legal_name" text NOT NULL,
  "address" text NOT NULL,
  "city" text NOT NULL,
  "state" text NOT NULL,
  "zip" text NOT NULL,
  "signature_data_url" text NOT NULL,
  "signed_at" text NOT NULL,
  "ip_address" text DEFAULT '',
  "agreed" boolean DEFAULT false NOT NULL,
  CONSTRAINT "hr_ica_signatures_agent_id_unique" UNIQUE ("agent_id")
);

CREATE TABLE IF NOT EXISTS "hr_training_progress" (
  "id" serial PRIMARY KEY NOT NULL,
  "agent_id" integer NOT NULL,
  "module_key" text NOT NULL,
  "module_name" text NOT NULL,
  "completed" boolean DEFAULT false NOT NULL,
  "completed_at" text DEFAULT ''
);

CREATE TABLE IF NOT EXISTS "hr_agent_sessions" (
  "id" serial PRIMARY KEY NOT NULL,
  "agent_id" integer NOT NULL,
  "token" text NOT NULL,
  "expires_at" text NOT NULL,
  "created_at" text NOT NULL,
  CONSTRAINT "hr_agent_sessions_token_unique" UNIQUE ("token")
);

CREATE TABLE IF NOT EXISTS "hr_status_events" (
  "id" serial PRIMARY KEY NOT NULL,
  "agent_id" integer NOT NULL,
  "event_type" text NOT NULL,
  "actor_type" text NOT NULL,
  "actor_id" text DEFAULT '' NOT NULL,
  "old_value" text DEFAULT '',
  "new_value" text DEFAULT '',
  "metadata_json" text DEFAULT '',
  "created_at" text NOT NULL
);

CREATE TABLE IF NOT EXISTS "hr_email_requests" (
  "id" serial PRIMARY KEY NOT NULL,
  "agent_id" integer NOT NULL,
  "requested_email" text NOT NULL,
  "status" text DEFAULT 'requested' NOT NULL,
  "temp_password_ciphertext" text DEFAULT '' NOT NULL,
  "temp_password_created_at" text DEFAULT '' NOT NULL,
  "temp_password_revealed_at" text DEFAULT '' NOT NULL,
  "created_at" text NOT NULL,
  "updated_at" text NOT NULL,
  "notes" text DEFAULT '' NOT NULL,
  CONSTRAINT "hr_email_requests_requested_email_unique" UNIQUE ("requested_email")
);

CREATE INDEX IF NOT EXISTS "hr_agents_email_idx" ON "hr_agents" USING btree ("email");
CREATE UNIQUE INDEX IF NOT EXISTS "hr_agents_phone_normalized_unique" ON "hr_agents" USING btree ("phone_normalized");
CREATE UNIQUE INDEX IF NOT EXISTS "hr_agents_company_email_unique" ON "hr_agents" USING btree ("company_email");
CREATE INDEX IF NOT EXISTS "hr_onboarding_tasks_agent_idx" ON "hr_onboarding_tasks" USING btree ("agent_id");
CREATE INDEX IF NOT EXISTS "hr_documents_agent_idx" ON "hr_documents" USING btree ("agent_id");
CREATE INDEX IF NOT EXISTS "hr_training_progress_agent_idx" ON "hr_training_progress" USING btree ("agent_id");
CREATE INDEX IF NOT EXISTS "hr_agent_sessions_agent_idx" ON "hr_agent_sessions" USING btree ("agent_id");
CREATE INDEX IF NOT EXISTS "hr_agent_sessions_expires_idx" ON "hr_agent_sessions" USING btree ("expires_at");
CREATE INDEX IF NOT EXISTS "hr_status_events_agent_idx" ON "hr_status_events" USING btree ("agent_id");
CREATE INDEX IF NOT EXISTS "hr_status_events_created_idx" ON "hr_status_events" USING btree ("created_at");
CREATE INDEX IF NOT EXISTS "hr_email_requests_agent_idx" ON "hr_email_requests" USING btree ("agent_id");
CREATE INDEX IF NOT EXISTS "hr_email_requests_status_idx" ON "hr_email_requests" USING btree ("status");
CREATE INDEX IF NOT EXISTS "hr_email_requests_created_idx" ON "hr_email_requests" USING btree ("created_at");
