/* eslint-disable react/no-multi-comp */
import React, { Component } from 'react';
import { Route } from 'react-router-dom';

const { shell } = require('electron');

const { __ } = require('i18n');

const { version } = require('../../../../package');

interface NavigationProps {
  tabs: Array
}

type ItemProps = {
  current?: boolean,
  usable?: boolean,
  name: string,
  onclick: (1) => void
};

let currentlyOpen;

exports.navitems = {};
exports.lookupNavItem = function(name) {
  return exports.navitems[name.toLowerCase()];
};

export default class Navigation extends Component<NavigationProps> {
  static handleClick(obj) {
    if (currentlyOpen !== undefined) {
      currentlyOpen.setState({
        current: false
      });
    }

    currentlyOpen = obj;
    obj.setState({
      current: true
    });
  }

  constructor(props) {
    super(props);
    this.active = undefined;

    global.ipfsStatusEvents.on('status-change', () => {
      const status = global.ipfsdStatus;

      const gatewayNavitem = exports.lookupNavItem('gateway');
      const nodeNavitem = exports.lookupNavItem('node');

      gatewayNavitem.setState({
        status
      });

      nodeNavitem.setState({
        status
      });
    });
  }

  render() {
    const {
      tabs
    } = this.props;

    return (
      <div className='k-nav'>
        <div className='k-menu'>
          {
            tabs.map((obj) => <NavigationItem {...obj} key={`${obj.name}`}
                                              onclick={(sub) => Navigation.handleClick(sub)}/>)
          }
          <br/>
          <div className='k-copyright'>{__('navigation.about-me.watermark', `${version}`)}</div>
        </div>
        <div className='button k-profile material slight-rounded'>
          <img src='res/image/placeholder-profile.png' className='no-select' alt='profile-pic'/>
          <h5><img src='res/image/currency.png' className='no-select' alt=''/> 0</h5>
        </div>
      </div>
    );
  }
}

export class NavigationItem extends Component<ItemProps> {
  constructor(props) {
    super(props);

    const {
      current,
      usable,
      name
    } = this.props;

    this.state = {
      current,
      usable,
      status: (usable ? 'waiting' : 'unavailable')
    };

    if (current) {
      currentlyOpen = this;
    }

    exports.navitems[name.toLowerCase()] = this;
  }

  render() {
    const {
      name,
      onclick
    } = this.props;

    const {
      usable,
      current,
      status
    } = this.state;

    const i18nname = __(`navigation.${name}.title`);
    const description = __(`navigation.${name}.description`);

    return (
      <Route render={({ history }) => (
        <div className={
          `button k-option material ${usable ? 'active' : 'inactive'} no-select ${current ? 'current' : ''}`
        } onClick={() => {
          if (!usable || currentlyOpen === this) {
            shell.beep();
            return;
          }

          onclick(this);
          history.push(name);
        }}>{i18nname}<br/><span>{description}</span>
          <div className={`k-status ${status}`}/>
        </div>
      )}/>
    );
  }
}

NavigationItem.defaultProps = {
  current: false,
  usable: false
};
