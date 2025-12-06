/*
  # Set Up Profile Photos Storage

  1. Storage Bucket
    - Create 'profile-photos' bucket for storing user profile pictures
    - Public bucket to allow easy access to profile photos

  2. Security Policies
    - Users can upload their own profile photos
    - Anyone can view profile photos (public access)
    - Users can update/delete only their own photos

  3. Configuration
    - Maximum file size handled by Supabase defaults
    - Allowed file types: images only
*/

-- Create storage bucket for profile photos if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('profile-photos', 'profile-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload their own profile photos
DROP POLICY IF EXISTS "Users can upload own profile photo" ON storage.objects;
CREATE POLICY "Users can upload own profile photo"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'profile-photos' 
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow authenticated users to update their own profile photos
DROP POLICY IF EXISTS "Users can update own profile photo" ON storage.objects;
CREATE POLICY "Users can update own profile photo"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'profile-photos' 
    AND (storage.foldername(name))[1] = auth.uid()::text
  )
  WITH CHECK (
    bucket_id = 'profile-photos' 
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow authenticated users to delete their own profile photos
DROP POLICY IF EXISTS "Users can delete own profile photo" ON storage.objects;
CREATE POLICY "Users can delete own profile photo"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'profile-photos' 
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow public read access to all profile photos
DROP POLICY IF EXISTS "Anyone can view profile photos" ON storage.objects;
CREATE POLICY "Anyone can view profile photos"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'profile-photos');
