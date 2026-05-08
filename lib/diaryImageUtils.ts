import * as ImagePicker from 'expo-image-picker';
import { File } from 'expo-file-system';
import { supabase } from './supabase';
import { Alert } from 'react-native';

const BUCKET = 'diary-images';

export async function pickImages(maxCount: number): Promise<string[]> {
  const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!perm.granted) {
    Alert.alert('提示', '需要相册权限才能选择图片');
    return [];
  }
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    quality: 0.8,
    allowsMultipleSelection: true,
    selectionLimit: maxCount,
  });
  if (result.canceled) return [];
  return result.assets.map((a) => a.uri);
}

export async function uploadImages(userId: string, uris: string[]): Promise<string[]> {
  const urls: string[] = [];
  for (const uri of uris) {
    const ext = uri.split('.').pop()?.split('?')[0] || 'jpg';
    const name = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const path = `${userId}/${name}`;

    try {
      const file = new File(uri);
      const bytes = await file.bytes();

      const { error } = await supabase.storage.from(BUCKET).upload(path, bytes, {
        contentType: `image/${ext}`,
        upsert: false,
      });

      if (error) {
        console.error('Image upload error:', error.message);
        continue;
      }

      const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
      urls.push(data.publicUrl);
    } catch (e: any) {
      console.error('Image upload exception:', e?.message || e);
    }
  }
  return urls;
}

export async function deleteImages(urls: string[]): Promise<void> {
  const paths = urls
    .map((url) => {
      const marker = `/storage/v1/object/public/${BUCKET}/`;
      const idx = url.indexOf(marker);
      if (idx === -1) return null;
      return url.substring(idx + marker.length);
    })
    .filter(Boolean) as string[];

  if (paths.length === 0) return;

  const { error } = await supabase.storage.from(BUCKET).remove(paths);
  if (error) {
    console.error('Image delete error:', error.message);
  }
}
