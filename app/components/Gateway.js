/* eslint-disable no-underscore-dangle */
// @flow
import React, {Component} from 'react';

const {remote} = require('electron');

const { dialog } = remote;

const fs = require('fs');
const os = require('os');

const { __ } = require('i18n');

const mainWindow = remote.getCurrentWindow();

type Props = {};

export default class Gateway extends Component<Props> {
  constructor(props) {
    super(props);
    this.state = {
      preppedForUpload: null
    };

    this.prepareUpload = this.prepareUpload.bind(this);
    this.publishPayload = this.publishPayload.bind(this);
    this.cancelPayload = this.cancelPayload.bind(this);
  }

  prepareUpload(...files) {
    if (files[0] === undefined) {
      return;
    }

    this.setState({
      preppedForUpload: files
    });
  }

  publishPayload() {
    const {
      preppedForUpload
    } = this.state;
    if (preppedForUpload == null) {
      return;
    }

    global.ipfsController.saveToIPFS(fs.readFileSync(`${preppedForUpload[0]}`));
    this.cancelPayload();
  }

  cancelPayload() {
    this.setState({
      preppedForUpload: null
    });
  }

  render() {
    const {
      preppedForUpload
    } = this.state;
    return (
      <div className="k-content gateway" onDrop={event => {
        event.preventDefault();

        const files = [];
        for (let i = 0; i < event.dataTransfer.files.length; ++i) {
          const f = event.dataTransfer.files[i];
          files.push(f.path);
        }

        this.prepareUpload(files);
        return false;
      }}>
        <div className="k-gateway-frame">
          <div className="k-website" />
          <img src="res/image/ghost.svg" className="no-select" alt=''/>
        </div>
        <div className="k-gateway-toolbar">
          <button type='button' className="button k-gateway-button slight-rounded material no-select upload-button left"
          onClick={() => {
            dialog.showOpenDialog(mainWindow, {
              properties: [
                'openFile', 'multiSelections'
              ],
              title: __('gateway.upload'),
              defaultPath: os.homedir(),
              filters: [
                {name: __('gateway.upload-window.archive-file-types'), extensions: ['7z', 'tar', 'tar.gz', 'tgz', 'zip']},
                {name: __('gateway.upload-window.all-file-types'), extensions: ['*']}
              ]
            }, (fileNames) => {
              this.prepareUpload(fileNames);
            });
          }}>
            <div>{__('gateway.upload')}</div>
          </button>
          <div className={`button k-gateway-button material slight-rounded
          no-select publish-button right ${
            (preppedForUpload != null && preppedForUpload.length > 0 ? '' : 'disabled')
          }`}
          onClick={this.publishPayload}>
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
