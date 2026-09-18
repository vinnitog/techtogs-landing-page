# TechTogs

Landing page baseada no briefing TechTogs.pdf. HTML, CSS e JavaScript, com servidor Node.js sem dependências. Identidade grafite e verde-limão, versão responsiva, fluxo demonstrativo, projetos ilustrativos, formulário e página de privacidade.

## Rodar

Demonstração: https://vinnitog.github.io/techtogs-landing-page/

O GitHub Pages publica automaticamente a cada push na branch `main`, pelo workflow `.github/workflows/pages.yml`. O comando `npm run build` prepara apenas os arquivos públicos em `dist/`. No Pages, o formulário permite simular o preenchimento, mas não envia nem armazena dados. O backend continua disponível na execução local.

Requer Node.js 20 ou superior. Não precisa instalar pacotes.

```powershell
npm start
```

Abra http://localhost:3000. `npm run check` verifica a sintaxe do JavaScript. Abrir apenas o HTML exibe o site, mas o formulário depende do servidor.

## Contatos e formulário

WhatsApp e e-mail não foram definidos. Os links só aparecem quando configurados. No modo padrão, o formulário informa que é uma prévia e salva solicitações em `data/leads.jsonl`, sem disparar e-mail ou WhatsApp. A pasta de dados não é servida pela web nem incluída no Git.

Variáveis de ambiente opcionais, definidas antes de iniciar:

- `CONTACT_EMAIL`: e-mail público da TechTogs.
- `CONTACT_WHATSAPP`: número com país e DDD, somente dígitos.
- `CONTACT_WEBHOOK_URL`: URL de uma integração que receba POST JSON, para CRM ou envio de e-mail. Quando definida, o formulário envia para essa integração e só confirma o recebimento depois de resposta HTTP de sucesso.
- `CONTACT_WEBHOOK_TOKEN`: token Bearer opcional, usado apenas pelo servidor.
- `DATA_DIR`: diretório de gravação local das solicitações na prévia.
- `PORT`: porta; padrão 3000.
- `HOST`: interface de rede; padrão `127.0.0.1`. Para hospedagem, configure conforme o provedor.

O JSON enviado inclui `id`, `createdAt`, `name`, `company`, `contact`, `challenge`, `message`, `consent` e `privacyVersion`. A integração deve tratar o ID como identificador único para evitar processamento repetido.

## Antes de publicar

Configure o destino de contato e complete a política de privacidade com os dados reais da empresa, o canal de privacidade, os fornecedores e o prazo de retenção. A política atual identifica explicitamente o ambiente de demonstração.

Hospede com HTTPS e Node.js ativo. O armazenamento local serve para a prévia; o endpoint do webhook é a opção de entrega para produção. O limitador por IP é simples e fica em memória: ajuste para a infraestrutura real se houver proxy ou múltiplas instâncias.

Os exemplos do portfólio e seus números são fictícios e estão identificados na interface. Substitua por projetos reais autorizados quando disponíveis. A marca utiliza a imagem oficial fornecida pelo usuário.

Google Analytics, Search Console, CRM e pixels dependem de contas e identificadores ainda não fornecidos. Nenhum rastreador ou cookie de publicidade está ativo; ao adicioná-los, implemente o consentimento apropriado e atualize a política. As fontes usam Google Fonts com fallback local.

Marca: `assets/brand-horizontal.svg` compõe símbolo e lettering originais lado a lado para cabeçalho e rodapé; `assets/brand-symbol.svg` enquadra apenas o símbolo para demonstrações e favicon. Ambos incorporam a imagem original, sem redesenhar a identidade. O CSS integra o fundo preto à superfície escura. Original preservado em `assets/techtogs-logo.jpeg`.
