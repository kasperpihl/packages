import storeGet from '../store/storeGet';

export default function orgGetBelonging(ownedBy) {
  if (ownedBy.startsWith('U')) {
    return 'Personal';
  }
  return (
    storeGet()
      .getState()
      .organization.getIn([ownedBy, 'name']) || 'Unknown'
  );
}
