/* eslint-disable no-underscore-dangle */
import React, {Component} from 'react';
import { remote } from 'electron';

// Images
import konjure from '../../../res/image/konjure.png';
import minimzie from '../../../res/image/window/minimize.png';
import maximize from '../../../res/image/window/maximize.png';
import close from '../../../res/image/window/close.png';

export default class WindowControls extends Component {
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
          <img src={konjure} alt=''/>
        </div>
        <div className='k-toolbar-right'>
          <div className='k-toolbar-button' id='min' onClick={() => this.window.minimize()}>
            <img src={minimzie} alt='minimize'/>
          </div>
          <div className='k-toolbar-button' id='max' onClick={() => this.doWindowMaximize()}>
            <img src={maximize} alt='maximize'/>
          </div>
          <div className='k-toolbar-button' id='close' onClick={() => this.window.close()} >
            <img src={close} alt='close'/>
          </div>
        </div>
      </div>
    );
  }
}
