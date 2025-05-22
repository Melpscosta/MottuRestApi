# API Mottu - ASP.NET Core + Oracle

## 📄 Descrição
API RESTful para cadastro de motos, feita com ASP.NET Core, EF Core e banco Oracle. Suporte a rotas GET, POST, PUT, DELETE e documentação via Swagger.

## 🔁 Rotas
- `GET /api/motos` → Lista todas
- `GET /api/motos/{id}` → Busca por ID
- `GET /api/motos/busca?marca=Honda` → Busca por marca
- `POST /api/motos` → Cria moto
- `PUT /api/motos/{id}` → Atualiza moto
- `DELETE /api/motos/{id}` → Remove moto

## 🛠️ Como usar
1. Clone o projeto
2. Configure o `appsettings.json`
3. Rode `dotnet ef database update`
4. Execute com `dotnet run`
5. Acesse: `https://localhost:{porta}/swagger`

## 🧰 Tecnologias
- ASP.NET Core
- Entity Framework Core
- Oracle
- Swagger
