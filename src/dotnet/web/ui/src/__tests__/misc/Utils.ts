// wait for the fetch to occurs in react query

import { act } from 'react-dom/test-utils';
/**
 * wait for an amout of ms, in an async act() to stay in the test renderer context
 */
export const actAwait = async (interval: number): Promise<void> => {
  let awaiter = (interval: number): Promise<void> => new Promise((r, s) => setTimeout(r, interval));
  return act(async () => await awaiter(interval));
};
