# Matter View

Ferramenta interna de videoconferência da Matter: câmera, áudio, compartilhamento de tela e uma
área administrativa completa. Login obrigatório para todo mundo — não existe entrada anônima.

Stack: Next.js 16 (App Router) + Prisma 5 (Postgres/Neon) + shadcn/ui (Base UI) +
[LiveKit Cloud](https://livekit.io) para o motor de áudio/vídeo + Vercel Blob para uploads
(fotos, logo, sons, fundos). Layout e paleta copiados do projeto Elementa, com marca, cores,
logo e favicon customizáveis pelo admin sem precisar de deploy.

## Funcionalidades

**Contas e acesso**
- Login por e-mail/senha (sem conta, sem entrada — inclusive em links de sala).
- Dois papéis: `ADMIN` (gerencia salas, usuários, equipes e configurações) e `USER`.
- Importação de usuários em massa por planilha Excel (nome, e-mail, cargo).
- Foto de perfil com reposicionamento/zoom (aparece no lugar da câmera quando ela está desligada).

**Salas e reuniões**
- Salas permanentes (admin), salas de equipe (sempre visíveis em "Equipes" pra qualquer um
  entrar) e salas instantâneas (qualquer usuário, um clique).
- Agendamento de reunião (nome, data, hora) direto pela home.
- Reunião secreta: opção ao criar/agendar uma sala pra ela não aparecer em "Acontecendo agora"
  pra ninguém além de quem for explicitamente convidado.
- Por sala: senha opcional, máximo de participantes, câmera/mic ligados ao entrar, permitir
  compartilhar tela, sala de espera (aprovação do anfitrião via permissões ao vivo do LiveKit).
- Home: ações rápidas, entrar com link/código, "Acontecendo agora" (reuniões ao vivo que você
  pode entrar), últimas reuniões e próximas agendadas.
- Busca (header): salas suas/que você já entrou e pessoas cadastradas, por nome ou cargo.

**Dentro da chamada**
- Prévia antes de entrar: testa câmera/mic (com medidor de nível de áudio), escolhe dispositivo,
  já escolhe o fundo virtual — tudo isso usando as mesmas tracks que são publicadas na chamada de
  verdade (evita pedir permissão de câmera/mic duas vezes, que é a causa mais comum de "mic não
  funciona" nesse tipo de app).
- Fundo virtual (desfoque ou imagem) e filtro de anti-ruído (Krisp).
- Compartilhamento de tela com áudio do sistema, zoom (1x–3x, local por quem olha) e qualidade
  ajustada especificamente pra texto/planilha (não herda mais o perfil de vídeo da câmera).
- Zoom local por câmera de participante (1x/1.5x/2x), não afeta o que os outros veem.
- Soundboard compartilhado (todos ouvem o som tocado, com volume individual por pessoa).
- Lousa colaborativa sobre o compartilhamento de tela, com permissão pedida ao apresentador.
- Levantar a mão (badge + borda colorida no quadro de vídeo).
- Chat lateral, com opção de abrir/fechar.
- Transcrição simultânea (Web Speech API) com relatório baixável por pessoa ao final — nunca
  fica salva no servidor.
- Botão de convite (copiar link) direto no cabeçalho e no painel de participantes.
- Grade prioriza quem está com câmera ligada.
- Encerramento automático por inatividade: sem câmera, tela ou fala de ninguém por 10 minutos
  encerra a sala de verdade (via `deleteRoom` do LiveKit, não só desconecta localmente) — aviso
  2 minutos antes. Existe porque o LiveKit cobra por minuto ativo.

**Administração**
- **Salas**: CRUD completo + painel "Reuniões ao vivo" (toda reunião em andamento agora, com
  participantes e há quanto tempo está rolando — vê tudo, inclusive reuniões secretas).
- **Usuários**: CRUD, import por planilha, reposicionamento de foto.
- **Equipes**: listagem das salas de equipe.
- **Configurações**: marca (nome, logo, favicon — com recorte/zoom), cores (destaque, e das três
  seções do menu), padrões de sala nova.
- Sininho de notificações: alguém entrou numa sala sua, ou uma reunião sua agendada começa em
  menos de 1h.
- Indicador de quem está online (barra lateral esquerda) — só pinga presença de verdade enquanto
  a pessoa está numa página do app OU numa chamada.

## Padrões de arquitetura que vale saber antes de mexer

- **Provider sempre montado + painel só de UI**: soundboard, fundo virtual, transcrição, lousa,
  mão levantada e o guardião de inatividade são todos "Provider" montados uma vez no topo da
  chamada (`CallRoom`), independente de o painel correspondente estar aberto na tela. Isso evita
  o bug clássico de "só funciona pra quem abriu o painel" — já aconteceu duas vezes (soundboard e
  transcrição) antes de virar convenção fixa.
- **Fuso horário**: qualquer coisa que mostre "hoje"/"amanhã"/hora de agendamento precisa fixar
  `timeZone: "America/Sao_Paulo"` explicitamente nos `Intl.DateTimeFormat`, tanto no client
  quanto (principalmente) no server — o runtime da Vercel roda em UTC, então sem isso a hora sai
  errada silenciosamente.
- **Memoização de request**: `getCurrentUser`/`getSession`/`getAppSettings` são envolvidos em
  `cache()` do React porque são chamados várias vezes por página (layout, shell, página em si) —
  sem isso, cada chamada repete a consulta no Postgres.

## Setup local

1. **Neon Postgres**: crie um projeto gratuito em [neon.tech](https://neon.tech), copie a
   connection string pooled (`DATABASE_URL`) e a direta (`DATABASE_URL_UNPOOLED`).
2. **LiveKit Cloud**: crie um projeto gratuito em [cloud.livekit.io](https://cloud.livekit.io),
   copie a **API Key**, **API Secret** e a **URL do projeto** (`wss://xxx.livekit.cloud`).
3. **Vercel Blob**: crie um Blob Store no dashboard da Vercel e linke ao projeto — em produção o
   token é injetado automaticamente; localmente, rode `vercel env pull` depois do `vercel link`.
4. Copie `.env.example` para `.env` e preencha as variáveis do passo 1 e 2 + `AUTH_SECRET`
   (qualquer string longa aleatória, assina o cookie de sessão).
5. `npm install`
6. `npx prisma migrate deploy` (aplica as migrations no Neon)
7. `npm run dev`

O primeiro admin precisa ser criado direto no banco (não há tela de "criar primeira conta") —
depois disso, todo o resto de usuários é gerenciado pela própria UI em **Usuários**.

## Deploy na Vercel

```bash
npx --yes vercel@latest link
npx --yes vercel@latest deploy --prod
```

O comando de build (`prisma migrate deploy && next build`) já aplica as migrations pendentes no
Neon a cada deploy. Depois de cada deploy em produção é preciso re-apontar o alias customizado,
já que ele não segue automaticamente a última produção:

```bash
npx --yes vercel@latest alias set reuniao-two.vercel.app matter-reuniao.vercel.app
```

## GitHub

Código também espelhado em [github.com/juvanamatter/view](https://github.com/juvanamatter/view)
— branches `main` (histórico completo) e `feature/mvp-inicial` (a que está de fato em produção).
