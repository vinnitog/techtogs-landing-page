# TechTogs Design System

Versão 1.0.0 · 28 de setembro de 2026 · documentação em português

Uma identidade de tecnologia com precisão e personalidade: neutros minerais, verde profundo e um único acento lima. A geometria angular e o circuito da logo orientam a direção visual; a interface usa tipografia legível e componentes simples para deixar o conteúdo em primeiro plano.

Este pacote entrega tokens, estilos, comportamentos de referência e um catálogo navegável. Abra `index.html` para explorar. O arquivo independente `TechTogs-Design-System.html`, entregue junto do ZIP, inclui CSS, JavaScript e a logo. As fontes online são opcionais; sem internet, entram os fallbacks locais.

## 1. Fundamentos e tokens nos dois modos

### Origem da paleta e uso da logo

A imagem enviada é uma composição raster com reflexos, sombras e gradientes. Os pixels lima mais frequentes ficam perto de RGB(159, 247, 47). Adotamos **#9FF72F** como adaptação digital consistente, sem apresentá-lo como um código oficial já existente. O verde-floresta **#1F3830**, preto **#000000** e prata **#D9DDDA** completam a paleta derivada visualmente da imagem.

A logo original está preservada em `assets/techtogs-original.png`. Ela tem fundo preto incorporado: use-a em uma área preta, inclusive dentro do tema claro. Não aplique filtros de inversão, recoloração automática, distorção ou recorte do símbolo. Para um cabeçalho compacto, obtenha futuramente a versão vetorial oficial e uma versão própria para fundo claro. O nome em texto no cabeçalho do catálogo é uma identificação funcional, não um redesenho do lettering.

Diretriz inicial: reserve área livre equivalente a 1/4 da altura do símbolo e valide o tamanho mínimo com o arquivo vetorial. Não reduza o raster quadrado inteiro para funcionar como favicon. Canto arredondado é um recurso da interface; a logo permanece angular.

### Paleta e superfícies

| Token CSS (prefixo `--tt-`) | Claro | Escuro | Função |
|---|---|---|---|
| `bg` | #F7F8F4 | #000000 | Fundo global, branco quente / OLED |
| `surface-0` | #FFFFFF | #0D120F | Cards e campos |
| `surface-1` | #F1F3EE | #151D18 | Agrupamentos e elevação 1 |
| `surface-2` | #E8ECE5 | #202B24 | Elevação 2 e interação pressionada |
| `text-primary` | #111812 | #F5F8F3 | Títulos, corpo, rótulos |
| `text-secondary` | #303C33 | #D3DDD3 | Explicações |
| `text-muted` | #464E47 | #B6C1B7 | Auxiliares e placeholders |
| `border-subtle` | #D4DBD1 | #35433A | Divisões decorativas |
| `border-strong` | #667365 | #778D7E | Limites essenciais dos controles |
| `brand-text` | #2A480C | #9FF72F | Links e destaques textuais |
| `primary` | #9FF72F | #9FF72F | Ação principal |
| `on-primary` | #111A0C | #111A0C | Texto e ícone sobre lima |
| `primary-border` | #365313 | #9FF72F | Limite reconhecível do CTA |
| `secondary` | #1F3830 | #223A2F | Ação secundária preenchida |
| `on-secondary` | #FFFFFF | #DBF3E5 | Conteúdo da ação secundária |
| `focus` | #2A480C | #9FF72F | Foco visível |

Use o lima em poucos pontos de atenção: ação principal, conexão gráfica, detalhe de marca. Evite grandes blocos de texto lima, excesso de contornos luminosos ou todos os cards com o mesmo destaque. O lima original sobre branco não serve como texto acessível; o token `brand-text` resolve essa aplicação. A hierarquia de texto vem também de peso, tamanho e posição: não diminua a opacidade de textos para torná-los discretos.

`border-subtle` não deve ser o único identificador de um campo ou controle. Use `border-strong` nessas situações. Uma borda de card puramente decorativa pode permanecer suave. Combinações opacas prescritas são verificadas; transparência, imagens e gradientes exigem medição do fundo resultante.

### Estados semânticos

| Estado | Texto claro | Fundo claro | Texto escuro | Fundo escuro |
|---|---|---|---|---|
| Sucesso | #15532E | #E9F5EC | #94E1AF | #112B1B |
| Atenção | #603A04 | #FFF4D8 | #F5D080 | #30240C |
| Erro | #861525 | #FDEFF1 | #FFB4BE | #37151D |
| Informação | #143D7A | #EDF3FF | #ADCDFE | #102440 |

Cada estado oferece `--tt-success`, `--tt-success-bg`, e os equivalentes `warning`, `error` e `info`. Combine cor com rótulo, mensagem e, quando útil, ícone. Um erro informa o que aconteceu e como corrigir; um sucesso confirma a ação realizada. A cor primária da marca não substitui a semântica de sucesso.

### Tipografia

**Display e títulos:** Space Grotesk, peso 600; 500 em títulos editoriais grandes. **Corpo e controles:** Inter, 400 no corpo e 600 nos rótulos/CTAs. **Código:** fonte monoespaçada do sistema. O catálogo usa Google Fonts com `display=swap`; para produção, prefira hospedar WOFF2 no próprio domínio, manter licenças e carregar somente os pesos usados. Sem arquivos externos, os fallbacks são Arial e fontes do sistema.

Escala inspirada na razão 1,25 e normalizada para uma hierarquia prática. As entrelinhas seguem múltiplos de 8 px. Os tamanhos são `rem`, respeitando a preferência de texto do usuário; não fixe a raiz em pixels.

| Papel | Tamanho | Entrelinha | Peso | Tracking |
|---|---:|---:|---:|---:|
| Display | 64 px | 72 px | 600 | −0,03 em |
| H1 | 48 px | 56 px | 600 | −0,03 em |
| H2 | 40 px | 48 px | 600 | −0,03 em |
| H3 | 32 px | 40 px | 600 | −0,03 em |
| H4 | 24 px | 32 px | 600 | −0,03 em |
| Lead | 20 px | 32 px | 400 | 0 |
| Corpo | 16 px | 24 px | 400 | 0 |
| Auxiliar | 14 px | 24 px | 400 | 0 |
| Eyebrow | 14 px | 24 px | 600 | +0,04 em |

Em mobile, H1 desce para 40/48 e H2 para 32/40; em telas ≥1440 px, o título principal pode usar 64/72. Texto corrido: máximo 65ch, alinhado à esquerda, sem justificação. Maiúsculas ficam restritas a rótulos curtos. A hierarquia visual não altera a semântica: escolha `h1`–`h6` pela estrutura do documento.

### Elevação, geometria e vidro

| Elemento | Diretriz |
|---|---|
| Raio SM / 8 px | Botões, inputs, detalhes pequenos |
| Raio MD / 16 px | Painéis compactos |
| Raio LG / 24 px | Cards |
| Raio XL / 32 px | Blocos de destaque |
| Raio pill | Indicadores e spinner; evitar como padrão de todos os botões |
| Nível 0 | Sem sombra; superfície e borda organizam |
| Nível 1 | Claro: 0 8px 24px, 8% preto esverdeado; escuro: borda e luz interna |
| Nível 2 | Claro: 0 16px 48px, 12%; escuro: borda, sombra e luz interna |
| Nível 3 | Claro: 0 24px 64px, 16%; escuro: limite mais forte e sombra |
| Vidro | Blur de 16 px, superfície com 96% de opacidade e fallback sólido |

`tt-glass` aplica o tratamento, e `tt-glass-content` fornece uma base opaca sob conteúdo. Vidro fica em painéis breves e áreas decorativas; não coloque texto essencial diretamente sobre fotos ou 3D variáveis. A transparência não faz parte da garantia de contraste dos pares opacos. Nada depende de `backdrop-filter` para funcionar.

### Layout e grid

Espaçamentos: **0, 8, 16, 24, 32, 40, 48, 64, 80, 96 e 128 px**. O token `--tt-space-3` representa 24 px na raiz padrão. Exceções ópticas explícitas: bordas de 1 px, traços de 2 px, anel/offset de foco de 3 px; esses valores não são espaçamentos de layout. Tipografia e largura fluida não precisam ser múltiplos de 8.

| Intervalo | Colunas | Gutter | Margem mínima |
|---|---:|---:|---:|
| Mobile <640 px | 4 | 16 px | 16 px |
| Mobile amplo 640–767 px | 4 | 16 px | 32 px |
| Tablet 768–1023 px | 8 | 24 px | 32 px |
| Desktop 1024–1439 px | 12 | 32 px | 32 px |
| Desktop amplo 1440–1919 px | 12 | 32 px | 32 px |
| Ultra-wide ≥1920 px | 12 | 32 px | 64 px no container amplo |

Container padrão: máximo 1280 px. Container amplo: máximo 1536 px em ultra-wide. Texto: 65ch. Utilize `.tt-grid`, `.tt-col-half` e `.tt-col-third`; colunas viram largura total quando necessário. Breakpoints exportados em rem: 40, 48, 64, 90 e 120. Não esconda conteúdo essencial em telas pequenas.

## 2. Componentes e variantes

### Botões

| Variante | Classe adicional | Aplicação |
|---|---|---|
| Primário | nenhuma | Uma ação de maior importância por grupo |
| Secundário | `tt-button--secondary` | Ação complementar de peso intermediário |
| Contorno | `tt-button--outline` | Alternativa clara, com limite visível |
| Ghost | `tt-button--ghost` | Ação terciária, sempre com rótulo legível |
| Destrutivo | `tt-button--destructive` | Remoção ou ação irreversível; contexto explica consequência |
| Ícone | `tt-button--icon` + variante | Ferramenta compacta; `aria-label` obrigatório |

SM tem 48 px de altura, texto 14/24 e padding horizontal 16 px. MD tem 56 px, texto 16/24 e padding 24 px. LG tem 64 px, texto 16/24 e padding 32 px. Ícones ocupam 16/24/32 px conforme contexto; alvos continuam com pelo menos 48×48 px. Largura acompanha o conteúdo. Use texto com verbo claro: “Criar projeto”, “Ver detalhes”, “Excluir integração”.

| Estado | Regra implementada |
|---|---|
| Default | Par foreground/background próprio da variante |
| Hover | Token `*-hover`; somente dispositivos com hover |
| Active | Token `*-active` e escala 0,98, sem mudar layout |
| Focus-visible | Anel de 3 px com offset de 3 px; não remover foco |
| Disabled | `disabled`, superfície neutra e borda tracejada; sem opacidade global |
| Loading | `aria-busy=true`, `aria-disabled=true`, rótulo legível e bloqueio de nova ativação |

Loading mantém o botão no fluxo de foco. O JavaScript de referência bloqueia ativações enquanto `aria-disabled=true`; HTML sozinho não bloqueia. Para ações use `<button type="button">`; para navegação use `<a href>`. Nunca envolva um botão em outro botão ou em um link. O catálogo permite alternar as seis variantes e três tamanhos, comparando todos os estados nos dois temas.

### Cards e containers

Base `.tt-card`; elevação `.tt-card--raised` ou `.tt-card--floating`; destino clicável `.tt-card--interactive` em um link real. Em cards com várias ações, o container é `article`, e cada ação tem seu próprio link ou botão. A borda forte identifica o card interativo; o texto não muda de cor ao hover. Padding padrão 24 px, conteúdo com gaps de 16/24 px.

O showcase fornece perspectiva de 1000 px, inclinação de no máximo ±4° e atualização com `requestAnimationFrame`. Apenas a camada decorativa inclina, mantendo texto e ação estáveis. O exemplo é 3D CSS; não inclui um motor WebGL. Para modelos WebGL reais: carregue após intenção/interseção, forneça poster estático, mantenha o conteúdo e as ações em HTML, pare renderização fora de tela, limite resolução e descarte recursos ao desmontar. Nunca faça uma tarefa depender de arrastar, hover, rotação ou de enxergar o objeto 3D.

### Navegação e headers

O header usa 80 px de altura mínima e tema do contexto. A partir de 1024 px, apresenta links e dropdown de navegação. O dropdown usa disclosure nativo (`details/summary`), links normais, Tab/Shift+Tab, fechamento por Escape, clique externo e saída de foco. Não usa `role=menu`: navegação de site não é um menu de aplicativo com atalhos de setas obrigatórios.

No mobile, o botão abre um `dialog` modal: foco contido pelo navegador, Escape para fechar, retorno de foco ao gatilho, rolagem do fundo bloqueada e backdrop. Forneça título acessível, botão Fechar e `aria-expanded`/`aria-controls` no gatilho. Em aplicações com portais, copie o `data-theme` do dono para o portal; a árvore DOM define a herança, não a árvore de componentes React.

A aparência tem três preferências: Claro, Escuro e Sistema. `theme-init.js` lê a escolha antes do CSS, evitando o flash de tema incorreto. `components.js` persiste a seleção, acompanha o sistema quando essa preferência está ativa e trata armazenamento indisponível. Contextos explícitos continuam independentes. A troca de tema é instantânea: evita quadros intermediários de contraste insuficiente. Em SSR, carregue essa inicialização antes da hidratação e mantenha a lógica do atributo consistente com o framework.

### Campos, selects e checkboxes

Campos usam `label` associado por `for/id`; placeholder é exemplo, nunca o único rótulo. Altura padrão 56 px, texto mínimo 16 px em mobile, borda forte. `select` e checkbox permanecem controles nativos. O alvo do checkbox é toda a linha de 48 px, com caixa de 24 px. Em cores forçadas, a aparência nativa do checkbox é restaurada.

Validação: `aria-invalid=true`, borda de erro, texto explicando correção e `aria-describedby`. Confirmação: mensagem explícita e `data-valid=true`. Campos desabilitados têm `disabled`; campos apenas para leitura devem usar `readonly` quando aplicável. Nunca marque um campo obrigatório como inválido antes de uma tentativa de envio ou interação relevante.

O exemplo demonstra validação de e-mail no cliente e status com `aria-live=polite`; não possui envio de dados. Integre validação no servidor, estado de rede, erros de domínio e prevenção de duplo envio no produto. Não use alertas intrusivos para cada tecla digitada. Um seletor personalizado com busca exige combobox completo; mantenha o `select` nativo enquanto ele atender ao caso.

## 3. Motion e microinterações

| Token | Valor | Aplicação |
|---|---|---|
| `duration-fast` | 120 ms | Hover, pressed |
| `duration-base` | 200 ms | Elevação e tilt |
| `duration-slow` | 320 ms | Entrada de grandes elementos, quando necessária |
| `ease-standard` | cubic-bezier(0.2, 0, 0, 1) | Mudanças de estado |
| `ease-enter` | cubic-bezier(0, 0, 0.2, 1) | Entrada |
| `ease-exit` | cubic-bezier(0.4, 0, 1, 1) | Saída |
| Troca de tema | 0 ms | Cores mudam juntas |

O card interativo sobe 8 px com mouse; o botão pressiona a 0,98. Não animar layout/altura continuamente, não adicionar parallax de página nem loops decorativos. O spinner só comunica carregamento. `prefers-reduced-motion: reduce` remove transições, animações, deslocamentos e tilt; o texto de status continua suficiente. Uma aplicação pode adicionar um controle explícito de movimento, respeitando a preferência mais restritiva.

## 4. Arquitetura e exportação

### Camadas

Primitivos da marca → tokens semânticos por contexto → tokens locais de componente → aplicação. Cores de superfície e conteúdo são pares. Os componentes leem `--tt-*`; não conhecem o tema por seletores de ancestral. A definição Light aparece em `:root, [data-theme="light"]`, e Dark em `[data-theme="dark"]`. Cada contexto redefine todos os tokens semânticos, inclusive sombras.

```html
<script src="theme-init.js"></script>
<link rel="stylesheet" href="tokens.css">
<link rel="stylesheet" href="components.css">
<script src="components.js" defer></script>

<section data-theme="dark" class="tt-theme">
  <button type="button" class="tt-button">Criar projeto</button>
  <article data-theme="light" class="tt-theme tt-card">
    <h2>Contexto claro dentro do escuro</h2>
    <p>Tokens locais preservam contraste e identidade.</p>
  </article>
</section>
```

`data-theme` altera tokens e `color-scheme`; `.tt-theme` pinta o fundo e o texto. Um atributo sozinho não cria uma superfície. Não use `.dark .card` para definir cores: o ancestral escuro continuaria atingindo um card explicitamente claro. Não use `filter: invert()`. Variáveis semânticas de cor têm valores explícitos em cada escopo; aliases de componente são definidos no próprio componente para evitar resolução herdada incorreta.

### Arquivos entregues

| Arquivo | Conteúdo |
|---|---|
| `tokens.css` | Sistema completo de CSS Custom Properties |
| `tokens.json` | Exportação JSON com fundamentos, breakpoints e dois temas |
| `components.css` | Componentes, layout, foco, movimento reduzido e cores forçadas |
| `theme-init.js` | Inicialização antes da pintura |
| `components.js` | Preferência, dropdown, dialog, formulário e tilt de referência |
| `tailwind-v4.css` | Entrada CSS-first para Tailwind v4 |
| `tailwind.config.cjs` | Adaptador para Tailwind 3.4 |
| `index.html`, `preview.css`, `preview.js` | Catálogo interativo |
| `build_tokens.py` | Fonte editável dos tokens e gerador/auditoria sem dependências |
| `build_preview.py` | Gerador do catálogo e arquivo independente |
| `qa/contrast.json`, `qa/contrast.md` | Resultados reproduzíveis por combinação |
| `qa/verify.cjs`, `qa/browser-results.json` | Verificação funcional e resultados do navegador |
| `TOKEN-REFERENCE.md` | Inventário completo dos valores exportados |

Edite os dicionários de `build_tokens.py` e execute `python build_tokens.py` para regenerar JSON/CSS/adaptadores e validar contraste. Não edite simultaneamente arquivos gerados e a fonte. O JSON é um esquema próprio documentado, com valores resolvidos; não é apresentado como DTCG nem como importação automática para Figma. Os estados de componentes utilizam os mesmos tokens em todos os temas.

### Tailwind

**v4:** use `tailwind-v4.css` como entrada do seu build. `@theme inline` garante que as utilities leiam os tokens no elemento de uso. **v3.4:** importe `tokens.css`, use `tailwind.config.cjs` e configure os caminhos de conteúdo do seu projeto. Os adaptadores são alternativas: não carregue ambos.

```html
<section data-theme="dark" class="bg-tt-bg text-tt-text-primary p-tt-4">
  <article data-theme="light"
    class="bg-tt-surface-0 text-tt-text-primary p-tt-3 rounded-tt-lg">
    Conteúdo claro em um contexto escuro.
  </article>
</section>
```

No adaptador v3, o equivalente ao raio acima é `rounded-lg`. As utilities `p-tt-3` e `p-tt-4` usam a escala de 8 px sem alterar a escala convencional do Tailwind. As cores usam `var(--tt-...)`; não dependem de `dark:`. Evite modificadores de opacidade sobre texto/superfície em combinações verificadas. Para estados complexos, use `.tt-button` ou mapeie os tokens de hover/active/foco explicitamente.

## 5. Acessibilidade e limites verificados

Meta de contraste: 7:1 para texto comum; WCAG AAA admite 4,5:1 para texto grande, mas este sistema mantém 7:1 nos pares de texto prescritos. Contornos essenciais e foco adotam pelo menos 3:1 nas superfícies neutras; a borda decorativa não é um controle. O anel de foco tem 3 px, excedendo a área de referência de um perímetro de 2 px, e precisa permanecer desobstruído. Os alvos dos controles têm pelo menos 48 px, acima da referência AAA de 44 px.

`qa/contrast.json` mede 134 pares sRGB opacos sem arredondar antes da aprovação. O menor contraste textual é aproximadamente 7,194:1. A auditoria cobre texto principal/secundário/auxiliar, links, botões nos três estados cromáticos, semântica, desabilitados, limites e foco. Não generalize essa aprovação para combinações novas, filtros, fundos com imagens ou composições translúcidas.

A implementação fornece base técnica para os critérios abordados; não declara conformidade AAA integral de um site. A versão final exige validação com o conteúdo real, leitor de tela, teclado, zoom 200%/400%, espaçamento de texto personalizado, idiomas, Safari/Firefox/Chrome e dispositivos reais. Os adaptadores Tailwind seguem a API documentada; o pacote de referência funciona em CSS puro e não inclui build Tailwind compilado.

### Referências primárias

- [W3C — contraste aprimorado, 1.4.6](https://www.w3.org/WAI/WCAG22/Understanding/contrast-enhanced.html)
- [W3C — contraste não textual, 1.4.11](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html)
- [W3C — aparência do foco, 2.4.13](https://www.w3.org/WAI/WCAG22/Understanding/focus-appearance.html)
- [W3C — alvos aprimorados, 2.5.5](https://www.w3.org/WAI/WCAG22/Understanding/target-size-enhanced.html)
- [W3C — animação por interação, 2.3.3](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html)
- [W3C APG — disclosure para navegação](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/examples/disclosure-navigation/)
- [Tailwind — theme variables e @theme inline](https://tailwindcss.com/docs/theme)

Fontes consultadas em 28/09/2026. As escolhas estéticas, tokens e regras de uso são propostas específicas para a TechTogs.


---

# TechTogs — inventário completo de tokens

Exportação gerada de tokens.json. Todas as variáveis CSS usam o prefixo `--tt-`. Valores em rem assumem 16 px como preferência inicial do navegador.

## Fundamentos

| Token | Valor |
|---|---|
| `brand-lime` | `#9FF72F` |
| `brand-forest` | `#1F3830` |
| `brand-black` | `#000000` |
| `brand-silver` | `#D9DDDA` |
| `font-display` | `"Space Grotesk", "Arial", sans-serif` |
| `font-body` | `"Inter", system-ui, -apple-system, "Segoe UI", sans-serif` |
| `font-code` | `ui-monospace, "SFMono-Regular", Consolas, monospace` |
| `weight-regular` | `400` |
| `weight-medium` | `500` |
| `weight-semibold` | `600` |
| `weight-bold` | `700` |
| `tracking-body` | `0em` |
| `tracking-heading` | `-0.03em` |
| `tracking-label` | `0.04em` |
| `radius-none` | `0` |
| `radius-sm` | `0.5rem` |
| `radius-md` | `1rem` |
| `radius-lg` | `1.5rem` |
| `radius-xl` | `2rem` |
| `radius-pill` | `9999px` |
| `border-width` | `1px` |
| `focus-width` | `3px` |
| `focus-offset` | `3px` |
| `container-content` | `80rem` |
| `container-wide` | `96rem` |
| `container-reading` | `65ch` |
| `control-sm` | `3rem` |
| `control-md` | `3.5rem` |
| `control-lg` | `4rem` |
| `icon-sm` | `1rem` |
| `icon-md` | `1.5rem` |
| `icon-lg` | `2rem` |
| `duration-instant` | `0ms` |
| `duration-fast` | `120ms` |
| `duration-base` | `200ms` |
| `duration-slow` | `320ms` |
| `ease-standard` | `cubic-bezier(0.2, 0, 0, 1)` |
| `ease-enter` | `cubic-bezier(0, 0, 0.2, 1)` |
| `ease-exit` | `cubic-bezier(0.4, 0, 1, 1)` |
| `blur-glass` | `16px` |
| `perspective` | `1000px` |
| `tilt-max` | `4deg` |
| `z-base` | `0` |
| `z-header` | `20` |
| `z-dropdown` | `30` |
| `z-overlay` | `40` |
| `z-dialog` | `50` |
| `space-0` | `0rem` |
| `space-1` | `0.5rem` |
| `space-2` | `1rem` |
| `space-3` | `1.5rem` |
| `space-4` | `2rem` |
| `space-5` | `2.5rem` |
| `space-6` | `3rem` |
| `space-8` | `4rem` |
| `space-10` | `5rem` |
| `space-12` | `6rem` |
| `space-16` | `8rem` |
| `text-caption` | `0.875rem` |
| `line-caption` | `1.5rem` |
| `text-body` | `1rem` |
| `line-body` | `1.5rem` |
| `text-lead` | `1.25rem` |
| `line-lead` | `2rem` |
| `text-h4` | `1.5rem` |
| `line-h4` | `2rem` |
| `text-h3` | `2rem` |
| `line-h3` | `2.5rem` |
| `text-h2` | `2.5rem` |
| `line-h2` | `3rem` |
| `text-h1` | `3rem` |
| `line-h1` | `3.5rem` |
| `text-display` | `4rem` |
| `line-display` | `4.5rem` |

## Temas

| Token | Claro | Escuro |
|---|---|---|
| `bg` | `#F7F8F4` | `#000000` |
| `surface-0` | `#FFFFFF` | `#0D120F` |
| `surface-1` | `#F1F3EE` | `#151D18` |
| `surface-2` | `#E8ECE5` | `#202B24` |
| `text-primary` | `#111812` | `#F5F8F3` |
| `text-secondary` | `#303C33` | `#D3DDD3` |
| `text-muted` | `#464E47` | `#B6C1B7` |
| `border-subtle` | `#D4DBD1` | `#35433A` |
| `border-strong` | `#667365` | `#778D7E` |
| `focus` | `#2A480C` | `#9FF72F` |
| `brand-text` | `#2A480C` | `#9FF72F` |
| `brand-soft` | `#E8F4D9` | `#203211` |
| `brand-soft-text` | `#2A480C` | `#C3F58D` |
| `primary` | `#9FF72F` | `#9FF72F` |
| `primary-hover` | `#B2FF55` | `#B2FF55` |
| `primary-active` | `#8BDC20` | `#8BDC20` |
| `on-primary` | `#111A0C` | `#111A0C` |
| `primary-border` | `#365313` | `#9FF72F` |
| `secondary` | `#1F3830` | `#223A2F` |
| `secondary-hover` | `#29473B` | `#2A4436` |
| `secondary-active` | `#14291F` | `#172C21` |
| `on-secondary` | `#FFFFFF` | `#DBF3E5` |
| `neutral-hover` | `#F1F3EE` | `#151D18` |
| `neutral-active` | `#E8ECE5` | `#202B24` |
| `destructive` | `#8B1A23` | `#FFB4B7` |
| `destructive-hover` | `#73131C` | `#FFC8CA` |
| `destructive-active` | `#580D14` | `#ED9BA1` |
| `on-destructive` | `#FFFFFF` | `#39080D` |
| `disabled-bg` | `#E8ECE5` | `#202B24` |
| `disabled-text` | `#464E47` | `#B6C1B7` |
| `disabled-border` | `#667365` | `#778D7E` |
| `success` | `#15532E` | `#94E1AF` |
| `success-bg` | `#E9F5EC` | `#112B1B` |
| `warning` | `#603A04` | `#F5D080` |
| `warning-bg` | `#FFF4D8` | `#30240C` |
| `error` | `#861525` | `#FFB4BE` |
| `error-bg` | `#FDEFF1` | `#37151D` |
| `info` | `#143D7A` | `#ADCDFE` |
| `info-bg` | `#EDF3FF` | `#102440` |
| `glass-bg` | `rgb(255 255 255 / 0.96)` | `rgb(13 18 15 / 0.96)` |
| `scrim` | `rgb(0 0 0 / 0.64)` | `rgb(0 0 0 / 0.72)` |
| `shadow-0` | `none` | `none` |
| `shadow-1` | `0 8px 24px rgb(17 24 18 / 0.08)` | `0 0 0 1px #35433A, inset 0 1px 0 rgb(195 245 141 / 0.06)` |
| `shadow-2` | `0 16px 48px rgb(17 24 18 / 0.12)` | `0 0 0 1px #35433A, 0 16px 48px rgb(0 0 0 / 0.40), inset 0 1px 0 rgb(195 245 141 / 0.08)` |
| `shadow-3` | `0 24px 64px rgb(17 24 18 / 0.16)` | `0 0 0 1px #778D7E, 0 24px 64px rgb(0 0 0 / 0.56)` |
| `inner-glow` | `inset 0 1px 0 rgb(255 255 255 / 0.64)` | `inset 0 1px 0 rgb(195 245 141 / 0.08)` |

## Breakpoints

| Nome | Valor |
|---|---|
| `sm` | `40rem` |
| `md` | `48rem` |
| `lg` | `64rem` |
| `xl` | `90rem` |
| `2xl` | `120rem` |
