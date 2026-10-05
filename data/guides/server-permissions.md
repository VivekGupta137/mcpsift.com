---
title: Understand server permissions
description: A practical checklist before giving an assistant access to your tools.
category: Best practices
tags: [permissions, security, access]
author: MCP Sift
date: "2026-10-04"
---
## Access is a design decision

An MCP server connects your assistant to another system. Depending on its tools and credentials, it may read files, send network requests, create issues, or modify a design.

Before connecting it, decide which capabilities you actually want the assistant to have.

## Use the smallest useful scope

- Allow one working directory rather than your entire home folder.
- Prefer read-only credentials for research and discovery tasks.
- Keep production systems separate from experiments.
- Avoid broad organization-level access when a project scope is enough.

The controls available depend on the service, server, and client. A setting in one layer may not replace restrictions in another.

## Treat retrieved content as untrusted

READMEs, web pages, issue descriptions, and other external text can contain instructions. That does not make those instructions part of your request.

Ask the assistant to use external content as information, and review consequential actions before approving them. Do not expose credentials merely because a retrieved page asks for them.

## A quick review checklist

| Before connecting | Before approving a change |
| --- | --- |
| Confirm the publisher | Check the target resource |
| Read the tool descriptions | Review the proposed modification |
| Limit credentials and folders | Confirm that the action is reversible |
| Understand data storage | Keep a backup where appropriate |

## Disconnect cleanly

When an integration is no longer needed, remove it from the client and revoke credentials you created for it. Check whether it stored logs or persistent memory that should also be removed.

For protocol-level guidance, consult the [official MCP security best practices](https://modelcontextprotocol.io/specification/draft/basic/security_best_practices).
