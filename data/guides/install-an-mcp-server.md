---
title: How to install an MCP server
description: A practical workflow for installing, configuring, and testing a local or remote MCP server.
category: Getting started
tags: [installation, setup, configuration, tutorial]
author: MCP Sift
date: "2026-10-05"
---
## Start with the server's documentation

There is no single installation command for every MCP server. A server may be a local Node.js or Python process, a desktop application, a container, or a remote service. Open the project's official documentation and confirm the supported clients, runtime, connection method, and required credentials before installing anything.

Use the [MCP server directory](/) to find the project's source repository. Prefer an official server when one is available, and review recent releases and repository activity before relying on a community implementation.

## Identify the connection type

A local server commonly communicates through standard input and output, usually called `stdio`. Your AI client starts the process using a command and arguments from its configuration.

A remote server usually provides an HTTPS endpoint. Modern implementations commonly use Streamable HTTP. A remote connection may open an authorization flow instead of asking you to paste a credential into configuration.

Do not substitute one transport for another. The client and server must support the same connection method.

## Install local prerequisites

The repository README should identify its runtime and package manager. Common requirements include Node.js, Python, Docker, or a standalone executable. Install only from the source linked by the maintainer and avoid copying commands from an unrelated directory page.

Before editing your client configuration, run the documented command in a terminal when the project supports doing so. This can reveal missing runtimes, packages, environment variables, or file permissions independently of the client.

## Add the client configuration

A typical local configuration contains a command, optional arguments, and environment variables:

```json
{
  "mcpServers": {
    "example": {
      "command": "<documented-command>",
      "args": ["<documented-argument>"],
      "env": {
        "EXAMPLE_API_KEY": "<set-this-securely>"
      }
    }
  }
}
```

Property names and configuration locations vary by client. Use the client's documentation rather than assuming this example can be pasted unchanged.

For a remote server, add the documented HTTPS URL through the client's remote-server flow. Complete OAuth or another authorization step only on the expected service domain.

## Test a narrow workflow

Restart or reload the client if its documentation requires it. Confirm that the server appears, inspect the tools it exposes, and test a read-only operation first. Avoid granting access to an entire home directory or production account merely to verify the connection.

If the server does not appear, work through the [MCP server troubleshooting guide](/guides/mcp-server-troubleshooting/) and check the client's logs. Once it works, follow the [server permissions checklist](/guides/server-permissions/) before expanding access.

