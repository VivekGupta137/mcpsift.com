---
title: GitHub
description: Bring repositories, issues, and pull requests into your development workflow.
category: Developer tools
tags: [repositories, issues, pull-requests, remote]
icon: github
source: Official
owner: github
transport: Streamable HTTP
authentication: GitHub OAuth or a scoped personal access token
githubUrl: https://github.com/github/github-mcp-server
readmeUrl: https://github.com/github/github-mcp-server/blob/main/README.md
documentationUrl: https://github.com/github/github-mcp-server#remote-github-mcp-server
endpoint: https://api.githubcopilot.com/mcp/
---
## Overview

The **GitHub MCP server** connects your AI tools to GitHub context and capabilities. Work with repositories, review issues and pull requests, and investigate development workflows from a compatible MCP client.

GitHub provides a publicly reachable remote endpoint. **Authentication and applicable account or organization policies still apply.** This is not an unauthenticated gateway to private repositories.

## Configuration

In VS Code, the OAuth-based remote configuration uses `.vscode/mcp.json`:

```json
{
  "servers": {
    "github": {
      "type": "http",
      "url": "https://api.githubcopilot.com/mcp/"
    }
  }
}
```

Complete the sign-in flow in your client. Other clients may use a different configuration format or require a token. Follow the linked installation instructions rather than pasting a token into a repository.

## Useful workflows

- Explore a repository’s code and structure.
- Read, create, and update issues and pull requests.
- Inspect workflow runs and development activity.

> Start with the narrowest available permissions and tool set. Confirm write operations before letting an assistant change a repository.
