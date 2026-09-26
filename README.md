# TechTogs

Site oficial: https://techtogs.com.br — atendimento: support@techtogs.com.br.
Landing page em HTML/CSS/JavaScript e Node.js, sem dependências de produção.

## Desenvolvimento

Node.js 20+; execute `npm start`. Prévia: http://localhost:3000.
Verificações: `npm run check`, `npm test` e `npm run build`.

## Hospedagem

O Railway executa `npm start`, com `/health` como verificação de disponibilidade. O repositório no GitHub continua sendo a fonte do código. O domínio oficial aponta para o serviço Railway pelo DNS.

O workflow do GitHub Pages publica uma demonstração estática sem envio de formulário. Essa versão tem `noindex` e URL canônica apontando para o site oficial.

## E-mail e formulário

Resend envia como `TechTogs <support@techtogs.com.br>`. Cloudflare Email Routing encaminha o recebimento de support para o Gmail definido pelo proprietário. O Gmail pode usar SMTP do Resend para responder como support; essa configuração é feita na conta do usuário.

Configure somente no ambiente privado do Railway:

- `NODE_ENV=production`
- `HOST=0.0.0.0`
- `RESEND_API_KEY`: chave restrita ao envio pelo domínio techtogs.com.br.
- `CONTACT_RECIPIENT`: caixa de atendimento indicada pelo proprietário.
- `CONTACT_WHATSAPP`: opcional, país e DDD, somente dígitos.
- `CONTACT_WEBHOOK_URL` e `CONTACT_WEBHOOK_TOKEN`: integração alternativa opcional. Resend tem prioridade quando configurado.
- `PORT`: fornecida pelo Railway.

Em produção, o formulário só confirma sucesso após aceitação pelo provedor. Sem integração, retorna indisponibilidade; não grava contatos no disco efêmero. Em desenvolvimento sem integração, salva a prévia em `data/leads.jsonl`, ignorada pelo Git.

O remetente e o destinatário são controlados pelo servidor. O e-mail informado pelo visitante é usado apenas como Reply-To. A proteção contra repetição fica em memória e é adequada a uma única instância; reavaliar para múltiplas réplicas. Atrás do Railway, usa o último endereço válido de X-Forwarded-For informado pelo proxy.

Não publique chaves em HTML, JavaScript do navegador, commits ou arquivos estáticos. As rotas públicas do servidor usam uma lista explícita de arquivos.

## DNS

Os valores de DKIM/CNAME vêm do painel do domínio no Resend. Os registros MX de recebimento vêm do Cloudflare Email Routing. Não habilitar o MX de recebimento do Resend simultaneamente: ele competiria com o encaminhamento ao Gmail. Usar o alvo e o TXT de verificação fornecidos pelo Railway para o domínio web.

## Conteúdo e marca

Os projetos e seus números são exemplos fictícios identificados na interface. WhatsApp não foi definido. Não há analytics nem cookies de publicidade. As fontes usam Google Fonts.

`assets/brand-horizontal.svg` compõe símbolo e lettering originais; `assets/brand-symbol.svg` enquadra o símbolo. Ambos incorporam a imagem oficial preservada em `assets/techtogs-logo.jpeg`. `assets/favicon.svg` adapta o emblema para pequenos tamanhos.
