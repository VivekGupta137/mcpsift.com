---
title: Memory
description: Keep useful context across conversations with a local knowledge graph.
category: Knowledge
tags: [memory, knowledge-graph, local, reference-server]
icon: memory
source: Reference
owner: modelcontextprotocol
transport: stdio
authentication: Local process access
githubUrl: https://github.com/modelcontextprotocol/servers
readmeUrl: https://github.com/modelcontextprotocol/servers/blob/main/src/memory/README.md
documentationUrl: https://github.com/modelcontextprotocol/servers/tree/main/src/memory
---
## Overview

The **Memory MCP server** lets an assistant store and retrieve information using a knowledge graph. Entities, relations, and observations provide a structured way to keep context between interactions.

The data is stored by the local server. Decide which information is appropriate to persist before enabling it.

## Configuration

For a client using the `mcpServers` format:

```json
{
  "mcpServers": {
    "memory": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-memory"]
    }
  }
}
```

Consult the README for storage configuration and environment variables. Set a deliberate storage location if you need predictable persistence or backups.

> Persistent memory can contain sensitive information. Review what is stored, who can read it, and how to delete it.
