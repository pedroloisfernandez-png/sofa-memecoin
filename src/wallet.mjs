import fs from 'node:fs';
import path from 'node:path';
import { Keypair, LAMPORTS_PER_SOL } from '@solana/web3.js';

const DIR = path.resolve('wallet');

// Carga una clave guardada o crea una nueva (formato JSON compatible con la CLI de Solana).
export function loadOrCreate(name) {
  fs.mkdirSync(DIR, { recursive: true });
  const file = path.join(DIR, `${name}.json`);
  if (fs.existsSync(file)) {
    return Keypair.fromSecretKey(Uint8Array.from(JSON.parse(fs.readFileSync(file, 'utf8'))));
  }
  const kp = Keypair.generate();
  fs.writeFileSync(file, JSON.stringify(Array.from(kp.secretKey)));
  return kp;
}

// SOL de pruebas gratis. El faucet de devnet limita peticiones: si falla, usar https://faucet.solana.com
export async function ensureDevnetSol(connection, pubkey, minSol = 0.5) {
  const balance = await connection.getBalance(pubkey);
  if (balance >= minSol * LAMPORTS_PER_SOL) return balance / LAMPORTS_PER_SOL;
  console.log(`Pidiendo 1 SOL de pruebas para ${pubkey.toBase58()}...`);
  try {
    const sig = await connection.requestAirdrop(pubkey, LAMPORTS_PER_SOL);
    await connection.confirmTransaction(sig, 'confirmed');
  } catch (err) {
    throw new Error(
      `El faucet de devnet no respondió (${err.message}).\n` +
      `Pide SOL de pruebas gratis en https://faucet.solana.com para la dirección:\n  ${pubkey.toBase58()}\n` +
      `y vuelve a ejecutar el script.`
    );
  }
  return (await connection.getBalance(pubkey)) / LAMPORTS_PER_SOL;
}
