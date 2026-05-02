import { QueryClient } from "@tanstack/react-query";

function getAuthToken(): string | null {
  return localStorage.getItem('auth_token');
}

async function customFetch(url: string, options?: RequestInit) {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options?.headers as Record<string, string> || {}),
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: "include",
  });

  if (!response.ok) {
    const errorText = await response.text();
    let errorMessage = errorText;
    try {
      const errorJson = JSON.parse(errorText);
      errorMessage = errorJson.error || errorText;
    } catch { /* ignore parse errors */ }
    throw new Error(errorMessage);
  }

  return response.json();
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: async ({ queryKey }) => {
        const url = queryKey[0] as string;
        return customFetch(url);
      },
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: false,
    },
  },
});

export async function apiRequest(url: string, options?: RequestInit) {
  return customFetch(url, options);
}
