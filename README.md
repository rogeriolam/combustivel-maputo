# Combustível Maputo

MVP Web mobile-first para Maputo e Matola, focado em mostrar bombas de combustível num mapa e permitir que a comunidade actualize a disponibilidade de Gasolina e Diesel em tempo quase real.

## Arquitectura proposta

- Frontend: `Next.js 15` com App Router e TypeScript.
- UI: CSS global mobile-first, componentes reutilizáveis e navegação inferior pensada para telemóvel.
- Mapa: `Leaflet + OpenStreetMap`, escolhido para evitar dependências de cartão e manter o MVP simples.
- Backend/BaaS: `Supabase` para Auth, Postgres, RLS e futura expansão com Edge Functions.
- Dados: `Postgres + PostGIS` para proximidade GPS, prevenção de duplicados e cálculo de distâncias.
- Deploy: `Vercel` para frontend, `Supabase` para base de dados/auth.

## Estrutura

```text
combustivel-maputo/
├─ app/
│  ├─ admin/
│  ├─ alerts/
│  ├─ auth/
│  ├─ dashboard/
│  ├─ profile/
│  ├─ stations/
│  └─ api/notify/
├─ components/
│  ├─ auth/
│  ├─ layout/
│  ├─ map/
│  ├─ stations/
│  └─ ui/
├─ lib/
│  ├─ domain/
│  ├─ mocks/
│  └─ supabase/
└─ supabase/schema.sql
```

## Modelo de dados

### `profiles`

- `id`
- `full_name`
- `email`
- `auth_provider`
- `reputation_score`
- `reputation_weight`
- `role`
- `created_at`

### `stations`

- `id`
- `name`
- `city`
- `neighborhood`
- `latitude`
- `longitude`
- `geom`
- `created_at`
- `created_by`
- `is_active`
- `is_validated`
- `admin_notes`

### `signals`

- `id`
- `station_id`
- `user_id`
- `fuel_type`
- `status_option`
- `created_at`
- `user_latitude`
- `user_longitude`
- `distance_meters`
- `gps_validated`
- `reputation_weight`
- `meta`

### `alerts`

- `id`
- `user_id`
- `station_id` ou `city`
- `fuel_type`
- `trigger_status`
- `channel`
- `is_active`
- `created_at`

### `admin_actions`

- histórico de correcções, fusões, bloqueios e remoções.

## Regras de negócio implementadas

- Apenas as sinalizações das últimas `3 horas` contam para o estado actual.
- Para a mesma `bomba + combustível + utilizador`, só conta a sinalização válida mais recente.
- Menos de `2` sinalizações válidas: `Sem informação recente`.
- `>= 60%` de peso em `Tem`: `Tem`.
- `>= 60%` de peso em `Não tem`: `Não tem`.
- Caso contrário: `Em conflito`.
- GPS obrigatório até `100m` da bomba para criar sinalizações.
- Criação de bomba bloqueada se existir outra a menos de `100m`.

## Reputação MVP

- Peso base: `1.00`.
- Utilizadores com `reputation_score >= 40`: peso `1.10`.
- Utilizadores com `reputation_score >= 80`: peso `1.25`.
- O UI mostra contagens simples, mas a base já guarda `reputation_weight` por sinalização e o SQL já calcula estado com ponderação.

## Ecrãs incluídos

- Onboarding / login
- Mapa principal
- Detalhe da bomba
- Adicionar bomba
- Dashboard
- Perfil
- Alertas
- Administração

## Setup local

1. Entrar na pasta:

```bash
cd "/Users/rogerio.lam/Documents/New project/combustivel-maputo"
```

2. Instalar dependências:

```bash
npm install
```

3. Criar o ficheiro `.env.local` a partir de `.env.example`.

4. No Supabase:

- criar um projecto;
- activar `Google`, `Apple` e `Email` em `Authentication > Providers`;
- executar [`supabase/schema.sql`](/Users/rogerio.lam/Documents/New project/combustivel-maputo/supabase/schema.sql);
- configurar a URL de redirect para `http://localhost:3000/auth/callback`.

5. Arrancar localmente:

```bash
npm run dev
```

Guia mais amigável para primeira publicação:

- ver [GETTING-STARTED.md](/Users/rogerio.lam/Documents/New project/combustivel-maputo/GETTING-STARTED.md)

## Deploy

### Frontend na Vercel

1. Importar o repositório na Vercel.
2. Definir as variáveis:
   - `NEXT_PUBLIC_APP_URL`
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `ADMIN_EMAILS`
3. Fazer deploy com preset `Next.js`.
4. Adicionar o domínio final como redirect URL no Supabase Auth.

### Backend/BaaS no Supabase

1. Aplicar o schema SQL.
2. Configurar OAuth providers.
3. Opcional para alertas:
   - criar uma Edge Function ou Vercel Cron que consulte `alerts`;
   - detectar transições para `available`;
   - enviar browser push ou e-mail.

## Notificações MVP

- A UI de alertas já existe.
- O endpoint `app/api/notify/route.ts` serve como ponto inicial.
- Próximo passo simples: cron periódico a cada 5 minutos + Resend para e-mail + Web Push para browser notifications.

## Roadmap pós-MVP

1. Persistir formulários com Server Actions + Supabase real.
2. Adicionar `auth/callback`, logout e guardas de rota.
3. Implementar admin merge de duplicados com auditoria.
4. Activar push notifications reais.
5. Melhorar reputação com validação cruzada, streaks e detecção de abuso.
6. Preparar reuse de domínio para React Native / Expo.

## Notas

- O projecto tem fallback para dados mock quando o Supabase ainda não está configurado, o que acelera o arranque do MVP.
- O schema está preparado para evoluir sem reescrever a lógica principal.
- O callback de login já está preparado em [app/auth/callback/route.ts](/Users/rogerio.lam/Documents/New project/combustivel-maputo/app/auth/callback/route.ts).
- O mapa usa OpenStreetMap via Leaflet, sem exigir conta Mapbox.
- O acesso de administrador pode ser atribuído por e-mail via variável `ADMIN_EMAILS`.
