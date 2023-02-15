import { useCallback, useState, useEffect, Dispatch, SetStateAction } from 'react';

type FuncOfT<T> = () => T;

export function useLocalStorage<T>(key: string, defaultValue: T | FuncOfT<T>) {
  return useStorage<T>(key, defaultValue, window.localStorage);
}

export function useSessionStorage<T>(key: string, defaultValue: T | FuncOfT<T>) {
  return useStorage<T>(key, defaultValue, window.sessionStorage);
}

function useStorage<T>(key: string, defaultValue: T | FuncOfT<T>, storageObject: Storage): [T, Dispatch<SetStateAction<T>>, () => void] {
  const [value, setValue] = useState<T>(() => {
    const jsonValue = storageObject.getItem(key);

    if (jsonValue != null) return JSON.parse(jsonValue);

    if (typeof defaultValue === 'function') {
      return (defaultValue as FuncOfT<T>)();
    } else {
      return defaultValue;
    }
  });

  useEffect(() => {
    if (value === undefined) return storageObject.removeItem(key);

    storageObject.setItem(key, JSON.stringify(value));
  }, [key, value, storageObject]);

  const remove = useCallback(() => {
    setValue(undefined);
  }, []);

  return [value, setValue, remove];
}
