import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { staticAPI } from "../static-api";

// التحقق مما إذا كنا في بيئة GitHub Pages
const isStatic = window.location.hostname.includes('github.io');

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  // في بيئة GitHub Pages، استخدم البيانات الوهمية
  if (isStatic) {
    console.log('Using static mock data for', url);
    
    // محاكاة استجابة واجهة برمجة التطبيقات عند استخدام البيانات الوهمية
    const mockResponse = async () => {
      try {
        let result;
        
        // التعامل مع مختلف نقاط النهاية للواجهة البرمجية
        if (url === '/api/user') {
          result = await staticAPI.getUser();
        } else if (url.startsWith('/api/media')) {
          // يمكن إضافة المزيد من الحالات التي تعتمد على المعلمات
          result = await staticAPI.getAllMedia();
        } else if (url.startsWith('/api/supporters')) {
          result = await staticAPI.getAllSupporters();
        } else {
          throw new Error(`No mock data available for ${url}`);
        }
        
        // إرجاع كائن Response مماثل
        return new Response(JSON.stringify(result), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      } catch (error) {
        console.error('Error with mock API:', error);
        return new Response(JSON.stringify({ error: 'Mock API error' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    };
    
    return mockResponse();
  }
  
  // السلوك الطبيعي للبيئة غير الثابتة
  const res = await fetch(url, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    // في بيئة GitHub Pages، استخدم البيانات الوهمية
    if (isStatic) {
      const endpoint = queryKey[0] as string;
      console.log('Using static mock data for query:', endpoint);
      
      try {
        // التعامل مع مختلف نقاط النهاية للواجهة البرمجية
        if (endpoint === '/api/user') {
          return await staticAPI.getUser();
        } else if (endpoint === '/api/media') {
          return await staticAPI.getAllMedia();
        } else if (endpoint.startsWith('/api/media/featured')) {
          return await staticAPI.getFeaturedMedia();
        } else if (endpoint.match(/\/api\/media\/(\d+)\/(\d+)/)) {
          // استخراج السنة والشهر من المسار
          const matches = endpoint.match(/\/api\/media\/(\d+)\/(\d+)/);
          if (matches) {
            const year = parseInt(matches[1]);
            const month = parseInt(matches[2]);
            return await staticAPI.getMediaByYearMonth(year, month);
          }
        } else if (endpoint === '/api/supporters') {
          return await staticAPI.getAllSupporters();
        } else if (endpoint.match(/\/api\/supporters\/top\/(\d+)\/(\d+)\/(\d+)/)) {
          // استخراج السنة والشهر والحد من المسار
          const matches = endpoint.match(/\/api\/supporters\/top\/(\d+)\/(\d+)\/(\d+)/);
          if (matches) {
            const year = parseInt(matches[1]);
            const month = parseInt(matches[2]);
            const limit = parseInt(matches[3]);
            return await staticAPI.getTopSupporters(year, month, limit);
          }
        }
        
        throw new Error(`No mock data handler for ${endpoint}`);
      } catch (error) {
        console.error('Error with mock query:', error);
        throw error;
      }
    }
    
    // السلوك الطبيعي للبيئة غير الثابتة
    const res = await fetch(queryKey[0] as string, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
