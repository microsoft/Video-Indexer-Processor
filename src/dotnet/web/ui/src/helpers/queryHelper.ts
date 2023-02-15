export const parseUrlParamNumber = (params: URLSearchParams, paramName: string, paramDefaultValue: number = 1): number => {
  // page number
  let p = +params.get(paramName) ?? paramDefaultValue;
  p = p === 0 ? paramDefaultValue : p;
  return p;
};
