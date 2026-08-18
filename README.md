# Reunião

Ferramenta interna de videoconferência: câmera, áudio e compartilhamento de tela, com uma área
administrativa (CRUD) para criar salas e definir as regras de entrada de cada uma.

Stack: Next.js 16 + Prisma 5 (Postgres/Neon) + shadcn/ui (Base UI) + [LiveKit Cloud](https://livekit.io)
para o motor de áudio/vídeo. Layout e paleta de cores copiados do projeto Elementa.

## Como funciona

- **`/`** — página pública: cole um link/código de sala para entrar.
- **`/sala/[slug]`** — pré-entrada (nome + senha, se houver) e a chamada em si.
- **`/salas`** e **`/configuracoes`** — área administrativa (protegida por uma senha única,
  `ADMIN_PASSWORD`): criar/editar/excluir salas e definir os padrões de sala nova.

Configurações por sala: senha opcional, máximo de participantes (validado contra o LiveKit em
tempo real), câmera/microfone ligados ao entrar, permitir compartilhar tela e sala de espera
(participante entra sem publicar/assistir até o anfitrião admitir — funciona via atualização de
permissões ao vivo do próprio LiveKit, sem infraestrutura extra).

## Setup local

1. **Neon Postgres**: crie um projeto gratuito em [neon.tech](https://neon.tech), copie a
   connection string pooled (`DATABASE_URL`) e a direta (`DATABASE_URL_UNPOOLED`).
2. **LiveKit Cloud**: crie um projeto gratuito em [cloud.livekit.io](https://cloud.livekit.io),
   copie a **API Key**, **API Secret** e a **URL do projeto** (`wss://xxx.livekit.cloud`).
3. Copie `.env.example` para `.env` e preencha as quatro variáveis acima + `ADMIN_PASSWORD`
   (senha da área administrativa) + `AUTH_SECRET` (qualquer string longa aleatória).
4. `npm install`
5. `npx prisma migrate deploy` (aplica a migration inicial no Neon)
6. `npm run dev`

## Deploy na Vercel

Este projeto não está conectado ao GitHub para deploy automático — deploy manual via CLI:

```bash
npx --yes vercel@latest link
npx --yes vercel@latest env add DATABASE_URL
npx --yes vercel@latest env add DATABASE_URL_UNPOOLED
npx --yes vercel@latest env add LIVEKIT_API_KEY
npx --yes vercel@latest env add LIVEKIT_API_SECRET
npx --yes vercel@latest env add LIVEKIT_URL
npx --yes vercel@latest env add ADMIN_PASSWORD
npx --yes vercel@latest env add AUTH_SECRET

npx --yes vercel@latest deploy --prod
```

O comando de build (`prisma migrate deploy && next build`) já aplica a migration no Neon a cada
deploy.
