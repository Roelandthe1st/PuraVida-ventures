// Thin fetch wrapper for external market-data APIs.
// Replace BASE_URL and add auth headers as needed for your provider
// (e.g. Alpha Vantage, Financial Modeling Prep, or your own backend).

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    ...init,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API error ${res.status}: ${text}`);
  }

  return res.json() as Promise<T>;
}

export type NavDataPoint = { date: string; nav: number };

export async function getFundNav(isin: string): Promise<NavDataPoint[]> {
  return apiFetch<NavDataPoint[]>(`/nav/${isin}`);
}

export async function getExchangeRate(
  from: string,
  to: string
): Promise<number> {
  const data = await apiFetch<{ rate: number }>(`/fx?from=${from}&to=${to}`);
  return data.rate;
}
