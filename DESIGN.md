# Identidade visual aplicada

O design system adotado está em `docs/identidade-visual/TechTogs-Design-System.md`, com catálogo em `docs/identidade-visual/TechTogs-Design-System.html`. Esses documentos são a especificação para mudanças visuais; este arquivo registra como a landing page atual os aplica.

## Tema e cor

A landing usa o modo escuro escolhido pelo usuário. `styles.css` define os tokens `--tt-*`: fundo preto `#000000`, superfícies `#0D120F`, `#151D18` e `#202B24`, textos `#F5F8F3`, `#D3DDD3` e `#B6C1B7`, bordas `#35433A` e `#778D7E`, e lima `#9FF72F` para a ação principal e poucos detalhes. Estados de sucesso, atenção e erro têm cores semânticas próprias.

## Tipografia e componentes

Space Grotesk serve aos títulos, Inter ao corpo e aos controles, com fontes do sistema como fallback. A hierarquia principal segue 48/56 px para H1 e 40/48 px para H2, com H1 móvel em 40/48 px e até 64/72 px em telas amplas. O layout usa container de até 1280 px, espaçamento baseado em 8 px, botões e campos com alvo mínimo de 48 px e foco visível de 3 px.

Cards, formulário, navegação e diálogos usam as superfícies e os estados do sistema. O menu móvel usa `dialog`. A versão principal combina GSAP na entrada do hero e nas etapas do método com Motion na interação da simulação do fluxo. `prefers-reduced-motion` remove as animações adicionais e as transições. A logo original permanece em área preta, sem filtro de cor nem modo de mesclagem.

## Versões de comparação

O usuário escolheu a combinação Motion + GSAP para a landing principal. As versões isoladas continuam disponíveis como prévias de comparação, todas derivadas da mesma base visual. O catálogo HTML de referência não é importado como código de produção.
