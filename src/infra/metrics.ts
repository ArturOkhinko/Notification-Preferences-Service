type Labels = Record<string, string>;

const counters = new Map<string, number>();

const counterKey = (name: string, labels: Labels): string => {
  const labelPairs = Object.entries(labels)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}="${value}"`)
    .join(',');
  return labelPairs ? `${name}{${labelPairs}}` : name;
};

export const metrics = {
  increment: (name: string, labels: Labels = {}): void => {
    const key = counterKey(name, labels);
    counters.set(key, (counters.get(key) ?? 0) + 1);
  },
  snapshot: (): Record<string, number> => Object.fromEntries(counters),
};
