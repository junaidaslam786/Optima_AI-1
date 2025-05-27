// hooks/useReports.ts
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function useReports(userId: string | undefined) {
  return useSWR(
    () => (userId ? `/api/reports?user_id=${userId}` : null),
    fetcher
  );
}
