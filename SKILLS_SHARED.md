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
git -c core.autocrlf=false clone --no-checkout git@github.com:vinnitog/techtogs-utilities.git ../techtogs-utilities-bd46a3d293ae
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

## Atualizacao central — 2026-10-09

Pin ativo: `bd46a3d293aec0c85bdc5a1be6b1a2c6477438a7`. A divergencia de senior-dev foi corrigida nesta versao; notas anteriores sobre o bloqueio do checkout antigo sao historicas. O checkout antigo e suas edicoes locais permanecem preservados.

O bootstrap procura por padrao `../techtogs-utilities-bd46a3d293ae`, verificando o pin completo e os hashes. `-UtilitiesPath` e `TECHTOGS_UTILITIES_PATH` continuam aceitos; use a versao fixada. Em outra maquina:

```powershell
git -c core.autocrlf=false clone --no-checkout git@github.com:vinnitog/techtogs-utilities.git ../techtogs-utilities-bd46a3d293ae
git -C ../techtogs-utilities-bd46a3d293ae -c core.autocrlf=false checkout --detach bd46a3d293aec0c85bdc5a1be6b1a2c6477438a7
powershell.exe -NoProfile -ExecutionPolicy Bypass -File scripts/bootstrap-utilities.ps1
powershell.exe -NoProfile -ExecutionPolicy Bypass -File scripts/bootstrap-utilities.ps1 -Action verify
```

A chave privada de CI existente consome `libraryCommit`; nao versionar credenciais nem junctions. Publique manifesto, bootstrap, workflow de autenticacao, regras e remocoes da migracao juntos, pelo fluxo Git do projeto, preservando outras alteracoes.

`-Action rollback` atua apenas na instalacao deste checkout novo. Para retornar ao estado local exato anterior a esta transicao, use o journal privado da transicao e seu comando restore, que restaura os metadados e links originais depois do rollback novo. O rollback do checkout antigo nao deve ser aplicado aos novos links. Nao restaure descobertas retiradas do manifesto atual.
