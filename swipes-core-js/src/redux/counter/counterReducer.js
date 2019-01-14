import { fromJS } from 'immutable';

const initialState = fromJS({
  notification: [],
  discussion: []
});

export default function counterReducer(state = initialState, action) {
  const { type, payload } = action;

  switch (type) {
    case 'init': {
      return state;
      return fromJS(payload.counter);
    }
    case 'me.clearCounter':
    case 'me_cleared_counter': {
      return state
        .set(`${payload.type}Ts`, payload.cleared_at)
        .updateIn([payload.type], cs =>
          cs.filter(c => c.get('read_at') > payload.cleared_at)
        );
    }
    case 'update': {
      payload.updates.forEach(({ type, data }) => {
        if (type !== 'discussion') return;
        if (data.archived) {
          return state.updateIn(['discussion'], d =>
            d.filter(o => o.get('id') !== data.id)
          );
        }
        const subscription = data.followers.find(
          f => f.user_id === state.get('myId')
        );

        if (
          data.last_comment_at > state.get('discussionTs') &&
          subscription &&
          (!subscription.read_at || subscription.read_at < data.last_comment_at)
        ) {
          state = state.updateIn(['discussion'], d =>
            d
              .filter(o => o.get('id') !== data.id)
              .push(
                fromJS({
                  ts: data.last_comment_at,
                  id: data.id
                })
              )
          );
        }
      });
      return state;
    }
    default:
      return state;
  }
}
