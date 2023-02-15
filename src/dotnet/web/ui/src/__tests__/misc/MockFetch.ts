import { testResult } from './Constants';

export class mockFetchExpect {
  onCalled?: (fetchUrl: string, response: any, config: any) => void = () => {};

  constructor(public fetchUrl: string, public response: any, public responseType: 'JSON' | 'BLOB' | 'TEXT' = 'JSON') {}
}

/**
 * Mocking fetch()
 * @param fetchUrl fetch url that should be target by fetch
 * @param response any object that should be returned
 * @param responseType : response type expected
 */
export const mockAllFetch = (mocksFetches: mockFetchExpect[]) => {
  const mock = async (url: string, config) => {
    // check config
    if (config['headers'].map.authorization !== `Bearer ${testResult.accessToken}`) console.error(`http request header is not good`);

    // get the correct mock
    let mockFetch = mocksFetches.find((mf) => mf.fetchUrl === url);

    if (!mockFetch) console.error(`Unable to mock a fetch for url ${url}...`);

    let fetchResponse = {
      ok: true,
      status: 200,
      json: async () => undefined,
      blob: async () => undefined,
      text: async () => undefined,
    };
    switch (mockFetch.responseType) {
      case 'BLOB':
        fetchResponse.blob = async () => mockFetch.response;
        break;
      case 'TEXT':
        fetchResponse.text = async () => mockFetch.response;
        break;
      case 'JSON':
      default:
        fetchResponse.json = async () => mockFetch.response;
        break;
    }

    if (!mockFetch.onCalled) {
      mockFetch.onCalled = (f, r) => {};
    }

    mockFetch.onCalled(url, mockFetch.response, config);

    return fetchResponse;
  };

  return mock;
};

export const mockFetchNotFound = () => {
  const mock = async (url: string, config) => {
    let fetchResponse = {
      ok: true,
      status: 404,
    };
    return fetchResponse;
  };

  return mock;
};
