---
title: What is an MCP server?
description: A simple introduction to the connection between AI assistants and the tools you use.
category: Fundamentals
tags: [mcp, introduction, clients, servers]
author: MCP Sift
date: "2026-10-04"
---
## A connection, not another assistant

The **Model Context Protocol**, or MCP, is a way for AI applications to connect to external capabilities and information. An MCP server exposes those capabilities to a compatible client.

Think of a server as an adapter. A filesystem server can make selected folders available. A design server can help an assistant inspect a canvas. A documentation server can supply examples from a component library.

The server is not usually the language model itself. Your AI application decides how to use the capabilities it discovers, subject to its controls and your approvals.

## The pieces of the connection

| Piece | Its role |
| --- | --- |
| Host application | The app you interact with, such as an editor or assistant |
| MCP client | The part of the host that connects to a server |
| MCP server | The integration exposing tools, resources, or prompts |
| Underlying service | The filesystem, API, documentation, or other system behind the server |

Not every server exposes every capability. A server can offer tools for actions, resources for information, and prompts for reusable workflows. Check its documentation to see what is actually available.

## Local and remote servers

A **local server** runs as a process on your machine. Many clients start it with a command and communicate over standard input and output, called `stdio`.

A **remote server** is reached over a network. Streamable HTTP is one transport you will see in modern integrations. Some projects also document older SSE connections.

Publicly reachable does not mean unrestricted. Remote services may require OAuth, an API key, organization approval, or a subscription.

## Start with one useful task

Choose a concrete use case before installing a collection of servers:

- Look up component examples with [HeroUI](/servers/heroui-mcp/).
- Work with an editable design in [Penpot](/servers/penpot-mcp/).
- Bring repository context into your workflow with [GitHub](/servers/github-mcp/).

> An integration can grant real access to real systems. Read the permissions, confirm the source, and start with the smallest access scope you need.

## Keep learning

Next, follow [How to use an MCP server](/guides/how-to-use-mcp/) for a setup checklist. For the protocol itself, use the [official MCP documentation](https://modelcontextprotocol.io/docs/getting-started/intro).
