# Mottu Pátio Digital — API

API REST em ASP.NET Core para a demonstração do Pátio Digital: cadastro de motos, simulação de eventos IoT (beacons) e geração de alertas.

## Como rodar

```bash
dotnet run
```

Ou no Windows: `abrir_api.bat` (sobe em http://localhost:5055).

Swagger na raiz: http://localhost:5055

## Autenticação (JWT)

- **POST** `/api/auth/login` — body: `{ "username": "admin", "password": "admin123" }`
- Credenciais: `admin` / `admin123` (Admin), `operador` / `op123` (Operador)
- Rotas protegidas: header `Authorization: Bearer {token}`

## Banco (SQLite)

- Arquivo: `mottu.db` (criado na pasta `api/`)
- Seed automático de motos, eventos e alertas na primeira execução
- Reset em desenvolvimento: `Dev:ResetDatabaseOnStart` em `appsettings.Development.json`

## Principais rotas

| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/api/auth/login` | Login (retorna JWT) |
| GET | `/api/motos` | Lista motos |
| GET | `/api/dashboard` | KPIs e últimos eventos |
| GET | `/api/alertas` | Lista alertas |
| PUT | `/api/alertas/marcar-todos-lidos` | Marcar todos como lidos |
| GET | `/api/historico` | Eventos IoT (paginação) |
| POST | `/api/motos/simular-iot` | Disparar evento IoT manual |

## Simulador em background

O `IoTSimulatorService` roda a cada 2 minutos, move uma moto entre zonas (A/B/C) e gera alerta quando a moto entra na Zona C (máx. 1 por moto a cada 10 min).
