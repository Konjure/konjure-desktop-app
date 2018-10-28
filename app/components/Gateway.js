/* eslint-disable no-underscore-dangle */
// @flow
import CircularProgress from '@material-ui/core/CircularProgress';
import React, { Component } from 'react';
import IFrame from 'react-iframe';

const { remote, shell } = require('electron');

const currentWindow = remote.getCurrentWindow();

const { dialog } = remote;

const fs = require('fs');
const path = require('path');
const os = require('os');

const { __ } = require('../lang/locale');

const { sha256bs58HashString } = require('../utils/Crypto');

const mainWindow = remote.getCurrentWindow();

type Props = {};

export default class Gateway extends Component<Props> {
  static walk(dir) {
    return new Promise((resolve, reject) => {
      fs.readdir(dir, (error, files) => {
        if (error) {
          return reject(error);
        }

        // eslint-disable-next-line no-shadow
        Promise.all(files.map((file) => new Promise((resolve, reject) => {
          const filepath = path.join(dir, file);
          fs.stat(filepath, (statError, stats) => {
            if (statError) {
              return reject(statError);
            }
            if (stats.isDirectory()) {
              Gateway.walk(filepath).then(resolve).catch((err) => reject(err));
            } else if (stats.isFile()) {
              resolve(filepath);
            }
          });
        })))
          .then((foldersContents) =>
            resolve(foldersContents.reduce((all, folderContents) => all.concat(folderContents), []))
          )
          .catch((err) => {
            reject(err);
          });
      });
    });
  }

  constructor(props) {
    super(props);
    this.state = {
      preppedForUpload: null,
      pageURL: null,
      statusBar: 'Waiting for upload'
    };

    this.prepareUpload = this.prepareUpload.bind(this);
    this.publishPayload = this.publishPayload.bind(this);
    this.cancelPayload = this.cancelPayload.bind(this);
    this.getUploadText = this.getUploadText.bind(this);
    this.getWebsiteFrame = this.getWebsiteFrame.bind(this);
    this.setWebpage = this.setWebpage.bind(this);
  }

  prepareUpload(file) {
    if (file === undefined) {
      return;
    }

    this.setState({
      preppedForUpload: file,
      statusBar: 'Ready to upload'
    });
  }

  publishPayload() {
    const { preppedForUpload } = this.state;
    if (preppedForUpload == null) {
      return;
    }

    if (fs.lstatSync(preppedForUpload).isDirectory()) {
      this.setStatusBar('Prepare files for upload...');
      Gateway.walk(preppedForUpload).then(files => {
        this.setStatusBar('Uploading files to IPFS');

        const fileCount = files.length;
        let currentCount = 0;

        const ipfs = global.ipfsController.getAPI();
        const konjid = sha256bs58HashString(`${new Date().getMilliseconds()}`);
        console.log(`Beginning site upload with KonjID: ${konjid}`);

        ipfs.files.mkdir(`/${konjid}`, mkdirErr => {
          if (mkdirErr) {
            console.log(mkdirErr);
            return;
          }

          this.setState({ pageURL: null });

          Promise.all(files.map(file => {
            const ipfsPath = `/${path.join(konjid, file.substring(preppedForUpload.length + 1)).replace(/\\/g, '/')}`;
            const promise = new Promise((resolve, reject) => {
              ipfs.files.write(ipfsPath, fs.readFileSync(file), { create: true, parents: true }, (err) => {
                if (err) {
                  reject(err);
                }

                console.log(`Uploaded ${ipfsPath}`);

                const percentage = (++currentCount / fileCount);
                this.setStatusBar(`Uploading files to IPFS (${(percentage * 100).toFixed(2)}/%)`);
                currentWindow.setProgressBar(percentage);

                resolve();
              });
            });
            return promise;
          })).then(() => {
            ipfs.files.stat(`/${konjid}`, (err, stats) => {
              if (err) {
                console.log(`Stat Error: ${err}`);
                return;
              }

              currentWindow.setProgressBar(0, { mode: 'none' });

              const { hash } = stats;
              this.setWebpage(hash);
            });
            return true;
          }).catch((err) => {
            throw err;
          });
        });

        return true;
      }).catch((err) => {
        this.cancelPayload('Error during upload');
        throw err;
      });
    } else {
      global.ipfsController.saveToIPFS(fs.readFileSync(`${preppedForUpload}`), (err, data) => {
        if (err === null) {
          this.setWebpage(data[0].hash);
        }
      });
    }

    this.cancelPayload();
  }

  setWebpage(hash) {
    console.log(`Published to IPFS, hash ${hash}`);
    const url = `https://ipfs.io/ipfs/${hash}`;

    this.state.pageURL = url;
    this.state.statusBar = <div
      className="underline-on-hover"
      onClick={() => {
        shell.openExternal(url);
      }}>
      {__('gateway.open-in-browser')}
    </div>;

    this.forceUpdate();
  }

  setStatusBar(statusBar) {
    this.setState({
      statusBar
    });
    this.forceUpdate();
  }

  cancelPayload(error = null) {
    this.setState({
      preppedForUpload: null,
      statusBar: error === null ? 'Waiting for Upload' : `${error}`,
      pageURL: null
    });
  }

  getUploadText() {
    const { preppedForUpload } = this.state;

    if (preppedForUpload != null) {
      return preppedForUpload.length > 60 ? `${preppedForUpload.substr(0, 60)}...` : preppedForUpload;
    }

    return __('gateway.upload');
  }

  getWebsiteFrame() {
    const { pageURL } = this.state;

    if (pageURL !== null) {
      return <IFrame url={this.state.pageURL}>
        <p>Error while attempting to display IFrame, view page externally with link below.</p>
      </IFrame>;
    }

    return <div className="vertical-center-outer">
      <div className="vertical-center-inner">
        <img src="res/image/drop.png" className="center" alt="dragndrop"/>
        <br/>
        <h6 className="text-center">{__('gateway.dragdrop')}</h6>
      </div>
    </div>;
  }

  render() {
    const { preppedForUpload, pageURL } = this.state;
    return (
      <div className="k-content gateway" onDrop={event => {
        event.preventDefault();
        this.prepareUpload(event.dataTransfer.files[0].path);
        return false;
      }}>
        <div className="k-gateway-frame">
          <div className="k-website">
            {this.getWebsiteFrame()}
          </div>
        </div>
        <div className="k-gateway-toolbar">
          <button type='button' className="button k-gateway-button slight-rounded material no-select upload-button left"
                  onClick={() => {
                    const defaultpath = preppedForUpload != null ? preppedForUpload : os.homedir();
                    dialog.showOpenDialog(mainWindow, {
                      properties: [
                        'openDirectory'
                      ],
                      title: __('gateway.upload'),
                      defaultPath: defaultpath
                    }, (fileNames) => {
                      if (fileNames === undefined) {
                        return;
                      }

                      this.prepareUpload(fileNames[0]);
                    });
                  }}>
            <div>{this.getUploadText()}</div>
          </button>
          <h5 id="percent-uploaded"> {this.state.statusBar}</h5>
          <div className={`button k-gateway-button material slight-rounded no-select publish-button right
            ${(preppedForUpload != null && preppedForUpload.length > 0 ? '' : 'disabled')}`
          } onClick={this.publishPayload}>
            {__('gateway.publish')}
          </div>
          <div className={`button k-gateway-button material slight-rounded no-select
          cancel-button right ${
            (preppedForUpload != null && preppedForUpload.length > 0 ? '' : 'disabled')
            }`}
               onClick={() => this.cancelPayload()}>
            {__('gateway.cancel')}
          </div>
          {pageURL != null ?
            <div className='button k-gateway-button material slight-rounded no-select cancel-button right'
                 onClick={() => this.cancelPayload()}>
              {__('gateway.close')}
            </div> : ''
          }
        </div>
      </div>
    );
  }
}
