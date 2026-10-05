---
title: HeroUI
description: Bring component docs, examples, and design tokens into your AI-powered workflow.
category: Design & UI
tags: [react, components, design-system, documentation]
icon: layers
source: Official
owner: heroui-inc
transport: stdio
authentication: No account required for public documentation
githubUrl: https://github.com/heroui-inc/heroui-mcp
readmeUrl: https://github.com/heroui-inc/heroui-mcp/blob/main/apps/react-mcp/README.md
documentationUrl: https://heroui.com/en/docs/react/getting-started/mcp-server
---
## Overview

Build with the documentation beside you. The **HeroUI React MCP server** gives your assistant access to HeroUI v3 component documentation, examples, source references, and theme information.

It is a publicly available package that runs locally, rather than an anonymous hosted MCP endpoint. The React server supports **HeroUI v3**; HeroUI Native has its own package.

## Configuration

Install Node.js 22 or later. In a client that accepts `mcpServers` configuration, add:

```json
{
  "mcpServers": {
    "heroui-react": {
      "command": "npx",
      "args": ["-y", "@heroui/react-mcp@latest"]
    }
  }
}
```

Restart or reconnect your client, then ask it to list the available HeroUI components. Configuration formats differ between clients; use the official documentation for your client’s exact format.

## What you can do

- Discover available components before choosing one.
- Read usage examples, props, and composition patterns.
- Inspect theme variables and component styles.
- Reference the implementation when debugging an integration.

> This server provides documentation. It does not automatically install HeroUI into your project or publish changes to your app.
