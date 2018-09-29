import React, { Component } from 'react';
import ReactDOM from 'react-dom';

const remote = require('electron').remote;
const {Menu, MenuItem} = remote;

const i18n = require('i18n');
const {configurei18n} = require('../../lang/locale');

const popupMenu = new Menu();
const languages = [];

function initLanguages () {
  i18n.getLocales().map(loc => {
    languages.push({
      label: i18n.__({phrase: 'language', locale: loc}),
      click () {
        configurei18n(loc);
        ReactDOM.render(document.getElementById('root'));
      }
    })
  });

  popupMenu.append(new MenuItem({
    label: 'Language', submenu: languages
  }));
}

type Props = {};

export default class WindowControls extends Component<Props> {
  constructor(props) {
    super(props);
    this.window = remote.getCurrentWindow();

    initLanguages();
    this.doWindowMaximize = this.doWindowMaximize.bind(this);
    this.doMenu = this.doMenu.bind(this);
  }

  doWindowMaximize () {
    if (this.window.isMaximized()) {
      this.window.restore();
    } else {
      this.window.maximize();
    }
  }

  doMenu () {
    popupMenu.popup({
      window: remote.getCurrentWindow(),
      x: 15,
      y: 15
    });
  }

  render() {
    return (
      <div className="k-toolbar">
        <div className="k-toolbar-left" onClick={this.doMenu}>
          <img src="res/image/konjure.png"/>
        </div>
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
