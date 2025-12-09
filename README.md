# Frontend Museus & Cidades Históricas

Frontend em React + Vite, pronto para subir na Vercel, integrado conceitualmente com o último backend
que criamos (multi-tenant, com rotas /auth, /tenants, /points, /trails, /events, /analytics, etc.).

## Estrutura de painéis

- **Aplicativo do visitante**
  - Home, obras, detalhes da obra, trilhas, detalhes da trilha, mapa, eventos, favoritos.
  - Suporte a audiodescrição e Libras (URL de mídia cadastrada pelo admin).
- **Painel Admin (museu / cidade)**
  - Dashboard local, gestão de obras, trilhas, eventos e configurações básicas.
- **Painel Master**
  - Gestão de tenants (museus / cidades), usuários admin, visão consolidada e resumo de faturamento.

## Como rodar localmente

```bash
npm install
npm run dev
```

## Configuração do .env

Crie um arquivo `.env` na raiz copiando o `.env.example`:

```bash
cp .env.example .env
```

Edite:

- `VITE_API_URL` = URL pública do backend (por exemplo, a URL do Render).
- `VITE_DEMO_MODE`:
  - `"true"` para usar dados de exemplo e permitir login fake.
  - `"false"` para obrigar integração real com o backend.

## Deploy na Vercel

1. Crie um novo projeto na Vercel apontando para este repositório.
2. Em **Environment Variables**, defina:
   - `VITE_API_URL`
   - `VITE_DEMO_MODE`
3. Build command: `npm run build`
4. Output directory: `dist`

Qualquer ajuste fino de rotas de API (por exemplo, `/points`, `/trails`, etc.) pode ser feito em
`src/api/client.ts` e nos componentes admin, conectando diretamente com o último backend que você já
tem rodando.
