const EventEmitter = require('events');

export default class IPFSController extends EventEmitter {
  constructor() {
    super();

    this.tasks = [];
    this.started = false;
    this.rand = Math.random();

    this.bindAPI = this.bindAPI.bind(this);
    this.unbindAPI = this.unbindAPI.bind(this);
    this.getAPI = this.getAPI.bind(this);
  }

  bindAPI(api) {
    this.ipfsAPI = api;
    this.started = true;
  }

  unbindAPI() {
    this.ipfsAPI = null;
    this.started = false;
  }

  getAPI() {
    return this.ipfsAPI;
  }
}
