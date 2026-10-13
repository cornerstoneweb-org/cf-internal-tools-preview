// Fetch generated JSON. One schema, many datasets: adding a dataset is a data
// change, not a code change.
const cache = new Map();

export async function loadJSON(path) {
  if (cache.has(path)) return cache.get(path);
  const res = await fetch(path, { cache: "no-cache" });
  if (!res.ok) throw new Error(`Failed to load ${path}: ${res.status}`);
  const json = await res.json();
  cache.set(path, json);
  return json;
}
