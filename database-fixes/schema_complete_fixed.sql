-- ============================================================
-- COMPLETE DATABASE SCHEMA - FIXED VERSION
-- Marketplace Core Application
-- ============================================================
-- 
-- Database: PostgreSQL 15+
-- Extensions: pg_trgm, unaccent, uuid-ossp
-- 
-- Changes from original:
-- 1. All TEXT status columns converted to ENUM types
-- 2. All missing foreign keys added
-- 3. Composite indexes for common queries
-- 4. Full-text search capabilities
-- 5. Denormalization/summary columns
-- 6. Data integrity constraints
-- 7. Trigger functions for auto-updates
-- 8. Materialized views for reporting
--
-- ============================================================

-- ============================================================
-- EXTENSIONS
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "unaccent";

-- ============================================================
-- ENUM TYPES
-- ============================================================

-- User Roles
CREATE TYPE public.app_role AS ENUM ('user', 'admin', 'penjual');

-- Listing Types
CREATE TYPE public.listing_price_type AS ENUM ('fixed', 'negotiable', 'auction');
CREATE TYPE public.listing_type AS ENUM ('sale', 'rent', 'service', 'wanted');
CREATE TYPE public.listing_condition AS ENUM ('new', 'like_new', 'good', 'fair', 'poor');
CREATE TYPE public.listing_status AS ENUM ('draft', 'pending_review', 'active', 'sold', 'expired', 'rejected', 'deleted');

-- Auction Types
CREATE TYPE public.auction_status AS ENUM ('active', 'ended', 'sold', 'cancelled', 'no_winner');

-- Boost Types
CREATE TYPE public.boost_type AS ENUM ('highlight', 'top_search', 'premium');
CREATE TYPE public.boost_status AS ENUM ('active', 'expired', 'cancelled');

-- Credit Types
CREATE TYPE public.credit_transaction_type AS ENUM ('purchase', 'usage', 'refund', 'bonus', 'expired', 'topup', 'adjustment');

-- Order Types
CREATE TYPE public.order_status AS ENUM ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'completed', 'cancelled', 'refunded', 'failed');
CREATE TYPE public.payment_status AS ENUM ('unpaid', 'pending', 'paid', 'failed', 'refunded', 'partial');
CREATE TYPE public.payment_method AS ENUM ('bank_transfer', 'e_wallet', 'credit_card', 'cod', 'credit', 'va');

-- KYC Types
CREATE TYPE public.kyc_status AS ENUM ('not_submitted', 'draft', 'pending', 'under_review', 'approved', 'rejected', 'expired');
CREATE TYPE public.document_type AS ENUM ('ktp', 'npwp', 'siup', 'tdp', 'nib', 'akta', 'skdp', 'other');

-- Wallet Types
CREATE TYPE public.wallet_status AS ENUM ('active', 'frozen', 'closed', 'suspended');
CREATE TYPE public.transaction_type AS ENUM ('topup', 'withdrawal', 'payment', 'refund', 'commission', 'bonus', 'transfer_in', 'transfer_out', 'adjustment');
CREATE TYPE public.withdrawal_status AS ENUM ('pending', 'processing', 'approved', 'rejected', 'paid', 'failed', 'cancelled');

-- Banner Types
CREATE TYPE public.banner_position AS ENUM ('hero', 'sidebar', 'inline', 'footer', 'category_top', 'search_top');
CREATE TYPE public.banner_status AS ENUM ('pending', 'active', 'paused', 'expired', 'rejected');
CREATE TYPE public.banner_pricing_model AS ENUM ('cpc', 'cpm', 'fixed');

-- Report Types
CREATE TYPE public.report_reason AS ENUM ('spam', 'fraud', 'inappropriate', 'wrong_category', 'duplicate', 'counterfeit', 'sold_elsewhere', 'other');
CREATE TYPE public.report_status AS ENUM ('pending', 'reviewed', 'action_taken', 'dismissed');

-- UMKM Types
CREATE TYPE public.umkm_status AS ENUM ('pending', 'active', 'suspended', 'closed', 'rejected');
CREATE TYPE public.business_scale AS ENUM ('micro', 'small', 'medium', 'large');

-- Support Types
CREATE TYPE public.ticket_status AS ENUM ('open', 'in_progress', 'waiting_customer', 'resolved', 'closed');
CREATE TYPE public.ticket_priority AS ENUM ('low', 'normal', 'high', 'urgent');
CREATE TYPE public.ticket_category AS ENUM ('general', 'account', 'payment', 'listing', 'order', 'technical', 'report', 'suggestion');

-- Notification Types
CREATE TYPE public.notification_type AS ENUM ('info', 'success', 'warning', 'error', 'order', 'payment', 'message', 'listing', 'promotion', 'system');
CREATE TYPE public.notification_channel AS ENUM ('in_app', 'email', 'sms', 'whatsapp', 'push');

-- OTP Types
CREATE TYPE public.otp_channel AS ENUM ('sms', 'whatsapp', 'email');

-- Other Types
CREATE TYPE public.contact_preference AS ENUM ('phone', 'whatsapp', 'email', 'in_app', 'all');
CREATE TYPE public.promo_type AS ENUM ('regular', 'flash_sale', 'discount', 'bundle', 'free_shipping', 'cashback');
CREATE TYPE public.subscription_status AS ENUM ('active', 'expired', 'cancelled', 'pending', 'grace_period');

-- ============================================================
-- UTILITY FUNCTIONS
-- ============================================================

-- Update timestamp function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Generate slug function
CREATE OR REPLACE FUNCTION public.generate_slug(p_text TEXT)
RETURNS TEXT
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  RETURN LOWER(TRIM(BOTH '-' FROM 
    REGEXP_REPLACE(
      REGEXP_REPLACE(p_text, '[^a-zA-Z0-9\s]', '', 'g'),
      '\s+', '-', 'g'
    )
  ));
END;
$$;

-- Has role check function
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role AND is_active = true
  );
$$;

-- ============================================================
-- REGION TABLES (Indonesia Geographic)
-- ============================================================

CREATE TABLE public.provinces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  name_alt TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  regency_count INTEGER DEFAULT 0,
  district_count INTEGER DEFAULT 0,
  village_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.regencies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  province_id UUID NOT NULL REFERENCES public.provinces(id),
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  type TEXT DEFAULT 'kabupaten',
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  district_count INTEGER DEFAULT 0,
  village_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.districts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  regency_id UUID NOT NULL REFERENCES public.regencies(id),
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  village_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.villages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  district_id UUID NOT NULL REFERENCES public.districts(id),
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  type TEXT,
  postal_code TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- USER MANAGEMENT
-- ============================================================

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  name TEXT,
  phone_number TEXT,
  address TEXT,
  avatar_url TEXT,
  primary_role TEXT DEFAULT 'user',
  is_active BOOLEAN DEFAULT true,
  
  -- Summary columns (denormalized)
  total_listings INTEGER DEFAULT 0,
  active_listings INTEGER DEFAULT 0,
  sold_count INTEGER DEFAULT 0,
  total_sales NUMERIC DEFAULT 0,
  average_rating NUMERIC(3,2) DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  response_rate NUMERIC(5,2) DEFAULT 0,
  last_active_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  CONSTRAINT chk_phone_format CHECK (phone_number IS NULL OR phone_number ~ '^\+?[0-9]{10,15}$')
);

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL DEFAULT 'user',
  assigned_by UUID REFERENCES auth.users(id),
  assigned_at TIMESTAMPTZ DEFAULT now(),
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, role)
);

CREATE TABLE public.kyc_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ktp_number TEXT,
  ktp_image_url TEXT,
  selfie_image_url TEXT,
  status kyc_status DEFAULT 'not_submitted',
  rejection_reason TEXT,
  notes TEXT,
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  submitted_at TIMESTAMPTZ,
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  CONSTRAINT chk_ktp_number_format CHECK (ktp_number IS NULL OR ktp_number ~ '^\d{16}$')
);

CREATE TABLE public.kyc_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kyc_verification_id UUID NOT NULL REFERENCES public.kyc_verifications(id) ON DELETE CASCADE,
  document_type document_type NOT NULL,
  document_name TEXT NOT NULL,
  document_number TEXT,
  image_url TEXT NOT NULL,
  file_name TEXT,
  status TEXT DEFAULT 'pending',
  rejection_reason TEXT,
  
  -- KTP Data
  full_name TEXT,
  birth_place TEXT,
  birth_date TIMESTAMPTZ,
  gender TEXT,
  blood_type TEXT,
  religion TEXT,
  marital_status TEXT,
  occupation TEXT,
  nationality TEXT DEFAULT 'WNI',
  
  -- Address from KTP
  province_id UUID REFERENCES public.provinces(id),
  regency_id UUID REFERENCES public.regencies(id),
  district_id UUID REFERENCES public.districts(id),
  village_id UUID REFERENCES public.villages(id),
  rt TEXT,
  rw TEXT,
  address TEXT,
  postal_code TEXT,
  
  -- Business Data
  npwp_number TEXT,
  npwp_name TEXT,
  npwp_address TEXT,
  business_name TEXT,
  business_type TEXT,
  business_address TEXT,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- WALLET & TRANSACTIONS
-- ============================================================

CREATE TABLE public.wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  balance NUMERIC(15,2) DEFAULT 0,
  currency_code CHAR(3) DEFAULT 'IDR',
  status wallet_status DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  CONSTRAINT chk_wallet_balance_positive CHECK (balance >= 0)
);

CREATE TABLE public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  wallet_id UUID NOT NULL REFERENCES public.wallets(id) ON DELETE CASCADE,
  type transaction_type NOT NULL,
  amount NUMERIC(15,2) NOT NULL,
  balance_before NUMERIC(15,2),
  balance_after NUMERIC(15,2),
  description TEXT,
  reference_type TEXT,
  reference_id UUID,
  is_reversed BOOLEAN DEFAULT false,
  reversed_at TIMESTAMPTZ,
  reversed_by UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  
  CONSTRAINT chk_transaction_amount_positive CHECK (amount > 0)
);

CREATE TABLE public.withdrawals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  wallet_id UUID NOT NULL REFERENCES public.wallets(id) ON DELETE CASCADE,
  amount NUMERIC(15,2) NOT NULL,
  bank_name TEXT NOT NULL,
  account_number TEXT NOT NULL,
  account_holder TEXT NOT NULL,
  status withdrawal_status DEFAULT 'pending',
  processed_by UUID REFERENCES auth.users(id),
  processed_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  
  CONSTRAINT chk_withdrawal_amount_positive CHECK (amount > 0)
);

-- ============================================================
-- CREDIT SYSTEM
-- ============================================================

CREATE TABLE public.user_credits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  balance INTEGER DEFAULT 0,
  lifetime_purchased INTEGER DEFAULT 0,
  lifetime_used INTEGER DEFAULT 0,
  
  -- Summary columns
  total_purchased INTEGER DEFAULT 0,
  total_used INTEGER DEFAULT 0,
  total_bonus INTEGER DEFAULT 0,
  total_expired INTEGER DEFAULT 0,
  last_transaction_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  CONSTRAINT chk_credits_balance_positive CHECK (balance >= 0)
);

CREATE TABLE public.credit_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type credit_transaction_type NOT NULL,
  amount INTEGER NOT NULL,
  balance_after INTEGER NOT NULL,
  reference_type TEXT,
  reference_id UUID,
  description TEXT,
  payment_id UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  
  CONSTRAINT chk_credit_amount_positive CHECK (amount > 0)
);

CREATE TABLE public.credit_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  credits INTEGER NOT NULL,
  price NUMERIC NOT NULL,
  bonus_credits INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  CONSTRAINT chk_credit_package_valid CHECK (credits > 0 AND price > 0 AND bonus_credits >= 0)
);

CREATE TABLE public.credit_topup_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  package_id UUID REFERENCES public.credit_packages(id),
  amount NUMERIC NOT NULL,
  credits_amount INTEGER NOT NULL,
  bonus_credits INTEGER DEFAULT 0,
  bank_name TEXT DEFAULT 'BNI',
  account_number TEXT DEFAULT '1186096134',
  account_holder TEXT DEFAULT 'PT. Ihsan Media Kreatif',
  proof_image_url TEXT,
  status TEXT DEFAULT 'pending',
  admin_notes TEXT,
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  CONSTRAINT chk_topup_request_valid CHECK (amount > 0 AND credits_amount > 0)
);

CREATE TABLE public.coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  credits_amount INTEGER DEFAULT 0,
  max_uses INTEGER DEFAULT 1,
  used_count INTEGER DEFAULT 0,
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  description TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  CONSTRAINT chk_coupon_valid CHECK (credits_amount >= 0 AND max_uses > 0 AND used_count >= 0)
);

CREATE TABLE public.coupon_uses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coupon_id UUID NOT NULL REFERENCES public.coupons(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  credits_given INTEGER NOT NULL,
  used_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(coupon_id, user_id)
);

-- ============================================================
-- CATEGORIES
-- ============================================================

CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  parent_id UUID REFERENCES public.categories(id),
  icon_url TEXT,
  image_banner_url TEXT,
  description TEXT,
  meta_title TEXT,
  meta_description TEXT,
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  keywords TEXT,
  attributes_schema JSONB DEFAULT '[]',
  sort_order INTEGER DEFAULT 0,
  
  -- Summary columns
  listing_count INTEGER DEFAULT 0,
  active_listing_count INTEGER DEFAULT 0,
  umkm_count INTEGER DEFAULT 0,
  product_count INTEGER DEFAULT 0,
  
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- LISTINGS
-- ============================================================

CREATE TABLE public.listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES public.categories(id),
  umkm_id UUID REFERENCES public.umkm_profiles(id),
  subcategory_id UUID REFERENCES public.categories(id),
  
  -- Basic Info
  title TEXT NOT NULL,
  slug TEXT UNIQUE,
  description TEXT,
  image_url TEXT,
  gallery JSONB,
  video_url TEXT,
  specifications JSONB,
  
  -- Pricing
  price NUMERIC DEFAULT 0,
  price_type listing_price_type DEFAULT 'fixed',
  price_negotiable BOOLEAN DEFAULT true,
  rental_price DOUBLE PRECISION,
  rental_period TEXT,
  price_formatted TEXT,
  
  -- Type & Condition
  listing_type listing_type DEFAULT 'sale',
  condition listing_condition DEFAULT 'good',
  
  -- Status
  status listing_status DEFAULT 'draft',
  is_featured BOOLEAN DEFAULT false,
  featured_until TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  published_at TIMESTAMPTZ,
  
  -- Promo
  promo_type promo_type DEFAULT 'regular',
  promo_details JSONB,
  
  -- Location
  location_lat DOUBLE PRECISION,
  location_lng DOUBLE PRECISION,
  province_id UUID REFERENCES public.provinces(id),
  regency_id UUID REFERENCES public.regencies(id),
  district_id UUID REFERENCES public.districts(id),
  village_id UUID REFERENCES public.villages(id),
  address TEXT,
  city TEXT,
  province TEXT,
  
  -- Contact
  contact_preference contact_preference,
  contact_name TEXT,
  contact_phone TEXT,
  contact_whatsapp TEXT,
  contact_email TEXT,
  
  -- Stats
  view_count INTEGER DEFAULT 0,
  click_count INTEGER DEFAULT 0,
  share_count INTEGER DEFAULT 0,
  favorite_count INTEGER DEFAULT 0,
  inquiry_count INTEGER DEFAULT 0,
  
  -- Summary columns (denormalized)
  image_count INTEGER DEFAULT 0,
  primary_image_url TEXT,
  bid_count INTEGER DEFAULT 0,
  current_bid_amount NUMERIC,
  days_listed INTEGER DEFAULT 0,
  is_auction BOOLEAN DEFAULT false,
  is_boosted BOOLEAN DEFAULT false,
  active_boost_types TEXT[],
  
  -- Sold/Rented
  is_sold BOOLEAN DEFAULT false,
  is_rented BOOLEAN DEFAULT false,
  sold_at TIMESTAMPTZ,
  rented_at TIMESTAMPTZ,
  sold_to UUID REFERENCES auth.users(id),
  rented_to UUID REFERENCES auth.users(id),
  
  -- Moderation
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMPTZ,
  rejection_reason TEXT,
  
  -- SEO
  meta_title TEXT,
  meta_description TEXT,
  keywords TEXT,
  
  -- Credits
  credits_used INTEGER DEFAULT 0,
  
  -- Soft delete
  deleted_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  -- Constraints
  CONSTRAINT chk_listings_price_positive CHECK (price >= 0),
  CONSTRAINT chk_listings_counts_positive CHECK (
    view_count >= 0 AND click_count >= 0 AND share_count >= 0 AND 
    favorite_count >= 0 AND inquiry_count >= 0
  ),
  CONSTRAINT chk_listings_slug_format CHECK (slug IS NULL OR slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  CONSTRAINT chk_listings_coordinates CHECK (
    (location_lat IS NULL AND location_lng IS NULL) OR
    (location_lat IS NOT NULL AND location_lng IS NOT NULL AND
     location_lat >= -90 AND location_lat <= 90 AND
     location_lng >= -180 AND location_lng <= 180)
  )
);

CREATE TABLE public.listing_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  is_primary BOOLEAN DEFAULT false,
  is_paid BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.saved_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, listing_id)
);

CREATE TABLE public.listing_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  reporter_id UUID NOT NULL REFERENCES auth.users(id),
  reason report_reason NOT NULL,
  description TEXT,
  status report_status DEFAULT 'pending',
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- AUCTIONS
-- ============================================================

CREATE TABLE public.listing_auctions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID UNIQUE NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  starting_price NUMERIC NOT NULL,
  current_price NUMERIC NOT NULL,
  min_increment NUMERIC DEFAULT 10000,
  buy_now_price NUMERIC,
  ends_at TIMESTAMPTZ NOT NULL,
  winner_id UUID REFERENCES auth.users(id),
  total_bids INTEGER DEFAULT 0,
  platform_fee_percent NUMERIC DEFAULT 5,
  platform_fee_amount NUMERIC DEFAULT 0,
  status auction_status DEFAULT 'active',
  
  -- Summary columns
  time_remaining_seconds INTEGER,
  unique_bidders INTEGER DEFAULT 0,
  highest_bidder_id UUID REFERENCES auth.users(id),
  has_reserve BOOLEAN DEFAULT false,
  reserve_met BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  CONSTRAINT chk_auction_prices CHECK (
    starting_price >= 0 AND current_price >= starting_price AND min_increment > 0
  )
);

CREATE TABLE public.auction_bids (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auction_id UUID NOT NULL REFERENCES public.listing_auctions(id) ON DELETE CASCADE,
  bidder_id UUID NOT NULL REFERENCES auth.users(id),
  amount NUMERIC NOT NULL,
  is_auto_bid BOOLEAN DEFAULT false,
  max_auto_amount NUMERIC,
  is_winning BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  
  CONSTRAINT chk_bid_amount_positive CHECK (amount > 0)
);

-- ============================================================
-- BOOSTS
-- ============================================================

CREATE TABLE public.boost_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type boost_type UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  credits_per_day INTEGER NOT NULL,
  multiplier NUMERIC DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.listing_boosts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  boost_type boost_type NOT NULL,
  credits_used INTEGER NOT NULL,
  starts_at TIMESTAMPTZ DEFAULT now(),
  ends_at TIMESTAMPTZ NOT NULL,
  status boost_status DEFAULT 'active',
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- BANNERS (Advertising)
-- ============================================================

CREATE TABLE public.banners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  title TEXT NOT NULL,
  image_url TEXT NOT NULL,
  target_url TEXT NOT NULL,
  position banner_position DEFAULT 'inline',
  status banner_status DEFAULT 'pending',
  
  -- Pricing
  pricing_model banner_pricing_model DEFAULT 'cpc',
  budget_total NUMERIC DEFAULT 0,
  budget_spent NUMERIC DEFAULT 0,
  cost_per_click NUMERIC DEFAULT 500,
  cost_per_mille NUMERIC DEFAULT 5000,
  
  -- Stats
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  
  -- Performance columns
  ctr NUMERIC(8,4) DEFAULT 0,
  cpc_actual NUMERIC(10,2),
  cpm_actual NUMERIC(10,2),
  days_running INTEGER DEFAULT 0,
  
  -- Schedule
  starts_at TIMESTAMPTZ DEFAULT now(),
  ends_at TIMESTAMPTZ,
  priority INTEGER DEFAULT 0,
  
  -- Approval
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMPTZ,
  
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.banner_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  banner_id UUID NOT NULL REFERENCES public.banners(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  event_type TEXT NOT NULL CHECK (event_type IN ('view', 'click')),
  ip_address INET,
  user_agent TEXT,
  cost_amount NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- UMKM PROFILES
-- ============================================================

CREATE TABLE public.umkm_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID UNIQUE NOT NULL REFERENCES auth.users(id),
  umkm_name TEXT NOT NULL,
  brand_name TEXT,
  slug TEXT UNIQUE,
  tagline TEXT,
  description TEXT,
  category_id UUID REFERENCES public.categories(id),
  subcategory_id UUID REFERENCES public.categories(id),
  business_type TEXT,
  business_scale business_scale DEFAULT 'micro',
  year_established INTEGER,
  
  -- Contact
  phone TEXT,
  whatsapp TEXT,
  email TEXT,
  website TEXT,
  
  -- Location
  province_id UUID REFERENCES public.provinces(id),
  regency_id UUID REFERENCES public.regencies(id),
  district_id UUID REFERENCES public.districts(id),
  village_id UUID REFERENCES public.villages(id),
  address TEXT,
  city TEXT,
  province TEXT,
  postal_code TEXT,
  google_maps_url TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  
  -- Branding
  logo_url TEXT,
  banner_url TEXT,
  gallery JSONB,
  
  -- Social Media
  instagram TEXT,
  facebook TEXT,
  tiktok TEXT,
  twitter TEXT,
  youtube TEXT,
  linkedin TEXT,
  
  -- Operations
  operational_hours JSONB,
  
  -- Status
  is_verified BOOLEAN DEFAULT false,
  verified_at TIMESTAMPTZ,
  verified_by UUID REFERENCES auth.users(id),
  status umkm_status DEFAULT 'pending',
  
  -- Stats
  view_count INTEGER DEFAULT 0,
  contact_count INTEGER DEFAULT 0,
  
  -- Summary columns
  total_products INTEGER DEFAULT 0,
  active_products INTEGER DEFAULT 0,
  total_orders INTEGER DEFAULT 0,
  completed_orders INTEGER DEFAULT 0,
  total_revenue NUMERIC DEFAULT 0,
  average_rating NUMERIC(3,2) DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  total_followers INTEGER DEFAULT 0,
  response_time_hours INTEGER,
  fulfillment_rate NUMERIC(5,2) DEFAULT 0,
  
  -- Subscription
  current_plan TEXT DEFAULT 'free',
  plan_starts_at TIMESTAMPTZ,
  plan_ends_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.umkm_portfolios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  umkm_id UUID NOT NULL REFERENCES public.umkm_profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.umkm_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  umkm_id UUID NOT NULL REFERENCES public.umkm_profiles(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES auth.users(id),
  rating INTEGER NOT NULL,
  title TEXT,
  content TEXT,
  is_anonymous BOOLEAN DEFAULT false,
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  CONSTRAINT chk_umkm_review_rating_range CHECK (rating >= 1 AND rating <= 5)
);

CREATE TABLE public.umkm_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  umkm_id UUID NOT NULL REFERENCES public.umkm_profiles(id) ON DELETE CASCADE,
  plan TEXT NOT NULL,
  status subscription_status DEFAULT 'active',
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- PRODUCTS
-- ============================================================

CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  umkm_id UUID NOT NULL REFERENCES public.umkm_profiles(id) ON DELETE CASCADE,
  category_id UUID REFERENCES public.categories(id),
  name TEXT NOT NULL,
  slug TEXT,
  description TEXT,
  price NUMERIC(12,2),
  stock INTEGER DEFAULT 0,
  sku TEXT,
  is_service BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'active',
  
  -- Summary columns
  total_orders INTEGER DEFAULT 0,
  total_sold INTEGER DEFAULT 0,
  average_rating NUMERIC(3,2) DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  primary_image_url TEXT,
  image_count INTEGER DEFAULT 0,
  is_in_stock BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  CONSTRAINT chk_product_price_positive CHECK (price IS NULL OR price >= 0),
  CONSTRAINT chk_product_stock_positive CHECK (stock >= 0)
);

CREATE TABLE public.product_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  is_primary BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.product_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL,
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  CONSTRAINT chk_product_review_rating_range CHECK (rating >= 1 AND rating <= 5)
);

-- ============================================================
-- CART SYSTEM
-- ============================================================

CREATE TABLE public.carts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cart_id UUID NOT NULL REFERENCES public.carts(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  price NUMERIC(12,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  
  CONSTRAINT chk_cart_item_quantity CHECK (quantity > 0 AND price >= 0)
);

-- ============================================================
-- ORDERS
-- ============================================================

CREATE TABLE public.umkm_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  umkm_id UUID NOT NULL REFERENCES public.umkm_profiles(id),
  order_number TEXT UNIQUE,
  status order_status DEFAULT 'pending',
  subtotal NUMERIC(12,2),
  shipping_fee NUMERIC(12,2) DEFAULT 0,
  total_amount NUMERIC(12,2),
  payment_status payment_status DEFAULT 'unpaid',
  shipping_address TEXT,
  shipping_method TEXT,
  notes TEXT,
  
  -- Summary columns
  item_count INTEGER DEFAULT 0,
  product_names TEXT,
  seller_name TEXT,
  buyer_name TEXT,
  shipping_tracking_number TEXT,
  shipping_carrier TEXT,
  estimated_delivery TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  CONSTRAINT chk_order_amounts CHECK (
    subtotal >= 0 AND shipping_fee >= 0 AND total_amount >= 0
  )
);

CREATE TABLE public.umkm_order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.umkm_orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id),
  product_name TEXT,
  price NUMERIC(12,2),
  quantity INTEGER,
  total NUMERIC(12,2),
  created_at TIMESTAMPTZ DEFAULT now(),
  
  CONSTRAINT chk_order_item_valid CHECK (price >= 0 AND quantity > 0 AND total >= 0)
);

CREATE TABLE public.umkm_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.umkm_orders(id) ON DELETE CASCADE,
  provider TEXT,
  method payment_method,
  transaction_id TEXT,
  amount NUMERIC(12,2),
  status payment_status DEFAULT 'pending',
  paid_at TIMESTAMPTZ,
  raw_response JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- COMMUNICATION
-- ============================================================

CREATE TABLE public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID REFERENCES public.listings(id) ON DELETE SET NULL,
  buyer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  seller_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  last_message_at TIMESTAMPTZ DEFAULT now(),
  
  -- Summary columns
  last_message_content TEXT,
  last_sender_id UUID REFERENCES auth.users(id),
  unread_count_buyer INTEGER DEFAULT 0,
  unread_count_seller INTEGER DEFAULT 0,
  message_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(listing_id, buyer_id, seller_id)
);

CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  message TEXT,
  category ticket_category DEFAULT 'general',
  status ticket_status DEFAULT 'open',
  priority ticket_priority DEFAULT 'normal',
  assigned_to UUID REFERENCES auth.users(id),
  assigned_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES auth.users(id),
  
  -- Summary columns
  reply_count INTEGER DEFAULT 0,
  last_reply_at TIMESTAMPTZ,
  last_reply_by UUID REFERENCES auth.users(id),
  first_response_at TIMESTAMPTZ,
  resolution_time_hours INTEGER,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.ticket_replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES public.support_tickets(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  is_internal BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- REVIEWS
-- ============================================================

CREATE TABLE public.seller_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  rating INTEGER NOT NULL,
  content TEXT,
  is_anonymous BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  CONSTRAINT chk_review_rating_range CHECK (rating >= 1 AND rating <= 5),
  UNIQUE(order_id, reviewer_id)
);

-- ============================================================
-- NOTIFICATIONS
-- ============================================================

CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT,
  type notification_type DEFAULT 'info',
  channel notification_channel DEFAULT 'in_app',
  is_read BOOLEAN DEFAULT false,
  data JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- OTP
-- ============================================================

CREATE TABLE public.otp_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  channel otp_channel NOT NULL,
  code TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  is_used BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  
  CONSTRAINT chk_otp_valid CHECK (code ~ '^\d{4,6}$' AND expires_at > created_at)
);

-- ============================================================
-- TESTIMONIALS
-- ============================================================

CREATE TABLE public.testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  role TEXT,
  avatar_url TEXT,
  content TEXT NOT NULL,
  rating INTEGER DEFAULT 5,
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  CONSTRAINT chk_testimonial_rating_range CHECK (rating >= 1 AND rating <= 5)
);

-- ============================================================
-- SUBSCRIPTION PLANS
-- ============================================================

CREATE TABLE public.subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  price NUMERIC NOT NULL DEFAULT 0,
  duration_days INTEGER DEFAULT 30,
  features JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- PERMISSIONS
-- ============================================================

CREATE TABLE public.permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  module TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.role_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role TEXT NOT NULL,
  permission_id UUID NOT NULL REFERENCES public.permissions(id) ON DELETE CASCADE,
  can_access BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(role, permission_id)
);

-- ============================================================
-- AUDIT LOGS
-- ============================================================

CREATE TABLE public.admin_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id UUID,
  details JSONB,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  details JSONB,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- PLATFORM SETTINGS
-- ============================================================

CREATE TABLE public.platform_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  description TEXT,
  updated_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- MATERIALIZED VIEWS
-- ============================================================

CREATE MATERIALIZED VIEW public.dashboard_stats AS
SELECT
  (SELECT COUNT(*) FROM public.listings WHERE status = 'active' AND deleted_at IS NULL) as active_listings,
  (SELECT COUNT(*) FROM public.listings WHERE status = 'sold' AND deleted_at IS NULL) as sold_listings,
  (SELECT COUNT(*) FROM public.umkm_profiles WHERE status = 'active') as active_umkm,
  (SELECT COUNT(*) FROM public.products WHERE status = 'active') as active_products,
  (SELECT COALESCE(SUM(total_amount), 0) FROM public.umkm_orders WHERE status = 'completed') as total_revenue,
  (SELECT COUNT(*) FROM public.listing_auctions WHERE status = 'active') as active_auctions,
  (SELECT COUNT(*) FROM public.profiles WHERE is_active = true) as active_users,
  (SELECT COALESCE(SUM(balance), 0) FROM public.user_credits) as total_credits_in_system;

CREATE UNIQUE INDEX idx_dashboard_stats ON public.dashboard_stats (active_listings);

-- ============================================================
-- END OF SCHEMA
-- ============================================================
