// hooks/useReports.ts
import useSWR from "swr";

type FetcherError = Error & { info?: unknown; status?: number };

const fetcher = async (url: string) => {
  const response = await fetch(url);

  if (!response.ok) {
    let errorInfo;
    try {
      errorInfo = await response.json();
    } catch {
      errorInfo = { message: response.statusText };
    }

    const error = new Error(
      `API request failed with status ${response.status}`
    ) as FetcherError;
    error.info = errorInfo;
    error.status = response.status;
    throw error;
  }

  return response.json();
};
export function useReports(userId: string | undefined) {
  return useSWR(
    () => (userId ? `/api/reports?user_id=${userId}` : null),
    fetcher
  );
}
