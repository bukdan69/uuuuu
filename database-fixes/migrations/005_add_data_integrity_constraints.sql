-- ============================================================
-- MIGRATION: Data Integrity & Constraints
-- Deskripsi: Menambahkan constraints untuk menjaga integritas
-- data dan mencegah data tidak valid
-- ============================================================

-- ============================================================
-- 1. CHECK CONSTRAINTS FOR LISTINGS
-- ============================================================

-- Ensure price is non-negative
ALTER TABLE public.listings
  DROP CONSTRAINT IF EXISTS chk_listings_price_positive,
  ADD CONSTRAINT chk_listings_price_positive 
    CHECK (price >= 0);

-- Ensure view counts are non-negative
ALTER TABLE public.listings
  DROP CONSTRAINT IF EXISTS chk_listings_counts_positive,
  ADD CONSTRAINT chk_listings_counts_positive 
    CHECK (
      view_count >= 0 AND 
      click_count >= 0 AND 
      share_count >= 0 AND 
      favorite_count >= 0 AND 
      inquiry_count >= 0
    );

-- Ensure valid price type for auction
ALTER TABLE public.listings
  DROP CONSTRAINT IF EXISTS chk_listings_auction_price,
  ADD CONSTRAINT chk_listings_auction_price 
    CHECK (
      (price_type = 'auction' AND EXISTS (
        SELECT 1 FROM public.listing_auctions la WHERE la.listing_id = listings.id
      )) OR price_type != 'auction'
    );

-- Ensure slug format
ALTER TABLE public.listings
  DROP CONSTRAINT IF EXISTS chk_listings_slug_format,
  ADD CONSTRAINT chk_listings_slug_format 
    CHECK (slug IS NULL OR slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$');

-- Ensure coordinates are valid
ALTER TABLE public.listings
  DROP CONSTRAINT IF EXISTS chk_listings_coordinates,
  ADD CONSTRAINT chk_listings_coordinates 
    CHECK (
      (location_lat IS NULL AND location_lng IS NULL) OR
      (location_lat IS NOT NULL AND location_lng IS NOT NULL AND
       location_lat >= -90 AND location_lat <= 90 AND
       location_lng >= -180 AND location_lng <= 180)
    );

-- ============================================================
-- 2. CHECK CONSTRAINTS FOR AUCTIONS
-- ============================================================

ALTER TABLE public.listing_auctions
  DROP CONSTRAINT IF EXISTS chk_auction_prices,
  ADD CONSTRAINT chk_auction_prices 
    CHECK (
      starting_price >= 0 AND 
      current_price >= starting_price AND
      min_increment > 0
    );

ALTER TABLE public.auction_bids
  DROP CONSTRAINT IF EXISTS chk_bid_amount_positive,
  ADD CONSTRAINT chk_bid_amount_positive 
    CHECK (amount > 0);

-- Ensure only one winning bid per auction
ALTER TABLE public.auction_bids
  DROP CONSTRAINT IF EXISTS chk_one_winning_bid,
  ADD CONSTRAINT chk_one_winning_bid 
    CHECK (
      is_winning = false OR 
      NOT EXISTS (
        SELECT 1 FROM public.auction_bids ab2 
        WHERE ab2.auction_id = auction_bids.auction_id 
        AND ab2.is_winning = true 
        AND ab2.id != auction_bids.id
      )
    );

-- ============================================================
-- 3. CHECK CONSTRAINTS FOR WALLET & TRANSACTIONS
-- ============================================================

ALTER TABLE public.wallets
  DROP CONSTRAINT IF EXISTS chk_wallet_balance_positive,
  ADD CONSTRAINT chk_wallet_balance_positive 
    CHECK (balance >= 0);

ALTER TABLE public.transactions
  DROP CONSTRAINT IF EXISTS chk_transaction_amount_positive,
  ADD CONSTRAINT chk_transaction_amount_positive 
    CHECK (amount > 0);

ALTER TABLE public.withdrawals
  DROP CONSTRAINT IF EXISTS chk_withdrawal_amount_positive,
  ADD CONSTRAINT chk_withdrawal_amount_positive 
    CHECK (amount > 0);

-- ============================================================
-- 4. CHECK CONSTRAINTS FOR CREDITS
-- ============================================================

ALTER TABLE public.user_credits
  DROP CONSTRAINT IF EXISTS chk_credits_balance_positive,
  ADD CONSTRAINT chk_credits_balance_positive 
    CHECK (balance >= 0);

ALTER TABLE public.credit_transactions
  DROP CONSTRAINT IF EXISTS chk_credit_amount_positive,
  ADD CONSTRAINT chk_credit_amount_positive 
    CHECK (amount > 0);

ALTER TABLE public.credit_packages
  DROP CONSTRAINT IF EXISTS chk_credit_package_valid,
  ADD CONSTRAINT chk_credit_package_valid 
    CHECK (credits > 0 AND price > 0 AND bonus_credits >= 0);

ALTER TABLE public.credit_topup_requests
  DROP CONSTRAINT IF EXISTS chk_topup_request_valid,
  ADD CONSTRAINT chk_topup_request_valid 
    CHECK (amount > 0 AND credits_amount > 0 AND bonus_credits >= 0);

-- ============================================================
-- 5. CHECK CONSTRAINTS FOR REVIEWS
-- ============================================================

ALTER TABLE public.seller_reviews
  DROP CONSTRAINT IF EXISTS chk_review_rating_range,
  ADD CONSTRAINT chk_review_rating_range 
    CHECK (rating >= 1 AND rating <= 5);

ALTER TABLE public.product_reviews
  DROP CONSTRAINT IF EXISTS chk_product_review_rating_range,
  ADD CONSTRAINT chk_product_review_rating_range 
    CHECK (rating >= 1 AND rating <= 5);

ALTER TABLE public.umkm_reviews
  DROP CONSTRAINT IF EXISTS chk_umkm_review_rating_range,
  ADD CONSTRAINT chk_umkm_review_rating_range 
    CHECK (rating >= 1 AND rating <= 5);

ALTER TABLE public.testimonials
  DROP CONSTRAINT IF EXISTS chk_testimonial_rating_range,
  ADD CONSTRAINT chk_testimonial_rating_range 
    CHECK (rating >= 1 AND rating <= 5);

-- ============================================================
-- 6. CHECK CONSTRAINTS FOR PRODUCTS
-- ============================================================

ALTER TABLE public.products
  DROP CONSTRAINT IF EXISTS chk_product_price_positive,
  ADD CONSTRAINT chk_product_price_positive 
    CHECK (price IS NULL OR price >= 0);

ALTER TABLE public.products
  DROP CONSTRAINT IF EXISTS chk_product_stock_positive,
  ADD CONSTRAINT chk_product_stock_positive 
    CHECK (stock >= 0);

ALTER TABLE public.cart_items
  DROP CONSTRAINT IF EXISTS chk_cart_item_quantity,
  ADD CONSTRAINT chk_cart_item_quantity 
    CHECK (quantity > 0 AND price >= 0);

-- ============================================================
-- 7. CHECK CONSTRAINTS FOR ORDERS
-- ============================================================

ALTER TABLE public.umkm_orders
  DROP CONSTRAINT IF EXISTS chk_order_amounts,
  ADD CONSTRAINT chk_order_amounts 
    CHECK (
      subtotal >= 0 AND 
      shipping_fee >= 0 AND 
      total_amount >= 0
    );

ALTER TABLE public.umkm_order_items
  DROP CONSTRAINT IF EXISTS chk_order_item_valid,
  ADD CONSTRAINT chk_order_item_valid 
    CHECK (
      price >= 0 AND 
      quantity > 0 AND 
      total >= 0
    );

-- ============================================================
-- 8. CHECK CONSTRAINTS FOR BANNERS
-- ============================================================

ALTER TABLE public.banners
  DROP CONSTRAINT IF EXISTS chk_banner_budget,
  ADD CONSTRAINT chk_banner_budget 
    CHECK (budget_total >= 0 AND budget_spent >= 0 AND budget_spent <= budget_total);

ALTER TABLE public.banners
  DROP CONSTRAINT IF EXISTS chk_banner_costs,
  ADD CONSTRAINT chk_banner_costs 
    CHECK (cost_per_click >= 0 AND cost_per_mille >= 0);

ALTER TABLE public.banners
  DROP CONSTRAINT IF EXISTS chk_banner_dates,
  ADD CONSTRAINT chk_banner_dates 
    CHECK (ends_at IS NULL OR ends_at > starts_at);

-- ============================================================
-- 9. CHECK CONSTRAINTS FOR KYC
-- ============================================================

-- KTP number format (16 digits)
ALTER TABLE public.kyc_verifications
  DROP CONSTRAINT IF EXISTS chk_ktp_number_format,
  ADD CONSTRAINT chk_ktp_number_format 
    CHECK (ktp_number IS NULL OR ktp_number ~ '^\d{16}$');

-- NPWP format (16 digits)
ALTER TABLE public.kyc_documents
  DROP CONSTRAINT IF EXISTS chk_npwp_format,
  ADD CONSTRAINT chk_npwp_format 
    CHECK (npwp_number IS NULL OR npwp_number ~ '^\d{15}$' OR npwp_number ~ '^\d{2}\.\d{3}\.\d{3}\.\d{1}\-\d{3}\.\d{3}$');

-- Phone number format
ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS chk_phone_format,
  ADD CONSTRAINT chk_phone_format 
    CHECK (phone_number IS NULL OR phone_number ~ '^\+?[0-9]{10,15}$');

-- ============================================================
-- 10. CHECK CONSTRAINTS FOR COUPONS
-- ============================================================

ALTER TABLE public.coupons
  DROP CONSTRAINT IF EXISTS chk_coupon_valid,
  ADD CONSTRAINT chk_coupon_valid 
    CHECK (
      credits_amount > 0 AND 
      max_uses > 0 AND 
      used_count >= 0 AND 
      used_count <= max_uses
    );

-- ============================================================
-- 11. CHECK CONSTRAINTS FOR OTP
-- ============================================================

ALTER TABLE public.otp_codes
  DROP CONSTRAINT IF EXISTS chk_otp_valid,
  ADD CONSTRAINT chk_otp_valid 
    CHECK (
      code ~ '^\d{4,6}$' AND
      expires_at > created_at
    );

-- ============================================================
-- 12. CHECK CONSTRAINTS FOR OTP
-- ============================================================

ALTER TABLE public.support_tickets
  DROP CONSTRAINT IF EXISTS chk_ticket_resolved,
  ADD CONSTRAINT chk_ticket_resolved 
    CHECK (
      (status NOT IN ('resolved', 'closed')) OR 
      (resolved_at IS NOT NULL)
    );

-- ============================================================
-- 13. UNIQUE CONSTRAINTS
-- ============================================================

-- Prevent duplicate slugs per category level
ALTER TABLE public.categories
  DROP CONSTRAINT IF EXISTS uq_categories_slug,
  ADD CONSTRAINT uq_categories_slug UNIQUE (slug);

-- Ensure one conversation per buyer-seller-listing
ALTER TABLE public.conversations
  DROP CONSTRAINT IF EXISTS uq_conversation_participants,
  ADD CONSTRAINT uq_conversation_participants UNIQUE (listing_id, buyer_id, seller_id);

-- Ensure one review per order per reviewer
ALTER TABLE public.seller_reviews
  DROP CONSTRAINT IF EXISTS uq_seller_review_order,
  ADD CONSTRAINT uq_seller_review_order UNIQUE (order_id, reviewer_id);

-- Ensure one KYC per user
ALTER TABLE public.kyc_verifications
  DROP CONSTRAINT IF EXISTS uq_kyc_user,
  ADD CONSTRAINT uq_kyc_user UNIQUE (user_id);

-- Ensure one wallet per user
ALTER TABLE public.wallets
  DROP CONSTRAINT IF EXISTS uq_wallet_user,
  ADD CONSTRAINT uq_wallet_user UNIQUE (user_id);

-- Ensure one credit balance per user
ALTER TABLE public.user_credits
  DROP CONSTRAINT IF EXISTS uq_user_credits_user,
  ADD CONSTRAINT uq_user_credits_user UNIQUE (user_id);

-- Ensure one UMKM profile per owner
ALTER TABLE public.umkm_profiles
  DROP CONSTRAINT IF EXISTS uq_umkm_owner,
  ADD CONSTRAINT uq_umkm_owner UNIQUE (owner_id);

-- Ensure unique listing slug
ALTER TABLE public.listings
  DROP CONSTRAINT IF EXISTS uq_listings_slug,
  ADD CONSTRAINT uq_listings_slug UNIQUE (slug);

-- ============================================================
-- 14. EXCLUSION CONSTRAINTS
-- ============================================================

-- Prevent overlapping boosts for same listing
ALTER TABLE public.listing_boosts
  DROP CONSTRAINT IF EXISTS excl_listing_boosts_overlap,
  ADD CONSTRAINT excl_listing_boosts_overlap 
    EXCLUDE USING GIST (
      listing_id WITH =,
      boost_type WITH =,
      tsrange(starts_at, ends_at) WITH &&
    )
    WHERE (status = 'active');

-- ============================================================
-- 15. TRIGGER FUNCTIONS FOR DATA VALIDATION
-- ============================================================

-- Validate listing before insert/update
CREATE OR REPLACE FUNCTION public.validate_listing()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Ensure title is not empty
  IF LENGTH(TRIM(NEW.title)) < 3 THEN
    RAISE EXCEPTION 'Listing title must be at least 3 characters';
  END IF;
  
  -- Ensure description is not empty for active listings
  IF NEW.status = 'active' AND LENGTH(TRIM(COALESCE(NEW.description, ''))) < 10 THEN
    RAISE EXCEPTION 'Listing description must be at least 10 characters for active listings';
  END IF;
  
  -- Auto-generate slug if not provided
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := LOWER(REGEXP_REPLACE(NEW.title, '[^a-zA-Z0-9]+', '-', 'g'));
    NEW.slug := TRIM(BOTH '-' FROM NEW.slug);
  END IF;
  
  -- Set published_at when status changes to active
  IF NEW.status = 'active' AND OLD.status != 'active' THEN
    NEW.published_at := now();
  END IF;
  
  -- Set expires_at if not set for active listings
  IF NEW.status = 'active' AND NEW.expires_at IS NULL THEN
    NEW.expires_at := now() + INTERVAL '30 days';
  END IF;
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_validate_listing ON public.listings;
CREATE TRIGGER trigger_validate_listing
  BEFORE INSERT OR UPDATE ON public.listings
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_listing();

-- Validate auction before insert/update
CREATE OR REPLACE FUNCTION public.validate_auction()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Ensure ends_at is in the future
  IF NEW.ends_at <= now() THEN
    RAISE EXCEPTION 'Auction end time must be in the future';
  END IF;
  
  -- Ensure buy_now_price is higher than starting_price if set
  IF NEW.buy_now_price IS NOT NULL AND NEW.buy_now_price <= NEW.starting_price THEN
    RAISE EXCEPTION 'Buy now price must be higher than starting price';
  END IF;
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_validate_auction ON public.listing_auctions;
CREATE TRIGGER trigger_validate_auction
  BEFORE INSERT OR UPDATE ON public.listing_auctions
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_auction();

-- Validate bid before insert
CREATE OR REPLACE FUNCTION public.validate_bid()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_auction public.listing_auctions;
BEGIN
  -- Get auction details
  SELECT * INTO v_auction 
  FROM public.listing_auctions 
  WHERE id = NEW.auction_id;
  
  -- Check if auction is active
  IF v_auction.status != 'active' THEN
    RAISE EXCEPTION 'Cannot bid on inactive auction';
  END IF;
  
  -- Check if auction hasn't ended
  IF v_auction.ends_at <= now() THEN
    RAISE EXCEPTION 'Auction has ended';
  END IF;
  
  -- Check if bid is higher than current price
  IF NEW.amount <= v_auction.current_price THEN
    RAISE EXCEPTION 'Bid must be higher than current price (%)', v_auction.current_price;
  END IF;
  
  -- Check if bid meets minimum increment
  IF NEW.amount < v_auction.current_price + v_auction.min_increment THEN
    RAISE EXCEPTION 'Bid must be at least % higher than current price', v_auction.min_increment;
  END IF;
  
  -- Check if seller is not bidding on their own auction
  IF NEW.bidder_id = (SELECT user_id FROM public.listings WHERE id = v_auction.listing_id) THEN
    RAISE EXCEPTION 'Seller cannot bid on their own auction';
  END IF;
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_validate_bid ON public.auction_bids;
CREATE TRIGGER trigger_validate_bid
  BEFORE INSERT ON public.auction_bids
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_bid();

-- Validate withdrawal before insert
CREATE OR REPLACE FUNCTION public.validate_withdrawal()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_wallet public.wallets;
  v_pending_withdrawals NUMERIC;
BEGIN
  -- Get wallet
  SELECT * INTO v_wallet FROM public.wallets WHERE user_id = NEW.user_id;
  
  -- Check if wallet is active
  IF v_wallet.status != 'active' THEN
    RAISE EXCEPTION 'Wallet is not active';
  END IF;
  
  -- Get pending withdrawals
  SELECT COALESCE(SUM(amount), 0) INTO v_pending_withdrawals
  FROM public.withdrawals
  WHERE user_id = NEW.user_id AND status IN ('pending', 'approved');
  
  -- Check if sufficient balance
  IF v_wallet.balance < (NEW.amount + v_pending_withdrawals) THEN
    RAISE EXCEPTION 'Insufficient balance (available: %, pending: %)', 
      v_wallet.balance, v_pending_withdrawals;
  END IF;
  
  -- Minimum withdrawal amount
  IF NEW.amount < 10000 THEN
    RAISE EXCEPTION 'Minimum withdrawal amount is Rp 10,000';
  END IF;
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_validate_withdrawal ON public.withdrawals;
CREATE TRIGGER trigger_validate_withdrawal
  BEFORE INSERT ON public.withdrawals
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_withdrawal();

-- ============================================================
-- 16. DEFERRED CONSTRAINTS FOR COMPLEX OPERATIONS
-- ============================================================

-- Make some constraints deferrable for batch operations
ALTER TABLE public.listings
  DROP CONSTRAINT IF EXISTS fk_listings_category,
  ADD CONSTRAINT fk_listings_category 
    FOREIGN KEY (category_id) REFERENCES public.categories(id)
    ON DELETE RESTRICT
    DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE public.listing_auctions
  DROP CONSTRAINT IF EXISTS fk_listing_auctions_listing,
  ADD CONSTRAINT fk_listing_auctions_listing 
    FOREIGN KEY (listing_id) REFERENCES public.listings(id)
    ON DELETE CASCADE
    DEFERRABLE INITIALLY IMMEDIATE;

-- ============================================================
-- 17. PARTIAL UNIQUE INDEXES
-- ============================================================

-- Ensure only one primary image per listing
CREATE UNIQUE INDEX IF NOT EXISTS uq_listing_primary_image 
  ON public.listing_images(listing_id) 
  WHERE is_primary = true;

-- Ensure only one active subscription per UMKM
CREATE UNIQUE INDEX IF NOT EXISTS uq_umkm_active_subscription 
  ON public.umkm_subscriptions(umkm_id) 
  WHERE status = 'active';

-- ============================================================
-- 18. CLEANUP FUNCTIONS
-- ============================================================

-- Function to clean up expired data
CREATE OR REPLACE FUNCTION public.cleanup_expired_data()
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
  -- Expire ended auctions
  UPDATE public.listing_auctions
  SET status = 'ended'
  WHERE status = 'active' AND ends_at <= now();
  
  -- Expire ended boosts
  UPDATE public.listing_boosts
  SET status = 'expired'
  WHERE status = 'active' AND ends_at <= now();
  
  -- Expire old OTP codes
  UPDATE public.otp_codes
  SET is_used = true
  WHERE is_used = false AND expires_at <= now();
  
  -- Deactivate expired coupons
  UPDATE public.coupons
  SET is_active = false
  WHERE is_active = true AND expires_at <= now();
  
  -- Mark expired listings
  UPDATE public.listings
  SET status = 'expired'
  WHERE status = 'active' AND expires_at <= now();
  
  -- Expire ended banners
  UPDATE public.banners
  SET status = 'expired'
  WHERE status = 'active' AND ends_at <= now();
END;
$$;

-- Schedule cleanup (would be run via pg_cron or external scheduler)
-- SELECT cron.schedule('cleanup-expired', '*/5 * * * *', 'SELECT public.cleanup_expired_data()');
