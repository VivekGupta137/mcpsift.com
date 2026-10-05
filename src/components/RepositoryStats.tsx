import Icon from './Icon';
import type { RepositoryStats as Stats } from '../lib/github';

const compactNumber = new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 });
const exactNumber = new Intl.NumberFormat('en-US');

export default function RepositoryStats({ stats, detailed = false }: { stats?: Stats; detailed?: boolean }) {
  if (!stats) return null;
  const description = `GitHub repository ${stats.repository}: ${exactNumber.format(stats.stars)} stars, ${exactNumber.format(stats.forks)} forks. ${stats.stale ? 'Cached snapshot' : 'Snapshot'} from ${stats.fetchedAt.slice(0, 10)}. Counts apply to the whole repository.`;
  return <div className={`repository-stats${detailed ? ' detailed' : ''}`} data-pagefind-ignore>
    <div className="repository-counts" role="img" aria-label={description} title={description}>
      <span aria-hidden="true"><Icon name="star" size={15} />{detailed ? exactNumber.format(stats.stars) : compactNumber.format(stats.stars)}<span className="stat-label">stars</span></span>
      <span aria-hidden="true"><Icon name="fork" size={15} />{detailed ? exactNumber.format(stats.forks) : compactNumber.format(stats.forks)}<span className="stat-label">forks</span></span>
    </div>
    {detailed && <p>Repository-wide counts · {stats.stale ? 'Cached' : 'Retrieved'} {stats.fetchedAt.slice(0, 10)}</p>}
  </div>;
}
