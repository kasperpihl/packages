import { useRef, useMemo } from 'react';

export default function useCallbackRef(callback, deps) {
  const callbackRef = useRef(callback);
  useMemo(() => {
    callbackRef.current = callback;
  }, deps);

  return callbackRef;
}
