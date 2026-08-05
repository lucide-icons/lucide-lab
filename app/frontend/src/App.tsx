import React, { useState, useEffect, useMemo, Fragment } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Moon, Sun, Copy, Check, X, ChevronDown, Filter, Code, MonitorDown } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// @ts-ignore: Vite raw import
import codesRaw from '../code.txt?raw';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const GitHubIcon = () => (
  <svg
    role="img"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    fill="currentColor"
    className="w-5 h-5"
  >
    <title>GitHub</title>
    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
  </svg>
);

// Types
type IconNode = [string, Record<string, string>][];
type IconMetadata = {
  tags: string[];
  categories: string[];
  contributors: string[];
};

type IconData = {
  name: string;
  nodes: IconNode;
  metadata: IconMetadata;
};

// Components
const ThemeToggle = ({ theme, toggle }: { theme: 'light' | 'dark'; toggle: () => void }) => (
  <button
    onClick={toggle}
    className="p-2 rounded-full hover:bg-secondary transition-colors text-secondary hover:text-primary"
    aria-label="Toggle theme"
  >
    {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
  </button>
);

const IconRenderer = ({
  nodes,
  size = 24,
  strokeWidth = 2,
  color = 'currentColor',
}: {
  nodes: IconNode;
  size?: number;
  strokeWidth?: number;
  color?: string;
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {nodes.map(([element, attrs], i) => React.createElement(element, { ...attrs, key: i }))}
  </svg>
);

const IconCard = ({
  name,
  nodes,
  onClick,
}: {
  name: string;
  nodes: IconNode;
  onClick: () => void;
}) => (
  <motion.button
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.9 }}
    whileHover={{ y: -4, transition: { duration: 0.2 } }}
    onClick={onClick}
    className="group flex flex-col items-center justify-center p-6 bg-secondary border border-border-color rounded-2xl hover:border-accent-color hover:shadow-xl transition-all h-40"
  >
    <div className="text-primary group-hover:text-accent-color transition-colors mb-4">
      <IconRenderer nodes={nodes} size={36} strokeWidth={1.5} />
    </div>
    <span className="text-sm font-medium text-secondary group-hover:text-primary text-center w-full px-2 break-words">
      {name.replace(/-/g, ' ')}
    </span>
  </motion.button>
);

const toCamelCase = (str: string) => {
  return str.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
};

const Toast = ({
  message,
  title = 'Import Copied',
  onClose,
}: {
  message: string;
  title?: string;
  onClose: () => void;
}) => (
  <motion.div
    key={message}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: 20 }}
    className="fixed bottom-12 right-4 z-200 px-6 py-4 bg-bg-primary text-primary rounded-2xl shadow-2xl border border-border-color flex items-center gap-4 min-w-toast"
  >
    <div className="w-10 h-10 rounded-full bg-accent-soft flex items-center justify-center flex-shrink-0">
      <Check size={20} className="text-accent-color" />
    </div>
    <div className="flex-1">
      <p className="font-bold text-xs text-accent-color uppercase tracking-widest mb-0.5">
        {title}
      </p>
      <p className="text-secondary text-sm font-medium truncate max-w-[200px]">{message}</p>
    </div>
    <button
      onClick={onClose}
      className="p-2 hover:bg-secondary rounded-xl transition-colors text-tertiary hover:text-primary"
    >
      <X size={20} />
    </button>
  </motion.div>
);

export default function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [icons, setIcons] = useState<IconData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState<{ message: string; title: string } | null>(null);
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showCategories, setShowCategories] = useState(false);
  const [selectedSnippet, setSelectedSnippet] = useState<string | null>(null);

  // Parse `code.txt` which contains multiple framework snippets separated by lines starting with `# Framework`
  const snippets = useMemo(() => {
    const lines = codesRaw.split(/\r?\n/);
    const map: Record<string, string[]> = {};
    let current: string | null = null;

    for (const line of lines) {
      const m = line.match(/^#\s*(.+)$/);
      if (m) {
        const key = m[1].trim();
        current = key;
        map[key] = [];
        continue;
      }
      if (current) map[current].push(line);
    }

    return Object.entries(map).map(([k, v]) => ({ name: k, code: v.join('\n') }));
  }, [codesRaw]);

  useEffect(() => {
    if (snippets.length && !selectedSnippet) setSelectedSnippet(snippets[0].name);
  }, [snippets, selectedSnippet]);

  useEffect(() => {
    // Detect system preference
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setTheme('dark');
    }

    // Fetch icons
    const fetchData = async () => {
      try {
        const [metaRes, nodesRes] = await Promise.all([
          fetch('/api/icon-metadata'),
          fetch('/api/icon-nodes'),
        ]);
        const meta = await metaRes.json();
        const nodes = await nodesRes.json();

        const combined = Object.keys(nodes).map((name) => ({
          name,
          nodes: nodes[name],
          metadata: meta[name] || { tags: [], categories: [], contributors: [] },
        }));

        setIcons(combined);
      } catch (err) {
        console.error('Failed to fetch icons', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  const categories = useMemo(() => {
    const cats = new Set(['All']);
    icons.forEach((icon) => icon.metadata.categories.forEach((c) => cats.add(c)));
    return Array.from(cats).sort();
  }, [icons]);

  const filteredIcons = useMemo(() => {
    const q = debouncedSearch.toLowerCase();
    let filtered = icons;

    if (selectedCategory !== 'All') {
      filtered = filtered.filter((icon) => icon.metadata.categories.includes(selectedCategory));
    }

    if (q) {
      filtered = filtered.filter(
        (icon) =>
          icon.name.toLowerCase().includes(q) ||
          icon.metadata.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    return [...filtered].sort((a, b) => a.name.localeCompare(b.name));
  }, [icons, debouncedSearch, selectedCategory]);

  const handleIconClick = async (name: string) => {
    const componentName = toCamelCase(name);
    const importString = `import { ${componentName} } from '@lucide/lab';`;

    let copied = true;
    try {
      await navigator.clipboard.writeText(importString);
    } catch (err) {
      console.error('Clipboard helper failed', err);
      copied = false;
    }

    // Show toast regardless of clipboard success. Provide helpful title on failure.
    setToast({
      message: copied ? componentName : `${componentName} (copy failed)`,
      title: copied ? 'Import Copied' : 'Clipboard Error',
    });
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <div className="min-h-screen">
      {/* Navbar */}
      <header className="sticky top-0 z-50 glass border-b border-border-color">
        <div className="container h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Lucide Lab Logo" className="w-16 h-16 object-contain" />
            <div className="flex flex-col items-center">
              <span className="text-xl font-bold font-display tracking-tight hidden sm:block">
                Lucide Lab
              </span>
              <span className="text-sm text-secondary hidden sm:block text-center">
                A laboratory for beautifully designed icons with experimental use cases.
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <a
              href="https://github.com/lucide-icons/lucide-lab"
              target="_blank"
              className="text-secondary hover:text-primary transition-colors"
            >
              <GitHubIcon />
            </a>
            <ThemeToggle
              theme={theme}
              toggle={() => setTheme((t) => (t === 'light' ? 'dark' : 'light'))}
            />
          </div>
        </div>
      </header>

      <main className="container py-12">
        {/* Hero */}
        <div className="text-center mb-16 animate-fade-in flex flex-col items-center">
          <img
            src="/logo.png"
            alt="Lucide Lab Logo"
            className="w-24 h-24 object-contain rounded-hero shadow-2xl mb-8"
          />
          <h1 className="text-5xl sm:text-7xl mb-6 tracking-tight">
            Lucide (Lab) <span className="text-accent-color italic">Icons</span>
          </h1>
          <p className="text-lg text-secondary max-w-2xl mx-auto">
            A laboratory for beautifully designed icons with experimental use cases. Part of the
            Lucide family, built by the community.
          </p>
        </div>

        {/* Installation */}
        <div className="mb-8">
          <div className="px-6 py-6 rounded-2xl border border-border-color bg-bg-primary mb-4">
            <div className="flex items-center gap-3">
              <MonitorDown size={20} />
              <h2 className="text-lg font-semibold">Installation</h2>
            </div>
            <p className="text-sm text-secondary mt-2">
              Install the package using your preferred package manager. The Lucide core package is
              required in your project (for more information, see the{' '}
              <a
                href="https://lucide.dev/guide/installation"
                className="text-accent-color hover:underline"
              >
                Lucide installation guide
              </a>
              ).
            </p>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="flex items-center justify-between gap-4 px-4 py-3 bg-bg-primary border border-border-color rounded-md">
                <pre className="whitespace-pre-wrap text-sm font-mono text-secondary m-0">
                  npm install @lucide/lab
                </pre>
                <button
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText('npm install @lucide/lab');
                      setToast({
                        message: 'npm install @lucide/lab copied',
                        title: 'Installation Command Copied',
                      });
                    } catch (err) {
                      console.error(err);
                      setToast({ message: 'npm (copy failed)', title: 'Copy Error' });
                    }
                    setTimeout(() => setToast(null), 2200);
                  }}
                  className="px-4 py-2 rounded-md bg-bg-primary border border-border-color text-secondary hover:text-primary transition-colors"
                >
                  Copy
                </button>
              </div>

              <div className="flex items-center justify-between gap-4 px-4 py-3 bg-bg-primary border border-border-color rounded-md">
                <pre className="whitespace-pre-wrap text-sm font-mono text-secondary m-0">
                  yarn add @lucide/lab
                </pre>
                <button
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText('yarn add @lucide/lab');
                      setToast({
                        message: 'yarn add @lucide/lab copied',
                        title: 'Installation CommandCopied',
                      });
                    } catch (err) {
                      console.error(err);
                      setToast({ message: 'yarn (copy failed)', title: 'Copy Error' });
                    }
                    setTimeout(() => setToast(null), 2200);
                  }}
                  className="px-4 py-2 rounded-md bg-bg-primary border border-border-color text-secondary hover:text-primary transition-colors"
                >
                  Copy
                </button>
              </div>

              <div className="flex items-center justify-between gap-4 px-4 py-3 bg-bg-primary border border-border-color rounded-md">
                <pre className="whitespace-pre-wrap text-sm font-mono text-secondary m-0">
                  pnpm add @lucide/lab
                </pre>
                <button
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText('pnpm add @lucide/lab');
                      setToast({
                        message: 'pnpm add @lucide/lab copied',
                        title: 'Installation Command Copied',
                      });
                    } catch (err) {
                      console.error(err);
                      setToast({ message: 'pnpm (copy failed)', title: 'Copy Error' });
                    }
                    setTimeout(() => setToast(null), 2200);
                  }}
                  className="px-4 py-2 rounded-md bg-bg-primary border border-border-color text-secondary hover:text-primary transition-colors"
                >
                  Copy
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* How to use + Code examples */}
        <div className="mb-8">
          <div className="px-6 py-6 rounded-2xl border border-border-color bg-bg-primary">
            <div className="flex items-center gap-3">
              <Code size={20} />
              <h2 className="text-lg font-semibold">How to use</h2>
            </div>
            <p className="text-sm text-secondary mt-2">
              Use the snippets below to quickly import and use Lucide Lab icons in your project.
              Select a framework tab to see the example and copy it to your clipboard.
            </p>

            <div className="relative rounded-2xl border border-border-color bg-secondary overflow-hidden mt-4">
              <div className="flex items-center justify-between px-4 py-2 border-b border-border-color">
                <div className="flex gap-2 overflow-x-auto">
                  {snippets.map((s) => (
                    <button
                      key={s.name}
                      onClick={() => setSelectedSnippet(s.name)}
                      className={cn(
                        'px-4 py-2 text-sm font-medium rounded-md whitespace-nowrap',
                        selectedSnippet === s.name
                          ? 'bg-accent-color text-white shadow-sm'
                          : 'text-secondary hover:text-primary'
                      )}
                    >
                      {s.name}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={async () => {
                      const active = snippets.find((x) => x.name === selectedSnippet);
                      if (!active) return;
                      try {
                        await navigator.clipboard.writeText(active.code);
                        setToast({ message: `${active.name} snippet copied`, title: 'Copied' });
                      } catch (err) {
                        console.error('Copy failed', err);
                        setToast({
                          message: `${active.name} snippet (copy failed)`,
                          title: 'Copy Error',
                        });
                      }
                      setTimeout(() => setToast(null), 2200);
                    }}
                    className="px-4 py-2 rounded-md bg-bg-primary border border-border-color text-secondary hover:text-primary transition-colors flex items-center gap-2"
                    aria-label="Copy code"
                  >
                    <Copy size={16} /> Copy
                  </button>
                </div>
              </div>

              <div className="p-4">
                <pre className="whitespace-pre-wrap max-h-64 overflow-auto text-sm font-mono text-secondary">
                  {snippets.find((x) => x.name === selectedSnippet)?.code || ''}
                </pre>
              </div>
            </div>
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
            {[...Array(24)].map((_, i) => (
              <div key={i} className="h-40 bg-secondary rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : (
          <Fragment>
            <div className="flex flex-col gap-6 mb-12 px-6 py-8 rounded-3xl border border-border-color bg-secondary">
              <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
                <div className="relative w-full sm:flex-1 group">
                  <Search
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-tertiary group-focus-within:text-accent-color transition-colors"
                    size={20}
                  />
                  <input
                    type="text"
                    placeholder="Search 300+ lab icons..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full bg-bg-primary border border-border-color rounded-2xl py-3 pl-12 pr-12 outline-none focus:ring-4 focus:ring-accent-color/10 focus:border-accent-color transition-all text-lg"
                  />
                  {search && (
                    <button
                      onClick={() => setSearch('')}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-tertiary hover:text-primary transition-colors"
                    >
                      <X size={18} />
                    </button>
                  )}
                </div>
                <div className="flex-shrink-0 bg-bg-primary px-6 py-3 rounded-2xl border border-border-color min-w-[140px] text-center">
                  <span className="text-xl font-bold font-display text-accent-color">
                    {filteredIcons.length}
                    {icons.length > filteredIcons.length ? `/${icons.length}` : ''}
                  </span>
                  <span className="text-lg font-medium text-secondary ml-2">
                    Icon{filteredIcons.length !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>

              <div className="flex flex-col items-center gap-4">
                <button
                  onClick={() => setShowCategories(!showCategories)}
                  className={cn(
                    'flex items-center gap-2 px-6 py-2 rounded-full text-sm font-medium border transition-all',
                    showCategories || selectedCategory !== 'All'
                      ? 'bg-accent-soft border-accent-color text-accent-color'
                      : 'bg-secondary border-border-color text-secondary hover:text-primary hover:border-accent-color'
                  )}
                >
                  <Filter size={16} />
                  <span>
                    {selectedCategory === 'All'
                      ? 'Filter by Category'
                      : `Category: ${
                          selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)
                        }`}
                  </span>
                  <motion.div
                    animate={{ rotate: showCategories ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ChevronDown size={16} />
                  </motion.div>
                </button>

                <AnimatePresence>
                  {showCategories && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: 'easeInOut' }}
                      className="overflow-hidden w-full"
                    >
                      <div className="flex flex-wrap gap-2 justify-center pt-2 pb-4">
                        {categories.map((cat) => (
                          <button
                            key={cat}
                            onClick={() => {
                              setSelectedCategory(cat);
                            }}
                            className={cn(
                              'px-6 py-2 rounded-full text-sm font-medium border transition-all whitespace-nowrap capitalize',
                              selectedCategory === cat
                                ? 'bg-accent-color border-accent-color text-white shadow-lg shadow-accent-color/20'
                                : 'bg-bg-primary border-border-color text-secondary hover:border-accent-color hover:text-primary'
                            )}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {filteredIcons.length === 0 ? (
              <div className="text-center py-20 bg-secondary/30 rounded-3xl border border-dashed border-border-color">
                <div className="mb-4 text-tertiary flex justify-center">
                  <Search size={48} strokeWidth={1} />
                </div>
                <p className="text-xl text-secondary">No icons found matching your criteria.</p>
                <button
                  onClick={() => {
                    setSearch('');
                    setSelectedCategory('All');
                  }}
                  className="mt-4 text-accent-color font-medium hover:underline"
                >
                  Clear all filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4 overflow-hidden pt-3">
                <AnimatePresence>
                  {filteredIcons.map((icon) => (
                    <IconCard
                      key={icon.name}
                      name={icon.name}
                      nodes={icon.nodes}
                      onClick={() => handleIconClick(icon.name)}
                    />
                  ))}
                </AnimatePresence>
              </div>
            )}
          </Fragment>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border-color py-12 bg-secondary/50">
        <div className="container flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-3">
            <img
              src="/logo.png"
              alt="Lucide Lab Logo"
              className="w-6 h-6 object-contain grayscale opacity-50"
            />
            <span className="text-sm font-medium text-tertiary">© 2026 Lucide Contributors</span>
          </div>
          <div className="flex gap-6 text-sm text-tertiary">
            <a href="https://lucide.dev" className="hover:text-primary transition-colors">
              Lucide.dev
            </a>
            <a
              href="https://github.com/lucide-icons/lucide-lab"
              className="hover:text-primary transition-colors"
            >
              GitHub
            </a>
            <a href="https://lucide.dev/license" className="hover:text-primary transition-colors">
              License
            </a>
          </div>
        </div>
      </footer>

      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <Toast message={toast.message} title={toast.title} onClose={() => setToast(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}
