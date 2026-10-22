// Crea $SOFA en Solana Devnet: mint Token-2022 con metadatos on-chain,
// acuña todo el suministro al creador y renuncia a poder acuñar más.
import fs from 'node:fs';
import {
  Connection, SystemProgram, Transaction, sendAndConfirmTransaction,
} from '@solana/web3.js';
import {
  TOKEN_2022_PROGRAM_ID, ExtensionType, AuthorityType, LENGTH_SIZE, TYPE_SIZE,
  getMintLen, createInitializeMetadataPointerInstruction, createInitializeMintInstruction,
  getOrCreateAssociatedTokenAccount, mintTo, setAuthority,
} from '@solana/spl-token';
import { createInitializeInstruction, pack } from '@solana/spl-token-metadata';
import { TOKEN, RPC } from './token.config.mjs';
import { loadOrCreate, ensureDevnetSol } from './wallet.mjs';

if (fs.existsSync('deployment.json')) {
  console.log('Ya desplegado. Ver deployment.json (borrarlo para crear otro token).');
  process.exit(0);
}

const connection = new Connection(RPC, 'confirmed');
const payer = loadOrCreate('creador');
const mint = loadOrCreate('mint-sofa');

console.log('Creador:', payer.publicKey.toBase58());
console.log('Saldo:', await ensureDevnetSol(connection, payer.publicKey), 'SOL (devnet)');

const metadata = {
  mint: mint.publicKey,
  name: TOKEN.name,
  symbol: TOKEN.symbol,
  uri: TOKEN.uri,
  additionalMetadata: [['lema', 'Resolvemos el caso sin levantarnos del sofa']],
};

const mintLen = getMintLen([ExtensionType.MetadataPointer]);
const metadataLen = TYPE_SIZE + LENGTH_SIZE + pack(metadata).length;
// Margen extra para poder cambiar la URI más tarde sin quedarse sin espacio.
const lamports = await connection.getMinimumBalanceForRentExemption(mintLen + metadataLen + 256);

const tx = new Transaction().add(
  SystemProgram.createAccount({
    fromPubkey: payer.publicKey,
    newAccountPubkey: mint.publicKey,
    space: mintLen,
    lamports,
    programId: TOKEN_2022_PROGRAM_ID,
  }),
  createInitializeMetadataPointerInstruction(mint.publicKey, payer.publicKey, mint.publicKey, TOKEN_2022_PROGRAM_ID),
  createInitializeMintInstruction(mint.publicKey, TOKEN.decimals, payer.publicKey, null, TOKEN_2022_PROGRAM_ID),
  createInitializeInstruction({
    programId: TOKEN_2022_PROGRAM_ID,
    metadata: mint.publicKey,
    updateAuthority: payer.publicKey,
    mint: mint.publicKey,
    mintAuthority: payer.publicKey,
    name: metadata.name,
    symbol: metadata.symbol,
    uri: metadata.uri,
  }),
);
const createSig = await sendAndConfirmTransaction(connection, tx, [payer, mint]);
console.log('Mint creado:', mint.publicKey.toBase58());

const ata = await getOrCreateAssociatedTokenAccount(
  connection, payer, mint.publicKey, payer.publicKey, false, 'confirmed', undefined, TOKEN_2022_PROGRAM_ID,
);
const amount = TOKEN.supply * 10n ** BigInt(TOKEN.decimals);
const mintSig = await mintTo(connection, payer, mint.publicKey, ata.address, payer, amount, [], undefined, TOKEN_2022_PROGRAM_ID);
console.log(`Acuñados ${TOKEN.supply.toLocaleString('es-ES')} ${TOKEN.symbol}`);

// Suministro fijo: nadie (ni el creador) puede acuñar más.
const revokeSig = await setAuthority(
  connection, payer, mint.publicKey, payer, AuthorityType.MintTokens, null, [], undefined, TOKEN_2022_PROGRAM_ID,
);
console.log('Autoridad de acuñación revocada.');

const out = {
  network: 'devnet',
  mint: mint.publicKey.toBase58(),
  creator: payer.publicKey.toBase58(),
  tokenAccount: ata.address.toBase58(),
  supply: TOKEN.supply.toString(),
  decimals: TOKEN.decimals,
  tx: { create: createSig, mint: mintSig, revokeMint: revokeSig },
  explorer: `https://explorer.solana.com/address/${mint.publicKey.toBase58()}?cluster=devnet`,
  date: new Date().toISOString(),
};
fs.writeFileSync('deployment.json', JSON.stringify(out, null, 2));
// La web lee este fichero para mostrar la dirección del contrato.
fs.writeFileSync('docs/contrato.js', `window.SOFA = ${JSON.stringify(out, null, 2)};\n`);
console.log('\nListo:', out.explorer);
