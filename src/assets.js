export function publicAsset(path, base = import.meta.env?.BASE_URL ?? '/') {
  return `${base.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
}

export const OWL_IMAGE = publicAsset('images/coruja-conquista.png');
