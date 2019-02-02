import { fromJS } from 'immutable';

const initialState = fromJS({});

export default function counterReducer(state = initialState, action) {
  const { type, payload } = action;

  switch (type) {
    case 'me.init': {
      return fromJS(payload.unread);
    }
    case 'update': {
      // payload.updates.forEach(({ type, data }) => {
      //   if (type !== 'discussion') return;
      //   if (data.archived) {
      //     return state.updateIn(['discussion'], d =>
      //       d.filter(o => o.get('id') !== data.id)
      //     );
      //   }
      //   const subscription = data.followers.find(
      //     f => f.user_id === state.get('myId')
      //   );

      //   if (
      //     data.last_comment_at > state.get('discussionTs') &&
      //     subscription &&
      //     (!subscription.read_at || subscription.read_at < data.last_comment_at)
      //   ) {
      //     state = state.updateIn(['discussion'], d =>
      //       d
      //         .filter(o => o.get('id') !== data.id)
      //         .push(
      //           fromJS({
      //             ts: data.last_comment_at,
      //             id: data.id
      //           })
      //         )
      //     );
      //   }
      // });
      return state;
    }
    default:
      return state;
  }
}
