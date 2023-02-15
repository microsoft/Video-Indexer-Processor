export type SearchResult = {
  count: number;
  results: Result[];
  facets: any[];
};

export type Result = {
  score: number;
  highlights: string;
  document: any;
};
