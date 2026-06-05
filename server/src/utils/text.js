/**
 * Removes the trailing __JSON_META__ { ... } __JSON_META__ block(s) the model
 * appends to its answers, so stored content / re-sent context stays clean.
 */
export const stripMeta = (text = '') =>
  String(text)
    .replace(/__JSON_META__[\s\S]*?__JSON_META__/g, '')
    .replace(/__JSON_META__[\s\S]*$/g, '') // safety: unclosed meta block
    .trim();

/**
 * Truncates an oversized string while keeping its head and tail (the parts that
 * usually matter in a log / stack trace), with a marker in the middle.
 */
export const truncateMiddle = (text = '', max = 4000) => {
  const s = String(text);
  if (s.length <= max) return s;
  const head = Math.ceil(max * 0.6);
  const tail = Math.floor(max * 0.4);
  return `${s.slice(0, head)}\n…[trimmed ${s.length - max} chars]…\n${s.slice(s.length - tail)}`;
};
