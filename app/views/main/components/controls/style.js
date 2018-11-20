import { konjColors } from '../../style/colors';

const styles = {
  toolbar: {
    height: '26px',
    width: '100%',
    position: 'relative',
    zIndex: Number.MAX_SAFE_INTEGER,
    backgroundColor: konjColors.darkestGray,
    '-webkit-app-region': 'drag',
    '& img': {
      height: '16px',
      marginTop: '5px',
      marginLeft: '5px'
    },
  },
  toolbarButton: {
    height: '100%',
    width: '26px',
    float: 'left',
    '-webkit-app-region': 'no-drag',
    '& img': {
      marginLeft: '5px',
      opacity: 0.5
    },
    '&:hover': {
      backgroundColor: konjColors.gray,
      cursor: 'pointer'
    }
  },
  toolbarLeft: {
    float: 'left',
    height: '100%',
    width: '60px',
    zIndex: 10,
    '-webkit-app-region': 'no-drag'
  },
  toolbarRight: {
    height: '100%',
    float: 'right'
  },
  closeButton: {
    '&:hover': {
      backgroundColor: konjColors.red
    }
  }
};

export default styles;
