# Etapa: transferência pública com gzip e revalidação

O servidor negocia gzip para arquivos públicos compressíveis a partir de 1 KiB,
somente quando menor (ou identity foi recusado). A compressão usa zlib assíncrona,
sem dependência nova. `Vary: Accept-Encoding` separa representações e cada corpo
tem ETag forte próprio. GET condicional retorna 304; HEAD preserva os headers da
representação e não envia corpo. O cache continua no-cache: deve revalidar.

Recusa explícita gzip;q=0 prevalece sobre wildcard. Representações totalmente
recusadas retornam 406. Arquivos são lidos novamente, sem cache em memória que
mascare mudanças locais. API/config e contatos continuam no-store e sem gzip.
O helper não está na allowlist pública nem no artefato Pages; dados e código de
servidor continuam fora. Não foi alterado domínio, Railway, CDN ou publicação.

Gates: teste unitário de negociação, reversão byte-idêntica, ETag, alteração,
304, corpo pequeno e 406; HTTP loopback do bundle real prova gzip menor que
metade, identidade equivalente, HEAD vazio, 304 vazio e API sem compressão.
Build e regressões de formulário completam a etapa. Isso reduz bytes de rede;
não prova CWV real ou throughput, pois compressão tem custo de CPU. Pages segue
o cache/compressão de seu provedor. Rollback é revert do commit sem migração.
