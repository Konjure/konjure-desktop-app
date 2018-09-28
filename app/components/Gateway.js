// @flow
import React, {Component} from 'react';

const {ipcRenderer, ipcMain, remote} = require('electron');
const dialog = remote.dialog;
const fs = require('fs');
const os = require('os');
const path = require('path');

const __ = require('i18n').__;

const mainWindow = remote.getCurrentWindow();

type Props = {};

export default class Gateway extends Component<Props> {
  constructor(props) {
    super(props);
    this.state = {
      preppedForUpload: null
    };

    this.handleUpload = this.handleUpload.bind(this);
    this.publishPayload = this.publishPayload.bind(this);
    this.cancelPayload = this.cancelPayload.bind(this);
  }

  handleUpload(...files) {
    if (files[0] === undefined) {
      return;
    }

    this.setState({
      preppedForUpload: files
    });
  }

  publishPayload() {
    if (this.state.preppedForUpload == null) {
      return;
    }

    console.log(`Would publish ${this.state.preppedForUpload}`);
  }

  cancelPayload() {
    this.setState({
      preppedForUpload: null
    });
  }

  render() {
    return (
      <div className="k-content gateway" onDrop={event => {
        event.preventDefault();

        let files = [];
        for (let f of event.dataTransfer.files) {
          files.push(f.path);
        }

        this.handleUpload(files);
        return false;
      }}>
        <div className="k-gateway-frame">
          <div className="k-website"></div>
          <img src="res/image/ghost.svg" className="no-select"/>
        </div>
        <div className="k-gateway-toolbar">
          <button className="button k-gateway-button slight-rounded material no-select upload-button left"
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
              this.handleUpload(fileNames);
            });
          }}>
            <div>{__('gateway.upload')}</div>
          </button>
          <div className={`button k-gateway-button material slight-rounded
          no-select publish-button right ${
            (this.state.preppedForUpload != null && this.state.preppedForUpload.length > 0 ? '' : 'disabled')
          }`}
          onClick={this.publishPayload}>
            {__('gateway.publish')}
          </div>
          <div className={`button k-gateway-button material slight-rounded no-select
          cancel-button right ${
            (this.state.preppedForUpload != null && this.state.preppedForUpload.length > 0 ? '' : 'disabled')
          }`}
          onClick={this.cancelPayload}>
            {__('gateway.cancel')}
          </div>
        </div>
      </div>
    );
  }
}
