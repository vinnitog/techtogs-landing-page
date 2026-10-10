# Teclado e formulário — 2026-10-10

## Escopo e correção

Lote sobre o checkout isolado de `develop`, após a redução do pacote Motion. Preserva a identidade visual adotada, CSS, textos, animações, variantes, dependências e servidor de contato. Não altera configurações de produção nem envia solicitações externas.

Ao aceitar **Quero algo assim no meu negócio**, o diálogo preenchia a categoria e navegava para `#contato`, mas o foco terminava no `body`. O próximo Tab alcançava o link externo do WhatsApp, antes do formulário. Dois testes novos reproduziram a falha no código original em 390 e 1440 px.

O CTA agora mantém a categoria e o endereço `#contato`, fecha o diálogo e coloca o foco no primeiro campo do formulário, trazendo-o para a área visível. Funciona também se a URL já contém `#contato`. Cliques com Ctrl/Meta/Shift/Alt conservam o tratamento nativo do link. Escape continua voltando ao botão que abriu o diálogo.

## Evidências

`browser/accessibility.test.js` adiciona seis casos reais de navegador:

- Skip-link leva a sequência de Tab para o conteúdo, sem repetir o header; o diálogo de projeto impede foco em controles do fundo e Escape devolve foco ao gatilho.
- Menu móvel respeita `aria-expanded`, bloqueia rolagem do fundo, conserva a sequência modal de teclado, fecha com Escape e permite navegação nativa para uma seção.
- CTA do projeto leva foco visível ao formulário em 390 e 1440 px, com categoria correta, Enter e clique, segunda abertura e URL repetida. O próximo Tab chega ao campo Empresa.
- Contato inválido recebe foco, `aria-invalid`, explicação associada e zero POST; corrigir o campo remove o erro e permite sucesso simulado.
- Uma resposta pendente recebe um único POST mesmo após nova ativação por Enter, clique e `requestSubmit()`. Erro HTTP 503 preserva valores e consentimento; nova tentativa explícita obtém sucesso e limpa o formulário.

Os diálogos permanecem nativos. Em Chromium, Tab pode visitar a interface do navegador, expondo `activeElement === body`; a verificação impede que controles de fundo recebam foco e percorre vinte passos, incluindo Shift+Tab. Não foi acrescentado um controle artificial de Tab.

Gates locais: `npm run check`, `npm test` **4/4**, `BROWSER_CHANNEL=msedge npm run test:browser` **11/11** (seis novos + cinco de Motion), incluindo o build estático e as três variantes. A suíte nova usa um servidor temporário em `127.0.0.1`, produção sem provedor, bloqueia outras origens e intercepta `/api/config` e `/api/contact`; todos os dados são fictícios. Os cenários de formulário não alcançam o servidor de contato real. O workflow `qa.yml` já inclui `browser/*.test.js` em pushes de `develop` e PRs para `main`, sem deploy.

Evidências privadas e ignoradas ficam em `tmp/accessibility-20261010/`: `accessibility-red.log` (dois testes falham no original), `focus-green.log`, `browser-final.log`, `unit.log`, `check.log`. Nenhum commit, push ou deploy foi realizado neste lote.

O detector Impeccable foi executado uma vez sobre `app.js`, sem achados (`[]`); o contexto visual existente foi reutilizado. `bootstrap-utilities.ps1 -Action verify` confirmou **85 bindings** com `-UtilitiesPath` explícito para o checkout fixado, pois a biblioteca não é irmã desta worktree isolada. Pin e biblioteca permanecem intactos.

## Limites

As novas verificações comportamentais usam a landing principal em Edge/Chromium headless, larguras CSS 390/1440, altura 844 e movimento reduzido. Os cinco testes anteriores continuam cobrindo movimento normal, preferência reduzida e as variantes. Fontes externas ficam bloqueadas e usam fallback.

Não houve teste com NVDA, JAWS, VoiceOver, TalkBack, Safari/Firefox, teclado/dispositivo móvel físico ou zoom nativo, nem auditoria WCAG completa. O envio real, recebimento de e-mail, timeout de entrega e proteção entre múltiplas réplicas não são homologados por estas fixtures. A limitação de deduplicação em memória descrita no README permanece.

## Revisão independente final

O diff e as fixtures foram conferidos por revisor independente: foco segue o CTA, modificadores mantêm comportamento nativo, respostas de contato são interceptadas e serviços externos bloqueados. Sem bloqueadores identificados; limitações de plataforma e entrega permanecem.
