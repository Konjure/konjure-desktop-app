import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Node from '../components/Node';
import * as NodeActions from '../actions/node/node';

function mapStateToProps(state) {
  return {
    cpu: state.cpu,
    memory: state.memory
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(NodeActions, dispatch);
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Node);
