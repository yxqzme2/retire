import { useState, useCallback } from 'react';

export function useForm<T extends object>(initialValues: T) {
  const [values, setValues] = useState<T>(initialValues);

  const setValue = useCallback(<K extends keyof T>(key: K, value: T[K]) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  }, []);

  const reset = useCallback(() => {
    setValues(initialValues);
  }, [initialValues]);

  return { values, setValue, setValues, reset };
}
