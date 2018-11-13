/* eslint-disable no-underscore-dangle */
// @flow
import React, { Component } from 'react';
import IFrame from 'react-iframe';
import { Trans } from 'react-i18next';
import { t } from 'i18next';

import { remote, shell } from 'electron';

import os from 'os';
import fs from 'fs';
import path from 'path';

import { sha256bs58HashString } from '../utils/Crypto';

// Images
import imgDrop from '../../../res/image/drop.png';

const currentWindow = remote.getCurrentWindow();
const mainWindow = remote.getCurrentWindow();
const { dialog } = remote;

type Props = {
  setSitePath: (site) => void,
  site: string
};

let externalBrowserInformed = false;

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
      pageURL: null,
      statusBar: t('gateway.status.waiting')
    };

    this.prepareUpload = this.prepareUpload.bind(this);
    this.publishPayload = this.publishPayload.bind(this);
    this.cancelPayload = this.cancelPayload.bind(this);
    this.getUploadText = this.getUploadText.bind(this);
    this.getWebsiteFrame = this.getWebsiteFrame.bind(this);
    this.setWebpage = this.setWebpage.bind(this);
  }

  prepareUpload(sitepath) {
    if (sitepath === undefined) {
      return;
    }

    this.props.setSitePath(sitepath);

    this.setState({
      statusBar: t('gateway.status.ready')
    });
  }

  publishPayload() {
    const { site } = this.props;

    if (site == null) {
      return;
    }

    const ipfs = global.ipfsController.getAPI();

    if (fs.lstatSync(site).isDirectory()) {
      this.setStatusBar(t('gateway.status.preparing'));
      Gateway.walk(site).then(files => {
        this.setStatusBar(t('gateway.status.uploading'));

        const fileCount = files.length;
        let currentCount = 0;

        const konjid = sha256bs58HashString(`${new Date().getMilliseconds()}`);
        console.log(`Beginning site upload with KonjID: ${konjid}`);

        ipfs.files.mkdir(`/${konjid}`, mkdirErr => {
          if (mkdirErr) {
            console.log(mkdirErr);
            return;
          }

          this.setState({ pageURL: null });

          Promise.all(files.map(file => {
            const ipfsPath = `/${path.join(konjid, file.substring(site.length + 1)).replace(/\\/g, '/')}`;
            return new Promise((resolve, reject) => {
              ipfs.files.write(ipfsPath, fs.readFileSync(file), { create: true, parents: true }, (err) => {
                if (err) {
                  reject(err);
                }

                console.log(`Uploaded ${ipfsPath}`);

                const percentage = (++currentCount / fileCount);
                this.setStatusBar(t('gateway.status.upload-update', `${(percentage * 100).toFixed(2)}%`));
                currentWindow.setProgressBar(percentage);

                resolve();
              });
            });
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
        this.cancelPayload(t('gateway.status.error'));
        throw err;
      });
    } else {
      const { size } = fs.statSync(`${site}`);

      ipfs.files.add(fs.readFileSync(`${site}`), {
        progress: (prog) => {
          const percentage = prog / size;

          this.setStatusBar(t('gateway.status.upload-update', `${(percentage * 100).toFixed(2)}%`));
          currentWindow.setProgressBar(percentage);
        }
      }).then((response) => {
        currentWindow.setProgressBar(0, { mode: 'none' });

        const { hash } = response[0];
        this.setWebpage(hash);

        return true;
      }).catch((err) => {
        currentWindow.setProgressBar(0, { mode: 'none' });
        this.cancelPayload(t('gateway.status.error'));
        throw err;
      });
    }

    this.cancelPayload();
  }

  setWebpage(hash) {
    console.log(`Published to IPFS, hash ${hash}`);
    const url = `https://ipfs.io/ipfs/${hash}`;

    if (!externalBrowserInformed) {
      externalBrowserInformed = true;
      global.alert(t('gateway.upload-info'), 10, 'success');
    }

    this.state.pageURL = url;
    this.state.statusBar = <div
      className="underline-on-hover"
      onClick={() => {
        shell.openExternal(url);
      }}>
      {t('gateway.status.open-in-browser')}
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
    this.props.setSitePath(null);

    this.setState({
      statusBar: error === null ? t('gateway.status.waiting') : `${error}`,
      pageURL: null
    });
  }

  getUploadText() {
    const { site } = this.props;

    if (site != null) {
      return site.length > 60 ? `${site.substr(0, 60)}...` : site;
    }

    return t('gateway.upload');
  }

  getWebsiteFrame() {
    const { pageURL } = this.state;

    if (pageURL !== null) {
      return <IFrame url={pageURL}/>;
    }

    if (global.ipfsdStatus === 'down') {
      return <div className="vertical-center-outer">
        <div className="vertical-center-inner">
          <h3 className="text-center">
            <Trans i18nKey='gateway.node-down'>
              Please start the node to upload a website.
            </Trans>
          </h3>
        </div>
      </div>;
    }

    return <div className="vertical-center-outer">
      <div className="vertical-center-inner">
        <img src={imgDrop} className="center" alt="dragndrop"/>
        <br/>
        <h6 className="text-center">
          <Trans i18nKey='gateway.drag-drop'>
            Drag & drop a file for upload here
          </Trans>
        </h6>
      </div>
    </div>;
  }

  render() {
    const { pageURL } = this.state;
    const { site } = this.props;

    const disabled = global.ipfsdStatus === 'down';

    return (
      <div className="k-content gateway" onDrop={event => {
        if (disabled) {
          return;
        }

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
          <button type='button' className={`button k-gateway-button slight-rounded material
          no-select upload-button left ${disabled ? 'disabled' : ''}`}
                  onClick={() => {
                    const defaultpath = site != null ? site : os.homedir();
                    dialog.showOpenDialog(mainWindow, {
                      properties: [
                        'openDirectory'
                      ],
                      title: t('gateway.upload'),
                      defaultPath: defaultpath
                    }, (fileNames) => {
                      if (fileNames === undefined) {
                        return;
                      }

                      this.prepareUpload(fileNames[0]);
                    });
                  }}
                  disabled={disabled}>
            <div>{this.getUploadText()}</div>
          </button>
          <h5 id="percent-uploaded"> {this.state.statusBar}</h5>
          <div className={`button k-gateway-button material slight-rounded no-select publish-button right
            ${(site != null && site.length > 0 ? '' : 'disabled')}`
          } onClick={() => this.publishPayload()}>
            <Trans i18nKey='gateway.publish'>
              Publish
            </Trans>
          </div>
          <div className={`button k-gateway-button material slight-rounded no-select
          cancel-button right ${
            (site != null && site.length > 0 ? '' : 'disabled')
            }`}
               onClick={() => this.cancelPayload()}>
            <Trans i18nKey='gateway.cancel'>
              Cancel
            </Trans>
          </div>
          {pageURL != null ?
            <div className='button k-gateway-button material slight-rounded no-select cancel-button right'
                 onClick={() => this.cancelPayload()}>
              <Trans i18nKey='gateway.close'>
                Close
              </Trans>
            </div> : ''
          }
        </div>
      </div>
    );
  }
}
