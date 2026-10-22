# $SOFA · Detective de Sofá

Memecoin de humor en **Solana Devnet** (red de pruebas, 0 €, sin valor económico).

| Dato | Valor |
|---|---|
| Nombre / símbolo | Detective de Sofa / SOFA |
| Suministro | 1.000.000.000 (6 decimales), todo acuñado de una vez |
| Acuñación | Revocada tras el despliegue: suministro fijo |
| Estándar | Token-2022 con metadatos en la cadena |

## Desplegar

1. Pide SOL de pruebas gratis en https://faucet.solana.com (red **Devnet**) para la dirección del creador:
   `6WUhr7q8TuQTPeABAvFDwgCyEoCLVvxqquLhsUMQat87`
2. Ejecuta `npm run deploy`.
3. Se crea `deployment.json` y la web (`docs/index.html`) muestra sola la dirección del token.

## Archivos

- `src/token.config.mjs`: nombre, símbolo, suministro.
- `src/deploy.mjs`: crea el token, acuña y revoca la acuñación.
- `wallet/`: **claves privadas**. No compartir ni subir a internet.
- `assets/`: logo SVG/PNG.
- `docs/`: web de lanzamiento (GitHub Pages).

## Pasar a red real (cuesta dinero)

Cambiar `SOLANA_RPC` a mainnet y tener SOL real (~0,02 SOL para crear el token, más la liquidez para el pool).
