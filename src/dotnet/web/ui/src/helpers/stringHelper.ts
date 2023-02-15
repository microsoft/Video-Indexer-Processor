export const parseArrayToString = (input: string[] | string, sep: string): string => {
  if (!input) return '';

  if (typeof input !== 'string' && !Array.isArray(input)) return (input as any).toString();

  return Array.isArray(input) ? input.join(', ') : input;
};

export const mapFacetName = (facetName) => {
  if (!facetName) return '';

  const capitalizeFirstLetter = (string) => (string[0] ? `${string[0].toUpperCase()}${string.substring(1)}` : '');
  facetName = facetName.trim();
  facetName = capitalizeFirstLetter(facetName);

  facetName = facetName.replace('_', ' ');
  return facetName;
};
