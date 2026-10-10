# TechTogs

Site oficial: https://techtogs.com.br — atendimento: support@techtogs.com.br, WhatsApp +55 14 95978-1077 e Instagram https://www.instagram.com/tech_togs/.
Landing page em HTML/CSS/JavaScript e Node.js. A versão principal combina Motion e GSAP; esbuild prepara os pacotes locais.

## Desenvolvimento

Node.js 24 LTS; execute `npm ci` e depois `npm start`. A landing principal fica em http://localhost:3000.
Verificações: `npm run check`, `npm test` e `npm run build`.

Regressão de navegador: `npx playwright install chromium` e `npm run test:browser`.
Com Edge instalado, também é possível usar `BROWSER_CHANNEL=msedge` (PowerShell:
`$env:BROWSER_CHANNEL='msedge'`). O teste inicia um servidor temporário em loopback,
bloqueia origens externas e simula a entrega do formulário. O CI executa essas
verificações em PRs para `main` e pushes de `develop`, sem publicar o site.
Medição reproduzível dos pacotes: `node scripts/measure-motion.mjs`.
Evidências e limites: [`docs/qa-motion-2026-10-10.md`](docs/qa-motion-2026-10-10.md).
Regressões de teclado, diálogos e formulário móvel: [`docs/qa-accessibility-2026-10-10.md`](docs/qa-accessibility-2026-10-10.md).

### Três versões para comparação

Com `npm start`, abra:

- [Motion](http://localhost:3000/motion.html): entrada suave da apresentação e resposta dos nós ao passar o cursor ou testar o fluxo.
- [GSAP](http://localhost:3000/gsap.html): sequência de entrada da apresentação e progressão das etapas ao chegar à seção “Como trabalhamos”.
- [Motion + GSAP](http://localhost:3000/motion-gsap.html): sequência narrativa do GSAP e interação do fluxo com Motion.

O usuário escolheu Motion + GSAP como versão principal em `/`. As três páginas de comparação reutilizam o conteúdo e os estilos da base aprovada. O build gera HTML e pacotes JavaScript locais, sem CDN, e inclui a landing principal e as três prévias em `dist/`. As prévias têm `noindex`; com preferência por movimento reduzido, as animações adicionais são desativadas.

## Hospedagem

O Railway executa `npm start`, com `/health` como verificação de disponibilidade. Configure esses parâmetros no painel do serviço; novos serviços não aceitam o antigo `railway.json`. O repositório no GitHub continua sendo a fonte do código. O domínio oficial aponta para o serviço Railway pelo DNS.

O workflow do GitHub Pages publica uma demonstração estática sem envio de formulário. Essa versão tem `noindex` e URL canônica apontando para o site oficial.

## E-mail e formulário

Resend envia como `TechTogs <support@techtogs.com.br>`. Cloudflare Email Routing encaminha o recebimento de support para o Gmail definido pelo proprietário. O Gmail pode usar SMTP do Resend para responder como support; essa configuração é feita na conta do usuário.

Configure somente no ambiente privado do Railway:

- `NODE_ENV=production`
- `HOST=0.0.0.0`
- `RESEND_API_KEY`: chave restrita ao envio pelo domínio techtogs.com.br.
- `CONTACT_RECIPIENT`: caixa de atendimento indicada pelo proprietário.
- `CONTACT_WEBHOOK_URL` e `CONTACT_WEBHOOK_TOKEN`: integração alternativa opcional. Resend tem prioridade quando configurado.
- `PORT`: fornecida pelo Railway.

Em produção, o formulário só confirma sucesso após aceitação pelo provedor. Sem integração, retorna indisponibilidade; não grava contatos no disco efêmero. Em desenvolvimento sem integração, salva a prévia em `data/leads.jsonl`, ignorada pelo Git.

O remetente e o destinatário são controlados pelo servidor. O e-mail informado pelo visitante é usado apenas como Reply-To. A proteção contra repetição fica em memória e é adequada a uma única instância; reavaliar para múltiplas réplicas. Atrás do Railway, usa o último endereço válido de X-Forwarded-For informado pelo proxy.

Não publique chaves em HTML, JavaScript do navegador, commits ou arquivos estáticos. As rotas públicas do servidor usam uma lista explícita de arquivos.

## DNS

Os valores de DKIM/CNAME vêm do painel do domínio no Resend. Os registros MX de recebimento vêm do Cloudflare Email Routing. Não habilitar o MX de recebimento do Resend simultaneamente: ele competiria com o encaminhamento ao Gmail. Usar o alvo e o TXT de verificação fornecidos pelo Railway para o domínio web.

## Conteúdo e marca

O design system adotado para a identidade visual da TechTogs está em [`docs/identidade-visual/`](docs/identidade-visual/README.md). Consulte as especificações em Markdown, o catálogo HTML e o registro da [identidade aplicada](DESIGN.md) antes de mudar a aparência da landing page. O tema escuro é a apresentação inicial escolhida pelo proprietário.

Os projetos e seus números são exemplos fictícios identificados na interface. WhatsApp não foi definido. Não há analytics nem cookies de publicidade. As fontes usam Google Fonts.

`assets/brand-horizontal.svg` compõe símbolo e lettering originais; `assets/brand-symbol.svg` enquadra o símbolo. Ambos incorporam a imagem oficial preservada em `assets/techtogs-logo.jpeg`. `assets/favicon.svg` adapta o emblema para pequenos tamanhos.
