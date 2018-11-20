/* eslint-disable react/no-multi-comp */
import React, { Component } from 'react';
import injectSheet from 'react-jss';
import { Route } from 'react-router-dom';
import { Trans, Interpolate } from 'react-i18next';
import { shell } from 'electron';
import { version } from '../../../../../package';

// Images
import placeholderProfile from '../../../../res/image/placeholder-profile.png';
import currency from '../../../../res/image/currency.png';

// Styles
import styles from './style';

type NavigationProps = {
  tabs: array,
  classes: styles
};

type ItemProps = {
  current?: boolean,
  usable?: boolean,
  noStatus?: boolean,
  name: string,
  onclick: (1) => void,
  classes: styles
};

let currentlyOpen;

exports.navitems = {};
exports.lookupNavItem = (name) => exports.navitems[name.toLowerCase()];

const navigation = class extends Component<NavigationProps> {
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
      tabs,
      classes
    } = this.props;

    return (
      <div className={classes.nav}>
        <div className={classes.menu}>
          {
            tabs.map((obj) => <NavigationItem {...obj} key={`${obj.name}`}
                                              onclick={(sub) => Navigation.handleClick(sub)}/>)
          }
          <br/>
          <div className={classes.copyright}>
            <Interpolate
              i18nKey='navigation.about-me.watermark'
              version={version}>
              Konjure Desktop App.
            </Interpolate>
          </div>
        </div>
        <div className={`button ${classes.profile} material slight-rounded`}>
          <img src={placeholderProfile} className='no-select' alt='profile-pic'/>
          <h5><img src={currency} className='no-select' alt=''/> 0</h5>
        </div>
      </div>
    );
  }
};

const Navigation = injectSheet(styles)(navigation);
export default Navigation;

const navigationItem = class extends Component<ItemProps> {
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
      noStatus,
      onclick,
      classes
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
          <div className={(noStatus ? '' : `k-status ${status}`)}/>
        </div>
      )}/>
    );
  }
};

navigationItem.defaultProps = {
  current: false,
  usable: false,
  noStatus: false
};

const NavigationItem = injectSheet(styles)(navigationItem);

