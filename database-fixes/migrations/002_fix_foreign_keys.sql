-- ============================================================
-- MIGRATION: Fix Foreign Keys & References
-- Deskripsi: Menambahkan foreign key constraints yang hilang
-- dan memperbaiki referential integrity
-- ============================================================

-- ============================================================
-- 1. FIX PROFILES REFERENCES
-- ============================================================

-- Add foreign key for profiles.user_id to auth.users (already exists via reference)
-- Add foreign key for avatar in profiles
ALTER TABLE public.profiles 
  ADD CONSTRAINT fk_profiles_avatar 
  FOREIGN KEY (avatar_url) REFERENCES public.storage_objects(name) 
  ON DELETE SET NULL;

-- ============================================================
-- 2. FIX USER_ROLES REFERENCES
-- ============================================================

ALTER TABLE public.user_roles
  ADD CONSTRAINT fk_user_roles_assigned_by 
  FOREIGN KEY (assigned_by) REFERENCES auth.users(id) 
  ON DELETE SET NULL;

-- ============================================================
-- 3. FIX KYC REFERENCES
-- ============================================================

ALTER TABLE public.kyc_verifications
  ADD CONSTRAINT fk_kyc_reviewed_by 
  FOREIGN KEY (reviewed_by) REFERENCES auth.users(id) 
  ON DELETE SET NULL;

ALTER TABLE public.kyc_documents
  ADD CONSTRAINT fk_kyc_documents_province 
  FOREIGN KEY (province_id) REFERENCES public.provinces(id) 
  ON DELETE SET NULL,
  ADD CONSTRAINT fk_kyc_documents_regency 
  FOREIGN KEY (regency_id) REFERENCES public.regencies(id) 
  ON DELETE SET NULL,
  ADD CONSTRAINT fk_kyc_documents_district 
  FOREIGN KEY (district_id) REFERENCES public.districts(id) 
  ON DELETE SET NULL,
  ADD CONSTRAINT fk_kyc_documents_village 
  FOREIGN KEY (village_id) REFERENCES public.villages(id) 
  ON DELETE SET NULL;

-- ============================================================
-- 4. FIX WALLET & TRANSACTIONS REFERENCES
-- ============================================================

ALTER TABLE public.transactions
  ADD CONSTRAINT fk_transactions_reference 
  FOREIGN KEY (reference_id) REFERENCES public.transactions(id) 
  ON DELETE SET NULL;

ALTER TABLE public.withdrawals
  ADD CONSTRAINT fk_withdrawals_processed_by 
  FOREIGN KEY (processed_by) REFERENCES auth.users(id) 
  ON DELETE SET NULL;

-- ============================================================
-- 5. FIX LISTINGS REFERENCES
-- ============================================================

ALTER TABLE public.listings
  ADD CONSTRAINT fk_listings_province 
  FOREIGN KEY (province_id) REFERENCES public.provinces(id) 
  ON DELETE SET NULL,
  ADD CONSTRAINT fk_listings_regency 
  FOREIGN KEY (regency_id) REFERENCES public.regencies(id) 
  ON DELETE SET NULL,
  ADD CONSTRAINT fk_listings_district 
  FOREIGN KEY (district_id) REFERENCES public.districts(id) 
  ON DELETE SET NULL,
  ADD CONSTRAINT fk_listings_village 
  FOREIGN KEY (village_id) REFERENCES public.villages(id) 
  ON DELETE SET NULL,
  ADD CONSTRAINT fk_listings_approved_by 
  FOREIGN KEY (approved_by) REFERENCES auth.users(id) 
  ON DELETE SET NULL,
  ADD CONSTRAINT fk_listings_sold_to 
  FOREIGN KEY (sold_to) REFERENCES auth.users(id) 
  ON DELETE SET NULL,
  ADD CONSTRAINT fk_listings_rented_to 
  FOREIGN KEY (rented_to) REFERENCES auth.users(id) 
  ON DELETE SET NULL;

-- ============================================================
-- 6. FIX LISTING_REPORTS REFERENCES
-- ============================================================

ALTER TABLE public.listing_reports
  ADD CONSTRAINT fk_listing_reports_reviewed_by 
  FOREIGN KEY (reviewed_by) REFERENCES auth.users(id) 
  ON DELETE SET NULL;

-- ============================================================
-- 7. FIX SAVED_LISTINGS REFERENCES
-- ============================================================

-- Already has proper FKs

-- ============================================================
-- 8. FIX AUCTION REFERENCES
-- ============================================================

ALTER TABLE public.listing_auctions
  ADD CONSTRAINT fk_listing_auctions_winner 
  FOREIGN KEY (winner_id) REFERENCES auth.users(id) 
  ON DELETE SET NULL;

-- ============================================================
-- 9. FIX BOOST REFERENCES
-- ============================================================

-- listing_boosts already has proper FKs

-- ============================================================
-- 10. FIX BANNER REFERENCES
-- ============================================================

ALTER TABLE public.banners
  ADD CONSTRAINT fk_banners_user 
  FOREIGN KEY (user_id) REFERENCES auth.users(id) 
  ON DELETE CASCADE,
  ADD CONSTRAINT fk_banners_approved_by 
  FOREIGN KEY (approved_by) REFERENCES auth.users(id) 
  ON DELETE SET NULL;

-- ============================================================
-- 11. FIX CREDIT SYSTEM REFERENCES
-- ============================================================

ALTER TABLE public.credit_transactions
  ADD CONSTRAINT fk_credit_transactions_user 
  FOREIGN KEY (user_id) REFERENCES auth.users(id) 
  ON DELETE CASCADE,
  ADD CONSTRAINT fk_credit_transactions_reference 
  FOREIGN KEY (reference_id) REFERENCES public.credit_transactions(id) 
  ON DELETE SET NULL;

ALTER TABLE public.coupons
  ADD CONSTRAINT fk_coupons_created_by 
  FOREIGN KEY (created_by) REFERENCES auth.users(id) 
  ON DELETE SET NULL;

ALTER TABLE public.credit_topup_requests
  ADD CONSTRAINT fk_credit_topup_requests_reviewed_by 
  FOREIGN KEY (reviewed_by) REFERENCES auth.users(id) 
  ON DELETE SET NULL;

-- ============================================================
-- 12. FIX UMKM REFERENCES
-- ============================================================

ALTER TABLE public.umkm_profiles
  ADD CONSTRAINT fk_umkm_profiles_owner 
  FOREIGN KEY (owner_id) REFERENCES auth.users(id) 
  ON DELETE CASCADE,
  ADD CONSTRAINT fk_umkm_profiles_category 
  FOREIGN KEY (category_id) REFERENCES public.categories(id) 
  ON DELETE SET NULL,
  ADD CONSTRAINT fk_umkm_profiles_subcategory 
  FOREIGN KEY (subcategory_id) REFERENCES public.categories(id) 
  ON DELETE SET NULL,
  ADD CONSTRAINT fk_umkm_profiles_province 
  FOREIGN KEY (province_id) REFERENCES public.provinces(id) 
  ON DELETE SET NULL,
  ADD CONSTRAINT fk_umkm_profiles_regency 
  FOREIGN KEY (regency_id) REFERENCES public.regencies(id) 
  ON DELETE SET NULL,
  ADD CONSTRAINT fk_umkm_profiles_district 
  FOREIGN KEY (district_id) REFERENCES public.districts(id) 
  ON DELETE SET NULL,
  ADD CONSTRAINT fk_umkm_profiles_village 
  FOREIGN KEY (village_id) REFERENCES public.villages(id) 
  ON DELETE SET NULL,
  ADD CONSTRAINT fk_umkm_profiles_verified_by 
  FOREIGN KEY (verified_by) REFERENCES auth.users(id) 
  ON DELETE SET NULL;

-- ============================================================
-- 13. FIX PRODUCT REFERENCES
-- ============================================================

ALTER TABLE public.products
  ADD CONSTRAINT fk_products_umkm 
  FOREIGN KEY (umkm_id) REFERENCES public.umkm_profiles(id) 
  ON DELETE CASCADE,
  ADD CONSTRAINT fk_products_category 
  FOREIGN KEY (category_id) REFERENCES public.categories(id) 
  ON DELETE SET NULL;

ALTER TABLE public.product_images
  ADD CONSTRAINT fk_product_images_product 
  FOREIGN KEY (product_id) REFERENCES public.products(id) 
  ON DELETE CASCADE;

ALTER TABLE public.product_reviews
  ADD CONSTRAINT fk_product_reviews_user 
  FOREIGN KEY (user_id) REFERENCES auth.users(id) 
  ON DELETE CASCADE,
  ADD CONSTRAINT fk_product_reviews_product 
  FOREIGN KEY (product_id) REFERENCES public.products(id) 
  ON DELETE CASCADE;

-- ============================================================
-- 14. FIX CART REFERENCES
-- ============================================================

ALTER TABLE public.carts
  ADD CONSTRAINT fk_carts_user 
  FOREIGN KEY (user_id) REFERENCES auth.users(id) 
  ON DELETE CASCADE;

ALTER TABLE public.cart_items
  ADD CONSTRAINT fk_cart_items_cart 
  FOREIGN KEY (cart_id) REFERENCES public.carts(id) 
  ON DELETE CASCADE,
  ADD CONSTRAINT fk_cart_items_product 
  FOREIGN KEY (product_id) REFERENCES public.products(id) 
  ON DELETE CASCADE;

-- ============================================================
-- 15. FIX UMKM ORDER REFERENCES
-- ============================================================

ALTER TABLE public.umkm_orders
  ADD CONSTRAINT fk_umkm_orders_user 
  FOREIGN KEY (user_id) REFERENCES auth.users(id) 
  ON DELETE CASCADE,
  ADD CONSTRAINT fk_umkm_orders_umkm 
  FOREIGN KEY (umkm_id) REFERENCES public.umkm_profiles(id) 
  ON DELETE SET NULL;

ALTER TABLE public.umkm_order_items
  ADD CONSTRAINT fk_umkm_order_items_order 
  FOREIGN KEY (order_id) REFERENCES public.umkm_orders(id) 
  ON DELETE CASCADE,
  ADD CONSTRAINT fk_umkm_order_items_product 
  FOREIGN KEY (product_id) REFERENCES public.products(id) 
  ON DELETE SET NULL;

ALTER TABLE public.umkm_payments
  ADD CONSTRAINT fk_umkm_payments_order 
  FOREIGN KEY (order_id) REFERENCES public.umkm_orders(id) 
  ON DELETE CASCADE;

-- ============================================================
-- 16. FIX NOTIFICATION REFERENCES
-- ============================================================

ALTER TABLE public.notifications
  ADD CONSTRAINT fk_notifications_user 
  FOREIGN KEY (user_id) REFERENCES auth.users(id) 
  ON DELETE CASCADE;

-- ============================================================
-- 17. FIX OTP REFERENCES
-- ============================================================

ALTER TABLE public.otp_codes
  ADD CONSTRAINT fk_otp_codes_user 
  FOREIGN KEY (user_id) REFERENCES auth.users(id) 
  ON DELETE CASCADE;

-- ============================================================
-- 18. FIX SUPPORT TICKET REFERENCES
-- ============================================================

ALTER TABLE public.support_tickets
  ADD CONSTRAINT fk_support_tickets_user 
  FOREIGN KEY (user_id) REFERENCES auth.users(id) 
  ON DELETE CASCADE,
  ADD CONSTRAINT fk_support_tickets_assigned_to 
  FOREIGN KEY (assigned_to) REFERENCES auth.users(id) 
  ON DELETE SET NULL,
  ADD CONSTRAINT fk_support_tickets_resolved_by 
  FOREIGN KEY (resolved_by) REFERENCES auth.users(id) 
  ON DELETE SET NULL;

ALTER TABLE public.ticket_replies
  ADD CONSTRAINT fk_ticket_replies_ticket 
  FOREIGN KEY (ticket_id) REFERENCES public.support_tickets(id) 
  ON DELETE CASCADE,
  ADD CONSTRAINT fk_ticket_replies_user 
  FOREIGN KEY (user_id) REFERENCES auth.users(id) 
  ON DELETE CASCADE;

-- ============================================================
-- 19. FIX CONVERSATION & MESSAGE REFERENCES
-- ============================================================

ALTER TABLE public.conversations
  ADD CONSTRAINT fk_conversations_listing 
  FOREIGN KEY (listing_id) REFERENCES public.listings(id) 
  ON DELETE SET NULL,
  ADD CONSTRAINT fk_conversations_buyer 
  FOREIGN KEY (buyer_id) REFERENCES auth.users(id) 
  ON DELETE CASCADE,
  ADD CONSTRAINT fk_conversations_seller 
  FOREIGN KEY (seller_id) REFERENCES auth.users(id) 
  ON DELETE CASCADE;

ALTER TABLE public.messages
  ADD CONSTRAINT fk_messages_conversation 
  FOREIGN KEY (conversation_id) REFERENCES public.conversations(id) 
  ON DELETE CASCADE,
  ADD CONSTRAINT fk_messages_sender 
  FOREIGN KEY (sender_id) REFERENCES auth.users(id) 
  ON DELETE CASCADE;

-- ============================================================
-- 20. FIX REVIEW REFERENCES
-- ============================================================

ALTER TABLE public.seller_reviews
  ADD CONSTRAINT fk_seller_reviews_seller 
  FOREIGN KEY (seller_id) REFERENCES auth.users(id) 
  ON DELETE CASCADE,
  ADD CONSTRAINT fk_seller_reviews_reviewer 
  FOREIGN KEY (reviewer_id) REFERENCES auth.users(id) 
  ON DELETE CASCADE;

ALTER TABLE public.umkm_reviews
  ADD CONSTRAINT fk_umkm_reviews_umkm 
  FOREIGN KEY (umkm_id) REFERENCES public.umkm_profiles(id) 
  ON DELETE CASCADE,
  ADD CONSTRAINT fk_umkm_reviews_reviewer 
  FOREIGN KEY (reviewer_id) REFERENCES auth.users(id) 
  ON DELETE CASCADE;

ALTER TABLE public.umkm_portfolios
  ADD CONSTRAINT fk_umkm_portfolios_umkm 
  FOREIGN KEY (umkm_id) REFERENCES public.umkm_profiles(id) 
  ON DELETE CASCADE;

-- ============================================================
-- 21. FIX SUBSCRIPTION REFERENCES
-- ============================================================

ALTER TABLE public.umkm_subscriptions
  ADD CONSTRAINT fk_umkm_subscriptions_umkm 
  FOREIGN KEY (umkm_id) REFERENCES public.umkm_profiles(id) 
  ON DELETE CASCADE;

-- ============================================================
-- 22. FIX ADMIN LOG REFERENCES
-- ============================================================

ALTER TABLE public.admin_logs
  ADD CONSTRAINT fk_admin_logs_admin 
  FOREIGN KEY (admin_id) REFERENCES auth.users(id) 
  ON DELETE CASCADE;

-- ============================================================
-- 23. FIX PLATFORM SETTINGS REFERENCES
-- ============================================================

ALTER TABLE public.platform_settings
  ADD CONSTRAINT fk_platform_settings_updated_by 
  FOREIGN KEY (updated_by) REFERENCES auth.users(id) 
  ON DELETE SET NULL;

-- ============================================================
-- 24. FIX CATEGORIES REFERENCES
-- ============================================================

ALTER TABLE public.categories
  ADD CONSTRAINT fk_categories_created_by 
  FOREIGN KEY (created_by) REFERENCES auth.users(id) 
  ON DELETE SET NULL,
  ADD CONSTRAINT fk_categories_updated_by 
  FOREIGN KEY (updated_by) REFERENCES auth.users(id) 
  ON DELETE SET NULL;

-- ============================================================
-- 25. FIX TESTIMONIALS REFERENCES
-- ============================================================

ALTER TABLE public.testimonials
  ADD CONSTRAINT fk_testimonials_user 
  FOREIGN KEY (user_id) REFERENCES auth.users(id) 
  ON DELETE CASCADE;

-- ============================================================
-- 26. FIX COUPON USES REFERENCES
-- ============================================================

ALTER TABLE public.coupon_uses
  ADD CONSTRAINT fk_coupon_uses_user 
  FOREIGN KEY (user_id) REFERENCES auth.users(id) 
  ON DELETE CASCADE;
