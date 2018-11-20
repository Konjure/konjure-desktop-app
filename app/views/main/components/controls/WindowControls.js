/* eslint-disable no-underscore-dangle */
import React, {Component} from 'react';
import injectSheet from 'react-jss';
import { remote } from 'electron';

// Images
import konjure from '../../../../res/image/konjure.png';
import minimzie from '../../../../res/image/window/minimize.png';
import maximize from '../../../../res/image/window/maximize.png';
import close from '../../../../res/image/window/close.png';

// Styles
import styles from './style';

type Props = {
  classes: styles
};

const WindowControls = class extends Component<Props> {
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
    const { classes } = this.props;

    return (
      <div className={classes.toolbar}>
        <div className={classes.toolbarLeft}>
          <img src={konjure} alt=''/>
        </div>
        <div className={classes.toolbarRight}>
          <div className={classes.toolbarButton} id='min'
               onClick={() => this.window.minimize()}>
            <img src={minimzie} alt='minimize'/>
          </div>
          <div className={classes.toolbarButton} id='max'
               onClick={() => this.doWindowMaximize()}>
            <img src={maximize} alt='maximize'/>
          </div>
          <div className={`${classes.toolbarButton} ${classes.closeButton}`}
               id='close'
               onClick={() => this.window.close()}>
            <img src={close} alt='close'/>
          </div>
        </div>
      </div>
    );
  }
};

export default injectSheet(styles)(WindowControls);
