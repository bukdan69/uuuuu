-- ============================================================
-- MIGRATION: Denormalization & Summary Columns
-- Deskripsi: Menambahkan summary/denormalized columns untuk
-- performa query yang lebih baik
-- ============================================================

-- ============================================================
-- 1. PROFILES - ADD SUMMARY COLUMNS
-- ============================================================

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS total_listings INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS active_listings INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS sold_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_sales NUMERIC DEFAULT 0,
  ADD COLUMN IF NOT EXISTS average_rating NUMERIC(3,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_reviews INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS response_rate NUMERIC(5,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_active_at TIMESTAMPTZ;

-- ============================================================
-- 2. CATEGORIES - ADD SUMMARY COLUMNS
-- ============================================================

ALTER TABLE public.categories
  ADD COLUMN IF NOT EXISTS listing_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS umkm_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS product_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS active_listing_count INTEGER DEFAULT 0;

-- ============================================================
-- 3. LISTINGS - ADD CALCULATED FIELDS
-- ============================================================

ALTER TABLE public.listings
  ADD COLUMN IF NOT EXISTS price_display TEXT,
  ADD COLUMN IF NOT EXISTS primary_image_url TEXT,
  ADD COLUMN IF NOT EXISTS image_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS bid_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS current_bid_amount NUMERIC,
  ADD COLUMN IF NOT EXISTS days_listed INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS is_auction BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_boosted BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS active_boost_types TEXT[];

-- ============================================================
-- 4. UMKM_PROFILES - ADD SUMMARY COLUMNS
-- ============================================================

ALTER TABLE public.umkm_profiles
  ADD COLUMN IF NOT EXISTS total_products INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS active_products INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_orders INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS completed_orders INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_revenue NUMERIC DEFAULT 0,
  ADD COLUMN IF NOT EXISTS average_rating NUMERIC(3,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_reviews INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_followers INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS response_time_hours INTEGER,
  ADD COLUMN IF NOT EXISTS fulfillment_rate NUMERIC(5,2) DEFAULT 0;

-- ============================================================
-- 5. PRODUCTS - ADD SUMMARY COLUMNS
-- ============================================================

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS total_orders INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_sold INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS average_rating NUMERIC(3,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_reviews INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS primary_image_url TEXT,
  ADD COLUMN IF NOT EXISTS image_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS is_in_stock BOOLEAN DEFAULT true;

-- ============================================================
-- 6. CONVERSATIONS - ADD SUMMARY COLUMNS
-- ============================================================

ALTER TABLE public.conversations
  ADD COLUMN IF NOT EXISTS last_message_content TEXT,
  ADD COLUMN IF NOT EXISTS last_sender_id UUID,
  ADD COLUMN IF NOT EXISTS unread_count_buyer INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS unread_count_seller INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS message_count INTEGER DEFAULT 0;

-- ============================================================
-- 7. AUCTIONS - ADD CALCULATED FIELDS
-- ============================================================

ALTER TABLE public.listing_auctions
  ADD COLUMN IF NOT EXISTS time_remaining_seconds INTEGER,
  ADD COLUMN IF NOT EXISTS total_bids INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS unique_bidders INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS highest_bidder_id UUID,
  ADD COLUMN IF NOT EXISTS has_reserve BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS reserve_met BOOLEAN DEFAULT true;

-- ============================================================
-- 8. USER_CREDITS - ADD SUMMARY COLUMNS
-- ============================================================

ALTER TABLE public.user_credits
  ADD COLUMN IF NOT EXISTS total_purchased INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_used INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_bonus INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_expired INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_transaction_at TIMESTAMPTZ;

-- ============================================================
-- 9. TRANSACTIONS - ADD HELPER FIELDS
-- ============================================================

ALTER TABLE public.transactions
  ADD COLUMN IF NOT EXISTS balance_before NUMERIC(15,2),
  ADD COLUMN IF NOT EXISTS balance_after NUMERIC(15,2),
  ADD COLUMN IF NOT EXISTS is_reversed BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS reversed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS reversed_by UUID;

-- ============================================================
-- 10. ORDERS - ADD SUMMARY COLUMNS
-- ============================================================

ALTER TABLE public.umkm_orders
  ADD COLUMN IF NOT EXISTS item_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS product_names TEXT,
  ADD COLUMN IF NOT EXISTS seller_name TEXT,
  ADD COLUMN IF NOT EXISTS buyer_name TEXT,
  ADD COLUMN IF NOT EXISTS shipping_tracking_number TEXT,
  ADD COLUMN IF NOT EXISTS shipping_carrier TEXT,
  ADD COLUMN IF NOT EXISTS estimated_delivery TIMESTAMPTZ;

-- ============================================================
-- 11. BANNERS - ADD PERFORMANCE COLUMNS
-- ============================================================

ALTER TABLE public.banners
  ADD COLUMN IF NOT EXISTS ctr NUMERIC(8,4) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS cpc_actual NUMERIC(10,2),
  ADD COLUMN IF NOT EXISTS cpm_actual NUMERIC(10,2),
  ADD COLUMN IF NOT EXISTS days_running INTEGER DEFAULT 0;

-- ============================================================
-- 12. SUPPORT_TICKETS - ADD SUMMARY COLUMNS
-- ============================================================

ALTER TABLE public.support_tickets
  ADD COLUMN IF NOT EXISTS reply_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_reply_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS last_reply_by UUID,
  ADD COLUMN IF NOT EXISTS first_response_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS resolution_time_hours INTEGER;

-- ============================================================
-- FUNCTIONS TO UPDATE DENORMALIZED DATA
-- ============================================================

-- Function to update listing statistics
CREATE OR REPLACE FUNCTION public.update_listing_stats(p_listing_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_image_count INTEGER;
  v_primary_image TEXT;
  v_bid_count INTEGER;
  v_current_bid NUMERIC;
  v_is_auction BOOLEAN;
  v_is_boosted BOOLEAN;
  v_boost_types TEXT[];
BEGIN
  -- Get image count and primary image
  SELECT 
    COUNT(*),
    MAX(CASE WHEN is_primary THEN image_url END)
  INTO v_image_count, v_primary_image
  FROM public.listing_images
  WHERE listing_id = p_listing_id;

  -- Get auction info
  SELECT 
    EXISTS(SELECT 1 FROM public.listing_auctions WHERE listing_id = p_listing_id),
    (SELECT COUNT(*) FROM public.auction_bids ab 
     JOIN public.listing_auctions la ON la.id = ab.auction_id 
     WHERE la.listing_id = p_listing_id),
    (SELECT current_price FROM public.listing_auctions WHERE listing_id = p_listing_id)
  INTO v_is_auction, v_bid_count, v_current_bid;

  -- Get boost info
  SELECT 
    EXISTS(SELECT 1 FROM public.listing_boosts WHERE listing_id = p_listing_id AND status = 'active'),
    ARRAY_AGG(DISTINCT boost_type::TEXT)
  INTO v_is_boosted, v_boost_types
  FROM public.listing_boosts
  WHERE listing_id = p_listing_id AND status = 'active';

  v_boost_types := COALESCE(v_boost_types, '{}');

  -- Update listing
  UPDATE public.listings
  SET 
    image_count = v_image_count,
    primary_image_url = v_primary_image,
    bid_count = COALESCE(v_bid_count, 0),
    current_bid_amount = v_current_bid,
    is_auction = v_is_auction,
    is_boosted = v_is_boosted,
    active_boost_types = v_boost_types,
    days_listed = EXTRACT(DAY FROM now() - created_at)
  WHERE id = p_listing_id;
END;
$$;

-- Function to update profile statistics
CREATE OR REPLACE FUNCTION public.update_profile_stats(p_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_total_listings INTEGER;
  v_active_listings INTEGER;
  v_sold_count INTEGER;
  v_total_sales NUMERIC;
  v_avg_rating NUMERIC;
  v_total_reviews INTEGER;
BEGIN
  -- Get listing counts
  SELECT 
    COUNT(*),
    COUNT(*) FILTER (WHERE status = 'active'),
    COUNT(*) FILTER (WHERE status = 'sold')
  INTO v_total_listings, v_active_listings, v_sold_count
  FROM public.listings
  WHERE user_id = p_user_id AND deleted_at IS NULL;

  -- Get sales totals (from orders where seller)
  SELECT COALESCE(SUM(total_amount), 0)
  INTO v_total_sales
  FROM public.orders
  WHERE seller_id = p_user_id AND status = 'completed';

  -- Get rating
  SELECT 
    COALESCE(AVG(rating), 0),
    COUNT(*)
  INTO v_avg_rating, v_total_reviews
  FROM public.seller_reviews
  WHERE seller_id = p_user_id;

  -- Update profile
  UPDATE public.profiles
  SET 
    total_listings = v_total_listings,
    active_listings = v_active_listings,
    sold_count = v_sold_count,
    total_sales = v_total_sales,
    average_rating = ROUND(v_avg_rating::NUMERIC, 2),
    total_reviews = v_total_reviews,
    last_active_at = now()
  WHERE user_id = p_user_id;
END;
$$;

-- Function to update UMKM statistics
CREATE OR REPLACE FUNCTION public.update_umkm_stats(p_umkm_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_total_products INTEGER;
  v_active_products INTEGER;
  v_total_orders INTEGER;
  v_completed_orders INTEGER;
  v_total_revenue NUMERIC;
  v_avg_rating NUMERIC;
  v_total_reviews INTEGER;
BEGIN
  -- Get product counts
  SELECT 
    COUNT(*),
    COUNT(*) FILTER (WHERE status = 'active')
  INTO v_total_products, v_active_products
  FROM public.products
  WHERE umkm_id = p_umkm_id;

  -- Get order counts
  SELECT 
    COUNT(*),
    COUNT(*) FILTER (WHERE status = 'completed'),
    COALESCE(SUM(total_amount) FILTER (WHERE status = 'completed'), 0)
  INTO v_total_orders, v_completed_orders, v_total_revenue
  FROM public.umkm_orders
  WHERE umkm_id = p_umkm_id;

  -- Get rating
  SELECT 
    COALESCE(AVG(rating), 0),
    COUNT(*)
  INTO v_avg_rating, v_total_reviews
  FROM public.umkm_reviews
  WHERE umkm_id = p_umkm_id;

  -- Update UMKM
  UPDATE public.umkm_profiles
  SET 
    total_products = v_total_products,
    active_products = v_active_products,
    total_orders = v_total_orders,
    completed_orders = v_completed_orders,
    total_revenue = v_total_revenue,
    average_rating = ROUND(v_avg_rating::NUMERIC, 2),
    total_reviews = v_total_reviews
  WHERE id = p_umkm_id;
END;
$$;

-- Function to update category statistics
CREATE OR REPLACE FUNCTION public.update_category_stats(p_category_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_listing_count INTEGER;
  v_active_listing_count INTEGER;
  v_umkm_count INTEGER;
  v_product_count INTEGER;
BEGIN
  -- Get listing counts
  SELECT 
    COUNT(*),
    COUNT(*) FILTER (WHERE status = 'active')
  INTO v_listing_count, v_active_listing_count
  FROM public.listings
  WHERE category_id = p_category_id AND deleted_at IS NULL;

  -- Get UMKM count
  SELECT COUNT(DISTINCT umkm_id)
  INTO v_umkm_count
  FROM public.umkm_profiles
  WHERE category_id = p_category_id AND status = 'active';

  -- Get product count
  SELECT COUNT(*)
  INTO v_product_count
  FROM public.products p
  JOIN public.umkm_profiles u ON u.id = p.umkm_id
  WHERE p.category_id = p_category_id AND p.status = 'active' AND u.status = 'active';

  -- Update category
  UPDATE public.categories
  SET 
    listing_count = v_listing_count,
    active_listing_count = v_active_listing_count,
    umkm_count = v_umkm_count,
    product_count = v_product_count
  WHERE id = p_category_id;
END;
$$;

-- Function to update conversation statistics
CREATE OR REPLACE FUNCTION public.update_conversation_stats(p_conversation_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_last_content TEXT;
  v_last_sender UUID;
  v_message_count INTEGER;
  v_unread_buyer INTEGER;
  v_unread_seller INTEGER;
  v_buyer_id UUID;
  v_seller_id UUID;
BEGIN
  -- Get conversation participants
  SELECT buyer_id, seller_id
  INTO v_buyer_id, v_seller_id
  FROM public.conversations
  WHERE id = p_conversation_id;

  -- Get message stats
  SELECT 
    content,
    sender_id,
    COUNT(*)
  INTO v_last_content, v_last_sender, v_message_count
  FROM public.messages
  WHERE conversation_id = p_conversation_id
  ORDER BY created_at DESC
  LIMIT 1;

  -- Get unread counts
  SELECT COUNT(*) INTO v_unread_buyer
  FROM public.messages
  WHERE conversation_id = p_conversation_id
    AND sender_id != v_buyer_id
    AND is_read = false;

  SELECT COUNT(*) INTO v_unread_seller
  FROM public.messages
  WHERE conversation_id = p_conversation_id
    AND sender_id != v_seller_id
    AND is_read = false;

  -- Update conversation
  UPDATE public.conversations
  SET 
    last_message_content = v_last_content,
    last_sender_id = v_last_sender,
    message_count = v_message_count,
    unread_count_buyer = v_unread_buyer,
    unread_count_seller = v_unread_seller,
    last_message_at = now()
  WHERE id = p_conversation_id;
END;
$$;

-- ============================================================
-- TRIGGERS FOR AUTO-UPDATING DENORMALIZED DATA
-- ============================================================

-- Trigger to update listing stats after image change
CREATE OR REPLACE FUNCTION public.trigger_update_listing_image_stats()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'DELETE' OR TG_OP = 'UPDATE' THEN
    PERFORM public.update_listing_stats(
      COALESCE(NEW.listing_id, OLD.listing_id)
    );
  END IF;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trigger_listing_images_stats ON public.listing_images;
CREATE TRIGGER trigger_listing_images_stats
  AFTER INSERT OR UPDATE OR DELETE ON public.listing_images
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_update_listing_image_stats();

-- Trigger to update auction stats after bid
CREATE OR REPLACE FUNCTION public.trigger_update_auction_stats()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Update listing stats
  PERFORM public.update_listing_stats(
    (SELECT listing_id FROM public.listing_auctions WHERE id = COALESCE(NEW.auction_id, OLD.auction_id))
  );
  
  -- Update auction bid counts
  UPDATE public.listing_auctions
  SET 
    total_bids = (SELECT COUNT(*) FROM public.auction_bids WHERE auction_id = NEW.auction_id),
    unique_bidders = (SELECT COUNT(DISTINCT bidder_id) FROM public.auction_bids WHERE auction_id = NEW.auction_id)
  WHERE id = NEW.auction_id;
  
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trigger_auction_bids_stats ON public.auction_bids;
CREATE TRIGGER trigger_auction_bids_stats
  AFTER INSERT OR UPDATE OR DELETE ON public.auction_bids
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_update_auction_stats();

-- Trigger to update conversation stats after message
CREATE OR REPLACE FUNCTION public.trigger_update_conversation_message_stats()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  PERFORM public.update_conversation_stats(
    COALESCE(NEW.conversation_id, OLD.conversation_id)
  );
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trigger_messages_conversation_stats ON public.messages;
CREATE TRIGGER trigger_messages_conversation_stats
  AFTER INSERT OR UPDATE OR DELETE ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_update_conversation_message_stats();

-- ============================================================
-- MATERIALIZED VIEWS FOR REPORTING
-- ============================================================

-- Materialized view for dashboard statistics
CREATE MATERIALIZED VIEW IF NOT EXISTS public.dashboard_stats AS
SELECT
  (SELECT COUNT(*) FROM public.listings WHERE status = 'active' AND deleted_at IS NULL) as active_listings,
  (SELECT COUNT(*) FROM public.listings WHERE status = 'sold' AND deleted_at IS NULL) as sold_listings,
  (SELECT COUNT(*) FROM public.umkm_profiles WHERE status = 'active') as active_umkm,
  (SELECT COUNT(*) FROM public.products WHERE status = 'active') as active_products,
  (SELECT COALESCE(SUM(total_amount), 0) FROM public.umkm_orders WHERE status = 'completed') as total_revenue,
  (SELECT COUNT(*) FROM public.listing_auctions WHERE status = 'active') as active_auctions,
  (SELECT COUNT(*) FROM public.users WHERE is_active = true) as active_users,
  (SELECT COALESCE(SUM(balance), 0) FROM public.user_credits) as total_credits_in_system;

CREATE UNIQUE INDEX IF NOT EXISTS idx_dashboard_stats ON public.dashboard_stats (active_listings);

-- Refresh function for materialized view
CREATE OR REPLACE FUNCTION public.refresh_dashboard_stats()
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.dashboard_stats;
END;
$$;

-- Materialized view for category performance
CREATE MATERIALIZED VIEW IF NOT EXISTS public.category_performance AS
SELECT
  c.id as category_id,
  c.name as category_name,
  c.slug,
  COUNT(DISTINCT l.id) as total_listings,
  COUNT(DISTINCT l.id) FILTER (WHERE l.status = 'active') as active_listings,
  COUNT(DISTINCT l.user_id) as unique_sellers,
  COALESCE(AVG(l.price), 0) as avg_price,
  COALESCE(SUM(l.view_count), 0) as total_views,
  COALESCE(SUM(l.inquiry_count), 0) as total_inquiries
FROM public.categories c
LEFT JOIN public.listings l ON l.category_id = c.id AND l.deleted_at IS NULL
WHERE c.is_active = true
GROUP BY c.id, c.name, c.slug;

CREATE UNIQUE INDEX IF NOT EXISTS idx_category_performance ON public.category_performance (category_id);

-- ============================================================
-- INITIAL POPULATION OF SUMMARY COLUMNS
-- ============================================================

-- Update all listings stats
INSERT INTO public.listing_stats_audit (listing_id, updated_at)
SELECT id, now() FROM public.listings WHERE deleted_at IS NULL
ON CONFLICT DO NOTHING;

-- Populate listing stats (batch update)
DO $$
DECLARE
  rec RECORD;
BEGIN
  FOR rec IN SELECT id FROM public.listings WHERE deleted_at IS NULL LIMIT 1000 LOOP
    PERFORM public.update_listing_stats(rec.id);
  END LOOP;
END $$;

-- Populate profile stats
DO $$
DECLARE
  rec RECORD;
BEGIN
  FOR rec IN SELECT user_id FROM public.profiles LIMIT 1000 LOOP
    PERFORM public.update_profile_stats(rec.user_id);
  END LOOP;
END $$;

-- Populate category stats
DO $$
DECLARE
  rec RECORD;
BEGIN
  FOR rec IN SELECT id FROM public.categories WHERE is_active = true LOOP
    PERFORM public.update_category_stats(rec.id);
  END LOOP;
END $$;
