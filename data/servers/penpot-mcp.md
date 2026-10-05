---
title: Penpot
description: Connect your assistant to an editable design canvas, from inspection to creation.
category: Design & UI
tags: [design, canvas, prototyping, open-source]
icon: palette
source: Official
owner: penpot
transport: Streamable HTTP / SSE
authentication: Connected Penpot file and MCP plugin
githubUrl: https://github.com/penpot/penpot-mcp
readmeUrl: https://github.com/penpot/penpot-mcp/blob/main/README.md
documentationUrl: https://penpot.app/ai/mcp-server
---
## Overview

The **Penpot MCP server** connects an AI client to a Penpot design file through the Penpot Plugin API. Use it to inspect a design, transform existing elements, or create new editable layouts.

The project includes both the MCP server and a companion plugin. A running, connected plugin is part of the workflow; simply entering a URL does not grant access to a canvas.

## Configuration

For the self-hosted setup, clone the official repository and run its bootstrap command:

```bash
git clone https://github.com/penpot/penpot-mcp.git
cd penpot-mcp
npm install
npm run bootstrap
```

Follow the repository instructions to open the MCP plugin in your Penpot file and connect it to the server. Keep the plugin open while working.

The local server provides a Streamable HTTP endpoint:

```text
http://localhost:4401/mcp
```

Configure an HTTP-capable MCP client with that address. For the hosted setup and current plugin installation instructions, use [Penpot’s official MCP guide](https://penpot.app/ai/mcp-server).

## Before you connect

- Open the file you want your assistant to work on.
- Verify that the plugin reports an active connection.
- Review changes carefully: the tools can modify the design.
- Avoid sharing a local server with untrusted clients.
