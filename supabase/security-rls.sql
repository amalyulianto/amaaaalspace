-- =============================================================================
-- SUPABASE ROW-LEVEL SECURITY (RLS) & STORAGE HARDENING SCRIPT
-- Project: alapakadala-site
-- Instructions:
--   1. Replace 'YOUR_ADMIN_EMAIL@example.com' inside public.is_admin() below
--      with your actual admin login email address.
--   2. Paste and run this entire script in Supabase Dashboard -> SQL Editor.
-- =============================================================================

-- 1. Helper function to verify the authenticated user is the site administrator
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT (
    auth.role() = 'authenticated'
    AND lower(coalesce(auth.jwt() ->> 'email', '')) = lower('YOUR_ADMIN_EMAIL@example.com')
  );
$$;

-- 2. Enable Row-Level Security on all 10 tables
ALTER TABLE IF EXISTS public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.portfolio ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.portfolio_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.portfolio_category_mapping ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.resume ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.guestbook ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.links ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.short_links ENABLE ROW LEVEL SECURITY;

-- 3. Drop any existing overly-permissive policies so this script is idempotent
DO $$
DECLARE
  pol record;
BEGIN
  FOR pol IN
    SELECT policyname, tablename
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename IN (
        'categories',
        'posts',
        'portfolio',
        'portfolio_categories',
        'portfolio_category_mapping',
        'resume',
        'comments',
        'guestbook',
        'links',
        'short_links'
      )
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', pol.policyname, pol.tablename);
  END LOOP;
END $$;

-- =============================================================================
-- TABLE: posts
-- Public can ONLY read published posts whose published_at is in the past/now.
-- Drafts and future-scheduled posts are completely hidden from anon.
-- =============================================================================
CREATE POLICY "posts_public_select_published"
  ON public.posts
  FOR SELECT
  TO anon, authenticated
  USING (
    (status = 'published' AND published_at IS NOT NULL AND published_at <= now())
    OR public.is_admin()
  );

CREATE POLICY "posts_admin_all"
  ON public.posts
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- =============================================================================
-- TABLE: comments
-- Public can ONLY read approved comments.
-- Direct anon INSERT is blocked so all submissions must pass through
-- Next.js /api/comments (honeypot, rate-limit, length & published-post checks).
-- =============================================================================
CREATE POLICY "comments_public_select_approved"
  ON public.comments
  FOR SELECT
  TO anon, authenticated
  USING (approved = true OR public.is_admin());

CREATE POLICY "comments_admin_all"
  ON public.comments
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- =============================================================================
-- TABLE: guestbook
-- Public can ONLY read approved entries.
-- Direct anon INSERT is blocked so all submissions must pass through
-- Next.js /api/guestbook (honeypot, rate-limit, length checks).
-- =============================================================================
CREATE POLICY "guestbook_public_select_approved"
  ON public.guestbook
  FOR SELECT
  TO anon, authenticated
  USING (approved = true OR public.is_admin());

CREATE POLICY "guestbook_admin_all"
  ON public.guestbook
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- =============================================================================
-- TABLES: categories, portfolio, portfolio_categories,
--         portfolio_category_mapping, resume, links, short_links
-- Public can SELECT; only verified admin can INSERT, UPDATE, or DELETE.
-- =============================================================================

-- categories
CREATE POLICY "categories_public_select"
  ON public.categories FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "categories_admin_all"
  ON public.categories FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

-- portfolio
CREATE POLICY "portfolio_public_select"
  ON public.portfolio FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "portfolio_admin_all"
  ON public.portfolio FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

-- portfolio_categories
CREATE POLICY "portfolio_categories_public_select"
  ON public.portfolio_categories FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "portfolio_categories_admin_all"
  ON public.portfolio_categories FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

-- portfolio_category_mapping
CREATE POLICY "portfolio_category_mapping_public_select"
  ON public.portfolio_category_mapping FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "portfolio_category_mapping_admin_all"
  ON public.portfolio_category_mapping FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

-- resume
CREATE POLICY "resume_public_select"
  ON public.resume FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "resume_admin_all"
  ON public.resume FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

-- links
CREATE POLICY "links_public_select"
  ON public.links FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "links_admin_all"
  ON public.links FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

-- short_links (enforce http/https constraint at DB level too)
ALTER TABLE public.short_links
  DROP CONSTRAINT IF EXISTS short_links_destination_url_protocol_check;
ALTER TABLE public.short_links
  ADD CONSTRAINT short_links_destination_url_protocol_check
  CHECK (destination_url ~* '^https?://');

CREATE POLICY "short_links_public_select"
  ON public.short_links FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "short_links_admin_all"
  ON public.short_links FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

-- =============================================================================
-- RPC: increment_link_clicks
-- Locked down with explicit search_path so it only increments clicks by 1.
-- =============================================================================
CREATE OR REPLACE FUNCTION public.increment_link_clicks(link_slug text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF link_slug IS NULL OR length(link_slug) > 100 THEN
    RETURN;
  END IF;

  UPDATE public.short_links
  SET clicks = coalesce(clicks, 0) + 1,
      updated_at = now()
  WHERE slug = lower(trim(link_slug));
END;
$$;

GRANT EXECUTE ON FUNCTION public.increment_link_clicks(text) TO anon, authenticated;

-- =============================================================================
-- STORAGE: 'images' bucket policies
-- Public can view images; only verified admin can upload/update/delete,
-- and only safe raster image MIME types (no SVG) <= 5 MB are allowed.
-- =============================================================================
UPDATE storage.buckets
SET public = true,
    file_size_limit = 5242880,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
WHERE id = 'images';

DROP POLICY IF EXISTS "images_public_select" ON storage.objects;
DROP POLICY IF EXISTS "images_admin_insert" ON storage.objects;
DROP POLICY IF EXISTS "images_admin_update" ON storage.objects;
DROP POLICY IF EXISTS "images_admin_delete" ON storage.objects;

CREATE POLICY "images_public_select"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'images');

CREATE POLICY "images_admin_insert"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'images'
    AND public.is_admin()
    AND (storage.extension(name) = ANY (ARRAY['jpg', 'jpeg', 'png', 'webp', 'gif']))
  );

CREATE POLICY "images_admin_update"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'images' AND public.is_admin())
  WITH CHECK (bucket_id = 'images' AND public.is_admin());

CREATE POLICY "images_admin_delete"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'images' AND public.is_admin());
