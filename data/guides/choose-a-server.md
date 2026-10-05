---
title: Choose the right server
description: What to look for in documentation, permissions, and compatibility.
category: Best practices
tags: [evaluation, documentation, compatibility]
author: MCP Sift
date: "2026-10-04"
---
## Start with the job

A long list of integrations is not a workflow. Write down the task you want to complete, the information it needs, and whether it should be allowed to change anything.

Then look for a server that does that job with the fewest additional permissions.

## Check the source

Use the project’s official documentation and repository. Look for clear installation steps, a description of the exposed capabilities, and a way to report problems.

In this directory, **Official** means a server published by the service or project maintainer. **Reference** identifies an implementation from the MCP reference-server collection. These labels describe provenance, not a security audit or production guarantee.

## Compare the practical details

| Question | Why it matters |
| --- | --- |
| Does my client support it? | A transport mismatch prevents a connection |
| Does it run locally? | You may need a runtime or package manager |
| What does authentication require? | A public endpoint may still need an account |
| Can it write or delete data? | Actions may need stronger review controls |
| Is the setup documented? | Clear instructions make maintenance easier |

## Try a small, reversible workflow

Use a test project or a read-only operation first. Confirm that the server returns the information you expect before expanding its access.

Keep configuration out of public commits when it contains secrets. If you share setup instructions, use placeholders and explain which values must be supplied locally.

## Revisit your choice

Integrations evolve. Recheck requirements and permissions when you update, and disconnect a server if you no longer need it.

Continue with [Understand server permissions](/guides/server-permissions/) or [browse the directory](/).
