import GoalsGenerator from './goals-generator';
import HistoryGenerator from './history-generator';
import MeGenerator from './me-generator';
import MilestonesGenerator from './milestones-generator';
import OrganizationsGenerator from './organizations-generator';
import NotificationsGenerator from './notifications-generator';
import PostsGenerator from './posts-generator';
import UsersGenerator from './users-generator';

export default class MessageGenerator {
  constructor(store) {
    this.store = store;
    this.goals = new GoalsGenerator(store, this);
    this.history = new HistoryGenerator(store, this);
    this.me = new MeGenerator(store, this);
    this.milestones = new MilestonesGenerator(store, this);
    this.notifications = new NotificationsGenerator(store, this);
    this.orgs = new OrganizationsGenerator(store, this);
    this.posts = new PostsGenerator(store, this);
    this.users = new UsersGenerator(store, this);
  }
}
