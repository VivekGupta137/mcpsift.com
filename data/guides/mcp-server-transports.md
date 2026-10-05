---
title: MCP server transports explained
description: Understand stdio and Streamable HTTP connections and choose the transport supported by your MCP client.
category: Fundamentals
tags: [transport, stdio, streamable-http, networking]
author: MCP Sift
date: "2026-10-05"
---
## What a transport does

The transport carries protocol messages between an MCP client and server. It does not determine which tools a server provides or what those tools may access. Two servers can expose similar capabilities while using different transports and deployment models.

The client and server must share a supported transport. A mismatch is a connection problem, not something a prompt can correct.

## Standard input and output

With `stdio`, the client starts a local server process and exchanges messages through its standard input and output streams. The client configuration normally supplies an executable, arguments, and environment variables.

This model is useful when:

- The integration needs controlled access to local files or applications.
- The user can install the required runtime.
- Credentials should remain on the local machine.
- Each user should run an isolated server process.

The process must reserve standard output for protocol communication. Diagnostic text generally belongs in standard error according to the server's implementation guidance.

## Streamable HTTP

Streamable HTTP supports network-accessible MCP servers. A client connects to an HTTPS endpoint managed by the server operator. This can simplify updates and make one managed service available across devices or teams.

Remote operation introduces additional considerations: authentication, TLS, network policy, service availability, data residency, rate limits, and the operator's retention practices. “Remote” does not mean public or anonymous.

## Older connection methods

Some projects still mention HTTP with Server-Sent Events, often abbreviated SSE. Treat the project's current documentation as authoritative. Do not assume that an older endpoint works with a client that supports only a newer transport, or that two similarly named HTTP modes are interchangeable.

## How to choose

You usually do not choose a transport independently—the server and client documentation determine the compatible options. When both local and remote deployments exist, compare:

| Consideration | Local `stdio` | Remote HTTP |
| --- | --- | --- |
| Installation | Runtime or executable on each machine | Usually endpoint configuration |
| Updates | Managed by the user or client | Managed by the service operator |
| Local resource access | Direct but should be tightly scoped | Requires an explicit remote design |
| Availability | Depends on the local process | Depends on network and service uptime |
| Authentication | Often environment-based | Often OAuth or service credentials |

After choosing an implementation, use the [installation guide](/guides/install-an-mcp-server/) and verify its permissions before connecting important data.

