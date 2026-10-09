# Skills compartilhadas — techtogs-landing-page

Biblioteca: [techtogs-utilities](https://github.com/vinnitog/techtogs-utilities).
Manifesto: `.techtogs-utilities.json`. Perfis: core, planning, frontend, javascript, web-qa, infra.

As pastas de descoberta `.agents/skills` e `.claude/skills` apontam para uma unica
copia compartilhada. `.claude/agents` disponibiliza os cinco perfis de agentes;
no Codex, os mesmos papeis podem ser aplicados na sessao ou em subagentes conforme
autorizacao e ferramentas disponiveis. Toml internos de skills continuam dentro delas.
Instalar o catalogo nao executa scripts, hooks, deploys, issues ou alteracoes de produto.

## Setup e verificacao

Clone a biblioteca ao lado deste projeto. Use um checkout do commit fixado no
manifesto; para versoes diferentes entre consumidores, use clones separados e
`TECHTOGS_UTILITIES_PATH`. Nao atualize o checkout compartilhado silenciosamente.

```powershell
git clone git@github.com:vinnitog/techtogs-utilities.git
# Na raiz deste projeto:
powershell.exe -NoProfile -ExecutionPolicy Bypass -File scripts/bootstrap-utilities.ps1
powershell.exe -NoProfile -ExecutionPolicy Bypass -File scripts/bootstrap-utilities.ps1 -Action verify
```

O bootstrap tambem aceita `-UtilitiesPath` para uma biblioteca em outro diretorio.
O manifesto usa caminhos relativos e hashes; caminhos locais nao sao publicados.
As pastas compartilhadas sao geradas e ignoradas. Arquivos anteriormente versionados
aparecerao como remocoes de conteudo vendorizado na revisao da migracao; o manifesto,
bootstrap e regras locais devem entrar no mesmo commit antes de clonar em outra maquina.
Nao incluir alteracoes de codigo anteriores na migracao.

## Regras e roteamento

Leia `AGENTS.md` e o contexto real do projeto. Capacidade planejada nao ativa uma
skill de servico em producao. Perfil mobile web/PWA nao implica React Native,
Kotlin ou Swift. Escolha apenas skills pertinentes a tarefa; o catalogo completo
e consultavel na biblioteca sem instalar todos os perfis.
Comandos Matt de orquestracao continuam sujeitos ao fluxo Git e autorizacao locais.
Tracker e vocabulário de triagem sao configurados por projeto em `docs/agents/`;
`setup-matt-pocock-skills` e opcional e nao roda durante o bootstrap.
Leia estas regras locais sempre que a tarefa corresponder ao seu dominio:

- Contexto, regras de negocio e comandos permanecem nos documentos locais existentes.

Os textos antigos do hub nao sao um mecanismo de atualizacao: o togs-backoffice
foi descontinuado e nao e dependencia deste projeto.

## Reversao

Na maquina onde ocorreu a migracao, `-Action rollback` restaura as copias anteriores
usando os backups privados da biblioteca. Nao remove documentos novos nem sobrescreve
mudancas posteriores do usuario. Em um clone novo, use o historico Git para restaurar
a versao vendorizada. Backups locais nao sao enviados ao GitHub.
