/* eslint-disable no-underscore-dangle */
// @flow
import React, { Component } from 'react';
import IFrame from 'react-iframe';

const { remote, shell } = require('electron');

const { dialog } = remote;

const fs = require('fs');
const path = require('path');
const os = require('os');

const { __ } = require('i18n');

const mainWindow = remote.getCurrentWindow();

type Props = {};

export default class Gateway extends Component<Props> {
  constructor(props) {
    super(props);
    this.state = {
      preppedForUpload: null,
      pageURL: null,
      statusBar: 'Waiting for Upload'
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

    this.setState({ preppedForUpload: file });
  }

  publishPayload() {
    const { preppedForUpload } = this.state;
    if (preppedForUpload == null) {
      return;
    }

    if (fs.lstatSync(preppedForUpload).isDirectory()) {
      const walk = (dir) => new Promise((resolve, reject) => {
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
                walk(filepath).then(resolve).catch((err) => reject(err));
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

      this.setStatusBar('Prepare files for upload...');
      walk(preppedForUpload).then(files => {
        this.setStatusBar('Uploading files to IPFS');
        const ipfs = global.ipfsController.getAPI();

        ipfs.files.mkdir('/site', mkdirErr => {
          if (mkdirErr) {
            console.log(`Error: ${mkdirErr}`);
            return;
          }

          Promise.all(files.map(file => {
            const ipfsPath = `/${path.join('site', file.substring(preppedForUpload.length + 1)).replace(/\\/g, '/')}`;
            console.log(`Discovered ${ipfsPath}`);
            const promise = ipfs.files.write(
              ipfsPath,
              fs.readFileSync(file),
              {
                create: true,
                parents: true
              });
            return promise;
          })).then(() => {
            ipfs.files.stat('/site', (err, stats) => {
              if (err) {
                console.log(`Error: ${err}`);
                return;
              }

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
        console.log(`Error when attempting to read directory ${preppedForUpload}, ${err.toString()}`);
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
    this.state.statusBar = <div onClick={() => {
      shell.openExternal(url);
    }}>
      Click to open in browser.
    </div>;

    this.forceUpdate();
  }

  setStatusBar(statusBar) {
    this.setState({
      statusBar
    });
    this.forceUpdate();
  }

  cancelPayload() {
    this.setState({
      preppedForUpload: null,
      statusBar: 'Waiting for Upload'
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
      return <IFrame url={this.state.pageURL} />;
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
    const { preppedForUpload } = this.state;
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
          <h5 id="percent-uploaded">{this.state.statusBar}</h5>
          <div className={`button k-gateway-button material slight-rounded no-select publish-button right
            ${(preppedForUpload != null && preppedForUpload.length > 0 ? '' : 'disabled')}`
          } onClick={this.publishPayload}>
            {__('gateway.publish')}
          </div>
          <div className={`button k-gateway-button material slight-rounded no-select
          cancel-button right ${
            (preppedForUpload != null && preppedForUpload.length > 0 ? '' : 'disabled')
            }`}
               onClick={this.cancelPayload}>
            {__('gateway.cancel')}
          </div>
        </div>
      </div>
    );
  }
}
