---
title: How to evaluate MCP server security
description: A source-to-permissions checklist for assessing an MCP server before connecting sensitive tools or data.
category: Security
tags: [security, evaluation, permissions, supply-chain]
author: MCP Sift
date: "2026-10-05"
---
## Begin with the source

Identify who publishes the server and where its canonical documentation lives. An “official” label should mean that the connected service or project maintains the implementation—not merely that its name appears in the repository title.

For an open-source server, examine release history, recent maintenance, issue handling, dependency updates, and installation instructions. Popularity can help identify community adoption, but stars are not a security audit.

## Inventory capabilities

Read the exposed tool descriptions before enabling the server. Separate read operations from actions that create, modify, send, execute, or delete something.

Ask three questions for every consequential capability:

1. What system can it reach?
2. Which identity and permissions does it use?
3. What review or approval occurs before execution?

Do not rely on a friendly tool name. The implementation and underlying API determine the actual effect.

## Minimize access

Use a test project, dedicated account, restricted folder, or read-only credential where possible. Avoid organization-wide tokens and production resources during evaluation. If the service cannot scope access adequately, decide whether the convenience justifies the larger impact of a mistake or compromised dependency.

Review the [authentication guide](/guides/mcp-server-authentication/) for credential-specific controls.

## Consider untrusted content

Connected repositories, tickets, documents, web pages, and messages can contain misleading instructions. Retrieved content should be treated as data, not as authority to change configuration, disclose secrets, or bypass the user's request.

Keep confirmation boundaries for external communication, financial activity, deletion, code execution, and permission changes.

## Review operations and updates

Determine how the server is updated, whether versions can be pinned, where logs are stored, and how access is revoked. For a remote service, review the operator's privacy, retention, incident response, and availability information. For a local package, consider dependency and install-script risk.

Reassess the connection after material version or permission changes. A review performed at installation does not cover every future release.

## Record the decision

For team use, document the approved server, source URL, version or endpoint, credential owner, allowed resources, expected tools, and review date. This small record makes later audits and removals considerably easier.

