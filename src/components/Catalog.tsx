import { useEffect, useMemo, useRef, useState } from "react";
import {
  Button,
  Card,
  Chip,
  Link,
  SearchField,
  Spinner,
  Modal,
} from "@heroui/react";
import Icon from "./Icon";
import RepositoryStats from "./RepositoryStats";
import type { Entry } from "../lib/content";

type CatalogEntry = Omit<Entry, "body">;
type SortOption = "default" | "stars" | "forks" | "name-asc" | "name-desc";
const sortOptions = new Set<SortOption>(["default", "stars", "forks", "name-asc", "name-desc"]);
type Pagefind = {
  search: (
    term: string | null,
    options: { filters: Record<string, string> },
  ) => Promise<{
    results: { data: () => Promise<{ meta: Record<string, string> }> }[];
  }>;
};
let pagefindPromise: Promise<Pagefind> | undefined;
let pagefindAttempt = 0;

function loadPagefind() {
  if (!pagefindPromise) {
    const moduleUrl = `/pagefind/pagefind.js${pagefindAttempt ? `?retry=${pagefindAttempt}` : ""}`;
    pagefindPromise = import(/* @vite-ignore */ moduleUrl).catch((error) => {
      pagefindPromise = undefined;
      throw error;
    });
  }
  return pagefindPromise;
}

export function EntryCard({ entry }: { entry: CatalogEntry }) {
  return (
    <Card
      className={`entry-card ${entry.kind === "guide" ? "guide-card" : ""}`}
    >
      <Link
        href={entry.href}
        className="card-hit-area"
        aria-label={`View ${entry.title}`}
      />
      <Card.Header>
        {entry.kind === "server" ? (
          <>
            <div className="server-avatar">
              <img
                src={`/avatars/${entry.slug}.svg`}
                alt=""
                width={42}
                height={42}
                loading="lazy"
                decoding="async"
              />
            </div>
            <div className="card-identity">
              <Card.Title>{entry.title}</Card.Title>
              <Card.Description className="owner">
                {entry.owner}
              </Card.Description>
            </div>
            <span
              className={`source-badge ${entry.source === "Official" ? "verified" : ""}`}
            >
              <i />
              {entry.source}
            </span>
          </>
        ) : (
          <>
            <Chip size="sm" className="category-chip">
              {entry.category}
            </Chip>
            <span className="reading-time">{entry.readingTime} min read</span>
            <Card.Title>{entry.title}</Card.Title>
          </>
        )}
      </Card.Header>
      <Card.Content>
        <p>{entry.description}</p>
        {entry.kind === "server" && (
          <RepositoryStats stats={entry.repositoryStats} />
        )}
      </Card.Content>
      <Card.Footer>
        {entry.kind === "server" && (
          <Chip size="sm" className="category-chip">
            {entry.category}
          </Chip>
        )}
        <Icon name="arrow" size={19} className="card-arrow" />
      </Card.Footer>
    </Card>
  );
}

export default function Catalog({
  entries,
  kind,
  categoryOptions,
  catalogUrl,
}: {
  entries: CatalogEntry[];
  kind: "server" | "guide";
  categoryOptions?: { name: string; count: number }[];
  catalogUrl?: string;
}) {
  // Only the first page is embedded in the HTML. The complete card metadata is
  // fetched after hydration so the directory remains searchable without
  // serializing the entire catalog into the homepage island.
  const [catalogEntries, setCatalogEntries] = useState(entries);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [sort, setSort] = useState<SortOption>("default");
  const [results, setResults] = useState(entries);
  const [state, setState] = useState<"ready" | "loading" | "error">("ready");
  const [retry, setRetry] = useState(0);
  const [limit, setLimit] = useState(12);
  const [initialized, setInitialized] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [draftCategory, setDraftCategory] = useState("");
  const input = useRef<HTMLInputElement>(null);
  const categories = (categoryOptions?.map((option) => option.name) || [
    ...new Set(catalogEntries.map((entry) => entry.category)),
  ]).sort();
  const categoryCount = new Map(
    categoryOptions?.map((option) => [option.name, option.count]) ||
      categories.map((value) => [
        value,
        catalogEntries.filter((entry) => entry.category === value).length,
      ]),
  );
  useEffect(() => {
    if (!catalogUrl || catalogEntries.length > entries.length) return;
    fetch(catalogUrl)
      .then((response) => {
        if (!response.ok) throw new Error(`Catalog request failed: ${response.status}`);
        return response.json() as Promise<CatalogEntry[]>;
      })
      .then((allEntries) => setCatalogEntries(allEntries))
      .catch(() => {
        // The embedded first page remains browsable when the optional index
        // request is unavailable (for example during local development).
      });
  }, [catalogUrl]);
  useEffect(() => {
    const sync = () => {
      const params = new URLSearchParams(location.search);
      setQuery(params.get("q") || "");
      const value = params.get("category") || "";
      setCategory(categories.includes(value) ? value : "");
      const sortValue = params.get("sort") as SortOption | null;
      setSort(
        kind === "server" && sortValue && sortOptions.has(sortValue)
          ? sortValue
          : "default",
      );
    };
    sync();
    setInitialized(true);
    window.addEventListener("popstate", sync);
    const shortcut = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        input.current?.focus();
      }
    };
    window.addEventListener("keydown", shortcut);
    return () => {
      window.removeEventListener("popstate", sync);
      window.removeEventListener("keydown", shortcut);
    };
  }, []);
  useEffect(() => {
    if (!initialized) return;
    let cancelled = false;
    setLimit(12);
    if (!query.trim() && !category) {
      setResults(catalogEntries);
      setState("ready");
      return;
    }
    if (!query.trim()) {
      setResults(catalogEntries.filter((entry) => entry.category === category));
      setState("ready");
      return;
    }
    setState("loading");
    const timer = window.setTimeout(async () => {
      try {
        const engine = await loadPagefind();
        const filters: Record<string, string> = { kind };
        if (category) filters.category = category;
        const response = await engine.search(query.trim() || null, { filters });
        const documents = await Promise.all(
          response.results.map((result) => result.data()),
        );
        const found = documents
          .map((document) =>
            catalogEntries.find((entry) => entry.slug === document.meta.slug),
          )
          .filter((entry): entry is CatalogEntry => Boolean(entry));
        if (!cancelled) {
          setResults(found);
          setState("ready");
        }
      } catch {
        if (!cancelled) {
          setResults([]);
          setState("error");
        }
      }
    }, 180);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [query, category, retry, initialized, catalogEntries]);
  useEffect(() => {
    if (!initialized) return;
    const params = new URLSearchParams(location.search);
    if (query) params.set("q", query);
    else params.delete("q");
    if (category) params.set("category", category);
    else params.delete("category");
    if (kind === "server" && sort !== "default") params.set("sort", sort);
    else params.delete("sort");
    history.replaceState(
      null,
      "",
      `${location.pathname}${params.size ? `?${params}` : ""}${location.hash}`,
    );
  }, [query, category, sort, initialized, kind]);
  useEffect(() => setLimit(12), [sort]);
  const sortedResults = useMemo(() => {
    if (kind !== "server" || sort === "default") return results;
    const sorted = [...results];
    const byName = (first: CatalogEntry, second: CatalogEntry) => first.title.localeCompare(second.title);
    if (sort === "name-asc") return sorted.sort(byName);
    if (sort === "name-desc") return sorted.sort((first, second) => byName(second, first));
    const metric = sort === "stars" ? "stars" : "forks";
    return sorted.sort((first, second) =>
      (second.repositoryStats?.[metric] ?? -1) - (first.repositoryStats?.[metric] ?? -1) || byName(first, second),
    );
  }, [kind, results, sort]);
  const reset = () => {
    setQuery("");
    setCategory("");
    input.current?.focus();
  };
  const retrySearch = () => {
    pagefindPromise = undefined;
    pagefindAttempt++;
    setRetry(retry + 1);
  };
  const categoryControls = (
    selected: string,
    select: (value: string) => void,
  ) => (
    <div className="category-list" role="group" aria-label="Choose a category">
      <Button
        variant="ghost"
        className={!selected ? "selected" : ""}
        onPress={() => select("")}
        aria-pressed={!selected}
      >
        All {kind === "server" ? "servers" : "guides"}
        <span>{categoryOptions ? categoryOptions.reduce((sum, option) => sum + option.count, 0) : entries.length}</span>
      </Button>
      {categories.map((value) => (
        <Button
          key={value}
          variant="ghost"
          className={selected === value ? "selected" : ""}
          aria-pressed={selected === value}
          onPress={() => select(value)}
        >
          {value}
          <span>
            {categoryCount.get(value) || 0}
          </span>
        </Button>
      ))}
    </div>
  );
  const filters = categoryControls(category, setCategory);
  return (
    <section
      className={`catalog ${kind === "guide" ? "guide-catalog" : ""}`}
      aria-label={kind === "server" ? "Server directory" : "Guides library"}
    >
      <div className="search-row">
        <SearchField
          id="catalog-search"
          aria-label={`Search ${kind === "server" ? "MCP servers" : "guides"}`}
          value={query}
          onChange={setQuery}
          className="catalog-search"
        >
          <SearchField.Group>
            <SearchField.SearchIcon />
            <SearchField.Input
              ref={input}
              placeholder={
                kind === "server"
                  ? "Search by tool, runtime, or capability…"
                  : "Search implementation guides…"
              }
            />
            <span className="search-shortcut" aria-hidden="true">
              ⌘ K
            </span>
            <SearchField.ClearButton aria-label="Clear search" />
          </SearchField.Group>
        </SearchField>
      </div>
      <noscript>
        <p className="search-notice">
          All entries are available below. Enable JavaScript to search and
          filter.
        </p>
      </noscript>
      {kind === "server" && (
        <div className="catalog-sort-bar">
          <label className="catalog-sort">
            <span>Sort servers</span>
            <select value={sort} onChange={(event) => setSort(event.target.value as SortOption)}>
              <option value="default">Default order</option>
              <option value="stars">Most stars</option>
              <option value="forks">Most forks</option>
              <option value="name-asc">Name A–Z</option>
              <option value="name-desc">Name Z–A</option>
            </select>
          </label>
        </div>
      )}
      {kind === "guide" && (
        <div
          className="guide-categories"
          role="group"
          aria-label="Guide categories"
        >
          <Button
            variant="ghost"
            className={!category ? "selected" : ""}
            aria-pressed={!category}
            onPress={() => setCategory("")}
          >
            All
          </Button>
          {categories.map((value) => (
            <Button
              key={value}
              variant="ghost"
              className={category === value ? "selected" : ""}
              aria-pressed={category === value}
              onPress={() => setCategory(value)}
            >
              {value}
            </Button>
          ))}
        </div>
      )}
      <div className="catalog-layout">
        <aside className="category-sidebar">
          <h2>Browse categories</h2>
          {filters}
        </aside>
        <div className="catalog-main">
          <div className="results-toolbar">
            <div>
              <h2>
                {category ||
                  (query
                    ? "Search results"
                    : kind === "server"
                      ? "Server registry"
                      : "Guide library")}
              </h2>
              <span role="status" aria-live="polite">
                {state === "ready"
                  ? `${results.length} ${results.length === 1 ? kind : `${kind}s`}`
                  : state === "loading"
                    ? "Searching…"
                    : "Search unavailable"}
              </span>
            </div>
            <span className="curated-label">
              <i />
              GitHub-sourced registry
            </span>
          </div>
          {kind === "server" && (
            <div className="mobile-filters">
              <Modal
                isOpen={filtersOpen}
                onOpenChange={(open) => {
                  setFiltersOpen(open);
                  if (open) setDraftCategory(category);
                }}
              >
                <Button variant="secondary">
                  <Icon name="filter" size={17} />
                  Filters{category ? " · 1" : ""}
                </Button>
                <Modal.Backdrop className="filter-backdrop">
                  <Modal.Container
                    placement="bottom"
                    className="filter-container"
                  >
                    <Modal.Dialog className="filter-dialog">
                      <Modal.CloseTrigger />
                      <Modal.Header>
                        <Modal.Heading>Filter servers</Modal.Heading>
                      </Modal.Header>
                      <Modal.Body>
                        <p className="filter-description">Choose a category</p>
                        {categoryControls(draftCategory, setDraftCategory)}
                      </Modal.Body>
                      <Modal.Footer>
                        <Button
                          variant="secondary"
                          onPress={() => setDraftCategory("")}
                        >
                          Reset
                        </Button>
                        <Button
                          onPress={() => {
                            setCategory(draftCategory);
                            setFiltersOpen(false);
                          }}
                        >
                          Show results
                        </Button>
                      </Modal.Footer>
                      <p className="filter-help">
                        Filters apply to the current search.
                      </p>
                    </Modal.Dialog>
                  </Modal.Container>
                </Modal.Backdrop>
              </Modal>
            </div>
          )}
          {(query || category) && (
            <div className="active-filters">
              {category && <Chip size="sm">{category}</Chip>}
              {query && <span>Matching “{query}”</span>}
              <Button size="sm" variant="ghost" onPress={reset}>
                Clear all <Icon name="close" size={13} />
              </Button>
            </div>
          )}
          <div aria-busy={state === "loading"}>
            {state === "loading" ? (
              <div className="search-feedback">
                <Spinner />
                <p>Finding your next connection…</p>
              </div>
            ) : state === "error" ? (
              <div className="search-feedback panel" role="alert">
                <Icon name="info" size={30} />
                <h3>Search couldn’t load</h3>
                <p>Try again, or browse without searching.</p>
                <div className="actions">
                  <Button onPress={retrySearch}>Try again</Button>
                  <Button variant="secondary" onPress={reset}>
                    Browse all
                  </Button>
                </div>
                {import.meta.env.DEV && (
                  <p className="dev-search-note">
                    In development, run <code>npm run build</code> once to
                    generate the search index.
                  </p>
                )}
              </div>
            ) : sortedResults.length ? (
              <>
                <div className="entries-grid">
                  {sortedResults.slice(0, limit).map((entry) => (
                    <EntryCard key={entry.slug} entry={entry} />
                  ))}
                </div>
                {limit < sortedResults.length ? (
                  <Button
                    variant="secondary"
                    className="load-more"
                    onPress={() => setLimit(limit + 12)}
                  >
                    Show more
                  </Button>
                ) : (
                  <p className="end-results">
                    You’re all caught up. More{" "}
                    {kind === "server" ? "connections" : "guides"} are on the
                    way.
                  </p>
                )}
              </>
            ) : (
              <div className="search-feedback">
                <Icon name="search" size={36} />
                <h3>No {kind === "server" ? "connections" : "guides"} yet.</h3>
                <p>
                  Try a different keyword or remove a filter
                  <br />
                  to broaden your search.
                </p>
                <Button onPress={reset}>Clear search & filters</Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
