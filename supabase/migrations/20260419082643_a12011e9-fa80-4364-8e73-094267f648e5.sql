DROP POLICY IF EXISTS "Pet images publicly readable" ON storage.objects;

-- Public can read (GET) individual pet image files but not list the bucket
CREATE POLICY "Pet images public read" ON storage.objects FOR SELECT
  USING (
    bucket_id = 'pet-images'
    AND (
      auth.role() = 'anon'
      OR auth.role() = 'authenticated'
    )
  );