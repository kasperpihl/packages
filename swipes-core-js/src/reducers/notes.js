import { fromJS, Map } from 'immutable';
import * as types from '../constants';

const initialState = fromJS({ server: {}});

const handleNoteUpdate = (state, note) => {
  const id = note.get('id');
  if (!state.getIn(['server', id]) || state.getIn(['server', id, 'rev']) < note.get('rev')) {
    state = state.setIn(['server', id], note);
  }

  const saveId = state.getIn(['cache', id, '_saveId']);
  if (saveId === note.get('last_save_id')) {
    state = state.deleteIn(['cache', id, '_saveId']);

    if (state.getIn(['cache', id, 'text'])) {
      state = state.setIn(['cache', id, 'serverOrg'], note);
      return state.deleteIn(['cache', id, '_savingText']);
    }

    return state.deleteIn(['cache', id]);
  }
  return state;
};

export default function notesReducer(state = initialState, action) {
  const {
    type,
    payload,
  } = action;

  switch (type) {
    case 'init': {
      let server = Map();
      if(!payload.full_fetch) {
        server = state.get('server');
      }

      if(payload.notes) {
        payload.notes.forEach((note) => {
          server = server.set(note.id, fromJS(note));
          if(note.archived || note.deleted) {
            server = server.delete(note.id);
          }
        });
      }

      return state.set('server', server);
    }
    case types.NOTE_CACHE: {
      if (payload.serverOrg) {
        state = state.setIn(['cache', payload.id, 'serverOrg'], payload.serverOrg);
      }
      return state.setIn(['cache', payload.id, 'text'], fromJS(payload.text));
    }
    case types.NOTE_SAVE_START: {
      state = state.setIn(['cache', payload.id, '_savingText'], fromJS(payload.text));
      state = state.setIn(['cache', payload.id, '_saveId'], payload.saveId);
      return state.deleteIn(['cache', payload.id, 'text']);
    }
    case types.NOTE_SAVE_SUCCESS: {
      const note = fromJS(payload.note);
      return handleNoteUpdate(state, note);
    }
    case types.NOTE_SAVE_ERROR: {
      const id = payload.id;
      if (payload.error && payload.error.message === 'merge_needed') {
        const note = payload.error.note;
        if (state.getIn(['server', id, 'rev']) < note.rev) {
          state = state.setIn(['server', id], note);
        }
      }
      const oldText = state.getIn(['cache', id, '_savingText']);
      if (!state.getIn(['cache', id, 'text'])) {
        state = state.setIn(['cache', id, 'text'], oldText);
      }
      return state.deleteIn(['cache', id, '_savingText']);
    }
    case 'notes.create': {
      return state.setIn(['server', payload.note.id], fromJS(payload.note));
    }
    case 'note_updated': {
      const note = fromJS(payload);
      return handleNoteUpdate(state, note);
    }
    case types.RESET_STATE: {
      return initialState;
    }
    default:
      return state;
  }
}
