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
  getImportantUserIdFromMeta(meta) {
    return 'me';
  }
  parseMessage(message) {
    message = message || '';
    return message.replace(/<![A-Z0-9]*\|(.*?)>/gi, (t1, name) => name);
  }
  getStyledTextForNotification(n, boldStyle) {
    const meta = n.get('meta');
    const text = [];
    switch (meta.get('event_type')) {
      case 'goal_assigned': {
        const count = meta.get('step_assign_count') || 0;
        if (count > 0) {
          text.push('You have been assigned to ');
          text.push(
            boldText('count', `${count} step${count > 1 ? 's' : ''}`, boldStyle)
          );
          text.push(` in: "${meta.get('goal_title')}"`);
        } else {
          text.push(
            `You've been assigned to the goal: "${meta.get('goal_title')}"`
          );
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
        text.push(
          boldText('count', `${count} step${count > 1 ? 's' : ''}`, boldStyle)
        );
        text.push(` in: "${meta.get('goal_title')}"`);
        break;
      }

      default: {
        console.log('unknown notification', n.toJS());
        text.push('I don\t know what to say (unknown notification)');
      }
    }
    return text;
  }
}
