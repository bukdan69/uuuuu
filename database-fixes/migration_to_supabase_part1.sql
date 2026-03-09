-- ============================================================
-- COMPLETE DATABASE MIGRATION FOR SUPABASE
-- Project: fnicnfehvjuxmemujrhl
-- Region: ap-southeast-1 (Singapore)
-- ============================================================
-- 
-- Cara menjalankan:
-- 1. Via Supabase Dashboard: Buka SQL Editor, paste semua, run
-- 2. Via psql: psql "DATABASE_URL" -f migration_to_supabase.sql
-- 3. Via Supabase CLI: supabase db push
--
-- ============================================================

-- ============================================================
-- STEP 1: ENABLE EXTENSIONS
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "unaccent";

-- ============================================================
-- STEP 2: CREATE ENUM TYPES
-- ============================================================

-- User Roles
DO $$ BEGIN
    CREATE TYPE app_role AS ENUM ('user', 'admin', 'penjual');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Listing Types
DO $$ BEGIN
    CREATE TYPE listing_price_type AS ENUM ('fixed', 'negotiable', 'auction');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE listing_type AS ENUM ('sale', 'rent', 'service', 'wanted');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE listing_condition AS ENUM ('new', 'like_new', 'good', 'fair', 'poor');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE listing_status AS ENUM ('draft', 'pending_review', 'active', 'sold', 'expired', 'rejected', 'deleted');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Auction Types
DO $$ BEGIN
    CREATE TYPE auction_status AS ENUM ('active', 'ended', 'sold', 'cancelled', 'no_winner');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Boost Types
DO $$ BEGIN
    CREATE TYPE boost_type AS ENUM ('highlight', 'top_search', 'premium');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE boost_status AS ENUM ('active', 'expired', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Credit Types
DO $$ BEGIN
    CREATE TYPE credit_transaction_type AS ENUM ('purchase', 'usage', 'refund', 'bonus', 'expired', 'topup', 'adjustment');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Order Types
DO $$ BEGIN
    CREATE TYPE order_status AS ENUM ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'completed', 'cancelled', 'refunded', 'failed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE payment_status AS ENUM ('unpaid', 'pending', 'paid', 'failed', 'refunded', 'partial');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE payment_method AS ENUM ('bank_transfer', 'e_wallet', 'credit_card', 'cod', 'credit', 'va');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- KYC Types
DO $$ BEGIN
    CREATE TYPE kyc_status AS ENUM ('not_submitted', 'draft', 'pending', 'under_review', 'approved', 'rejected', 'expired');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE document_type AS ENUM ('ktp', 'npwp', 'siup', 'tdp', 'nib', 'akta', 'skdp', 'other');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Wallet Types
DO $$ BEGIN
    CREATE TYPE wallet_status AS ENUM ('active', 'frozen', 'closed', 'suspended');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE transaction_type AS ENUM ('topup', 'withdrawal', 'payment', 'refund', 'commission', 'bonus', 'transfer_in', 'transfer_out', 'adjustment');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE withdrawal_status AS ENUM ('pending', 'processing', 'approved', 'rejected', 'paid', 'failed', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Banner Types
DO $$ BEGIN
    CREATE TYPE banner_position AS ENUM ('hero', 'sidebar', 'inline', 'footer', 'category_top', 'search_top');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE banner_status AS ENUM ('pending', 'active', 'paused', 'expired', 'rejected');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE banner_pricing_model AS ENUM ('cpc', 'cpm', 'fixed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Report Types
DO $$ BEGIN
    CREATE TYPE report_reason AS ENUM ('spam', 'fraud', 'inappropriate', 'wrong_category', 'duplicate', 'counterfeit', 'sold_elsewhere', 'other');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE report_status AS ENUM ('pending', 'reviewed', 'action_taken', 'dismissed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- UMKM Types
DO $$ BEGIN
    CREATE TYPE umkm_status AS ENUM ('pending', 'active', 'suspended', 'closed', 'rejected');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE business_scale AS ENUM ('micro', 'small', 'medium', 'large');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Support Types
DO $$ BEGIN
    CREATE TYPE ticket_status AS ENUM ('open', 'in_progress', 'waiting_customer', 'resolved', 'closed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE ticket_priority AS ENUM ('low', 'normal', 'high', 'urgent');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE ticket_category AS ENUM ('general', 'account', 'payment', 'listing', 'order', 'technical', 'report', 'suggestion');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Notification Types
DO $$ BEGIN
    CREATE TYPE notification_type AS ENUM ('info', 'success', 'warning', 'error', 'order', 'payment', 'message', 'listing', 'promotion', 'system');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE notification_channel AS ENUM ('in_app', 'email', 'sms', 'whatsapp', 'push');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Other Types
DO $$ BEGIN
    CREATE TYPE otp_channel AS ENUM ('sms', 'whatsapp', 'email');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE contact_preference AS ENUM ('phone', 'whatsapp', 'email', 'in_app', 'all');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE promo_type AS ENUM ('regular', 'flash_sale', 'discount', 'bundle', 'free_shipping', 'cashback');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE subscription_status AS ENUM ('active', 'expired', 'cancelled', 'pending', 'grace_period');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ============================================================
-- STEP 3: CREATE UTILITY FUNCTIONS
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

-- ============================================================
-- STEP 4: CREATE TABLES - REGION (Indonesia)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.provinces (
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

CREATE TABLE IF NOT EXISTS public.regencies (
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

CREATE TABLE IF NOT EXISTS public.districts (
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

CREATE TABLE IF NOT EXISTS public.villages (
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
-- STEP 5: CREATE TABLES - USER MANAGEMENT
-- ============================================================

CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    name TEXT,
    phone_number TEXT,
    address TEXT,
    avatar_url TEXT,
    primary_role TEXT DEFAULT 'user',
    is_active BOOLEAN DEFAULT true,
    total_listings INTEGER DEFAULT 0,
    active_listings INTEGER DEFAULT 0,
    sold_count INTEGER DEFAULT 0,
    total_sales NUMERIC DEFAULT 0,
    average_rating NUMERIC(3,2) DEFAULT 0,
    total_reviews INTEGER DEFAULT 0,
    response_rate NUMERIC(5,2) DEFAULT 0,
    last_active_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.user_roles (
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

CREATE TABLE IF NOT EXISTS public.kyc_verifications (
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
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.kyc_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    kyc_verification_id UUID NOT NULL REFERENCES public.kyc_verifications(id) ON DELETE CASCADE,
    document_type document_type NOT NULL,
    document_name TEXT NOT NULL,
    document_number TEXT,
    image_url TEXT NOT NULL,
    file_name TEXT,
    status TEXT DEFAULT 'pending',
    rejection_reason TEXT,
    full_name TEXT,
    birth_place TEXT,
    birth_date TIMESTAMPTZ,
    gender TEXT,
    blood_type TEXT,
    religion TEXT,
    marital_status TEXT,
    occupation TEXT,
    nationality TEXT DEFAULT 'WNI',
    province_id UUID REFERENCES public.provinces(id),
    regency_id UUID REFERENCES public.regencies(id),
    district_id UUID REFERENCES public.districts(id),
    village_id UUID REFERENCES public.villages(id),
    rt TEXT,
    rw TEXT,
    address TEXT,
    postal_code TEXT,
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
-- STEP 6: CREATE TABLES - WALLET & TRANSACTIONS
-- ============================================================

CREATE TABLE IF NOT EXISTS public.wallets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    balance NUMERIC(15,2) DEFAULT 0,
    currency_code CHAR(3) DEFAULT 'IDR',
    status wallet_status DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.transactions (
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
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.withdrawals (
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
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- STEP 7: CREATE TABLES - CREDIT SYSTEM
-- ============================================================

CREATE TABLE IF NOT EXISTS public.user_credits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    balance INTEGER DEFAULT 0,
    lifetime_purchased INTEGER DEFAULT 0,
    lifetime_used INTEGER DEFAULT 0,
    total_purchased INTEGER DEFAULT 0,
    total_used INTEGER DEFAULT 0,
    total_bonus INTEGER DEFAULT 0,
    total_expired INTEGER DEFAULT 0,
    last_transaction_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.credit_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type credit_transaction_type NOT NULL,
    amount INTEGER NOT NULL,
    balance_after INTEGER NOT NULL,
    reference_type TEXT,
    reference_id UUID,
    description TEXT,
    payment_id UUID,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.credit_packages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    credits INTEGER NOT NULL,
    price NUMERIC NOT NULL,
    bonus_credits INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.credit_topup_requests (
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
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.coupons (
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
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.coupon_uses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    coupon_id UUID NOT NULL REFERENCES public.coupons(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    credits_given INTEGER NOT NULL,
    used_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(coupon_id, user_id)
);

-- ============================================================
-- STEP 8: CREATE TABLES - CATEGORIES
-- ============================================================

CREATE TABLE IF NOT EXISTS public.categories (
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
-- STEP 9: CREATE TABLES - LISTINGS
-- ============================================================

CREATE TABLE IF NOT EXISTS public.listings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES public.categories(id),
    umkm_id UUID,
    subcategory_id UUID REFERENCES public.categories(id),
    title TEXT NOT NULL,
    slug TEXT UNIQUE,
    description TEXT,
    image_url TEXT,
    gallery JSONB,
    video_url TEXT,
    specifications JSONB,
    price NUMERIC DEFAULT 0,
    price_type listing_price_type DEFAULT 'fixed',
    price_negotiable BOOLEAN DEFAULT true,
    rental_price DOUBLE PRECISION,
    rental_period TEXT,
    price_formatted TEXT,
    listing_type listing_type DEFAULT 'sale',
    condition listing_condition DEFAULT 'good',
    status listing_status DEFAULT 'draft',
    is_featured BOOLEAN DEFAULT false,
    featured_until TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    published_at TIMESTAMPTZ,
    promo_type promo_type DEFAULT 'regular',
    promo_details JSONB,
    location_lat DOUBLE PRECISION,
    location_lng DOUBLE PRECISION,
    province_id UUID REFERENCES public.provinces(id),
    regency_id UUID REFERENCES public.regencies(id),
    district_id UUID REFERENCES public.districts(id),
    village_id UUID REFERENCES public.villages(id),
    address TEXT,
    city TEXT,
    province TEXT,
    contact_preference contact_preference,
    contact_name TEXT,
    contact_phone TEXT,
    contact_whatsapp TEXT,
    contact_email TEXT,
    view_count INTEGER DEFAULT 0,
    click_count INTEGER DEFAULT 0,
    share_count INTEGER DEFAULT 0,
    favorite_count INTEGER DEFAULT 0,
    inquiry_count INTEGER DEFAULT 0,
    image_count INTEGER DEFAULT 0,
    primary_image_url TEXT,
    bid_count INTEGER DEFAULT 0,
    current_bid_amount NUMERIC,
    days_listed INTEGER DEFAULT 0,
    is_auction BOOLEAN DEFAULT false,
    is_boosted BOOLEAN DEFAULT false,
    active_boost_types TEXT[],
    is_sold BOOLEAN DEFAULT false,
    is_rented BOOLEAN DEFAULT false,
    sold_at TIMESTAMPTZ,
    rented_at TIMESTAMPTZ,
    sold_to UUID REFERENCES auth.users(id),
    rented_to UUID REFERENCES auth.users(id),
    approved_by UUID REFERENCES auth.users(id),
    approved_at TIMESTAMPTZ,
    rejection_reason TEXT,
    meta_title TEXT,
    meta_description TEXT,
    keywords TEXT,
    credits_used INTEGER DEFAULT 0,
    deleted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Add FK for umkm_id after umkm_profiles is created (done later)

CREATE TABLE IF NOT EXISTS public.listing_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    sort_order INTEGER DEFAULT 0,
    is_primary BOOLEAN DEFAULT false,
    is_paid BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.saved_listings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, listing_id)
);

CREATE TABLE IF NOT EXISTS public.listing_reports (
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
-- STEP 10: CREATE TABLES - AUCTIONS
-- ============================================================

CREATE TABLE IF NOT EXISTS public.listing_auctions (
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
    time_remaining_seconds INTEGER,
    unique_bidders INTEGER DEFAULT 0,
    highest_bidder_id UUID REFERENCES auth.users(id),
    has_reserve BOOLEAN DEFAULT false,
    reserve_met BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.auction_bids (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auction_id UUID NOT NULL REFERENCES public.listing_auctions(id) ON DELETE CASCADE,
    bidder_id UUID NOT NULL REFERENCES auth.users(id),
    amount NUMERIC NOT NULL,
    is_auto_bid BOOLEAN DEFAULT false,
    max_auto_amount NUMERIC,
    is_winning BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- STEP 11: CREATE TABLES - BOOSTS
-- ============================================================

CREATE TABLE IF NOT EXISTS public.boost_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type boost_type UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    credits_per_day INTEGER NOT NULL,
    multiplier NUMERIC DEFAULT 1,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.listing_boosts (
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
-- STEP 12: CREATE TABLES - BANNERS
-- ============================================================

CREATE TABLE IF NOT EXISTS public.banners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    title TEXT NOT NULL,
    image_url TEXT NOT NULL,
    target_url TEXT NOT NULL,
    position banner_position DEFAULT 'inline',
    status banner_status DEFAULT 'pending',
    pricing_model banner_pricing_model DEFAULT 'cpc',
    budget_total NUMERIC DEFAULT 0,
    budget_spent NUMERIC DEFAULT 0,
    cost_per_click NUMERIC DEFAULT 500,
    cost_per_mille NUMERIC DEFAULT 5000,
    impressions INTEGER DEFAULT 0,
    clicks INTEGER DEFAULT 0,
    ctr NUMERIC(8,4) DEFAULT 0,
    cpc_actual NUMERIC(10,2),
    cpm_actual NUMERIC(10,2),
    days_running INTEGER DEFAULT 0,
    starts_at TIMESTAMPTZ DEFAULT now(),
    ends_at TIMESTAMPTZ,
    priority INTEGER DEFAULT 0,
    approved_by UUID REFERENCES auth.users(id),
    approved_at TIMESTAMPTZ,
    deleted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.banner_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    banner_id UUID NOT NULL REFERENCES public.banners(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id),
    event_type TEXT NOT NULL,
    ip_address TEXT,
    user_agent TEXT,
    cost_amount NUMERIC DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- STEP 13: CREATE TABLES - UMKM PROFILES
-- ============================================================

CREATE TABLE IF NOT EXISTS public.umkm_profiles (
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
    phone TEXT,
    whatsapp TEXT,
    email TEXT,
    website TEXT,
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
    logo_url TEXT,
    banner_url TEXT,
    gallery JSONB,
    instagram TEXT,
    facebook TEXT,
    tiktok TEXT,
    twitter TEXT,
    youtube TEXT,
    linkedin TEXT,
    operational_hours JSONB,
    is_verified BOOLEAN DEFAULT false,
    verified_at TIMESTAMPTZ,
    verified_by UUID REFERENCES auth.users(id),
    status umkm_status DEFAULT 'pending',
    view_count INTEGER DEFAULT 0,
    contact_count INTEGER DEFAULT 0,
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
    current_plan TEXT DEFAULT 'free',
    plan_starts_at TIMESTAMPTZ,
    plan_ends_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Add FK from listings to umkm_profiles
ALTER TABLE public.listings 
ADD CONSTRAINT fk_listings_umkm 
FOREIGN KEY (umkm_id) REFERENCES public.umkm_profiles(id) ON DELETE SET NULL;

CREATE TABLE IF NOT EXISTS public.umkm_portfolios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    umkm_id UUID NOT NULL REFERENCES public.umkm_profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    image_url TEXT NOT NULL,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.umkm_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    umkm_id UUID NOT NULL REFERENCES public.umkm_profiles(id) ON DELETE CASCADE,
    reviewer_id UUID NOT NULL REFERENCES auth.users(id),
    rating INTEGER NOT NULL,
    title TEXT,
    content TEXT,
    is_anonymous BOOLEAN DEFAULT false,
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.umkm_subscriptions (
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
-- STEP 14: CREATE TABLES - PRODUCTS
-- ============================================================

CREATE TABLE IF NOT EXISTS public.products (
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
    total_orders INTEGER DEFAULT 0,
    total_sold INTEGER DEFAULT 0,
    average_rating NUMERIC(3,2) DEFAULT 0,
    total_reviews INTEGER DEFAULT 0,
    primary_image_url TEXT,
    image_count INTEGER DEFAULT 0,
    is_in_stock BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.product_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    is_primary BOOLEAN DEFAULT false,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.product_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL,
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- STEP 15: CREATE TABLES - CART
-- ============================================================

CREATE TABLE IF NOT EXISTS public.carts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.cart_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cart_id UUID NOT NULL REFERENCES public.carts(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1,
    price NUMERIC(12,2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- STEP 16: CREATE TABLES - ORDERS
-- ============================================================

CREATE TABLE IF NOT EXISTS public.umkm_orders (
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
    item_count INTEGER DEFAULT 0,
    product_names TEXT,
    seller_name TEXT,
    buyer_name TEXT,
    shipping_tracking_number TEXT,
    shipping_carrier TEXT,
    estimated_delivery TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.umkm_order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.umkm_orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id),
    product_name TEXT,
    price NUMERIC(12,2),
    quantity INTEGER,
    total NUMERIC(12,2),
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.umkm_payments (
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

-- Generic orders table (for listing orders)
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    seller_id UUID NOT NULL REFERENCES auth.users(id),
    listing_id UUID REFERENCES public.listings(id) ON DELETE SET NULL,
    order_number TEXT UNIQUE,
    status order_status DEFAULT 'pending',
    total_amount NUMERIC(12,2),
    payment_status payment_status DEFAULT 'unpaid',
    shipping_address TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- STEP 17: CREATE TABLES - COMMUNICATION
-- ============================================================

CREATE TABLE IF NOT EXISTS public.conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id UUID REFERENCES public.listings(id) ON DELETE SET NULL,
    buyer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    seller_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    last_message_at TIMESTAMPTZ DEFAULT now(),
    last_message_content TEXT,
    last_sender_id UUID REFERENCES auth.users(id),
    unread_count_buyer INTEGER DEFAULT 0,
    unread_count_seller INTEGER DEFAULT 0,
    message_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(listing_id, buyer_id, seller_id)
);

CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.support_tickets (
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
    reply_count INTEGER DEFAULT 0,
    last_reply_at TIMESTAMPTZ,
    last_reply_by UUID REFERENCES auth.users(id),
    first_response_at TIMESTAMPTZ,
    resolution_time_hours INTEGER,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.ticket_replies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id UUID NOT NULL REFERENCES public.support_tickets(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    is_internal BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- STEP 18: CREATE TABLES - REVIEWS
-- ============================================================

CREATE TABLE IF NOT EXISTS public.seller_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    reviewer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
    rating INTEGER NOT NULL,
    content TEXT,
    is_anonymous BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(order_id, reviewer_id)
);

-- ============================================================
-- STEP 19: CREATE TABLES - NOTIFICATIONS & OTP
-- ============================================================

CREATE TABLE IF NOT EXISTS public.notifications (
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

CREATE TABLE IF NOT EXISTS public.otp_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    channel otp_channel NOT NULL,
    code TEXT NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    is_used BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- STEP 20: CREATE TABLES - MISC
-- ============================================================

CREATE TABLE IF NOT EXISTS public.testimonials (
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
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.subscription_plans (
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

CREATE TABLE IF NOT EXISTS public.permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    module TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.role_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role TEXT NOT NULL,
    permission_id UUID NOT NULL REFERENCES public.permissions(id) ON DELETE CASCADE,
    can_access BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(role, permission_id)
);

CREATE TABLE IF NOT EXISTS public.admin_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    target_type TEXT NOT NULL,
    target_id UUID,
    details JSONB,
    ip_address TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    action TEXT NOT NULL,
    entity_type TEXT,
    entity_id UUID,
    details JSONB,
    ip_address TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.platform_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT UNIQUE NOT NULL,
    value JSONB NOT NULL,
    description TEXT,
    updated_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- STEP 21: ENABLE ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE public.provinces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.regencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.districts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.villages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kyc_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kyc_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.withdrawals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_topup_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupon_uses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listing_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listing_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listing_auctions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auction_bids ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.boost_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listing_boosts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.banner_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.umkm_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.umkm_portfolios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.umkm_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.umkm_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.umkm_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.umkm_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.umkm_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seller_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.otp_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- MIGRATION COMPLETE - See Part 2 for RLS Policies & Indexes
-- ============================================================
