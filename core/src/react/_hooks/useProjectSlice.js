import { useEffect, useRef, useState } from 'react';

export default function useProjectSlice(stateManager, slicer) {
  const getNewState = () => {
    if (!stateManager) return [];
    return slicer(stateManager.getClientState(), stateManager.getLocalState());
  };

  const [state, setState] = useState(getNewState());

  const stateRef = useRef(state);

  useEffect(() => {
    stateRef.current = state;
  });

  useEffect(() => {
    if (stateManager) {
      setState(getNewState());
      return stateManager.subscribe(() => {
        const newState = getNewState();
        const dirty = newState.filter((val, i) => val !== stateRef.current[i]);
        // only update if anything has changed.
        dirty.length && setState(newState);
      });
    }
  }, [stateManager]);

  return state;
}
