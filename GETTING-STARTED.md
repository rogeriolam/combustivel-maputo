# Publicar o MVP Sem Experiência

Este guia assume que vais usar:

- `GitHub` para guardar o código
- `Supabase` para base de dados e login
- `Vercel` para publicar o site
- `Leaflet + OpenStreetMap` para o mapa

## Visão simples

Pensa nestas 3 plataformas assim:

- `GitHub`: onde o teu código fica guardado online
- `Supabase`: onde ficam os dados da app e os logins
- `Vercel`: onde o site fica acessível ao público
- `OpenStreetMap`: base do mapa que aparece na app

Fluxo:

1. Criamos a app no teu Mac.
2. Enviamos o código para o GitHub.
3. Ligamos o GitHub à Vercel.
4. Ligamos a Vercel ao Supabase com variáveis de ambiente.
5. Publicamos.

## Passo 1: criar contas

Cria conta em:

- [GitHub](https://github.com/)
- [Supabase](https://supabase.com/)
- [Vercel](https://vercel.com/)

Não precisas de criar conta Mapbox.

## Passo 2: preparar o projecto no Mac

No Terminal:

```bash
cd "/Users/rogerio.lam/Documents/New project/combustivel-maputo"
cp .env.example .env.local
```

Depois abre o ficheiro `.env.local` e preenche mais tarde com os valores do Supabase.

## Passo 3: criar o projecto no Supabase

1. Entrar no Supabase.
2. Clicar em `New project`.
3. Dar nome:

```text
combustivel-maputo
```

4. Escolher password da base de dados e guardar bem.
5. Esperar a criação.

Depois:

1. Abrir `SQL Editor`.
2. Copiar o conteúdo de [schema.sql](/Users/rogerio.lam/Documents/New project/combustivel-maputo/supabase/schema.sql).
3. Executar.

## Passo 4: activar login

No Supabase:

1. Ir a `Authentication`.
2. Activar:
   - `Email`
   - `Google`
   - `Apple`

Para começar, podes activar só `Email` e `Google`.

### Redirect URLs

Adiciona estas URLs:

```text
http://localhost:3000/auth/callback
```

Mais tarde, quando a Vercel gerar o domínio final, adicionamos também:

```text
https://teu-projecto.vercel.app/auth/callback
```

## Passo 5: copiar as chaves do Supabase

No Supabase:

1. Ir a `Project Settings`.
2. Abrir `API`.
3. Copiar:
   - `Project URL`
   - `anon public key`
   - `service_role key`

Cola esses valores no `.env.local`.

## Passo 6: correr localmente

Quando estiveres pronto para instalar dependências:

```bash
npm install
npm run dev
```

Depois abre:

```text
http://localhost:3000
```

## Passo 7: enviar para GitHub

### Criar repositório no GitHub

No GitHub:

1. Clicar em `New repository`
2. Nome sugerido:

```text
combustivel-maputo
```

3. Criar sem README, porque o projecto já tem README.

### Enviar o projecto

No Terminal:

```bash
cd "/Users/rogerio.lam/Documents/New project/combustivel-maputo"
git init
git add .
git commit -m "Initial MVP"
git branch -M main
git remote add origin https://github.com/TEU-UTILIZADOR/combustivel-maputo.git
git push -u origin main
```

Substitui `TEU-UTILIZADOR` pelo teu nome de utilizador GitHub.

## Passo 8: publicar na Vercel

No Vercel:

1. Clicar em `Add New`
2. Escolher `Project`
3. Importar o repositório do GitHub
4. Confirmar que é um projecto `Next.js`
5. Antes do deploy, adicionar as variáveis de ambiente:
   - `NEXT_PUBLIC_APP_URL`
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`

### Valor de `NEXT_PUBLIC_APP_URL`

Primeiro deploy:

- podes deixar vazio e corrigir depois, ou
- usar temporariamente o domínio que a Vercel mostrar

Depois do deploy, actualiza:

```text
NEXT_PUBLIC_APP_URL=https://teu-projecto.vercel.app
```

## Passo 9: ligar o domínio da Vercel ao Supabase

Quando a Vercel te mostrar o domínio final:

1. Copia esse domínio.
2. Vai ao Supabase > Authentication > URL Configuration.
3. Adiciona:

```text
https://teu-projecto.vercel.app/auth/callback
```

## O que fazer primeiro, de forma prática

Se estiveres a começar do zero, segue esta ordem:

1. Criar contas GitHub, Supabase e Vercel.
2. Criar o projecto no Supabase.
3. Executar o SQL.
4. Preencher `.env.local`.
5. Instalar dependências.
6. Testar localmente.
7. Enviar para GitHub.
8. Publicar na Vercel.

## Se algo correr mal

Os problemas mais comuns costumam ser:

- chave errada no `.env.local`
- URL de callback em falta no Supabase
- OAuth Google/Apple ainda não configurado

Se quiseres, no próximo passo eu posso guiar-te exactamente assim:

1. criar o repositório GitHub
2. preparar o Supabase
3. configurar as variáveis
4. publicar na Vercel

um passo de cada vez, como se estivéssemos a fazer juntos no teu computador.
