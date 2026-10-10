# Publicação e recebimento incerto — terceiro lote

Lote isolado em `codex/third-lot-20261010`, base publicada
`defbcca8350901beb49cdab52570044b3c1e7b71`. Preserva marca, geometria,
animações, envio/provedor, dependências, pins e configurações reais. O backend
recebe apenas a distinção entre erro de entrada e de entrega e a mensagem 503
conservadora; o contrato válido 201/message/id permanece.

## Publicação conferida, somente GET

A API de Pages confirmou `https://vinnitog.github.io/techtogs-landing-page/`,
sem CNAME, e deployment do mesmo HEAD. Também foi conferido o site oficial
`https://techtogs.com.br/`, documentado no README. O estado do deployment não
substituiu a comparação de conteúdo: 8 GETs por origem, timeout individual
de 10s, nenhum POST, API de contato, provedor ou formulário real.

| Arquivo | Pages bytes | Oficial bytes |
| --- | ---: | ---: |
| HTML principal | 26.628 | 26.532 |
| app.js antes deste lote | 11.282 | 11.282 |
| styles.css | 53.027 | 53.027 |
| Motion + GSAP | 127.451 | 127.451 |
| brand-horizontal.svg | 48.965 | 48.965 |
| favicon.svg | 655 | 655 |
| política de privacidade | 4.350 | 4.350 |
| sistemas sob medida | 8.514 | 8.465 |

16/16 HTTP 200 e conteúdo correspondente ao artefato próprio de cada origem
após CRLF → LF. O bundle Motion + GSAP coincide byte a byte, SHA256
`0fdf3b4b8e5f29f762d3a91375e2d410029902d3dab7370f0931187a144dd852`,
confirmando que a redução anterior de 172.585 → 127.451 bytes está publicada.
CSS SHA `803d7353b9f2d539194b2cf4136c1ca4ba3130ccaaa09b96bcc0ef62388282a2`.
O HTML Pages é intencionalmente diferente: `data-hosting="static"`, noindex,
formulário demonstrativo e nenhuma entrega. A página de serviço também recebe
noindex no build. Não comparamos Pages com o HTML de produção como se fossem iguais.

Pages: `cache-control: max-age=600`, `age: 0`, gzip em todos os oito recursos,
last-modified de 10/10/2026 16:59:04–05 GMT. Oficial: `cache-control: no-cache`,
sem age/last-modified/content-encoding informado nessas oito respostas.
`no-cache` exige revalidação; não é uma declaração de que o browser nunca guarda
o arquivo. Isso descreve essa amostra HTTP, não todas as regiões/clientes.

Os oito recursos somam 280.872 bytes Pages e 280.727 no oficial, decodificados,
excluindo fontes Google, outros assets e variantes. Bytes ou falta de encoding
nessa amostra não demonstram LCP/INP/latência; não alegamos Web Vitals nem
alteramos o servidor/CDN para preencher este lote. Avaliar negociação/compressão
real em navegador continua um próximo experimento possível. Fontes externas
ficam bloqueadas nas fixtures, portanto sua tipografia online não foi homologada.

## Defeito de confirmação e correção mínima

O backend local retorna HTTP 201 com JSON `message` textual e `id` após sua
etapa de entrega/prévia. O frontend já usava `response.ok`, preservado: sucesso
2xx válido com mensagem continua aceito. O cliente depende dessa confirmação
textual; ela não comprova que o destinatário final leu o e-mail.

Antes, HTTP 200 com `{}` apagava os campos e deixava o status vazio. O novo caso
falhou no original esperando uma confirmação que nunca aparecia. Agora JSON
2xx sem mensagem textual não vazia é tratado como confirmação ausente; o draft
e consentimento permanecem. Timeout, erro de rede, JSON inválido e confirmação
ausente informam que o recebimento não pôde ser confirmado e orientam conferir
com a equipe pelos contatos já existentes **antes de reenviar**. As mensagens
anteriores incentivavam nova tentativa após falha ambígua.

Na revisão independente, a resposta 503 do catch real do backend foi reproduzida
por interceptação: um timeout/aceitação não confirmada do Resend pode chegar antes
do limite de 15s do cliente e ainda dizia `Tente novamente`. O caso novo falhou
antes do ajuste. Agora **5xx também é confirmação incerta**, antes de interpretar
o corpo; vale inclusive para um gateway 502 com HTML. Um erro interno explícito
`CONTACT_UNCONFIRMED` diferencia esses estados de JSON realmente inválido.
Não fabricamos `SyntaxError` para uma resposta JSON válida sem confirmação.

A revisão também reproduziu um erro no servidor: uma resposta 202 fictícia do
Resend com JSON inválido era capturada como `SyntaxError` e retornava 400,
confundindo falha de confirmação do provedor com validação do visitante. A
regressão offline falhou com 400 antes da correção e passou com 503 depois.
O servidor agora registra a conclusão da validação de entrada; somente antes
desse ponto erros de parsing/tipo são 400. Falhas posteriores mantêm 503, com
mensagem que orienta conferir com a equipe antes de reenviar. O log continua
limitado ao nome do erro, sem corpo da solicitação ou resposta do provedor.

Erros HTTP 4xx definitivos continuam exibindo sua mensagem; sucesso válido limpa
o formulário como antes. Não alteramos timeout nativo de 15s, provider/UUID,
transporte, rate limit, destinatário, configuração, CSS ou endpoint. Não existe
retry automático, nova entrega ao fechar página ou contato externo deste lote.
O botão continua disponível para ação manual após liberação da guarda; a
orientação de conferir recebimento não é uma reconciliação técnica de servidor.

## QA e limites

Nove novos cenários Edge reais, somente loopback/rotas interceptadas:

- Rede abortada, JSON inválido, HTTP 200 sem mensagem e HTTP 201 com mensagem
  em branco: valores/consentimento preservados, status acessível de entrega
  incerta, guarda liberada e somente um POST fictício.
- Timeout **nativo** de 15s sobre request interceptado sem resposta, sem relógio
  falso ou redução do limite: draft preservado e orientação conservadora.
- HTTP 503 com o texto atual e anterior do catch do servidor e HTTP 502 com HTML: nenhum
  incentivo ao retry cego, campos/consentimento preservados, um POST fictício.
- HTTP 400 conserva sua mensagem; tentativa manual com HTTP 201 válido limpa
  campos/consentimento, demonstrando que sucesso e erro definitivo não regrediram.

Gates finais: `npm run check`, 5/5 testes Node e build estático aprovados. A nova
fixture HTTP do servidor sobrescreve inteiramente `fetch`, aceita somente o URL
esperado do provedor e responde em memória: JSON de entrada malformado, null,
array, campo com tipo inválido e consentimento negado retornam 400 sem chamadas
ao provedor fictício; resposta 202 com JSON inválido retorna 503 após uma única
chamada, sem retry; a próxima solicitação manual recebe 201/message/id após
confirmação válida. O stderr contém apenas `Falha no recebimento de contato:
SyntaxError`. Nenhum transporte externo é utilizado nessa fixture.

Antes do
refinamento 5xx, a suíte completa passou 17/17 jornadas Edge (11 anteriores +
6 novas), incluindo variantes/animações, reduced motion, menus/diálogos/skip/foco
e guarda contra submissão concorrente. Após o refinamento 5xx, foram aprovados
9/9 cenários focados de contato: os sete estados incertos, 400/201 e pending
concorrente com 503 → sucesso manual. Após o ajuste mínimo do backend e a inclusão
da fixture 503 legada, passaram os 3 cenários pertinentes: 503 atual, 503 legado
e 400/201. O inventário agora tem 20 cenários; não afirmamos execução completa
dos 20 nem repetimos os cenários visuais/Motion
intactos. Fixtures zeram
as configurações de e-mail/webhook do servidor temporário, bloqueiam origens
externas e interceptam `/api/config` e `/api/contact`. Nenhum e-mail foi enviado.

Não homologamos recebimento real, Safari/Firefox, dispositivo físico, leitor de
tela manual ou idempotência entre réplicas. A limitação de proteção em memória
do servidor permanece documentada no README; mensagens conservadoras não
substituem reconciliação nem garantem exatamente uma entrega.

## Depois do deploy

A comparação acima precede as pequenas alterações de `app.js` e `server.js` deste lote. Após a
publicação, conferir HTML/JS/CSS/bundle servidos contra o commit e o build correto
de cada origem, considerando o cache Pages de 600s. Não deduzir atualização do
site oficial ou bytes servidos somente pelo workflow verde. Não houve deploy,
configuração de provedor ou mudança de DNS por este trabalho.
