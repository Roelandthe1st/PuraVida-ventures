// Mock prijzen in USD — worden overschreven door live CoinGecko data
export const currentPrices: Record<string, number> = {
  BTC:  83400,
  ETH:  2550,
  SOL:  144,
  USDT: 1,
};

export const BTC_PRICE_USD = currentPrices.BTC;
