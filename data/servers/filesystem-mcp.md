---
title: Filesystem
description: Give your assistant access to the files and folders you choose.
category: Files & storage
tags: [files, local, folders, reference-server]
icon: folder
source: Reference
owner: modelcontextprotocol
transport: stdio
authentication: Local directory allowlist
githubUrl: https://github.com/modelcontextprotocol/servers
readmeUrl: https://github.com/modelcontextprotocol/servers/blob/main/src/filesystem/README.md
documentationUrl: https://github.com/modelcontextprotocol/servers/tree/main/src/filesystem
---
## Overview

Your files, in the conversation. The **Filesystem reference server** exposes file operations within the directories you allow, letting a compatible assistant read, search, and work with a local workspace.

Treat this as a powerful local integration. It can expose file contents and supports operations that may change files.

## Configuration

With Node.js available, add the following to a compatible client’s MCP configuration. Replace the example path with an absolute path to a dedicated working folder.

```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-filesystem",
        "/absolute/path/to/allowed-folder"
      ]
    }
  }
}
```

Use your client’s documented configuration format. Review the repository README for directory access controls and roots support.

## Keep access focused

- Choose a project folder instead of your entire home directory.
- Keep credentials, private keys, and unrelated documents outside that folder.
- Back up files before allowing write operations.

> Reference servers demonstrate MCP functionality. Review suitability, security, and maintenance before using any integration in production.
