const KEY = "spk_selected_wisata";

export function setSelectedWisata(ids) {
  sessionStorage.setItem(KEY, JSON.stringify(ids));
}

export function getSelectedWisata() {
  try {
    return JSON.parse(sessionStorage.getItem(KEY)) || [];
  } catch {
    return [];
  }
}

export function clearSelectedWisata() {
  sessionStorage.removeItem(KEY);
}
