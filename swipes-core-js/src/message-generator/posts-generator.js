export default class Posts {
  constructor(store, parent) {
    this.store = store;
    this.parent = parent;
  }
  getPrefixForType() {
    return 'a ';
  }
  getPostTypeTitle() {
    return 'made a post';
  }
}
