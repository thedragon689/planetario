export function formatExtremeObjectForPanel(obj) {
  return {
    ...obj,
    catalog: obj.category?.includes('black_hole') ? 'Buchi neri' : 'Oggetti estremi',
    discovery: obj.discoveryYear
      ? `${obj.discoveryYear} · ${obj.discoveryMethod || 'Osservazione'}`
      : obj.discoveryMethod,
  };
}

export function findExtremeObjectInDataset(data, id) {
  const obj = data?.objects?.find((o) => o.id === id);
  return obj ? formatExtremeObjectForPanel(obj) : null;
}
