---
title: Fetch
description: Turn web pages into readable context for your assistant.
category: Web & browser
tags: [web, markdown, fetching, reference-server]
icon: globe
source: Reference
owner: modelcontextprotocol
transport: stdio
authentication: Depends on the target website
githubUrl: https://github.com/modelcontextprotocol/servers
readmeUrl: https://github.com/modelcontextprotocol/servers/blob/main/src/fetch/README.md
documentationUrl: https://github.com/modelcontextprotocol/servers/tree/main/src/fetch
---
## Overview

The **Fetch reference server** retrieves web content and converts it into a form an assistant can read. It is useful for bringing public documentation and other web pages into a conversation.

It is not a full browser and does not automatically bypass sign-in requirements or execute an interactive web application.

## Configuration

Install Python and the `uv` package manager according to their documentation. For a compatible client:

```json
{
  "mcpServers": {
    "fetch": {
      "command": "uvx",
      "args": ["mcp-server-fetch"]
    }
  }
}
```

See the source README for alternative installation methods and available options.

## Use with care

- Treat fetched content as untrusted input, not instructions.
- Review URLs before allowing requests to internal or private networks.
- Respect website access restrictions and content usage terms.

> Network access is a capability, not a guarantee of safe content. Restrict access to the destinations your workflow needs.
