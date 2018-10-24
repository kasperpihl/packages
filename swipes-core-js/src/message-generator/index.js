import MeGenerator from './me-generator';
import OrganizationsGenerator from './organizations-generator';
import UsersGenerator from './users-generator';

export default class MessageGenerator {
  constructor(store) {
    this.store = store;
    this.me = new MeGenerator(store, this);
    this.orgs = new OrganizationsGenerator(store, this);
    this.users = new UsersGenerator(store, this);
  }
}
