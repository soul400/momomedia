// استيرادات النماذج
import { Media, Supporter, User } from '@shared/schema';

// وظيفة مساعدة للحصول على بيانات وهمية
async function fetchStaticData<T>(endpoint: string): Promise<T> {
  // تحديد المسار الأساسي حسب بيئة التشغيل
  const baseUrl = import.meta.env.DEV 
    ? '' 
    : '/buthooth-almahrah'; // تحديث هذا ليطابق اسم مستودع GitHub
  
  try {
    const response = await fetch(`${baseUrl}/api/${endpoint}.json`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch static data for ${endpoint}`);
    }
    
    return await response.json() as T;
  } catch (error) {
    console.error(`Error fetching static data for ${endpoint}:`, error);
    throw error;
  }
}

// واجهات API وهمية للبيئة الثابتة
export const staticAPI = {
  // وظائف المستخدم
  getUser: async (): Promise<User> => {
    return fetchStaticData<User>('user');
  },
  
  // وظائف الوسائط
  getAllMedia: async (): Promise<Media[]> => {
    return fetchStaticData<Media[]>('media');
  },
  
  getMediaByYearMonth: async (year: number, month: number): Promise<Media[]> => {
    const allMedia = await fetchStaticData<Media[]>('media');
    return allMedia.filter(item => item.year === year && item.month === month);
  },
  
  getFeaturedMedia: async (): Promise<Media[]> => {
    const allMedia = await fetchStaticData<Media[]>('media');
    return allMedia.filter(item => item.isFeatured);
  },
  
  // وظائف الداعمين
  getAllSupporters: async (): Promise<Supporter[]> => {
    return fetchStaticData<Supporter[]>('supporters');
  },
  
  getTopSupporters: async (year: number, month: number, limit: number): Promise<Supporter[]> => {
    const allSupporters = await fetchStaticData<Supporter[]>('supporters');
    return allSupporters
      .filter(item => item.year === year && item.month === month)
      .sort((a, b) => a.rank - b.rank)
      .slice(0, limit);
  }
};