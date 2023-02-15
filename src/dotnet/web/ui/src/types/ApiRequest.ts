export type methodType = 'GET' | 'POST' | 'PUT' | 'DELETE';

export type ApiRequest = {
  /**
   * access token to be used in header.
   */
  accessToken: string;
  /**
   * API url to reach
   */
  url: string;
  /**
   *  Method like GET, POST, PUT, DELETE
   */
  method?: methodType;

  /**
   * body to use in the request
   */
  body?: BodyInit | null;

  /**
   * Key used to differentiate the api call (used by ReactQuery, internally)
   */
  key?: string;

  /**
   * return type of the query. Default is json
   */
  returnType?: ApiRequestReturnType;

  /**
   * define condition to enable / disable the query. Default is true
   */
  enabled?: boolean;
};

export enum ApiRequestReturnType {
  json = 'JSON',
  blob = 'BLOB',
  text = 'TEXT',
}
