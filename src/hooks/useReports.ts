// hooks/useReports.ts
import useSWR from "swr";

type FetcherError = Error & { info?: unknown; status?: number };

const fetcher = async (url: string) => {
  const response = await fetch(url);

  if (!response.ok) {
    let errorInfo;
    try {
      // Try to parse detailed error information from the response body
      errorInfo = await response.json();
    } catch (e) {
      // Fallback if the response body isn't JSON or parsing fails
      errorInfo = { message: response.statusText };
    }

    const error = new Error(
      `API request failed with status ${response.status}`
    ) as FetcherError;
    // Attach more details to the error object
    error.info = errorInfo;
    error.status = response.status;
    throw error; // This ensures SWR will populate its 'error' state
  }

  return response.json(); // Only parse JSON if the response is OK
};
export function useReports(userId: string | undefined) {
  return useSWR(
    () => (userId ? `/api/reports?user_id=${userId}` : null),
    fetcher
  );
}
