/* eslint-disable react/no-multi-comp */
import React, { Component } from 'react';
import { Route } from 'react-router-dom';
import { Trans, Interpolate } from 'react-i18next';
import { shell } from 'electron';
import { version } from '../../../../package';

// Images
import placeholderProfile from '../../../res/image/placeholder-profile.png';
import currency from '../../../res/image/currency.png';

interface NavigationProps {
  tabs: Array
}

type ItemProps = {
  current?: boolean,
  usable?: boolean,
  name: string,
  noStatus?: boolean,
  onclick: (1) => void
};

let currentlyOpen;

exports.navitems = {};
exports.lookupNavItem = (name) => exports.navitems[name.toLowerCase()];

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

      gatewayNavitem.status = { status };
      nodeNavitem.status = { status };
    });
  }

  componentDidMount() {
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
          <div className='k-copyright'>
            <Interpolate
              i18nKey='navigation.about-me.watermark'
              version={version}>
              Konjure Desktop App.
            </Interpolate>
          </div>
        </div>
        <div className='button k-profile material slight-rounded'>
          <img src={placeholderProfile} className='no-select' alt='profile-pic'/>
          <h5><img src={currency} className='no-select' alt=''/> 0</h5>
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

    return (
      <Route render={({ history }) => (
        <div className={
          `button k-option material ${usable ? 'active' : 'inactive'} no-select ${current ? 'current' : ''}`
        } onClick={() => {
          if (!usable || currentlyOpen === this) {
            shell.beep();
            return;
          }

          // Force stop any active alerts.
          global.alertEvents.emit('alert-stop');

          onclick(this);
          history.push(name);
        }}>
          <Trans i18nKey={`navigation.${name}.title`}>
            {name}
          </Trans>
          <br/>
          <span>
            <Trans i18nKey={`navigation.${name}.description`}>
              {name}
            </Trans>
          </span>
          <div className={(this.props.noStatus ? '' : `k-status ${status}`)}/>
        </div>
      )}/>
    );
  }
}

NavigationItem.defaultProps = {
  current: false,
  usable: false
};
