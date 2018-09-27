import React, { Component } from 'react';
const remote = require('electron').remote;

type Props = {};

export default class WindowControls extends Component<Props> {
  constructor(props) {
    super(props);
    this.window = remote.getCurrentWindow();
  }

  doWindowMaximize () {
    if (this.window.isMaximized()) {
      this.window.restore();
    } else {
      this.window.maximize();
    }
  }

  render() {
    return (
      <div className="k-toolbar no-select">
        <img src="res/image/konjure.png"/>
        <div className="k-toolbar-right">
          <div className="k-toolbar-button" id="min" onClick={() => this.window.minimize()}>
            <img src="res/image/window/minimize.png"/>
          </div>
          <div className="k-toolbar-button" id="max" onClick={() => this.doWindowMaximize()}>
            <img src="res/image/window/maximize.png"/>
          </div>
          <div className="k-toolbar-button" id="close" onClick={() => this.window.close()} >
            <img src="res/image/window/close.png"/>
          </div>
        </div>
      </div>
    );
  }
}
