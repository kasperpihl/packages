import { useEffect, useRef } from 'react';

export default function useUpdate(type, handler) {
  const updateHandler = useRef();
  updateHandler.current = handler;
  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.socket === 'undefined') {
      console.warn('useUpdate expects window and window.socket to be set');
      return;
    }
    return window.socket.subscribe(update => {
      if (update.type === type) {
        updateHandler.current(update.data);
      }
    });
  }, []);
}
