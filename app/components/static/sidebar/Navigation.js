import React, {Component} from 'react';
import { Route } from 'react-router-dom'

const __ = require('i18n').__;

interface NavigationProps {
  tabs: Array
}

type ItemProps = {
  current?: boolean,
  usable?: boolean,
  name: string,
  onclick: (1) => void
}

let currentlyOpen = undefined;

export default class Navigation extends Component<NavigationProps> {
  constructor(props) {
    super(props);
    this.active = undefined;
  }

  handleClick(obj) {
    if (currentlyOpen !== undefined) {
      currentlyOpen.setState({
        current: false
      })
    }

    currentlyOpen = obj;
    obj.setState({
      current: true
    });
  }

  render() {
    return (
      <div className="k-nav">
        <div className="k-menu">
          {
            this.props.tabs.map((obj) => <NavigationItem {...obj} key={`${obj.name}`} onclick={(sub) => this.handleClick(sub)}/>)
          }
          <br/>
          <div className="k-copyright">{__('navigation.about-me.watermark', '0.1.0')}</div>
        </div>
        <div className="button k-profile material slight-rounded">
          <img src="res/image/placeholder-profile.png" className="no-select"/>
          <h5><img src="res/image/currency.png" className="no-select"/> 0</h5>
        </div>
      </div>
    );
  }
}

export class NavigationItem extends Component<ItemProps> {
  constructor(props) {
    super(props);

    const current = this.props.current || false;
    const usable = this.props.usable && true;

    this.state = {
      current: current,
      usable: usable,
      status: (usable ? 'waiting' : 'down')
    };

    if (current) {
      currentlyOpen = this;
    }
  }

  render() {
    const name = __(`navigation.${this.props.name}.title`);
    const description = __(`navigation.${this.props.name}.description`);
    const usable = this.state.usable;
    const current = this.state.current;
    const status = this.state.status;

    return (
      <Route render={({history}) => (
        <div className={
          `button k-option material ${usable ? 'active' : 'inactive'} no-select ${current ? 'current' : ''}`
        } onClick={() => {
          if (!this.state.usable || currentlyOpen === this) {
            return;
          }

          this.props.onclick(this);
          history.push(this.props.map)
        }}>{name}<br/><span>{description}</span>
        <div className={`k-status ${status}`}></div>
        </div>
      )} />
    );
  }
}

