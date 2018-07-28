import { Map } from 'immutable';

const boldText = (id, string, boldStyle) => {
  const obj = {
    id,
    string,
    className: 'notification-item__styled-button',
  };
  if (boldStyle) {
    obj.boldStyle = boldStyle;
  }

  return obj;
};

export default class NotificationsGenerator {
  constructor(store, parent) {
    this.store = store;
    this.parent = parent;
  }
  getUserStringMeta(meta, boldStyle) {
    const { users } = this.parent;
    return boldText('users', users.getNames(meta.get('user_ids'), {
      preferId: meta.getIn(['last_reaction', 'created_by']),
      excludeId: 'me',
      number: 2,
    }), boldStyle);
  }
  getImportantUserIdFromMeta(meta) {
    let userId;
    const type = meta.get('event_type');
    if ([
      'post_reaction_added',
      'post_comment_added',
      'post_comment_reaction_added',
    ].indexOf(type) !== -1) {
      if (meta.getIn(['last_reaction', 'created_by'])) {
        return meta.getIn(['last_reaction', 'created_by']);
      }
      userId = meta.getIn(['user_ids', 0]);
    } else if (['post_created'].indexOf(type) !== -1) {
      userId = meta.get('created_by');
    } else if (['post_comment_mention'].indexOf(type) !== -1) {
      userId = meta.get('mentioned_by');
    } else {
      userId = 'me';
    }
    return userId;
  }
  parseMessage(message) {
    message = message || '';
    return message.replace(/<![A-Z0-9]*\|(.*?)>/gi, (t1, name) => name);
  }
  getStyledTextForNotification(n, boldStyle) {
    const meta = n.get('meta');
    const { users, posts } = this.parent;
    const text = [];
    switch (meta.get('event_type')) {
      case 'goal_assigned': {
        const count = meta.get('step_assign_count') || 0;
        if (count > 0) {
          text.push('You have been assigned to ');
          text.push(boldText('count', `${count} step${count > 1 ? 's' : ''}`, boldStyle));
          text.push(` in: "${meta.get('goal_title')}"`);
        } else {
          text.push(`You've been assigned to the goal: "${meta.get('goal_title')}"`);
        }

        break;
      }
      case 'organization_user_joined': {
        if (meta.get('is_me')) {
          text.push(boldText('name', 'You', boldStyle));
          text.push(' has joined the ');
          text.push(boldText('org', meta.get('organization_name'), boldStyle));
          text.push(' team. Welcome!');
        } else {
          text.push(boldText('name', meta.get('first_name'), boldStyle));
          text.push(' has joined the ');
          text.push(boldText('org', meta.get('organization_name'), boldStyle));
          text.push(' team.');
        }
        break;
      }
      case 'step_assigned': {
        const count = meta.get('step_assign_count');
        text.push('You have been assigned to ');
        text.push(boldText('count', `${count} step${count > 1 ? 's' : ''}`, boldStyle));
        text.push(` in: "${meta.get('goal_title')}"`);
        break;
      }
      case 'post_created': {
        text.push(boldText('send', users.getName(meta.get('created_by'), { capitalize: true }), boldStyle));
        text.push(` ${posts.getPostTypeTitle()}`);

        const myId = users.getUser('me').get('id');
        const mentioned = meta.get('mention_ids').find(id => id === myId);

        if (mentioned) {
          text.push(' and mentioned ');
        } else {
          text.push(' and tagged ');
        }

        text.push(boldText('users', 'you', boldStyle));
        text.push(`: "${this.parseMessage(meta.get('message'))}"'`);
        break;
      }
      case 'post_reaction_added': {
        text.push(this.getUserStringMeta(meta, boldStyle));
        text.push(` liked your post: "${this.parseMessage(meta.get('message'))}"`);
        break;
      }
      case 'post_comment_added': {
        text.push(this.getUserStringMeta(meta, boldStyle));
        const myId = users.getUser('me').get('id');
        const byMe = meta.get('post_created_by') === myId;
        const preFix = byMe ? 'your' : posts.getPrefixForType();
        const followString = byMe ? '' : 'you follow';
        const mentioned = meta.get('mention_ids').find(id => id === myId);

        if (mentioned) {
          text.push(` mentioned you in a comment: "${this.parseMessage(meta.get('comment_message'))}"`);
        } else {
          text.push(` commented on ${preFix} post ${followString}: "${this.parseMessage(meta.get('post_message'))}"`);
        }

        break;
      }
      case 'post_comment_reaction_added': {
        text.push(this.getUserStringMeta(meta, boldStyle));
        text.push(` liked your comment: "${this.parseMessage(meta.get('message'))}"`);
        break;
      }
      case 'post_comment_mention': {
        text.push(boldText('send', users.getName(meta.get('mentioned_by'), { capitalize: true }), boldStyle));
        text.push(` mentioned you in a comment: "${this.parseMessage(meta.get('comment_message'))}"`);
        break;
      }
      default: {
        console.log('unknown notification', n.toJS());
        text.push('I don\t know what to say (unknown notification)');
      }
    }
    return text;
  }
  getDesktopNotification(n) {
    const meta = n.get('meta');
    const myId = n.get('user_id');

    if (!meta.get('push')) {
      return undefined;
    }
    const notif = {
      id: n.get('id'),
      target: n.get('target').toJS(),
    };
    switch (meta.get('event_type')) {
      case 'post_created': {
        const name = this.parent.users.getName(meta.get('created_by'), { capitalize: true });
        const mentioned = meta.get('mention_ids').find(id => id === myId);

        if (mentioned) {
          notif.title = `${name} mentioned you in a post`;
        } else {
          notif.title = `${name} tagged you on a post`;
        }

        notif.message = this.parseMessage(meta.get('message'));
        break;
      }
      case 'post_comment_added': {
        const name = this.parent.users.getName(meta.get('created_by'), { capitalize: true });
        const mentioned = meta.get('mention_ids').find(id => id === myId);

        if (mentioned) {
          notif.title = `${name} mentioned you in a comment`;
        } else {
          notif.title = `${name} commented on a post you follow`;
        }

        notif.message = this.parseMessage(meta.get('comment_message'));
        break;
      }
    }
    return notif;
  }
}
