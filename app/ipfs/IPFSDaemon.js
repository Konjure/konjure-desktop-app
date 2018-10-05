const IPFSFactory = require('ipfsd-ctl');
const IPFS = require('ipfs');

export default class IPFSDaemon {
  constructor() {
    this.start = this.start.bind(this);
  }

  start(callback) {
    const factory = IPFSFactory.create({
      type: 'proc',
      exec: IPFS,
      port: 5001
    });

    console.log('Spawning IPFS daemon process');

    factory.spawn((err, ipfsd) => {
      if (err) {
        callback(err, undefined);
        return;
      }

      callback(err, ipfsd.api);
    });
  }
}
