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

- o utilizador não percebia claramente se estava autenticado ou em modo visitante

Solução:

- distinção explícita entre visitante e autenticado no perfil
- botões de login visíveis só para visitante
- logout coerente com a nova landing

## Evolução posterior

### Fase 7: generalização para Moçambique inteiro

- o produto deixou de estar focado só em Maputo/Matola
- os filtros passaram para `província`
- o formulário de nova bomba passou a aceitar:
  - província
  - cidade / distrito / localidade
  - bairro / referência
- o mapa passou a abrir com visão nacional

### Fase 8: migração geográfica no Supabase

- foi criada e executada a migração:
  - `supabase/migrations/2026-04-17-national-geography.sql`
- a tabela `stations` deixou de depender de `city`
- a view `stations_with_current_status` foi recriada

Erro encontrado:

- a migração falhou inicialmente porque a view dependia da coluna `city`

Solução:

- remover primeiro a view
- alterar o schema
- recriar a view no fim

### Fase 9: mapa público e acções protegidas

- leitura do mapa continua pública
- visitantes passaram a ser bloqueados em:
  - `/stations/new`
  - actualização de bombas
  - `/alerts`
- o login preserva agora o destino protegido original

Exemplo:

- se o utilizador entrar a partir de `/stations/new`, depois do login volta a `/stations/new`

### Fase 10: criação real de bombas e sinalizações

- criação de bomba ligada ao Supabase
- primeira sinalização opcional ligada ao Supabase
- sinalização no detalhe da bomba ligada ao Supabase
- validação GPS activa no fluxo real
- bloqueio de duplicados activo no servidor

### Fase 11: administração com remoção

- foi criada rota administrativa para remover bombas
- a remoção apaga a bomba e o histórico associado via `on delete cascade`
- o botão `Remover` ficou disponível na área de administração

### Fase 12: zoom por província

- ao seleccionar uma província, o mapa já faz zoom e recentra para essa zona

### Fase 13: foco do mapa na localização actual

- sem província seleccionada, o mapa tenta recentrar pela localização GPS do utilizador

### Fase 14: melhoria do fluxo de actualização de combustível

- o ecrã deixou de usar dropdown por combustível
- passou a permitir seleccionar directamente:
  - `Gasolina = Tem / Não tem`
  - `Diesel = Tem / Não tem`
- foi adicionado botão final:
  - `Guardar actualização`

### Fase 15: histórico mais auditável

- o histórico da bomba passa a mostrar:
  - combustível
  - estado
  - utilizador
  - data/hora
  - distância no momento do registo
- o cartão do combustível passou a mostrar data/hora exacta da última actualização
- o popup do mapa passou a mostrar a última actualização

## Erro mais recente encontrado

### 10. Erro RLS recursivo na gravação de sinalizações

Mensagem observada:

- `infinite recursion detected in policy for relation "profiles"`

Causa:

- as políticas RLS de `profiles` consultavam a própria tabela `profiles`, o que gerava recursão ao tentar gravar/ler sinalizações ligadas ao utilizador

Solução adoptada:

- correcção manual no Supabase via SQL Editor:
  - `profiles_select_self` passou a permitir apenas `auth.uid() = id`
  - `profiles_update_self` passou a permitir apenas `auth.uid() = id`
- foi criado também o ficheiro local:
  - `supabase/migrations/2026-04-17-fix-profiles-rls-recursion.sql`

## Sessão de 2026-04-18

### Fase 16: CTA de contribuição na lista de bombas

- em `station-list.tsx` foi adicionado um card de acção no topo da lista:
  - visitante vê `Quer contribuir?` + botão `Entrar para sinalizar`
  - autenticado vê `Pronto para contribuir` + instrução para clicar numa bomba

### Fase 17: melhoria do fluxo de login para páginas protegidas

- o login passou a preservar o destino original (`next`)
- exemplos:
  - `/stations/new`
  - `/alerts`
  - `/stations/[id]`
- o callback de auth devolve agora ao ecrã protegido correcto após login

### Fase 18: criação e remoção de bomba

- foi testado o registo de uma bomba fictícia com sucesso
- a área de administração já permite remover uma bomba e o histórico associado

### Fase 19: melhoria do ecrã de sinalização

- removido o dropdown por combustível
- introduzido fluxo:
  - seleccionar `Gasolina = Tem/Não tem`
  - seleccionar `Diesel = Tem/Não tem`
  - carregar `Guardar actualização`
- adicionado resumo:
  - `Por guardar: ...`

### Fase 20: data/hora e auditoria

- o detalhe da bomba passou a mostrar:
  - utilizador
  - data/hora
  - distância
- o cartão do combustível mostra a última actualização com data/hora exacta
- o mapa passou a ter tooltip com a última actualização

### Fase 21: foco do mapa na localização actual

- sem província seleccionada, o mapa tenta recentrar pela localização GPS do utilizador

### Fase 22: melhoria visual do estado conflito

- a variável CSS foi ajustada:
  - `--status-conflict: #c85a00`

### Fase 23: CTA visual em `/map`

- foi adicionado `action-card` com styling próprio
- o card ajuda a transformar visitantes em contribuidores autenticados

## Commits recentes

- `7321e98` Collapse province filters on mobile
- `13dd78d` Adjust conflict status color for better contrast
- `abe65ab` Add contribution call-to-action to station list
- `586a244` Improve station update flow and map tooltip feedback
- `3cfec0b` Fix signal save recursion and focus map on current location
- `5b1bddc` Improve reporting flow and show last update timestamps
- `a7908ff` Show signal author and timestamp in station history
- `9b6b9bc` Simplify station reporting actions

## Estado exacto no fim desta sessão

- o `PROJECT-STATUS.md` foi actualizado
- o utilizador vai fazer pausa e retomar amanhã
- a app já suporta:
  - landing pública
  - mapa público
  - login opcional
  - criação real de bomba
  - sinalização real com GPS
  - remoção administrativa de bomba

## Ponto de retoma sugerido para amanhã

1. validar no browser se:
   - o tooltip mostra sempre a última actualização correcta
   - o mapa foca bem a localização actual ao voltar para `/map`
   - o fluxo de sinalização está estável após múltiplas actualizações
2. depois decidir entre:
   - melhorar UX visual final
   - ou continuar a robustecer a lógica de alertas/notificações

- `infinite recursion detected in policy for relation "profiles"`

Causa:

- a leitura de `profiles` dentro da leitura das sinalizações entrava em conflito com as políticas RLS

Solução adoptada:

- guardar `reporter_name` e `reporter_email` no campo `meta` da própria sinalização
- ler o histórico da sinalização a partir desse `meta`, sem depender da relação com `profiles`

## Estado exacto no fim desta sessão

- o código mais recente já foi:
  - `commit`
  - `push`
- o utilizador **não testou ainda** esta última versão no browser

## Teste pendente para amanhã

Testar em `https://combustivel-maputo.vercel.app`:

1. abrir uma bomba existente
2. seleccionar:
   - `Gasolina = Tem` ou `Não tem`
   - `Diesel = Tem` ou `Não tem`
3. carregar em `Guardar actualização`
4. confirmar:
   - que a actualização é guardada sem erro
   - que aparece no histórico com utilizador e data/hora
   - que o popup do mapa mostra a última actualização
5. voltar ao mapa e confirmar:
   - foco na localização actual quando não há província seleccionada

## Regras de trabalho a manter

- antes de qualquer `push`, validar sempre localmente com:
  - `npm run build`
- usar sempre o domínio estável:
  - `https://combustivel-maputo.vercel.app`
- manter `PROJECT-STATUS.md` apenas local

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

## Actualização de 2026-04-19

### O que ficou concluído hoje

- Primeiro sprint de UX/UI no mapa e detalhe da bomba:
  - bloco introdutório no `/map`
  - lista de bombas mais legível
  - resumo rápido no topo do detalhe da bomba
- Ajuste de paleta visual:
  - menos verde estrutural
  - base mais quente (creme / areia / terracota)
  - verde mantido sobretudo para o estado `Tem`
- Simplificação da navegação mobile:
  - `Admin` saiu da bottom nav
  - `Admin` passou para botão flutuante próprio
  - legenda do mapa ficou colapsável
- Simplificação do fluxo de sinalização:
  - escolher -> rever -> guardar
  - bloco `Por guardar`
  - feedback mais claro
- Alteração estrutural de produto decidida e implementada localmente:
  - qualquer pessoa pode sinalizar combustível
  - apenas autenticados podem criar bombas
  - apenas admin pode remover bombas
- Migração Supabase aplicada com sucesso para suportar sinalizações anónimas:
  - ficheiro: `supabase/migrations/2026-04-19-open-anonymous-signals.sql`
  - nota: no alerta do Supabase, foi necessário usar `Run without RLS` porque o editor interpretou a variável PL/pgSQL `station_geom` como se fosse uma tabela nova
- Código local já preparado para visitantes sinalizarem no detalhe da bomba sem login
- `npm run build` passou depois destas alterações
- `git push` da alteração para permitir sinalizações anónimas já foi feito

### Estado exacto no fim de hoje

- a migração no Supabase já foi executada com sucesso
- o código já foi enviado
- o próximo passo não é programar: é testar no browser a nova regra de produto

### Ponto de retoma para amanhã

Testar este fluxo na app publicada:

1. Abrir uma bomba sem login
2. Fazer uma sinalização como visitante
3. Confirmar que guarda sem erro
4. Confirmar que o histórico reflecte a actualização
5. Confirmar que `/stations/new` continua a exigir login
6. Confirmar que `/admin` continua reservado ao admin

### Se tudo correr bem amanhã

Próximo passo recomendado:
- continuar a sprint de UX/UI
- refinar ainda mais o detalhe da bomba e o feedback visual após guardar
