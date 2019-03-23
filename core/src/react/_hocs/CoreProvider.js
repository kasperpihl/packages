import React from 'react';
import { connect } from 'react-redux';
import { MyIdContext, ConnectedContext } from 'src/react/contexts';

export default connect(state => ({
  myId: state.me.get('user_id'),
  connected: state.connection.get('status') === 'online'
}))(CoreProvider);

function CoreProvider({ myId, connected, children }) {
  return (
    <MyIdContext.Provider value={myId}>
      <ConnectedContext.Provider value={connected}>
        {children}
      </ConnectedContext.Provider>
    </MyIdContext.Provider>
  );
}
