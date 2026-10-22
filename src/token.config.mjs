// Datos de la moneda. Cambiar aquí antes de desplegar.
export const TOKEN = {
  name: 'Detective de Sofa',
  symbol: 'SOFA',
  decimals: 6,
  supply: 1_000_000_000n, // mil millones, todos acuñados de una vez
  // JSON público con descripción e imagen (se puede cambiar luego con update-uri.mjs)
  uri: process.env.SOFA_URI ?? 'https://pedroloisfernandez-png.github.io/sofa-memecoin/metadata.json',
};

export const RPC = process.env.SOLANA_RPC ?? 'https://api.devnet.solana.com';
