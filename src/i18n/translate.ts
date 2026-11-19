export type MessageTree = {
  [key: string]: string | MessageTree;
};

export type Dictionary<T> = {
  [K in keyof T]: T[K] extends string ? string : Dictionary<T[K]>;
};

export function translate(
  messages: MessageTree,
  key: string,
  vars?: Record<string, string | number>,
): string {
  const parts = key.split(".");
  let node: string | MessageTree | undefined = messages;
  for (const part of parts) {
    if (!node || typeof node === "string" || !(part in node)) {
      return key;
    }
    node = node[part];
  }
  if (typeof node !== "string") return key;
  if (!vars) return node;
  return node.replace(/\{(\w+)\}/g, (_, name: string) =>
    vars[name] === undefined ? `{${name}}` : String(vars[name]),
  );
}

export function messageKeys(tree: MessageTree, prefix = ""): string[] {
  return Object.entries(tree).flatMap(([key, value]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    return typeof value === "string" ? [path] : messageKeys(value, path);
  });
}
