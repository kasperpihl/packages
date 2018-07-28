import React from 'react';

export default class Users {
  constructor(store) {
    this.store = store;
  }
  getUser(user) {
    if (typeof user === 'string') {
      const { users, me } = this.store.getState();
      if (user === 'me' || me.get('id') === user) {
        return me;
      }
      return users.get(user);
    }
    return user;
  }

  getEmail(userId) {
    const user = this.getUser(userId);
    if (!user) {
      return undefined;
    }
    return user.get('email');
  }
  getPhoto(userId, size) {
    const sizes = [192, 96, 64];
    if (sizes.indexOf(size) === -1) {
      size = 192;
    }
    const sizeString = `${size}x${size}`;

    const user = this.getUser(userId);
    if (!user) {
      return undefined;
    }
    return user.getIn(['profile', 'photos', sizeString]);
  }
  getFirstName(userId) {
    const user = this.getUser(userId);
    if (!user) {
      return undefined;
    }
    const firstName = user.getIn(['profile', 'first_name']) || '';
    return firstName.split(' ').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');
  }
  getLastName(userId) {
    const user = this.getUser(userId);
    if (!user) {
      return undefined;
    }
    const lastName = user.getIn(['profile', 'last_name']) || '';
    return lastName.split(' ').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');
  }
  getRole(userId) {
    const user = this.getUser(userId);
    if (!user) {
      return undefined;
    }
    return user.getIn(['profile', 'role']) || '';
  }
  getBio(userId) {
    const user = this.getUser(userId);
    if (!user) {
      return undefined;
    }
    return user.getIn(['profile', 'bio']) || '';
  }
  getOrganizationName(userId) {
    const user = this.getUser(userId);
    if (!user) {
      return undefined;
    }
    return user.getIn(['organizations', 0, 'name']);
  }
  getInitials(userId) {
    const user = this.getUser(userId);
    if (!user) {
      return undefined;
    }
    let initials = this.getFirstName(user).substring(0, 1);
    const lastName = this.getLastName(user);
    if (lastName.length) {
      initials += lastName.substring(0, 1);
    }
    return initials;
  }
  getFullName(userId) {
    const user = this.getUser(userId);
    if (!user) {
      return undefined;
    }
    const firstName = this.getFirstName(user);
    const lastName = this.getLastName(user);
    let fullName = firstName;
    if (lastName.length) {
      fullName += ` ${lastName}`;
    }
    return fullName;
  }
  getName(userId, options) {
    options = options || {};
    const { me } = this.store.getState();

    if (userId === 'none') {
      return 'no one';
    }
    if (userId === 'me') {
      userId = me.get('id');
    }
    const user = this.getUser(userId);
    if (user) {
      if (user.get('id') === me.get('id') && !options.disableYou) {
        if (options.capitalize) {
          return options.yourself ? 'Yourself' : 'You';
        }
        return options.yourself ? 'yourself' : 'you';
      }

      return this.getFirstName(user);
    }

    return 'anyone';
  }
  getNames(userIds, options) {
    options = options || {};

    const { me } = this.store.getState();

    const {
      preferId = me.get('id'),
      number = 1,
      quotes = false,
      bold = false,
      defaultString = null,
    } = options;
    let {
      excludeId = null,
    } = options;

    if (!userIds || !userIds.size) {
      return defaultString || 'no one';
    }

    const numberOfNames = number;

    if (excludeId === 'me') {
      excludeId = me.get('id');
    }

    if (userIds.includes(excludeId)) {
      userIds = userIds.filter(uId => uId !== excludeId);
    }

    if (userIds.includes(preferId)) {
      userIds = userIds.filter(uId => uId !== preferId).insert(0, preferId);
    }

    const names = userIds.map(uId => this.getName(uId, options));
    let nameString = '';
    let i = 0;

    do {
      const name = names.get(i);
      if (i < numberOfNames && name) {
        let seperator = i > 0 ? ', ' : '';
        if (i === (names.size - 1) && i > 0) {
          seperator = ' & ';
        }
        nameString += (seperator + name);
      }
      i += 1;
    } while (i < numberOfNames && i < names.size);

    if (names.size && i < names.size) {
      const extra = (names.size - i);
      nameString += ` & ${extra} other${extra > 1 ? 's' : ''}`;
    }

    if (nameString.length === 0) {
      // the default string is taken as it is. Without respecting `quotes` or `bold` options
      nameString = defaultString;

      return nameString;
    }

    if (quotes) {
      nameString = `"${nameString}"`;
    }

    if (bold) {
      nameString = <b>{nameString}</b>;
    }

    return nameString;
  }
}
