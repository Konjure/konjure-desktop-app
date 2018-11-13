// @flow
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Gateway from "../components/Gateway";
import * as GatewayActions from '../actions/gateway/gateway';

function mapStateToProps(state) {
  const { gateway } = state;

  return {
    site: gateway.site
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(GatewayActions, dispatch);
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Gateway);
