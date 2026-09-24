const BASE_URL = import.meta.env.BASE_URL;

export function publicPath(path) {
  if (/^(?:https?:)?\/\//.test(path) || path.startsWith("data:") || path.startsWith("blob:")) return path;
  return `${BASE_URL}${path.replace(/^\/+/, "")}`;
}
