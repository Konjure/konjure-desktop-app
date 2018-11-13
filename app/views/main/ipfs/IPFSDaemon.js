const IPFSFactory = require('ipfsd-ctl');

const IPFS = require('ipfs');

const EventEmitter = require('events');

export default class IPFSDaemon extends EventEmitter{
  constructor() {
    super();

    this.factory = IPFSFactory.create({
      type: 'proc',
      exec: IPFS,
      port: 5001
    });

    this.start = this.start.bind(this);
    this.running = this.running.bind(this);
    this.getAPI = this.getAPI.bind(this);

    this.ipfsd = null;
  }

  getAPI () {
    return this.ipfsd.api;
  }

  running() {
    return this.ipfsd !== null;
  }

  stop() {
    if (this.ipfsd !== null) {
      this.ipfsd.stop(this.factory);
      global.ipfsController.unbindAPI();
      this.emit('stopped');
    }
  }

  start(callback) {
    console.log('Spawning IPFS daemon process');
    this.emit('pre-start');

    this.factory.spawn((err, ipfsd) => {
      if (err) {
        callback(err, undefined);
        return;
      }

      this.running = true;
      this.ipfsd = ipfsd;
      this.emit('post-start');
      callback(err, ipfsd.api);
    });
  }
}
