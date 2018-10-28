/* eslint-disable no-underscore-dangle */
import React, {Component} from 'react';

const { remote } = require('electron');

type Props = {};

export default class WindowControls extends Component<Props> {
  constructor(props) {
    super(props);
    this.window = remote.getCurrentWindow();

    this.doWindowMaximize = this.doWindowMaximize.bind(this);
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
      <div className='k-toolbar'>
        <div className='k-toolbar-left'>
          <img src='res/image/konjure.png' alt=''/>
        </div>
        <div className='k-toolbar-right'>
          <div className='k-toolbar-button' id='min' onClick={() => this.window.minimize()}>
            <img src='res/image/window/minimize.png' alt='minimize'/>
          </div>
          <div className='k-toolbar-button' id='max' onClick={() => this.doWindowMaximize()}>
            <img src='res/image/window/maximize.png' alt='maximize'/>
          </div>
          <div className='k-toolbar-button' id='close' onClick={() => this.window.close()} >
            <img src='res/image/window/close.png' alt='close'/>
          </div>
        </div>
      </div>
    );
  }
}
