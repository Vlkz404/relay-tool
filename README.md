# WhatsApp Control Center

Aplicação web para controlar instâncias da Evolution API, disparos, aquecimento,
IA, contatos, exports e logs — substituindo os menus de terminal legados.

## Arquitetura

| Área | Responsabilidade |
| --- | --- |
| `apps/web` | Painel web Next.js: operação, status e relatórios. |
| `apps/api` | API Fastify: autenticação futura, validação, banco e comandos. |
| `apps/worker` | Processos duráveis: disparos, aquecimento, IA e exportações. |
| `packages/core` | Regras reutilizáveis, cliente Evolution, IA e erros padronizados. |

O estado deixa de ficar em `job.json`, PID e arquivos de log. Campanhas e seus
destinatários ficam no PostgreSQL; o worker executa somente itens pendentes.

## Banco e fila

O banco recomendado é **PostgreSQL**. Localmente, o `docker-compose.yml` sobe
um Postgres. Em produção pode-se usar o plano gratuito do Supabase, apenas
substituindo `DATABASE_URL`. A fila usa o próprio PostgreSQL via `pg-boss`,
evitando Redis/Firebase como dependência obrigatória.

Firebase não é o banco principal indicado: campanhas, tentativas, filtros,
exports e logs são relacionais e auditáveis; PostgreSQL resolve isso melhor.

## Primeiro uso

```bash
cp .env.example .env
npm install
npm run db:up
npm run db:migrate
npm run dev
```

- Web: `http://localhost:3000`
- API: `http://localhost:3333/health`

O `npm run dev` mantém web, API e worker em observação e reinicia quando houver
alterações. Nunca grave chaves reais em código, `.env.example` ou commits.

## Módulos de negócio

- **Envio padrão**: grupo(s), contato único, lista, todos os contatos da API.
- **Contatos**: cadastro manual, importação VCF/XLSX, leitura/puxada da
  Evolution, deduplicação e bloqueios/opt-out.
- **Aquecimento**: jobs próprios, limite diário, espera de resposta e status.
- **IA**: provider, modelo, personas e templates.
- **Logs de envio**: somente sucesso/falha de cada tentativa.
- **Logs de desenvolvimento**: chamadas internas/externas, duração, erros e
  payloads sanitizados. Credenciais jamais são armazenadas nesse log.

## Migração do script antigo

As funções existentes devem ser migradas para `packages/core/src` aos poucos.
Não copie o menu CLI, PID ou arquivos `status.json`: converta cada fluxo para
serviços puros e persistência no banco.

