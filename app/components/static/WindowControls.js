/* eslint-disable no-underscore-dangle */
import React, {Component} from 'react';

const { remote } = require('electron');

const {Menu, MenuItem} = remote;

const i18n = require('i18n');

const { render } = require('../../index');

const { configurei18n } = require('../../lang/locale');

const popupMenu = new Menu();
const languages = [];

function initLanguages () {
  i18n.getLocales().forEach(loc => {
    languages.push({
      label: i18n.__({phrase: 'language', locale: loc}),
      click () {
        configurei18n(loc);
        // eslint-disable-next-line global-require
        render(require('../../containers/Root'))
      }
    })
  });

  popupMenu.append(new MenuItem({
    label: 'Language', submenu: languages
  }));
}

type Props = {};

export default class WindowControls extends Component<Props> {
  static doMenu () {
    popupMenu.popup({
      window: remote.getCurrentWindow(),
      x: 15,
      y: 15
    });
  }

  constructor(props) {
    super(props);
    this.window = remote.getCurrentWindow();

    initLanguages();
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
        <div className='k-toolbar-left' onClick={WindowControls.doMenu}>
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
