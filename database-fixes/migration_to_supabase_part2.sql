-- ============================================================
-- MIGRATION TO SUPABASE - PART 2
-- RLS Policies, Indexes, Triggers, and Seed Data
-- ============================================================

-- ============================================================
-- STEP 22: RLS POLICIES - USER MANAGEMENT
-- ============================================================

-- Profiles
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can view all profiles" ON public.profiles
    FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update all profiles" ON public.profiles
    FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

-- User Roles
CREATE POLICY "Users can view own roles" ON public.user_roles
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage roles" ON public.user_roles
    FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- KYC Verifications
CREATE POLICY "Users can view own KYC" ON public.kyc_verifications
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own KYC" ON public.kyc_verifications
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own KYC" ON public.kyc_verifications
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage KYC" ON public.kyc_verifications
    FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- KYC Documents
CREATE POLICY "Users can view own KYC documents" ON public.kyc_documents
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.kyc_verifications kv WHERE kv.id = kyc_documents.kyc_verification_id AND kv.user_id = auth.uid())
    );
CREATE POLICY "Users can insert own KYC documents" ON public.kyc_documents
    FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM public.kyc_verifications kv WHERE kv.id = kyc_documents.kyc_verification_id AND kv.user_id = auth.uid())
    );
CREATE POLICY "Admins can manage KYC documents" ON public.kyc_documents
    FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- ============================================================
-- STEP 23: RLS POLICIES - WALLET & TRANSACTIONS
-- ============================================================

-- Wallets
CREATE POLICY "Users can view own wallet" ON public.wallets
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all wallets" ON public.wallets
    FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- Transactions
CREATE POLICY "Users can view own transactions" ON public.transactions
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all transactions" ON public.transactions
    FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- Withdrawals
CREATE POLICY "Users can view own withdrawals" ON public.withdrawals
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can request withdrawal" ON public.withdrawals
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can manage withdrawals" ON public.withdrawals
    FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- ============================================================
-- STEP 24: RLS POLICIES - CREDIT SYSTEM
-- ============================================================

-- User Credits
CREATE POLICY "Users can view own credits" ON public.user_credits
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all credits" ON public.user_credits
    FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- Credit Transactions
CREATE POLICY "Users can view own credit transactions" ON public.credit_transactions
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all credit transactions" ON public.credit_transactions
    FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- Credit Packages
CREATE POLICY "Anyone can view active credit packages" ON public.credit_packages
    FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage credit packages" ON public.credit_packages
    FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Credit Topup Requests
CREATE POLICY "Users can view own topup requests" ON public.credit_topup_requests
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create topup requests" ON public.credit_topup_requests
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own pending requests" ON public.credit_topup_requests
    FOR UPDATE USING (auth.uid() = user_id AND status = 'pending');
CREATE POLICY "Admins can manage topup requests" ON public.credit_topup_requests
    FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Coupons
CREATE POLICY "Anyone can view active coupons" ON public.coupons
    FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage coupons" ON public.coupons
    FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Coupon Uses
CREATE POLICY "Users can view own coupon uses" ON public.coupon_uses
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage coupon uses" ON public.coupon_uses
    FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- ============================================================
-- STEP 25: RLS POLICIES - CATEGORIES
-- ============================================================

CREATE POLICY "Anyone can view active categories" ON public.categories
    FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage categories" ON public.categories
    FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- ============================================================
-- STEP 26: RLS POLICIES - LISTINGS
-- ============================================================

-- Listings
CREATE POLICY "Anyone can view active listings" ON public.listings
    FOR SELECT USING (status = 'active' AND deleted_at IS NULL);
CREATE POLICY "Users can view own listings" ON public.listings
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create listings" ON public.listings
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own listings" ON public.listings
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage all listings" ON public.listings
    FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Listing Images
CREATE POLICY "Anyone can view listing images" ON public.listing_images
    FOR SELECT USING (true);
CREATE POLICY "Users can manage own listing images" ON public.listing_images
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.listings WHERE id = listing_id AND user_id = auth.uid())
    );

-- Saved Listings
CREATE POLICY "Users can manage own saved listings" ON public.saved_listings
    FOR ALL USING (auth.uid() = user_id);

-- Listing Reports
CREATE POLICY "Users can create reports" ON public.listing_reports
    FOR INSERT WITH CHECK (auth.uid() = reporter_id);
CREATE POLICY "Users can view own reports" ON public.listing_reports
    FOR SELECT USING (auth.uid() = reporter_id);
CREATE POLICY "Admins can manage all reports" ON public.listing_reports
    FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- ============================================================
-- STEP 27: RLS POLICIES - AUCTIONS
-- ============================================================

-- Listing Auctions
CREATE POLICY "Anyone can view active auctions" ON public.listing_auctions
    FOR SELECT USING (status = 'active');
CREATE POLICY "Users can manage own auctions" ON public.listing_auctions
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.listings WHERE id = listing_id AND user_id = auth.uid())
    );
CREATE POLICY "Admins can manage all auctions" ON public.listing_auctions
    FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Auction Bids
CREATE POLICY "Anyone can view bids" ON public.auction_bids
    FOR SELECT USING (true);
CREATE POLICY "Users can place bids" ON public.auction_bids
    FOR INSERT WITH CHECK (auth.uid() = bidder_id);
CREATE POLICY "Admins can manage bids" ON public.auction_bids
    FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- ============================================================
-- STEP 28: RLS POLICIES - BOOSTS
-- ============================================================

-- Boost Types
CREATE POLICY "Anyone can view active boost types" ON public.boost_types
    FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage boost types" ON public.boost_types
    FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Listing Boosts
CREATE POLICY "Users can view own boosts" ON public.listing_boosts
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create boosts" ON public.listing_boosts
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can view all boosts" ON public.listing_boosts
    FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- ============================================================
-- STEP 29: RLS POLICIES - BANNERS
-- ============================================================

CREATE POLICY "Anyone can view active banners" ON public.banners
    FOR SELECT USING (status = 'active' AND deleted_at IS NULL);
CREATE POLICY "Users can view own banners" ON public.banners
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create banners" ON public.banners
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own banners" ON public.banners
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage all banners" ON public.banners
    FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Banner Events
CREATE POLICY "Anyone can insert banner events" ON public.banner_events
    FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can view banner events" ON public.banner_events
    FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- ============================================================
-- STEP 30: RLS POLICIES - UMKM
-- ============================================================

-- UMKM Profiles
CREATE POLICY "Anyone can view active UMKM" ON public.umkm_profiles
    FOR SELECT USING (status = 'active');
CREATE POLICY "Owners can view own UMKM" ON public.umkm_profiles
    FOR SELECT USING (auth.uid() = owner_id);
CREATE POLICY "Owners can insert own UMKM" ON public.umkm_profiles
    FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Owners can update own UMKM" ON public.umkm_profiles
    FOR UPDATE USING (auth.uid() = owner_id);
CREATE POLICY "Admins can manage all UMKM" ON public.umkm_profiles
    FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- UMKM Portfolios
CREATE POLICY "Anyone can view active portfolios" ON public.umkm_portfolios
    FOR SELECT USING (is_active = true);
CREATE POLICY "UMKM owners can manage portfolios" ON public.umkm_portfolios
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.umkm_profiles u WHERE u.id = umkm_portfolios.umkm_id AND u.owner_id = auth.uid())
    );

-- UMKM Reviews
CREATE POLICY "Anyone can view UMKM reviews" ON public.umkm_reviews
    FOR SELECT USING (true);
CREATE POLICY "Users can create UMKM reviews" ON public.umkm_reviews
    FOR INSERT WITH CHECK (auth.uid() = reviewer_id);
CREATE POLICY "Users can update own UMKM reviews" ON public.umkm_reviews
    FOR UPDATE USING (auth.uid() = reviewer_id);

-- ============================================================
-- STEP 31: RLS POLICIES - PRODUCTS
-- ============================================================

CREATE POLICY "Anyone can view active products" ON public.products
    FOR SELECT USING (status = 'active');
CREATE POLICY "UMKM owners can manage products" ON public.products
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.umkm_profiles u WHERE u.id = products.umkm_id AND u.owner_id = auth.uid())
    );
CREATE POLICY "Admins can manage all products" ON public.products
    FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Product Images
CREATE POLICY "Anyone can view product images" ON public.product_images
    FOR SELECT USING (true);

-- Product Reviews
CREATE POLICY "Anyone can view product reviews" ON public.product_reviews
    FOR SELECT USING (true);
CREATE POLICY "Users can create product reviews" ON public.product_reviews
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own product reviews" ON public.product_reviews
    FOR UPDATE USING (auth.uid() = user_id);

-- ============================================================
-- STEP 32: RLS POLICIES - CART
-- ============================================================

CREATE POLICY "Users can manage own cart" ON public.carts
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own cart items" ON public.cart_items
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.carts c WHERE c.id = cart_items.cart_id AND c.user_id = auth.uid())
    );

-- ============================================================
-- STEP 33: RLS POLICIES - ORDERS
-- ============================================================

-- UMKM Orders
CREATE POLICY "Buyers can view own orders" ON public.umkm_orders
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Sellers can view their UMKM orders" ON public.umkm_orders
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.umkm_profiles u WHERE u.id = umkm_orders.umkm_id AND u.owner_id = auth.uid())
    );
CREATE POLICY "Users can create orders" ON public.umkm_orders
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can view all orders" ON public.umkm_orders
    FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- Orders
CREATE POLICY "Users can view own orders" ON public.orders
    FOR SELECT USING (auth.uid() = user_id OR auth.uid() = seller_id);
CREATE POLICY "Users can create orders" ON public.orders
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can manage all orders" ON public.orders
    FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- ============================================================
-- STEP 34: RLS POLICIES - MESSAGES
-- ============================================================

CREATE POLICY "Users can view own conversations" ON public.conversations
    FOR SELECT USING (auth.uid() = buyer_id OR auth.uid() = seller_id);
CREATE POLICY "Users can create conversations" ON public.conversations
    FOR INSERT WITH CHECK (auth.uid() = buyer_id);

CREATE POLICY "Participants can view messages" ON public.messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.conversations c
            WHERE c.id = messages.conversation_id
            AND (c.buyer_id = auth.uid() OR c.seller_id = auth.uid())
        )
    );
CREATE POLICY "Participants can send messages" ON public.messages
    FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- Enable Realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- ============================================================
-- STEP 35: RLS POLICIES - SUPPORT
-- ============================================================

CREATE POLICY "Users can view own tickets" ON public.support_tickets
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create tickets" ON public.support_tickets
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can manage all tickets" ON public.support_tickets
    FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view ticket replies" ON public.ticket_replies
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.support_tickets st WHERE st.id = ticket_replies.ticket_id AND (st.user_id = auth.uid() OR public.has_role(auth.uid(), 'admin')))
    );
CREATE POLICY "Users can create ticket replies" ON public.ticket_replies
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- STEP 36: RLS POLICIES - REVIEWS
-- ============================================================

CREATE POLICY "Anyone can view seller reviews" ON public.seller_reviews
    FOR SELECT USING (true);
CREATE POLICY "Users can create seller reviews" ON public.seller_reviews
    FOR INSERT WITH CHECK (auth.uid() = reviewer_id);
CREATE POLICY "Users can update own seller reviews" ON public.seller_reviews
    FOR UPDATE USING (auth.uid() = reviewer_id);

-- ============================================================
-- STEP 37: RLS POLICIES - NOTIFICATIONS
-- ============================================================

CREATE POLICY "Users can manage own notifications" ON public.notifications
    FOR ALL USING (auth.uid() = user_id);

-- ============================================================
-- STEP 38: RLS POLICIES - OTP
-- ============================================================

CREATE POLICY "Users can view own OTP" ON public.otp_codes
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create OTP" ON public.otp_codes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- STEP 39: RLS POLICIES - MISC
-- ============================================================

-- Testimonials
CREATE POLICY "Anyone can view active testimonials" ON public.testimonials
    FOR SELECT USING (is_active = true);
CREATE POLICY "Users can create testimonials" ON public.testimonials
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can manage testimonials" ON public.testimonials
    FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Subscription Plans
CREATE POLICY "Anyone can view active plans" ON public.subscription_plans
    FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage plans" ON public.subscription_plans
    FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Permissions
CREATE POLICY "Authenticated can view permissions" ON public.permissions
    FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Admins can manage permissions" ON public.permissions
    FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Platform Settings
CREATE POLICY "Anyone can view platform settings" ON public.platform_settings
    FOR SELECT USING (true);
CREATE POLICY "Admins can manage settings" ON public.platform_settings
    FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Admin Logs
CREATE POLICY "Admins can view admin logs" ON public.admin_logs
    FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- ============================================================
-- STEP 40: CREATE INDEXES
-- ============================================================

-- Region indexes
CREATE INDEX IF NOT EXISTS idx_regencies_province_id ON public.regencies(province_id);
CREATE INDEX IF NOT EXISTS idx_districts_regency_id ON public.districts(regency_id);
CREATE INDEX IF NOT EXISTS idx_villages_district_id ON public.villages(district_id);

-- Profile indexes
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);

-- Listing indexes
CREATE INDEX IF NOT EXISTS idx_listings_user_id ON public.listings(user_id);
CREATE INDEX IF NOT EXISTS idx_listings_category_id ON public.listings(category_id);
CREATE INDEX IF NOT EXISTS idx_listings_status ON public.listings(status);
CREATE INDEX IF NOT EXISTS idx_listings_created_at ON public.listings(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_listings_province_id ON public.listings(province_id);
CREATE INDEX IF NOT EXISTS idx_listings_slug ON public.listings(slug);
CREATE INDEX IF NOT EXISTS idx_listing_images_listing_id ON public.listing_images(listing_id);

-- Full-text search indexes
CREATE INDEX IF NOT EXISTS idx_listings_title_search ON public.listings 
    USING gin(to_tsvector('indonesian', title));
CREATE INDEX IF NOT EXISTS idx_listings_fulltext_search ON public.listings 
    USING gin(to_tsvector('indonesian', COALESCE(title, '') || ' ' || COALESCE(description, '')));

-- Auction indexes
CREATE INDEX IF NOT EXISTS idx_auction_bids_auction_id ON public.auction_bids(auction_id);
CREATE INDEX IF NOT EXISTS idx_auctions_active ON public.listing_auctions(ends_at) WHERE status = 'active';

-- Transaction indexes
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_wallet_id ON public.transactions(wallet_id);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_user_id ON public.credit_transactions(user_id);

-- Message indexes
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_conversations_buyer_id ON public.conversations(buyer_id);
CREATE INDEX IF NOT EXISTS idx_conversations_seller_id ON public.conversations(seller_id);

-- Notification indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON public.notifications(user_id, is_read);

-- UMKM indexes
CREATE INDEX IF NOT EXISTS idx_umkm_profiles_owner ON public.umkm_profiles(owner_id);
CREATE INDEX IF NOT EXISTS idx_products_umkm ON public.products(umkm_id);

-- ============================================================
-- STEP 41: CREATE TRIGGERS
-- ============================================================

-- Auto-create wallet on profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user_wallet()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.wallets (user_id, balance, currency_code)
    VALUES (NEW.user_id, 0, 'IDR');
    INSERT INTO public.user_credits (user_id, balance)
    VALUES (NEW.user_id, 0);
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.user_id, 'user');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_profile_created ON public.profiles;
CREATE TRIGGER on_profile_created
    AFTER INSERT ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user_wallet();

-- Update timestamps triggers
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_listings_updated_at
    BEFORE UPDATE ON public.listings
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_categories_updated_at
    BEFORE UPDATE ON public.categories
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_wallets_updated_at
    BEFORE UPDATE ON public.wallets
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- STEP 42: SEED DATA
-- ============================================================

-- Credit Packages
INSERT INTO public.credit_packages (name, credits, price, bonus_credits, is_featured, sort_order) VALUES
    ('Starter', 10, 15000, 0, false, 1),
    ('Basic', 50, 65000, 5, false, 2),
    ('Popular', 100, 120000, 15, true, 3),
    ('Pro', 250, 275000, 50, false, 4),
    ('Enterprise', 500, 500000, 150, false, 5)
ON CONFLICT DO NOTHING;

-- Boost Types
INSERT INTO public.boost_types (type, name, description, credits_per_day, multiplier) VALUES
    ('highlight', 'Highlight', 'Listing ditandai dengan warna berbeda', 5, 1.5),
    ('top_search', 'Top Search', 'Muncul di atas hasil pencarian', 10, 2),
    ('premium', 'Premium', 'Highlight + Top Search + Badge Premium', 20, 3)
ON CONFLICT DO NOTHING;

-- Categories
INSERT INTO public.categories (name, slug, sort_order) VALUES
    ('Elektronik', 'elektronik', 1),
    ('Kendaraan', 'kendaraan', 2),
    ('Properti', 'properti', 3),
    ('Fashion', 'fashion', 4),
    ('Hobi & Koleksi', 'hobi-koleksi', 5),
    ('Rumah Tangga', 'rumah-tangga', 6),
    ('Jasa', 'jasa', 7),
    ('Lainnya', 'lainnya', 99)
ON CONFLICT DO NOTHING;

-- Platform Settings
INSERT INTO public.platform_settings (key, value, description) VALUES
    ('listing_credits', '{"post_listing": 1, "extra_image": 1, "auction_listing": 2}', 'Credit costs for listing actions'),
    ('boost_credits', '{"highlight": 5, "top_search": 10, "premium": 20}', 'Credit costs per boost type per day'),
    ('auction_settings', '{"min_duration_days": 1, "max_duration_days": 7, "platform_fee_percent": 5}', 'Auction configuration'),
    ('listing_limits', '{"max_free_images": 5, "max_total_images": 10, "max_active_listings": 50}', 'Listing limits')
ON CONFLICT DO NOTHING;

-- Subscription Plans
INSERT INTO public.subscription_plans (name, display_name, price, duration_days, features, is_featured, sort_order) VALUES
    ('free', 'Gratis', 0, 30, '["5 listing aktif", "5 gambar per listing", "Support basic"]', false, 1),
    ('basic', 'Basic', 99000, 30, '["20 listing aktif", "10 gambar per listing", "Highlight listing", "Support priority"]', false, 2),
    ('pro', 'Professional', 249000, 30, '["Unlimited listing", "Unlimited gambar", "Premium boost", "Analytics", "Support 24/7"]', true, 3)
ON CONFLICT DO NOTHING;

-- ============================================================
-- STEP 43: STORAGE BUCKETS
-- ============================================================

-- Create storage buckets (run via Supabase Dashboard > Storage)
-- INSERT INTO storage.buckets (id, name, public) VALUES 
--     ('listings', 'listings', true),
--     ('profiles', 'profiles', true),
--     ('umkm', 'umkm', true),
--     ('kyc', 'kyc', false),
--     ('topup-proofs', 'topup-proofs', true)
-- ON CONFLICT DO NOTHING;

-- ============================================================
-- MIGRATION COMPLETE
-- ============================================================
-- 
-- Langkah selanjutnya:
-- 1. Setup Storage buckets di Supabase Dashboard
-- 2. Configure Authentication providers (Google OAuth)
-- 3. Test RLS policies
-- 4. Import Indonesia region data jika diperlukan
--
-- ============================================================
