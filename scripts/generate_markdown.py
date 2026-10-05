import json
import os
import re

def clean_slug(identifier):
    if not identifier:
        return None
    # Lowercase, replace non-alphanumeric with hyphen
    slug = re.sub(r'[^a-z0-9]+', '-', identifier.lower())
    # Strip leading/trailing hyphens
    slug = slug.strip('-')
    return slug

def yaml_escape(s):
    if s is None:
        return '""'
    # Use json.dumps to get properly escaped double-quoted string
    return json.dumps(s)

def generate_markdown(item, output_dir):
    slug = clean_slug(item.get("identifier") or item.get("title"))
    if not slug:
        return False
        
    filepath = os.path.join(output_dir, f"{slug}.md")
    
    # We will safely encode all fields for YAML
    title = yaml_escape(item.get("title", ""))
    description = yaml_escape(item.get("description", ""))
    
    cat_val = item.get("category")
    if not cat_val or not str(cat_val).strip():
        cat_val = "Uncategorized"
    category = yaml_escape(cat_val)
    
    # Tags
    tags = item.get("tags", [])
    if not tags:
        tags = ["mcp", "mcp-server"]
    
    source = yaml_escape(item.get("source", "Community"))
    owner = yaml_escape(item.get("owner", ""))
    transport = yaml_escape(item.get("transport", "stdio"))
    authentication = yaml_escape(item.get("authentication", "Varies by repository; review the upstream documentation"))
    github_url = yaml_escape(item.get("githubUrl", ""))
    
    # Strictly construct a valid blob URL for Astro's rawReadmeUrl parser
    raw_github_url = item.get("githubUrl", "")
    readme_url_str = ""
    if raw_github_url and raw_github_url.startswith("https://github.com/"):
        parts = [p for p in raw_github_url.replace("https://github.com/", "").split("/") if p]
        if len(parts) >= 2:
            readme_url_str = f"https://github.com/{parts[0]}/{parts[1]}/blob/main/README.md"
            
    readme_url = yaml_escape(readme_url_str)
    
    github_stars = item.get("githubStars", 0)
    github_forks = item.get("githubForks", 0)
    fetched_at = yaml_escape(item.get("githubStatsFetchedAt", ""))
    
    icon_str = ""
    if item.get("icon"):
        icon_str = f"\nicon: {yaml_escape(item.get('icon'))}"
        
    # Build YAML Frontmatter
    frontmatter = f"""---
title: {title}
description: {description}
category: {category}
tags:
"""
    for tag in tags:
        frontmatter += f"  - {yaml_escape(tag)}\n"
        
    frontmatter += f"""source: {source}
owner: {owner}
transport: {transport}
authentication: {authentication}
githubUrl: {github_url}
readmeUrl: {readme_url}
githubStars: {github_stars}
githubForks: {github_forks}
githubStatsFetchedAt: {fetched_at}{icon_str}
---
## Overview

The **{item.get("title", "")} MCP server** is a publicly available project. Review the upstream repository for installation instructions, supported tools, compatibility, permissions, and current maintenance status.

## Configuration

Configuration, transport, authentication, and runtime requirements vary by project. Open the repository before connecting and use the smallest set of credentials and permissions required.

[Open the {item.get("title", "")} repository]({item.get("githubUrl", "")}) to read the latest documentation.
"""
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(frontmatter)
        
    return True

def main():
    scraper_dir = os.path.join(os.path.dirname(__file__), "..", "scraper")
    output_dir = os.path.join(os.path.dirname(__file__), "..", "data", "servers")
    
    # Process all pages_*.json files
    import glob
    files_to_process = glob.glob(os.path.join(scraper_dir, "pages_*.json"))
    
    count = 0
    for filepath in files_to_process:
        filename = os.path.basename(filepath)
        print(f"Processing {filename}...")
        with open(filepath, "r", encoding="utf-8") as f:
            try:
                items = json.load(f)
            except json.JSONDecodeError:
                print(f"Error parsing JSON in {filename}")
                continue
                
        for item in items:
            if generate_markdown(item, output_dir):
                count += 1
                
    print(f"Successfully generated {count} markdown files in {output_dir}")

if __name__ == "__main__":
    main()
