// @flow
import React, {Component} from 'react';

type Props = {};

export default class Home extends Component<Props> {
  props: Props;

  render() {
    return (
      <div className="k-content gateway">
        <div className="k-gateway-frame">
          <div className="k-website"></div>
          <img src="res/image/ghost.svg" className="no-select"/>
        </div>
        <div className="k-gateway-toolbar">
          <label htmlFor="site-upload"
                 className="button k-gateway-button slight-rounded material no-select upload-button left">
            <div>Upload your website (.zip)</div>
          </label>
          <input id="site-upload" type="file"
                 accept="application/zip,application/x-zip,application/x-zip-compressed"/>
          <div className="button k-gateway-button material slight-rounded no-select publish-button right disabled">
            Publish
          </div>
          <div className="button k-gateway-button material slight-rounded no-select cancel-button right disabled">
            Cancel
          </div>
        </div>
      </div>
    );
  }
}
