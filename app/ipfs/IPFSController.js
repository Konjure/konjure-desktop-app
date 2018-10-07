export default class IPFSController {
  constructor() {
    this.tasks = [];
    this.started = false;
    this.rand = Math.random();
    this.bindAPI = this.bindAPI.bind(this);
    this.saveToIPFS = this.saveToIPFS.bind(this);
  }

  bindAPI(api) {
    this.ipfsAPI = api;
    this.started = true;
  }

  saveToIPFS(file, callback) {
    if (!this.started) {
      console.log(`IPFS not in ready state! Pushing to task list #${this.tasks.length + 1}`);
      this.tasks.push(() => this.saveToIPFS(file, callback));
      return;
    }

    this.ipfsAPI.files.add(file, {progress: (prog) => console.log(`Received: ${prog}`)})
      .then((response) => {
        console.log(response[0].hash);
        return true;
      }).catch((err) => {
      console.log(err);
    });
  }
}
