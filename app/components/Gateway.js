/* eslint-disable no-underscore-dangle */
// @flow
import React, { Component } from 'react';
import Iframe from 'react-iframe';


const { remote } = require('electron');

const { dialog } = remote;

const unzipper = require('unzipper');

const stream = require('stream');

const fs = require('fs');
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

    const entries = [];

    fs.createReadStream(preppedForUpload)
      .pipe(unzipper.Parse())
      .pipe(stream.Transform({
        objectMode: true,
        transform(entry, encoding, callback) {
          entries.push(entry);
          entry.autodrain();
          callback();
        }
      }))
      .on('finish', () => {
        Object.values(entries).forEach(entry => {
          const { path, type, size } = entry;
          console.log(`${path}, ${type}, ${size}`);
        });
      });

    /* global.ipfsController.saveToIPFS(fs.readFileSync(`${preppedForUpload}`), (err, data) => {
      if (err === null) {
        console.log(`Published, got hash ${data[0].hash}`);
        this.state.pageURL = `https://ipfs.io/ipfs/${data[0].hash}`;
        this.forceUpdate();
      }
    }); */

    this.cancelPayload();
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
      return <Iframe url={pageURL}/>;
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
            { this.getWebsiteFrame() }
          </div>
        </div>
        <div className="k-gateway-toolbar">
          <button type='button' className="button k-gateway-button slight-rounded material no-select upload-button left"
                  onClick={() => {
                    const defaultpath = preppedForUpload != null ? preppedForUpload : os.homedir();
                    dialog.showOpenDialog(mainWindow, {
                      properties: [
                        'openFile', 'multiSelections'
                      ],
                      title: __('gateway.upload'),
                      defaultPath: defaultpath,
                      filters: [
                        { name: __('gateway.upload-window.archive-file-types'), extensions: ['zip'] },
                        { name: __('gateway.upload-window.all-file-types'), extensions: ['*'] }
                      ]
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
