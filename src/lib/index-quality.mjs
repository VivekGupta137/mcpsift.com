/**
 * The importer currently gives some repositories a placeholder overview. Those
 * pages are useful as a queue for editorial work, but are not useful search
 * results until they contain repository-specific information.
 */
export function isLowValueServer(data, content) {
  if (data?.seo?.noindex === true) return true;
  // Preserve the most established and publisher-backed listings even when
  // their local overview is brief: those pages also expose source-linked
  // repository documentation and are the catalog's highest-demand entries.
  if (['Official', 'Reference'].includes(data?.source) || Number(data?.githubStars || 0) >= 2500) return false;
  const text = String(content || '').replace(/\s+/g, ' ').trim();
  return /publicly available community project\. Review the upstream repository for installation instructions, supported tools, compatibility, permissions, and current maintenance status\./i.test(text)
    && text.length < 900;
}
