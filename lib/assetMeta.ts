export interface AssetMeta {
  name: string;
  color: string;
}

export const assetMeta: Record<string, AssetMeta> = {
  BTC:  { name: "Bitcoin",  color: "#f7931a" },
  ETH:  { name: "Ethereum", color: "#627eea" },
  SOL:  { name: "Solana",   color: "#14f195" },
  USDT: { name: "Cash",     color: "#26a17b" },
};
