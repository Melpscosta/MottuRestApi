# Mottu — Pátio Digital

Projeto completo de demonstração do **Pátio Digital**: API backend (ASP.NET Core) + app mobile (Expo / React Native) para monitoramento de motos no pátio, com simulação de IoT (beacons BLE), eventos e alertas.

Ideal para portfólio: roda localmente sem hardware; a movimentação e os alertas são simulados pela API.

---

## Estrutura do repositório

```
.
├── api/                    # Backend ASP.NET Core
│   ├── Controllers/        # Auth, Motos, Alertas, Dashboard, Histórico
│   ├── Data/               # DbContext e seed
│   ├── Models/             # Moto, Alerta, EventoIoT
│   ├── Services/           # IoTSimulatorService (beacons simulados)
│   ├── Program.cs
│   ├── appsettings.json
│   └── README.md           # Detalhes da API
│
├── app/                    # App mobile Expo (React Native)
│   ├── app/                # Rotas (Expo Router)
│   ├── src/                # Componentes, hooks, services
│   ├── package.json
│   └── ...
│
└── README.md               # Este arquivo
```

---

## Pré-requisitos

- **.NET 10** (ou .NET 9) — [Download](https://dotnet.microsoft.com/download)
- **Node.js 18+** e **npm** — para o app Expo
- **Expo Go** no celular (opcional) — para testar no dispositivo

---

## Como rodar

### 1. Backend (API)

```bash
cd api
dotnet run
```

A API sobe em **http://localhost:5055** (ou na porta configurada em `api/Properties/launchSettings.json`).  
Swagger: **http://localhost:5055** (raiz).

No Windows você pode usar o script:

```bash
api\abrir_api.bat
```

- O banco SQLite (`mottu.db`) é criado automaticamente na pasta `api/`.
- Na primeira execução são inseridos motos, eventos e alertas de demonstração.
- Um simulador em background move motos entre zonas (A/B/C) a cada 2 minutos e gera alertas quando alguma entra na Zona C.

### 2. App mobile (Expo)

```bash
cd app
npm install
npm run dev
```

Escaneie o QR code com o Expo Go ou use o emulador. No app, use a URL da API **http://localhost:5055** (ou o IP da sua máquina na rede, ex.: `http://192.168.1.10:5055`, se testar no celular).

---

## Autenticação (demo)

| Usuário   | Senha    | Role     |
|----------|----------|----------|
| `admin`  | `admin123` | Admin    |
| `operador` | `op123`  | Operador |

O app faz login em `POST /api/auth/login` com `{ "username": "...", "password": "..." }` e usa o JWT retornado nas requisições.

---

## Funcionalidades

- **Login** com JWT e roles (Admin / Operador).
- **Dashboard**: KPIs, gráficos por status, últimos eventos, alertas.
- **Pátio (mapa)**: visão do pátio com zonas A/B/C, simulação BLE (trilateração), lista de motos monitoradas.
- **Eventos**: histórico paginado de eventos IoT.
- **Relatórios**: dados por status e zona, inventário.
- **Ajustes**: tema claro/escuro, parâmetros da simulação BLE (Tick em ms, etc.), logout.

A API expõe ainda rotas para CRUD de motos (Admin), listagem de alertas, marcar alertas como lidos e simulação manual de evento IoT.

---

## Tecnologias

| Parte   | Stack |
|--------|--------|
| Backend | ASP.NET Core, Entity Framework Core, SQLite, JWT, Swagger |
| App     | Expo (SDK 54), React Native, Expo Router, React Native Paper |

---

## Configuração opcional

- **API**  
  - Porta e ambiente: `api/appsettings.json` e `api/appsettings.Development.json`.  
  - Reset do banco na subida: `Dev:ResetDatabaseOnStart` em `appsettings.Development.json`.

- **App**  
  - URL da API: `app/src/config/environment.ts` ou variáveis `EXPO_PUBLIC_API_BASE_URL` / `API_BASE_URL`.

---

## Licença

Projeto de demonstração para portfólio.
