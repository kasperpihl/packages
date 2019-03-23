import { useContext } from 'react';
import { MyIdContext, ConnectedContext } from 'src/react/contexts';

export default function useMyId() {
  return useContext(MyIdContext);
}
