export default clientState =>
  clientState.set(
    'sortedOrder',
    clientState
      .get('ordering')
      .sort((a, b) => {
        if (a < b) return -1;
        if (a > b) return 1;
        return 0;
      })
      .keySeq()
      .toList()
  );
