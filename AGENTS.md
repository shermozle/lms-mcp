# Agent Instructions for lms-mcp

This file contains guidance for AI coding agents working on the **lms-mcp** project.

## Project Overview

`lms-mcp` is a TypeScript/Node.js Model Context Protocol (MCP) server that exposes Lyrion Music Server (LMS, formerly Logitech Media Server / Squeezebox Server) functionality as LLM-callable tools.

- **Protocol**: MCP over stdio
- **LMS API**: JSONRPC via HTTP (`/jsonrpc.js`)
- **Language**: TypeScript (ES modules)
- **Runtime**: Node.js 20+

## Project Structure

```
src/
├── index.ts          # Entry point: loads config, starts LMSServer
├── mcp-server.ts     # MCP Server, tool definitions, handlers
├── lms-client.ts     # LMS JSONRPC client wrapper
├── types.ts          # Zod schemas and TypeScript types
└── config.ts         # Environment-based configuration

dist/                 # Compiled JS output (not committed)
README.md             # Human-facing documentation
AGENTS.md             # This file
```

## Build & Run

```bash
# Install dependencies
npm install

# Build TypeScript
npm run build

# Run smoke test
node test-mcp.js

# Start server (stdio MCP)
npm start

# Development mode
npm run dev
npm run watch
```

Always run `npm run build` after changing TypeScript source. The committed `dist/` directory is ignored; users build it themselves.

## Adding or Modifying Tools

When adding a new MCP tool:

1. **Add the LMS client method** in `src/lms-client.ts`.
   - Keep method names descriptive and consistent.
   - Use `this.sendRequest({ id: 1, method: 'slim.request', params: [...] })`.
   - Player/server-wide commands: use player ID `"0"` only for server-wide queries; use a real player ID for commands that act on or browse a player.

2. **Register the tool** in `src/mcp-server.ts`.
   - Add a tool object to the array inside `ListToolsRequestSchema`.
   - Add the matching `case` in the `CallToolRequestSchema` handler.
   - Use proper MCP tool annotations:
     - Read-only tools: `annotations: { readOnlyHint: true }`
     - Destructive tools (delete, clear, rescan): `annotations: { destructiveHint: true }`
     - Other write tools: `annotations: { readOnlyHint: false }`

3. **Update types** in `src/types.ts` if new shared types or Zod schemas are needed.

4. **Update documentation** in `README.md`.
   - Add the tool to the relevant feature list.
   - Add an API reference section.

5. **Test** with `npm run build && node test-mcp.js`.

## Code Style

- Use single quotes for strings.
- Use 2-space indentation.
- Prefer explicit types over `any` for new code.
- Keep LMS CLI command strings exactly as LMS expects them; verify against a live LMS or the [Lyrion CLI reference](https://lyrion.org/reference/cli/introduction/) when unsure.

## Configuration

Configuration comes from environment variables:

- `LMS_HOST` (default: `localhost`)
- `LMS_PORT` (default: `9000`)
- `LMS_PROTOCOL` (`http` or `https`, default: `http`)
- `LMS_TIMEOUT` (ms, default: `10000`)

Do not hardcode credentials, IPs, or secrets. `.env` and `env` files are gitignored.

## Common Pitfalls

- **Player ID `"0"` vs real player ID**: Some LMS commands (e.g. `search` for TuneIn, app browsing) require a real player ID and will drop the connection if called with `"0"`.
- **`dist/` is ignored**: Remember to build before running `node dist/index.js` or `test-mcp.js`.
- **XMLBrowser apps**: TIDAL, Spotify, Qobuz, etc. are browsed via their `cmd` field. Play commands use `[cmd, 'playlist', 'play', 'item_id:...']`.

## Testing

The only automated test is `test-mcp.js`, which starts the compiled server and verifies `tools/list` and `test_connection`. For new tools, manually test against a live LMS when possible.
