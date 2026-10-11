# Etapa: identidade estável da tentativa de contato

O formulário conserva UUID e horário da tentativa em memória para repetir o
mesmo conteúdo normalizado após falha. UUID e horário entram no pedido ao servidor;
o servidor valida os dois e mantém tanto Idempotency-Key quanto corpo do e-mail
estáveis. Não basta fixar a chave e mudar o timestamp do corpo a cada pedido.
Confirmação positiva limpa a tentativa; conteúdo diferente inicia outra intenção.
Não há retry automático ou persistência de conteúdo em localStorage.

O [contrato oficial do Resend](https://resend.com/docs/dashboard/emails/idempotency-keys)
mantém deduplicação por 24 horas e requer o mesmo payload. O cliente e servidor
recusam repetir a identidade após 23 horas, deixando margem e orientando conferir
com a equipe. Relógio muito adiantado/metadata parcial/inválida são recusados.
Clientes antigos sem metadata continuam compatíveis, sem a proteção nova.

Testes locais: helper confirma estabilidade/normalização/novo conteúdo/expiração;
servidor com fetch completamente fictício prova chave e corpo idênticos após JSON
ambíguo do provedor, e zero chamadas para identidade inválida/expirada. Navegador
interceptado prova retry manual, mudança de intenção e limpeza após confirmação.
Regressões de erro, draft, timeout, consentimento e modo Pages continuam válidas.

Limites: deduplicação é do Resend, não recibo de entrega ao destinatário. Reload,
aba diferente ou cliente legado não compartilham a tentativa em memória. Webhook
alternativo e JSONL local não oferecem esse contrato. Mudança de destinatário ou
configuração durante retry pode causar conflito no provedor, mostrado como falha
sem repetir automaticamente. Nenhum e-mail, webhook real, secret ou publicação
foi acionado na validação. Não há promessa de exatamente uma entrega universal.
Rollback é revert do commit; não existe migração de dados.
