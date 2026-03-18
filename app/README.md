# App Mobile (Expo / React Native)

Coloque aqui o conteúdo do projeto Expo (React Native) que consome a API do Pátio Digital.

## Como adicionar o app a este repositório

1. Copie **todo o conteúdo** da pasta do seu projeto Expo (por exemplo `mottuV3`) para esta pasta `app/`.
2. A estrutura deve ficar assim:
   ```
   app/
   ├── app/           (rotas Expo Router)
   ├── src/
   ├── package.json
   ├── app.json
   ├── tsconfig.json
   └── ...
   ```
3. Na pasta `app/`, execute:
   ```bash
   npm install
   npm run dev
   ```
4. Configure a URL da API em `src/config/environment.ts` (ou variável de ambiente) para `http://localhost:5055` quando a API estiver rodando na sua máquina.

## Requisitos

- Node.js 18+
- npm ou yarn
- Expo Go no celular (para testar no dispositivo) ou emulador

## Scripts

- `npm run dev` — inicia o Expo (Metro)
- `npm run lint` — executa o linter
