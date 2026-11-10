import { supabase, isSupabaseConfigured } from '../lib/supabase'

/**
 * Service to manage image file uploads in Supabase Storage.
 * Stores packaging label photos for the Food Scanner and custom pet avatars.
 */
export const supabaseStorage = {
  /**
   * Upload an image to a Supabase bucket (defaults to 'food-labels')
   * Returns a publicly accessible URL or null if upload fails.
   */
  async uploadImage(
    file: File | Blob,
    bucket = 'food-labels',
    folder = 'scans'
  ): Promise<string | null> {
    if (!isSupabaseConfigured) {
      // In offline mode, create a local object URL for preview
      return URL.createObjectURL(file)
    }

    try {
      const extension = file.type.split('/')[1] || 'jpg'
      const fileName = `${folder}/${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${extension}`

      const { data, error } = await supabase.storage.from(bucket).upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
      })

      if (error) {
        console.warn(`Supabase storage upload failed: ${error.message}. Using object URL fallback.`)
        return URL.createObjectURL(file)
      }

      const { data: publicData } = supabase.storage.from(bucket).getPublicUrl(data.path)
      return publicData.publicUrl
    } catch (err) {
      console.warn('Storage error, falling back to local object URL:', err)
      return URL.createObjectURL(file)
    }
  },
}

