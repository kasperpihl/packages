import { useContext } from 'react';
import { MyIdContext } from 'src/react/contexts';

export default function useMyId() {
  return useContext(MyIdContext);
}
