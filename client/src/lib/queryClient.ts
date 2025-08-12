import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    let errorData;
    try {
      const text = await res.text();
      try {
        errorData = JSON.parse(text);
      } catch {
        errorData = { message: text };
      }
    } catch {
      errorData = { message: res.statusText };
    }
    
    const error: any = new Error(errorData.message || `${res.status}: ${res.statusText}`);
    // Preserve all properties from the error response
    Object.assign(error, errorData);
    throw error;
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown,
): Promise<Response> {
  const token = localStorage.getItem("fokushub_token");
  const headers: Record<string, string> = {};
  
  console.log('🌐 API REQUEST:', {
    method,
    url,
    hasToken: !!token,
    tokenPrefix: token ? token.substring(0, 20) + '...' : 'No token',
    timestamp: new Date().toISOString()
  });
  
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  
  let body: BodyInit | undefined;

   if (data instanceof FormData) {
    // ✅ Don't set Content-Type, browser will handle it with boundary
    body = data;
  } else if (data !== undefined) {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(data);
  }

  const res = await fetch(url, {
    method,
    headers,
    body,
    credentials: "include",
  });

  console.log('📡 API RESPONSE:', {
    status: res.status,
    statusText: res.statusText,
    url: res.url
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
    const token = localStorage.getItem("fokushub_token");
    const headers: Record<string, string> = {};
    
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetch(queryKey.join("/") as string, {
      headers,
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
