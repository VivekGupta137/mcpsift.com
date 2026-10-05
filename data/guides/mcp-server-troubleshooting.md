---
title: MCP server troubleshooting guide
description: Diagnose connection, startup, authentication, and tool-discovery problems step by step.
category: Troubleshooting
tags: [troubleshooting, errors, configuration, debugging]
author: MCP Sift
date: "2026-10-05"
---
## Identify where the failure occurs

An MCP connection involves a client, a transport, a server, and often an underlying API. Start by locating the failing layer instead of repeatedly reinstalling everything.

- If the server never starts, inspect the command, runtime, path, and environment.
- If it starts but disconnects, compare the client and server transports.
- If it connects but exposes no tools, inspect initialization logs and server configuration.
- If tools fail, check credentials, permissions, input values, and the upstream service.

## Verify the command outside the client

For a local server, run the documented executable with the documented arguments in a terminal. A “command not found” error normally indicates that the runtime or package is missing from the environment used by the client. An immediate process exit usually leaves a useful error in standard error or a log file.

Desktop applications may not inherit the same `PATH` as an interactive terminal. When the documentation permits it, use an absolute executable path or configure the runtime where the application can find it.

Do not type protocol messages into a `stdio` server merely because it appears idle. Waiting for structured input can be normal behavior.

## Check configuration syntax

Validate JSON and confirm that the configuration was added to the correct file and profile. Frequent mistakes include:

- Smart quotes copied from formatted text.
- A trailing comma in strict JSON.
- Arguments combined into one string instead of an array.
- Environment variables placed outside the server definition.
- Editing one client's configuration while testing another.

Reload the client after making changes if it does not watch the file automatically.

## Match the transport

A command-based `stdio` configuration cannot connect directly to an HTTP endpoint. Likewise, placing a local command in a remote-server URL field will not work. Review [MCP server transports](/guides/mcp-server-transports/) and use the connection method documented by both products.

For a remote server, verify the exact HTTPS URL, redirects, proxy settings, TLS errors, and whether the service is reachable from the network where the client runs.

## Recheck authentication

An expired token can make a healthy connection look broken. Confirm that credentials belong to the expected account and environment, have the required scope, and are available to the server process. Never print full secrets into shared logs.

If OAuth authorization loops or fails, remove only the affected connection through the client's documented account controls, then authorize it again. Do not delete unrelated application data.

## Reduce the test case

Test one server with one simple, read-only request. Temporarily remove optional arguments and integrations, while preserving any required authentication. Capture the exact error, timestamp, client version, server version, operating system, and minimal configuration with secrets replaced by placeholders.

That information makes repository issues actionable and helps distinguish a server defect from local configuration.

