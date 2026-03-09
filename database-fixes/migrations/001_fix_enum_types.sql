-- ============================================================
-- MIGRATION: Fix ENUM Types
-- Deskripsi: Mengubah TEXT columns menjadi proper ENUM types
-- untuk konsistensi dan data integrity
-- ============================================================

-- ============================================================
-- 1. ORDER STATUS ENUM
-- ============================================================
CREATE TYPE public.order_status AS ENUM (
  'pending',
  'confirmed',
  'processing',
  'shipped',
  'delivered',
  'completed',
  'cancelled',
  'refunded',
  'failed'
);

CREATE TYPE public.payment_status AS ENUM (
  'unpaid',
  'pending',
  'paid',
  'failed',
  'refunded',
  'partial'
);

CREATE TYPE public.payment_method AS ENUM (
  'bank_transfer',
  'e_wallet',
  'credit_card',
  'cod',
  'credit',
  'va'
);

-- ============================================================
-- 2. TICKET STATUS & PRIORITY ENUM
-- ============================================================
CREATE TYPE public.ticket_status AS ENUM (
  'open',
  'in_progress',
  'waiting_customer',
  'resolved',
  'closed'
);

CREATE TYPE public.ticket_priority AS ENUM (
  'low',
  'normal',
  'high',
  'urgent'
);

CREATE TYPE public.ticket_category AS ENUM (
  'general',
  'account',
  'payment',
  'listing',
  'order',
  'technical',
  'report',
  'suggestion'
);

-- ============================================================
-- 3. UMKM STATUS ENUM
-- ============================================================
CREATE TYPE public.umkm_status AS ENUM (
  'pending',
  'active',
  'suspended',
  'closed',
  'rejected'
);

CREATE TYPE public.business_scale AS ENUM (
  'micro',
  'small',
  'medium',
  'large'
);

-- ============================================================
-- 4. NOTIFICATION TYPE ENUM
-- ============================================================
CREATE TYPE public.notification_type AS ENUM (
  'info',
  'success',
  'warning',
  'error',
  'order',
  'payment',
  'message',
  'listing',
  'promotion',
  'system'
);

CREATE TYPE public.notification_channel AS ENUM (
  'in_app',
  'email',
  'sms',
  'whatsapp',
  'push'
);

-- ============================================================
-- 5. KYC STATUS ENUM
-- ============================================================
CREATE TYPE public.kyc_status AS ENUM (
  'not_submitted',
  'draft',
  'pending',
  'under_review',
  'approved',
  'rejected',
  'expired'
);

-- ============================================================
-- 6. WALLET STATUS ENUM
-- ============================================================
CREATE TYPE public.wallet_status AS ENUM (
  'active',
  'frozen',
  'closed',
  'suspended'
);

-- ============================================================
-- 7. WITHDRAWAL STATUS ENUM
-- ============================================================
CREATE TYPE public.withdrawal_status AS ENUM (
  'pending',
  'processing',
  'approved',
  'rejected',
  'paid',
  'failed',
  'cancelled'
);

-- ============================================================
-- 8. TRANSACTION TYPE ENUM
-- ============================================================
CREATE TYPE public.transaction_type AS ENUM (
  'topup',
  'withdrawal',
  'payment',
  'refund',
  'commission',
  'bonus',
  'transfer_in',
  'transfer_out',
  'adjustment'
);

-- ============================================================
-- 9. OTP CHANNEL ENUM
-- ============================================================
CREATE TYPE public.otp_channel AS ENUM (
  'sms',
  'whatsapp',
  'email'
);

-- ============================================================
-- 10. CONTACT PREFERENCE ENUM
-- ============================================================
CREATE TYPE public.contact_preference AS ENUM (
  'phone',
  'whatsapp',
  'email',
  'in_app',
  'all'
);

-- ============================================================
-- 11. PROMO TYPE ENUM
-- ============================================================
CREATE TYPE public.promo_type AS ENUM (
  'regular',
  'flash_sale',
  'discount',
  'bundle',
  'free_shipping',
  'cashback'
);

-- ============================================================
-- 12. SUBSCRIPTION STATUS ENUM
-- ============================================================
CREATE TYPE public.subscription_status AS ENUM (
  'active',
  'expired',
  'cancelled',
  'pending',
  'grace_period'
);

-- ============================================================
-- 13. DOCUMENT TYPE ENUM
-- ============================================================
CREATE TYPE public.document_type AS ENUM (
  'ktp',
  'npwp',
  'siup',
  'tdp',
  'nib',
  'akta',
  'skdp',
  'other'
);

-- ============================================================
-- APPLY ENUM TO EXISTING TABLES
-- ============================================================

-- Update kyc_verifications
ALTER TABLE public.kyc_verifications 
  ALTER COLUMN status TYPE public.kyc_status 
  USING status::public.kyc_status;

-- Update wallets
ALTER TABLE public.wallets 
  ALTER COLUMN status TYPE public.wallet_status 
  USING status::public.wallet_status;

-- Update withdrawals
ALTER TABLE public.withdrawals 
  ALTER COLUMN status TYPE public.withdrawal_status 
  USING status::public.withdrawal_status;

-- Update support_tickets
ALTER TABLE public.support_tickets 
  ALTER COLUMN status TYPE public.ticket_status 
  USING status::public.ticket_status,
  ALTER COLUMN priority TYPE public.ticket_priority 
  USING priority::public.ticket_priority;

-- Update notifications
ALTER TABLE public.notifications 
  ALTER COLUMN type TYPE public.notification_type 
  USING type::public.notification_type,
  ALTER COLUMN channel TYPE public.notification_channel 
  USING channel::public.notification_channel;

-- Update otp_codes
ALTER TABLE public.otp_codes 
  ALTER COLUMN channel TYPE public.otp_channel 
  USING channel::public.otp_channel;

-- Update umkm_profiles
ALTER TABLE public.umkm_profiles 
  ALTER COLUMN business_scale TYPE public.business_scale 
  USING business_scale::public.business_scale,
  ALTER COLUMN status TYPE public.umkm_status 
  USING status::public.umkm_status;

-- Update listings
ALTER TABLE public.listings 
  ALTER COLUMN promo_type TYPE public.promo_type 
  USING promo_type::public.promo_type,
  ALTER COLUMN contact_preference TYPE public.contact_preference 
  USING contact_preference::public.contact_preference;

-- Update kyc_documents
ALTER TABLE public.kyc_documents 
  ALTER COLUMN document_type TYPE public.document_type 
  USING document_type::public.document_type;
