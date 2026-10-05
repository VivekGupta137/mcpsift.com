---
title: MCP server authentication guide
description: Compare API keys, environment variables, OAuth, and practical credential controls for MCP servers.
category: Security
tags: [authentication, oauth, api-keys, credentials]
author: MCP Sift
date: "2026-10-05"
---
## Authentication and authorization are different

Authentication establishes which user or application is connecting. Authorization determines what that identity may do. A successful login does not mean every exposed capability is appropriate for an AI-assisted workflow.

Review both the MCP server's access and the permissions of the underlying account.

## API keys and tokens

Local servers often receive credentials through environment variables. Keep secrets outside source-controlled configuration whenever the client or operating system offers a secure alternative.

- Create a dedicated credential when the service supports it.
- Choose the smallest available scope.
- Separate development and production access.
- Set an expiration date when practical.
- Rotate credentials after accidental exposure.

Never place real keys in tutorials, screenshots, issue reports, or committed example files.

## OAuth connections

Remote services may use OAuth so that the user authorizes access without giving the MCP client a reusable password. Before approving the flow, confirm the service domain, requested scopes, account, and organization.

OAuth improves credential handling, but it does not remove the need to review permissions. A broad authorization grant can still allow consequential actions.

## Local files and operating-system permissions

Not every server uses an account credential. A filesystem or desktop integration may rely on paths and operating-system permissions instead. Limit it to the folders and applications required for the task. Avoid granting an entire home directory when one project folder is sufficient.

## Team and production controls

For shared environments, document who owns the credential, how it is rotated, and how access is revoked. Prefer service accounts with auditable activity when the underlying platform supports them. Do not share a personal credential across a team merely because it is easy to configure.

Treat retrieved content as untrusted and keep approval controls for write operations. Authentication proves identity; it does not prove that a requested action is safe.

Use the [server permissions guide](/guides/server-permissions/) for a broader review and the [troubleshooting guide](/guides/mcp-server-troubleshooting/) when a valid credential is not being recognized.

