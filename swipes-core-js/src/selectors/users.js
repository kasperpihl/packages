import { createSelector } from 'reselect';
import Fuse from 'fuse.js';
import { searchSelectorFromKeys, getFuzzyOptionsWithKeys } from '../classes/utils';

const options = getFuzzyOptionsWithKeys([
  'email',
  'profile.first_name',
  'profile.last_name',
]);

const getAutoCompleteString = state => state.autoComplete.get('string');
const getUsers = state => state.users;

const nameSort = (a, b) => {
  const f1 = msgGen.users.getFirstName(a);
  const f2 = msgGen.users.getFirstName(b);
  if (f1 !== f2) {
    return f1.localeCompare(f2);
  }
  const l1 = msgGen.users.getLastName(a);
  const l2 = msgGen.users.getLastName(b);
  return l1.localeCompare(l2);
};

export const getSorted = createSelector(
  [getUsers],
  users => users.sort(nameSort),
);

export const getAllButSofi = createSelector(
  [getSorted],
  users => users.filter(u => !u.get('is_sofi')),
);

export const getActive = createSelector(
  [getSorted],
  users => users.filter(u => !u.get('disabled')),
);
export const getActiveArray = createSelector(
  [getActive],
  users => users.toList().toJS(),
);

export const getDisabled = createSelector(
  [getSorted],
  users => users.filter(u => !!u.get('disabled')),
);

export const search = searchSelectorFromKeys([
  'email',
  'profile.first_name',
  'profile.last_name',
], getActive);

export const autoComplete = createSelector(
  [getActiveArray, getAutoCompleteString],
  (list, autoCompleteString) => {
    const fuse = new Fuse(list, options); // "list" is the item array
    return fuse.search(autoCompleteString || '').map((res) => {
      const { item } = res;
      const user = msgGen.users.getUser(item.id);
      const profilePic = msgGen.users.getPhoto(user);
      res.resultItem = {
        title: msgGen.users.getFullName(user),
      };
      if (profilePic) {
        res.resultItem.leftIcon = {
          src: profilePic,
        };
      } else {
        res.resultItem.leftIcon = {
          initials: {
            color: 'white',
            backgroundColor: '#000C2F',
            letters: msgGen.users.getInitials(user),
          },
        };
      }
      return res;
    });
  },
);
