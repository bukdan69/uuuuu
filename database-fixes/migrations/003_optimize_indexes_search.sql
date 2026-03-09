-- ============================================================
-- MIGRATION: Optimize Indexes & Full-Text Search
-- Deskripsi: Menambahkan indexes yang optimal dan full-text
-- search capabilities untuk performa yang lebih baik
-- ============================================================

-- ============================================================
-- 1. EXTENSIONS
-- ============================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS pg_trgm;        -- Trigram similarity
CREATE EXTENSION IF NOT EXISTS unaccent;       -- Accent removal for search

-- ============================================================
-- 2. FULL-TEXT SEARCH INDEXES FOR LISTINGS
-- ============================================================

-- Create GIN index for full-text search on listings
CREATE INDEX IF NOT EXISTS idx_listings_title_search 
  ON public.listings USING gin(to_tsvector('indonesian', title));

CREATE INDEX IF NOT EXISTS idx_listings_description_search 
  ON public.listings USING gin(to_tsvector('indonesian', description));

-- Combined search index
CREATE INDEX IF NOT EXISTS idx_listings_fulltext_search 
  ON public.listings USING gin(
    to_tsvector('indonesian', 
      COALESCE(title, '') || ' ' || 
      COALESCE(description, '') || ' ' || 
      COALESCE(keywords, '')
    )
  );

-- Trigram index for LIKE/ILIKE queries on title
CREATE INDEX IF NOT EXISTS idx_listings_title_trgm 
  ON public.listings USING gin(title gin_trgm_ops);

-- ============================================================
-- 3. FULL-TEXT SEARCH INDEXES FOR PRODUCTS
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_products_name_search 
  ON public.products USING gin(to_tsvector('indonesian', name));

CREATE INDEX IF NOT EXISTS idx_products_description_search 
  ON public.products USING gin(to_tsvector('indonesian', description));

CREATE INDEX IF NOT EXISTS idx_products_fulltext_search 
  ON public.products USING gin(
    to_tsvector('indonesian', 
      COALESCE(name, '') || ' ' || 
      COALESCE(description, '')
    )
  );

CREATE INDEX IF NOT EXISTS idx_products_name_trgm 
  ON public.products USING gin(name gin_trgm_ops);

-- ============================================================
-- 4. FULL-TEXT SEARCH INDEXES FOR UMKM PROFILES
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_umkm_name_search 
  ON public.umkm_profiles USING gin(to_tsvector('indonesian', umkm_name));

CREATE INDEX IF NOT EXISTS idx_umkm_description_search 
  ON public.umkm_profiles USING gin(to_tsvector('indonesian', description));

CREATE INDEX IF NOT EXISTS idx_umkm_fulltext_search 
  ON public.umkm_profiles USING gin(
    to_tsvector('indonesian', 
      COALESCE(umkm_name, '') || ' ' || 
      COALESCE(brand_name, '') || ' ' || 
      COALESCE(description, '') || ' ' || 
      COALESCE(tagline, '')
    )
  );

CREATE INDEX IF NOT EXISTS idx_umkm_name_trgm 
  ON public.umkm_profiles USING gin(umkm_name gin_trgm_ops);

-- ============================================================
-- 5. FULL-TEXT SEARCH INDEXES FOR CATEGORIES
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_categories_name_search 
  ON public.categories USING gin(to_tsvector('indonesian', name));

CREATE INDEX IF NOT EXISTS idx_categories_name_trgm 
  ON public.categories USING gin(name gin_trgm_ops);

-- ============================================================
-- 6. COMPOSITE INDEXES FOR COMMON QUERIES
-- ============================================================

-- Listings: status + created_at (for marketplace listing)
CREATE INDEX IF NOT EXISTS idx_listings_status_created 
  ON public.listings(status, created_at DESC) 
  WHERE deleted_at IS NULL;

-- Listings: user + status (for user's listings dashboard)
CREATE INDEX IF NOT EXISTS idx_listings_user_status 
  ON public.listings(user_id, status) 
  WHERE deleted_at IS NULL;

-- Listings: category + status + created_at (for category pages)
CREATE INDEX IF NOT EXISTS idx_listings_category_status_created 
  ON public.listings(category_id, status, created_at DESC) 
  WHERE deleted_at IS NULL AND status = 'active';

-- Listings: location-based queries
CREATE INDEX IF NOT EXISTS idx_listings_location 
  ON public.listings(province_id, regency_id, status) 
  WHERE deleted_at IS NULL AND status = 'active';

-- Listings: price range queries
CREATE INDEX IF NOT EXISTS idx_listings_price_status 
  ON public.listings(price, status) 
  WHERE deleted_at IS NULL AND status = 'active';

-- Listings: featured listings
CREATE INDEX IF NOT EXISTS idx_listings_featured 
  ON public.listings(featured_until DESC) 
  WHERE is_featured = true AND status = 'active' AND deleted_at IS NULL;

-- ============================================================
-- 7. AUCTION INDEXES
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_auctions_active 
  ON public.listing_auctions(ends_at ASC) 
  WHERE status = 'active';

CREATE INDEX IF NOT EXISTS idx_auctions_listing 
  ON public.listing_auctions(listing_id, status);

CREATE INDEX IF NOT EXISTS idx_auction_bids_auction_created 
  ON public.auction_bids(auction_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_auction_bids_bidder 
  ON public.auction_bids(bidder_id, created_at DESC);

-- ============================================================
-- 8. BOOST INDEXES
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_boosts_active 
  ON public.listing_boosts(ends_at ASC) 
  WHERE status = 'active';

CREATE INDEX IF NOT EXISTS idx_boosts_listing_status 
  ON public.listing_boosts(listing_id, status, boost_type);

-- ============================================================
-- 9. WALLET & TRANSACTION INDEXES
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_transactions_user_type_created 
  ON public.transactions(user_id, type, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_transactions_wallet_created 
  ON public.transactions(wallet_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_transactions_reference 
  ON public.transactions(reference_type, reference_id);

CREATE INDEX IF NOT EXISTS idx_withdrawals_status_created 
  ON public.withdrawals(status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_withdrawals_user_status 
  ON public.withdrawals(user_id, status);

-- ============================================================
-- 10. CREDIT SYSTEM INDEXES
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_credit_transactions_user_type 
  ON public.credit_transactions(user_id, type, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_credit_transactions_created 
  ON public.credit_transactions(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_credit_topup_requests_status 
  ON public.credit_topup_requests(status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_credit_topup_requests_user 
  ON public.credit_topup_requests(user_id, status);

-- ============================================================
-- 11. ORDER INDEXES
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_orders_user_status 
  ON public.orders(user_id, status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_orders_seller_status 
  ON public.orders(seller_id, status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_orders_status_created 
  ON public.orders(status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_umkm_orders_user_status 
  ON public.umkm_orders(user_id, status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_umkm_orders_umkm_status 
  ON public.umkm_orders(umkm_id, status, created_at DESC);

-- ============================================================
-- 12. MESSAGE INDEXES
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_messages_conversation_created 
  ON public.messages(conversation_id, created_at ASC);

CREATE INDEX IF NOT EXISTS idx_messages_sender_created 
  ON public.messages(sender_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_conversations_user 
  ON public.conversations(buyer_id, last_message_at DESC);

CREATE INDEX IF NOT EXISTS idx_conversations_seller 
  ON public.conversations(seller_id, last_message_at DESC);

-- ============================================================
-- 13. NOTIFICATION INDEXES
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_notifications_user_read 
  ON public.notifications(user_id, is_read, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_notifications_user_type 
  ON public.notifications(user_id, type, created_at DESC);

-- ============================================================
-- 14. SUPPORT TICKET INDEXES
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_support_tickets_user_status 
  ON public.support_tickets(user_id, status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_support_tickets_status_priority 
  ON public.support_tickets(status, priority, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_support_tickets_assigned 
  ON public.support_tickets(assigned_to, status);

-- ============================================================
-- 15. KYC INDEXES
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_kyc_status_created 
  ON public.kyc_verifications(status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_kyc_documents_kyc_type 
  ON public.kyc_documents(kyc_verification_id, document_type);

-- ============================================================
-- 16. BANNER INDEXES
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_banners_active 
  ON public.banners(position, priority DESC) 
  WHERE status = 'active' AND deleted_at IS NULL 
  AND (ends_at IS NULL OR ends_at > now());

CREATE INDEX IF NOT EXISTS idx_banners_user_status 
  ON public.banners(user_id, status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_banner_events_banner_created 
  ON public.banner_events(banner_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_banner_events_type 
  ON public.banner_events(event_type, created_at DESC);

-- ============================================================
-- 17. PRODUCT INDEXES
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_products_umkm_status 
  ON public.products(umkm_id, status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_products_category_status 
  ON public.products(category_id, status);

CREATE INDEX IF NOT EXISTS idx_products_price 
  ON public.products(price) WHERE status = 'active';

-- ============================================================
-- 18. REVIEW INDEXES
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_seller_reviews_seller_created 
  ON public.seller_reviews(seller_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_seller_reviews_reviewer 
  ON public.seller_reviews(reviewer_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_umkm_reviews_umkm_created 
  ON public.umkm_reviews(umkm_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_product_reviews_product_created 
  ON public.product_reviews(product_id, created_at DESC);

-- ============================================================
-- 19. UMKM PROFILE INDEXES
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_umkm_profiles_owner_status 
  ON public.umkm_profiles(owner_id, status);

CREATE INDEX IF NOT EXISTS idx_umkm_profiles_category 
  ON public.umkm_profiles(category_id, status);

CREATE INDEX IF NOT EXISTS idx_umkm_profiles_location 
  ON public.umkm_profiles(province_id, regency_id, status);

CREATE INDEX IF NOT EXISTS idx_umkm_profiles_verified 
  ON public.umkm_profiles(is_verified, status);

-- ============================================================
-- 20. COUPON INDEXES
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_coupons_code 
  ON public.coupons(UPPER(code));

CREATE INDEX IF NOT EXISTS idx_coupons_active 
  ON public.coupons(is_active, expires_at) 
  WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_coupon_uses_user 
  ON public.coupon_uses(user_id, used_at DESC);

-- ============================================================
-- 21. PARTIAL INDEXES FOR PERFORMANCE
-- ============================================================

-- Only index active listings (most queries filter by active)
CREATE INDEX IF NOT EXISTS idx_listings_active_price 
  ON public.listings(price) 
  WHERE status = 'active' AND deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_listings_active_created 
  ON public.listings(created_at DESC) 
  WHERE status = 'active' AND deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_listings_active_view_count 
  ON public.listings(view_count DESC) 
  WHERE status = 'active' AND deleted_at IS NULL;

-- ============================================================
-- 22. ADMIN DASHBOARD INDEXES
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_admin_logs_admin_created 
  ON public.admin_logs(admin_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_admin_logs_action 
  ON public.admin_logs(action, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_admin_logs_target 
  ON public.admin_logs(target_type, target_id);

-- ============================================================
-- 23. SEARCH FUNCTIONS
-- ============================================================

-- Function to search listings
CREATE OR REPLACE FUNCTION public.search_listings(
  p_query TEXT,
  p_category_id UUID DEFAULT NULL,
  p_min_price NUMERIC DEFAULT NULL,
  p_max_price NUMERIC DEFAULT NULL,
  p_province_id UUID DEFAULT NULL,
  p_status public.listing_status DEFAULT 'active',
  p_limit INTEGER DEFAULT 20,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  description TEXT,
  price NUMERIC,
  image_url TEXT,
  rank REAL
)
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    l.id,
    l.title,
    l.description,
    l.price,
    l.image_url,
    ts_rank(
      to_tsvector('indonesian', 
        COALESCE(l.title, '') || ' ' || 
        COALESCE(l.description, '') || ' ' || 
        COALESCE(l.keywords, '')
      ),
      plainto_tsquery('indonesian', p_query)
    ) as rank
  FROM public.listings l
  WHERE 
    l.deleted_at IS NULL
    AND l.status = p_status
    AND (p_category_id IS NULL OR l.category_id = p_category_id)
    AND (p_min_price IS NULL OR l.price >= p_min_price)
    AND (p_max_price IS NULL OR l.price <= p_max_price)
    AND (p_province_id IS NULL OR l.province_id = p_province_id)
    AND (
      to_tsvector('indonesian', 
        COALESCE(l.title, '') || ' ' || 
        COALESCE(l.description, '') || ' ' || 
        COALESCE(l.keywords, '')
      ) @@ plainto_tsquery('indonesian', p_query)
      OR l.title ILIKE '%' || p_query || '%'
    )
  ORDER BY rank DESC, l.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;

-- Function to search products
CREATE OR REPLACE FUNCTION public.search_products(
  p_query TEXT,
  p_umkm_id UUID DEFAULT NULL,
  p_category_id UUID DEFAULT NULL,
  p_min_price NUMERIC DEFAULT NULL,
  p_max_price NUMERIC DEFAULT NULL,
  p_limit INTEGER DEFAULT 20,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  description TEXT,
  price NUMERIC,
  umkm_name TEXT,
  rank REAL
)
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.name,
    p.description,
    p.price,
    u.umkm_name,
    ts_rank(
      to_tsvector('indonesian', 
        COALESCE(p.name, '') || ' ' || 
        COALESCE(p.description, '')
      ),
      plainto_tsquery('indonesian', p_query)
    ) as rank
  FROM public.products p
  JOIN public.umkm_profiles u ON u.id = p.umkm_id
  WHERE 
    p.status = 'active'
    AND u.status = 'active'
    AND (p_umkm_id IS NULL OR p.umkm_id = p_umkm_id)
    AND (p_category_id IS NULL OR p.category_id = p_category_id)
    AND (p_min_price IS NULL OR p.price >= p_min_price)
    AND (p_max_price IS NULL OR p.price <= p_max_price)
    AND (
      to_tsvector('indonesian', 
        COALESCE(p.name, '') || ' ' || 
        COALESCE(p.description, '')
      ) @@ plainto_tsquery('indonesian', p_query)
      OR p.name ILIKE '%' || p_query || '%'
    )
  ORDER BY rank DESC, p.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;

-- Function to search UMKM
CREATE OR REPLACE FUNCTION public.search_umkm(
  p_query TEXT,
  p_category_id UUID DEFAULT NULL,
  p_province_id UUID DEFAULT NULL,
  p_scale public.business_scale DEFAULT NULL,
  p_limit INTEGER DEFAULT 20,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  umkm_name TEXT,
  brand_name TEXT,
  description TEXT,
  business_scale public.business_scale,
  city TEXT,
  rank REAL
)
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id,
    u.umkm_name,
    u.brand_name,
    u.description,
    u.business_scale,
    u.city,
    ts_rank(
      to_tsvector('indonesian', 
        COALESCE(u.umkm_name, '') || ' ' || 
        COALESCE(u.brand_name, '') || ' ' || 
        COALESCE(u.description, '') || ' ' || 
        COALESCE(u.tagline, '')
      ),
      plainto_tsquery('indonesian', p_query)
    ) as rank
  FROM public.umkm_profiles u
  WHERE 
    u.status = 'active'
    AND (p_category_id IS NULL OR u.category_id = p_category_id)
    AND (p_province_id IS NULL OR u.province_id = p_province_id)
    AND (p_scale IS NULL OR u.business_scale = p_scale)
    AND (
      to_tsvector('indonesian', 
        COALESCE(u.umkm_name, '') || ' ' || 
        COALESCE(u.brand_name, '') || ' ' || 
        COALESCE(u.description, '') || ' ' || 
        COALESCE(u.tagline, '')
      ) @@ plainto_tsquery('indonesian', p_query)
      OR u.umkm_name ILIKE '%' || p_query || '%'
    )
  ORDER BY rank DESC, u.view_count DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;
