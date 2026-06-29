Adicionar regras específicas para o projeto ToolForge IA no ficheiro de system messages do Continue.

Objetivo:
Forçar o agente a trabalhar de forma segura no projeto `Y:\IA`, sem partir funcionalidades existentes, sem apagar ficheiros e sem declarar sucesso sem validação real.

Adicionar este bloco perto das constantes existentes:

```ts core/llm/defaultSystemMessages.ts
export const TOOLFORGE_PROJECT_RULES = `\
<toolforge_project_rules>
  Project context:
  - The main project is ToolForge IA located at Y:\\IA.
  - Production URL is https://www.toolforge.pt/IA/.
  - Backend is plain PHP 8.4 with MySQL.
  - Frontend is HTML/CSS/JavaScript/jQuery.
  - Do not convert the project to Laravel, React, Vue, Next.js, Node, Express, or any new framework.
  - Preserve the existing structure unless explicitly asked otherwise.

  Critical files:
  - index.php is the main workspace/chat UI.
  - login.php is the Google login page.
  - bootstrap.php contains common helpers such as db(), auth, JSON responses, logging, and permissions.
  - config.php loads config, .env, providers, models, fallback and authorization settings.
  - api/process.php is the main chat/model execution endpoint.
  - assets/css/style.css is the main theme stylesheet.
  - assets/js/script.js is the main frontend logic.
  - admin/index.php is the admin area.
  - api/ai_models.php and admin/ai_models.php handle the AI model manager.
  - api/admin_users.php and admin/users.php handle user management when present.

  Safety rules:
  - Never delete files. Rename or move to a timestamped backup folder instead.
  - Before large changes, create a backup folder named _backup_<topic>_YYYYMMDD_HHMM.
  - Never edit or expose .env secrets.
  - Never print, move, log, or reveal API keys.
  - Never hardcode API keys in frontend, PHP, JavaScript, HTML, logs, screenshots, or comments.
  - Never store secrets in database fields meant for public/admin UI.
  - Do not modify database destructively.
  - Do not DROP, TRUNCATE, or DELETE production data unless explicitly instructed.
  - Migrations must be idempotent and safe to run multiple times.
  - Prefer ALTER TABLE ADD COLUMN IF MISSING patterns and CREATE TABLE IF NOT EXISTS.
  - Never declare a task complete without testing the affected URL or endpoint.

  PHP rules:
  - Always run php -l on every changed PHP file.
  - Avoid duplicate function declarations.
  - Before adding a helper function, search whether it already exists.
  - If a helper may already exist, wrap with function_exists() or reuse the existing function.
  - Do not redeclare log_access(), log_ai_usage(), json_response(), db(), current_user(), require_login(), require_admin(), csrf_token(), verify_csrf(), or is_admin().
  - API endpoints must always return valid JSON.
  - API endpoints must never return HTTP 500 with an empty body.
  - Use try/catch(Throwable $e) in API endpoints.
  - On errors, log technical details with error_log(), but return safe JSON to the browser.
  - Do not echo debug output before JSON headers.
  - Do not leave closing ?> tags in pure PHP files unless necessary.

  Authentication and permissions:
  - Admin access must never be based only on the display name "Marcelo Santos".
  - Admin must be validated by ADMIN_EMAIL, google_id/sub, role, and active status.
  - Marcelo Santos is the only admin unless explicitly changed.
  - Daniela Vala and Ana Vala are normal users.
  - Frontend hiding is not security. Backend admin endpoints must call require_admin().
  - Normal users must not access Gestor de IAs, Utilizadores, Consumos, Chaves API, Acessos, or Auditoria.

  AI model behavior:
  - Manual model selection must never silently fallback to another model.
  - If a manually selected model fails, show a clear error.
  - Auto/Maestro mode may use fallback.
  - If fallback is used, record and display the requested model and the actual model used.
  - Model status must be persisted in ai_models:
    status, last_test_at, last_latency_ms, last_error.
  - Testing a model must update the database, even when the test fails.
  - Offline test result should be saved as status = offline with last_error.
  - Unknown provider must not crash the app.

  Admin UI rules:
  - Admin pages must use the same dark ToolForge theme as the workspace.
  - Do not create raw HTML admin tables without the shared admin layout.
  - Use a shared admin template/layout when possible.
  - Admin pages must have sidebar/menu, topbar/header, content container, cards, modern tables, and styled buttons.
  - Admin menu should include Dashboard, Modelos, Utilizadores, Custos, Chaves API, Acessos, Auditoria, and Voltar ao Workspace.
  - Pages should not contain unstyled loose links or browser-default buttons.

  Theme and UX rules:
  - Preserve the dark workspace theme.
  - Do not accidentally reset the app to a white theme.
  - Chat bubbles should remain compact, readable, and dark themed.
  - User messages must preserve pasted formatting, line breaks, YAML, configs, and lists.
  - Escape user HTML before rendering it.
  - Use CSS white-space: pre-wrap for user message content.
  - Do not break assistant markdown/code formatting.
  - Login page should use a proper Google-style button with Google G icon and text "Continuar com Google".
  - Do not change the OAuth flow unless explicitly requested.

  Logging and costs:
  - Log access events when available: login, logout, admin access, forbidden access, model changes, user changes.
  - Log AI usage when available: user, provider, requested model, used model, fallback, tokens, cost, latency, success/error.
  - If provider does not return usage tokens, store zero tokens and do not crash.
  - Do not store full prompt content by default unless LOG_PROMPT_CONTENT=true.

  Testing requirements:
  - For PHP changes, report php -l results.
  - For endpoint changes, report real HTTP status and response body.
  - For production fixes, test the production URL, not just local files.
  - For index.php/homepage recovery, verify https://www.toolforge.pt/IA/index.php returns HTTP 200 or expected 302 when logged out.
  - For login, verify https://www.toolforge.pt/IA/login.php returns HTTP 200.
  - For admin pages, verify admin can access and normal users get 403.
  - Do not say "fixed", "stable", or "ready" without showing the actual test results.

  Working style:
  - Make minimal, targeted changes.
  - Avoid broad rewrites.
  - Do not rebuild modules from scratch unless the user explicitly requests it.
  - If something is broken, isolate the broken module first instead of changing unrelated areas.
  - Prefer one small fix, test, then continue.
  - In final reports, list files changed, what changed, tests run, and any pending issues.
</toolforge_project_rules>`;
```

Depois injetar o bloco nas system messages.

No `DEFAULT_CHAT_SYSTEM_MESSAGE`, adicionar antes de `</important_rules>`:

```ts core/llm/defaultSystemMessages.ts
${TOOLFORGE_PROJECT_RULES}
```

No `DEFAULT_AGENT_SYSTEM_MESSAGE`, adicionar também antes de `</important_rules>`:

```ts core/llm/defaultSystemMessages.ts
${TOOLFORGE_PROJECT_RULES}
```

No `DEFAULT_PLAN_SYSTEM_MESSAGE`, adicionar também, mas o plano deve continuar read-only:

```ts core/llm/defaultSystemMessages.ts
${TOOLFORGE_PROJECT_RULES}
```

Resultado esperado:

```ts core/llm/defaultSystemMessages.ts
export const DEFAULT_AGENT_SYSTEM_MESSAGE = `\
<important_rules>
  You are in agent mode.

  If you need to use multiple tools, you can call multiple read-only tools simultaneously.

${CODEBLOCK_FORMATTING_INSTRUCTIONS}

${BRIEF_LAZY_INSTRUCTIONS}

${TOOLFORGE_PROJECT_RULES}

However, only output codeblocks for suggestion and demonstration purposes, for example, when enumerating multiple hypothetical options. For implementing changes, use the edit tools.

</important_rules>`;
```
