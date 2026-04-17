# Project Status

## Resumo rápido

Projecto: `Combustível Maputo`

URL pública actual:

- `https://combustivel-maputo.vercel.app`

Estado actual:

- Landing page pública em `/`
- Mapa público em `/map`
- Login Google funcional
- Login por e-mail preparado
- Perfil autenticado funcional
- Admin funcional para `rogerio.lam@gmail.com`
- Supabase ligado
- Deploy na Vercel funcional

## Objectivo do produto

App web mobile-first para Maputo e Matola que ajuda a comunidade a perceber quais bombas têm Gasolina ou Diesel, num contexto de escassez de combustível em Moçambique.

Princípio de produto assumido:

- leitura do mapa é pública
- login é opcional
- a app só é útil se a comunidade a alimentar com informação real
- contribuições mais sensíveis devem exigir autenticação

## Stack usada

- `Next.js`
- `Supabase`
- `Postgres`
- `Supabase Auth`
- `Leaflet + OpenStreetMap`
- `Vercel`

## Estrutura funcional actual

- `/`
  - landing page pública
- `/map`
  - mapa público com filtros
- `/auth`
  - onboarding e login
- `/profile`
  - perfil do utilizador ou modo visitante
- `/admin`
  - área de administração, protegida por role

## Decisões importantes tomadas

### 1. Mapa sem Mapbox

Decisão:

- substituir `Mapbox` por `Leaflet + OpenStreetMap`

Motivo:

- evitar dependência de cartão de crédito
- simplificar o arranque do MVP

Impacto:

- mapa funcional sem custo inicial adicional
- arquitectura continua simples e reutilizável

### 2. Leitura pública, login opcional

Decisão:

- o mapa deve ser público
- login não deve ser obrigatório para consultar a app

Motivo:

- reduzir atrito
- permitir valor imediato para qualquer pessoa

Consequência:

- foi criada uma landing page pública
- o mapa foi movido para `/map`

### 3. Método de trabalho acordado

Decisão:

- validar sempre localmente com `npm run build` antes de fazer `push`

Motivo:

- evitar descobrir erros só na Vercel
- reduzir tentativas falhadas de deploy

## Passos percorridos

### Fase 1: criação do projecto

- foi criado um novo projecto em:
  - `/Users/rogerio.lam/Documents/New project/combustivel-maputo`
- foi feita a estrutura base em Next.js
- foram criados ecrãs iniciais:
  - mapa
  - detalhe da bomba
  - dashboard
  - perfil
  - alertas
  - administração

### Fase 2: GitHub

- foi criado o repositório:
  - `https://github.com/rogeriolam/combustivel-maputo`
- o código foi enviado para a branch `main`

### Fase 3: Supabase

- foi criado o projecto Supabase
- o schema SQL foi executado com sucesso
- foi activado login por:
  - `Email`
  - `Google`
- foi configurado o Google OAuth no Google Cloud

### Fase 4: Vercel

- o projecto foi importado a partir do GitHub
- as variáveis de ambiente foram configuradas
- o deploy público ficou disponível

### Fase 5: autenticação e admin

- o fluxo de login Google foi corrigido
- o utilizador passou a aparecer em `Authentication > Users`
- o perfil passou a ser criado/actualizado em `profiles`
- o teu e-mail ficou com `role = admin`
- a rota `/admin` ficou protegida
- o menu `Admin` só aparece para administradores

### Fase 6: landing page pública

- a homepage deixou de ser o mapa
- passou a ser uma landing page com hero
- o mapa público foi movido para `/map`

## Erros encontrados e soluções adoptadas

### 1. Erros de typed routes no build da Vercel

Problema:

- vários componentes com `Link` e `router.replace` falhavam no build por causa de `typedRoutes`

Exemplos:

- `app-shell.tsx`
- `page-header.tsx`
- callback auth

Solução:

- tipar os `href` com `Route`
- corrigir `next.config.ts`
- ajustar chamadas que usavam `string`

### 2. Warning CSS com `align-items: start`

Problema:

- warning do autoprefixer

Solução:

- trocar para `align-items: flex-start`

### 3. Erros de tipos no Supabase server client

Problema:

- parâmetro `cookieValues` sem tipo explícito

Solução:

- tipagem explícita usando `CookieOptions`

### 4. Erro com `useSearchParams` no callback

Problema:

- a página `/auth/callback` falhava no build por uso de `useSearchParams` sem `Suspense`

Solução inicial:

- envolver em `Suspense`

Solução final adoptada:

- abandonar callback cliente e voltar para callback de servidor

### 5. Erro PKCE no login Google

Mensagem observada:

- `PKCE code verifier not found in storage`

Causa:

- o fluxo de callback em client-side estava frágil para este cenário

Solução:

- mover o callback de autenticação para `route.ts`
- concluir o `exchangeCodeForSession` no servidor

### 6. Confusão entre login Vercel e login da app

Problema:

- a protecção da Vercel estava activa
- ao entrar parecia que o utilizador estava a fazer login na app, mas estava a autenticar-se na Vercel

Solução:

- desactivar `Vercel Authentication` em `Deployment Protection`

### 7. Testes feitos em domínio errado

Problema:

- uso do domínio aleatório do deployment, por exemplo:
  - `combustivel-maputo-cji...vercel.app`

Consequência:

- cookies e sessão inconsistentes
- versões diferentes da app

Solução:

- passar a usar sempre o domínio estável:
  - `https://combustivel-maputo.vercel.app`

### 8. Utilizador aparecia em `auth.users` mas não em `profiles`

Problema:

- o perfil não existia

Solução:

- criação manual inicial por SQL
- depois ajuste do fluxo para bootstrap automático do perfil

### 9. UX do perfil confundia visitante com utilizador autenticado

Problema:

- aparecia `Convidado`
- havia botão `Terminar sessão` mesmo sem sessão útil

Solução:

- separar claramente:
  - `Modo visitante`
  - `Sessão activa`
- mostrar opções de login a visitantes

## Configuração do Supabase

### O que foi feito

1. Criar projecto
2. Executar `supabase/schema.sql`
3. Activar `Email`
4. Configurar `Google`
5. Definir URLs:
   - `Site URL = https://combustivel-maputo.vercel.app`
   - `Redirect URL = https://combustivel-maputo.vercel.app/auth/callback`

### Onde encontrar coisas importantes

- `Authentication > Users`
  - para ver utilizadores autenticados
- `Authentication > URL Configuration`
  - para `Site URL` e `Redirect URLs`
- `Settings > General`
  - para `Project ID`
- `Settings > API Keys`
  - para `Publishable key`
  - para `Secret key`
- `SQL Editor`
  - para correr queries SQL
- `Table Editor`
  - para inspeccionar tabelas como `profiles`

### Variáveis relevantes usadas

```env
NEXT_PUBLIC_SUPABASE_URL=https://kleiahlfiukxzjazchqf.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
ADMIN_EMAILS=rogerio.lam@gmail.com
```

## Configuração do Google OAuth

### O que foi feito

1. Criar projecto no Google Cloud
2. Configurar branding/app consent
3. Criar `OAuth client`
4. Tipo:
   - `Web application`
5. Definir origin para produção:
   - `https://combustivel-maputo.vercel.app`
6. Manter callback do Supabase:
   - `https://kleiahlfiukxzjazchqf.supabase.co/auth/v1/callback`

## Configuração da Vercel

### O que foi feito

1. Importar repositório GitHub
2. Confirmar preset `Next.js`
3. Definir variáveis de ambiente
4. Fazer deploy
5. Passar a usar domínio estável:
   - `https://combustivel-maputo.vercel.app`
6. Desactivar `Vercel Authentication`

### Variáveis de ambiente relevantes

```env
NEXT_PUBLIC_APP_URL=https://combustivel-maputo.vercel.app
NEXT_PUBLIC_SUPABASE_URL=https://kleiahlfiukxzjazchqf.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
ADMIN_EMAILS=rogerio.lam@gmail.com
EMAIL_NOTIFICATION_FROM=rogerio.lam@gmail.com
```

### Lição importante

Não usar links aleatórios de deployment para testes funcionais de login.

Usar sempre:

- `https://combustivel-maputo.vercel.app`

## Estado actual do produto

### Funciona

- landing pública
- mapa público
- login Google
- perfil autenticado
- admin
- logout

### Ainda por fazer

- exigir autenticação para contribuir:
  - adicionar bomba
  - sinalizar combustível
  - alertas
  - histórico pessoal
- ligar formulários reais ao Supabase
- melhorar UX visual final
- melhorar destino pós-login/logout

## Próximos passos recomendados

1. Exigir login para contribuições
2. Ligar formulários reais ao Supabase
3. Implementar escrita real de sinalizações
4. Implementar criação real de bombas
5. Melhorar dashboard e alertas
6. Refino visual e UX final

## Regra operacional para o futuro

Antes de cada deploy:

```bash
npm run build
```

Só depois:

```bash
git add .
git commit -m "..."
git push
```
