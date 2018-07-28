import { fromJS, List } from 'immutable';
import * as types from '../constants';
import { REHYDRATE } from 'redux-persist';

const initialState = fromJS([]);

const sortFn = (b, c) => c.get('created_at').localeCompare(b.get('created_at'));

export default function notificationsReducer(state = initialState, action) {
  const { payload, type } = action;
  switch (type) {
    case REHYDRATE:
      if (payload && payload.notifications) {
        return payload.notifications.toList();
      }
      return state;
    case 'init': {
      if (!payload || !payload.notifications){
        return state;
      }
      if (payload.full_fetch) {
        return fromJS(payload.notifications).sort(sortFn);
      }
      let notifications = state;

      fromJS(payload.notifications).forEach((n) => {
        const index = notifications.findIndex(sn => sn.get('id') === n.get('id'));
        if (index > -1) {
          notifications = notifications.set(index, n);
        } else {
          notifications = notifications.push(n);
        }
      });
      return notifications.sort(sortFn);
    }

    // ======================================================
    // Notifications
    // ======================================================
    case types.NOTIFICATION_ADD: {
      return state.filter(n => n.get('id') !== payload.id).insert(0, fromJS(payload));
    }
    case 'notifications.markAsSeen':
    case 'notifications_seen': {
      const { notification_ids: ids, last_marked: lastMarked } = payload;
      return state.map((n) => {
        if (ids && ids.indexOf(n.get('id')) !== -1) {
          return n.set('seen_at', lastMarked);
        }
        return n;
      });
    }
    case types.RESET_STATE: {
      return initialState;
    }
    default:
      return state;
  }
}
