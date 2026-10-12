# Medição pública de performance — 12/10/2026

O sampler `npm run measure:public` mede somente a página oficial
`https://techtogs.com.br/`. Não envia formulário: permite apenas GET/HEAD HTTPS
no domínio oficial e nos dois hosts de fontes, bloqueia `/api/contact`, usa
contextos novos, bloqueia service workers e fecha o browser em até três minutos.
Não lê arquivos de ambiente nem usa credenciais. O JSON bruto fica ignorado em
`.tmp/`; não deve ser tratado como benchmark de CI ou SLA de produção.

## Evidência observada

Base publicada `b46bf96`, Edge 155.0.4283.45 headless, altura de viewport 900,
três amostras por largura, quatro segundos de observação após `load`.

| Viewport | LCP observado (ms) | CLS na janela | Maior long task (ms) |
|---|---|---|---|
| 1440 px | 1796 / 1188 / 932 | 0,005444 / 0,002124 / 0,001663 | 148 / 83 / 71 |
| 390 px | 940 / 940 / 912 | 0,005554 / 0,005589 / 0,005597 | 63 / 58 / 67 |

Cada amostra teve uma long task. O HTML veio com 7.614 bytes codificados e
26.540 decodificados; a soma dos corpos codificados dos recursos foi 118.159
bytes, sem recursos com tamanho desconhecido nessas amostras. O bundle principal
Motion + GSAP veio com 50.016 bytes codificados e 127.451 decodificados. A
compressão publicada no lote anterior está funcionando; esses números não
representam uma redução nova realizada neste lote.

O CLS usa o maior agrupamento de shifts sem input recente, com intervalos
inferiores a um segundo e duração inferior a cinco segundos, conforme a
[definição de CLS](https://web.dev/articles/cls). A janela curta pode perder
shifts posteriores; viewport de 390 px não equivale a aparelho físico. Não foram
medidos INP, interações de usuários, leitores de tela, rede celular, CPU de
telefone ou dados de campo. O estado de CDN/conexões não foi controlado; as
três amostras não provam diferença causal entre versões.

## Decisão e próximos gates

Preservar Motion + GSAP, a marca e o comportamento do contato. Não há comparação
controlada que justifique remover animações ou prometer ganho de CPU com estes
dados. Repetir o sampler após uma mudança específica, mantendo máquina, browser
e cenário, e medir interações locais separadamente antes de otimizar o runtime.

O contato já reaproveita a identidade de uma tentativa em memória e envia uma
chave de idempotência ao Resend. A [garantia do provedor é de 24 horas para a
mesma chave e payload](https://resend.com/docs/dashboard/emails/idempotency-keys).
Reload/novo contexto não preserva essa identidade; webhook e armazenamento
JSONL não oferecem a mesma garantia distribuída. Não adicionar retries
automáticos nem afirmar entrega exatamente uma vez. Coordenação persistente
entre instâncias exige definir destino, retenção e comportamento após falhas
antes de adicionar uma nova dependência ou armazenar dados de contato.

Nenhum e-mail, lead, webhook, serviço pago ou dado pessoal foi criado neste
ensaio. O sampler é uma ferramenta opcional de diagnóstico; a regressão normal
continua local e sem submissão pública.
