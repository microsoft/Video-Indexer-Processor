import { act, renderHook } from '@testing-library/react-hooks/dom';
import { useLocalStorage, useSessionStorage } from '../../hooks/useStorage';
import { testAccount } from '../misc/Constants';

describe('useStorage tests', () => {
  test('should returns default value from local storage', async () => {
    const { result, rerender, waitForNextUpdate } = renderHook(() => useLocalStorage('key1', testAccount));

    const [account] = result.current;
    expect(account).toStrictEqual(testAccount);

    waitForNextUpdate();

    const [newAccount] = result.current;
    expect(newAccount).toStrictEqual(testAccount);

    rerender();

    const [newRerenderAccount] = result.current;
    expect(newRerenderAccount).toStrictEqual(testAccount);

    // check directly from localStorage
    let jsonValue = window.localStorage.getItem('key1');
    let storageResult = JSON.parse(jsonValue);
    expect(storageResult).toStrictEqual(testAccount);
  });

  test('should returns updated value from local storage', async () => {
    const { result, rerender, waitForNextUpdate } = renderHook(() => useLocalStorage('key1', testAccount));

    waitForNextUpdate();

    const [, setAccount] = result.current;

    let updatedAccount = {
      ...testAccount,
      name: 'John Doe',
    };

    setAccount(updatedAccount);

    rerender();

    const [newRerenderAccount] = result.current;
    expect(newRerenderAccount).toStrictEqual(updatedAccount);

    // check directly from localStorage
    let jsonValue = window.localStorage.getItem('key1');
    let storageResult = JSON.parse(jsonValue);
    expect(storageResult).toStrictEqual(updatedAccount);
  });

  test('should returns undefined value from local storage if removed', async () => {
    const { result, rerender, waitForNextUpdate } = renderHook(() => useLocalStorage('key1', testAccount));

    waitForNextUpdate();

    act(() => {
      const [, , remove] = result.current;
      remove();
    });

    rerender();

    const [newRerenderAccount] = result.current;
    expect(newRerenderAccount).toBeUndefined();

    // check directly from localStorage
    let jsonValue = window.localStorage.getItem('key1');
    expect(jsonValue).toBeNull();
  });

  test('should returns default value from session storage', async () => {
    const { result, rerender, waitForNextUpdate } = renderHook(() => useSessionStorage('key1', testAccount));

    const [account] = result.current;
    expect(account).toStrictEqual(testAccount);

    waitForNextUpdate();

    const [newAccount] = result.current;
    expect(newAccount).toStrictEqual(testAccount);

    rerender();

    const [newRerenderAccount] = result.current;
    expect(newRerenderAccount).toStrictEqual(testAccount);

    // check directly from session storage
    let jsonValue = window.sessionStorage.getItem('key1');
    let storageResult = JSON.parse(jsonValue);
    expect(storageResult).toStrictEqual(testAccount);
  });

  test('should returns updated value from session storage', async () => {
    const { result, rerender, waitForNextUpdate } = renderHook(() => useSessionStorage('key1', testAccount));

    waitForNextUpdate();

    const [, setAccount] = result.current;

    let updatedAccount = {
      ...testAccount,
      name: 'John Doe',
    };

    setAccount(updatedAccount);

    rerender();

    const [newRerenderAccount] = result.current;
    expect(newRerenderAccount).toStrictEqual(updatedAccount);

    // check directly from session Storage
    let jsonValue = window.sessionStorage.getItem('key1');
    let storageResult = JSON.parse(jsonValue);
    expect(storageResult).toStrictEqual(updatedAccount);
  });

  test('should returns undefined value from session storage if removed', async () => {
    const { result, rerender, waitForNextUpdate } = renderHook(() => useSessionStorage('key1', testAccount));

    waitForNextUpdate();

    act(() => {
      const [, , remove] = result.current;
      remove();
    });

    rerender();

    const [newRerenderAccount] = result.current;
    expect(newRerenderAccount).toBeUndefined();

    // check directly from sessionStorage
    let jsonValue = window.sessionStorage.getItem('key1');
    expect(jsonValue).toBeNull();
  });
});
