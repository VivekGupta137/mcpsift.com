---
title: How to use an MCP server
description: Find a server, review the setup, and make your first connection.
category: Getting started
tags: [setup, configuration, tutorial]
author: MCP Sift
date: "2026-10-04"
---
## Before you begin

Start with an MCP-compatible client and a server you trust. Keep the server’s README open as you work through the setup. Your client and the server must support the same connection method.

This guide explains the general workflow. It does not replace the installation instructions for your chosen client or server.

## 1. Find a server

Browse the [directory](/) for a tool that matches your task. Before installing, check:

- What the server can access and which actions can change data.
- Which clients and connection methods it supports.
- The source code, publisher, and installation instructions.
- Whether it requires an account, API key, or subscription.

For a first experiment, a documentation integration is often easier to reason about than a tool with write access to an important workspace.

## 2. Configure your client

Follow the README for your client. A local server configuration may look like this:

```json
{
  "mcpServers": {
    "example": {
      "command": "<command-from-README>",
      "args": ["<argument-from-README>"]
    }
  }
}
```

This is a **template**, not a runnable installation. Replace the placeholders using the server’s instructions. Some clients use a different top-level key or a graphical configuration interface.

Remote servers instead use a URL and the authentication mechanism supported by the service. Complete the sign-in flow in your client rather than committing credentials to a shared project.

> Give a server only the access it needs. Review permissions before you connect it to your workspace.

## 3. Check the connection

Confirm that the client can discover the server’s tools. If something looks wrong, work through the basics before changing unrelated settings.

| Check | What to review |
| --- | --- |
| Setup | Executable, command, and arguments |
| Access | Required permissions and credentials |
| Connection | Client logs, network access, and the README |
| Compatibility | The client’s supported transport and server requirements |

Reconnect or restart the client if its documentation calls for that. Try a read-only action first, such as listing available capabilities or retrieving documentation.

## 4. Keep the connection healthy

Review release notes before updating. Pin versions when you need repeatable setups, rotate credentials when required, and remove integrations you no longer use.

For more background, read [What is an MCP server?](/guides/what-is-mcp/). For specific setup instructions, open the server’s detail page and its repository README.
