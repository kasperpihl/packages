import storeGet from '../store/storeGet';

export default function teamGetBelonging(ownedBy) {
  if (ownedBy.startsWith('U')) {
    return 'Personal';
  }
  return (
    storeGet()
      .getState()
      .teams.getIn([ownedBy, 'name']) || 'Unknown'
  );
}
