import { useContext } from 'react';
import { ConnectedContext } from 'src/react/contexts';

export default function useConnected() {
  return useContext(ConnectedContext);
}
