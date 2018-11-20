import { konjColors } from '../../style/colors';

const styles = {
  nav: {
    height: '100%',
    width: '200px',
    position: 'relative',
    float: 'left',
    overflow: 'hidden',
    'box-shadow': '0 0 15px 0 rgba(0, 0, 0, 0.5);'
  },
  menu: {
    position: 'relative',
    zIndex: 1
  },
  copyright: {
    fontSize: '11px',
    color: konjColors.lightGray,
    textAlign: 'center'
  },
  profile: {
    height: '40px',
    width: '180px',
    backgroundColor: konjColors.gray,
    position: 'absolute',
    bottom: '38px',
    left: '10px',
    padding: 0,
    '&:hover': {
      backgroundColor: '#373737',
      cursor: 'pointer'
    },
    '& > img': {
      height: '40px',
      width: '40px',
      float: 'left',
      borderRight: `2px solid ${konjColors.darkGray};`
    },
    '& h5': {
      float: 'right',
      color: konjColors.konjureGreen,
      paddingTop: '11px',
      paddingRight: '10px'
    },
    '& h5 img': {
      height: '15px',
      width: '15px',
      float: 'left',
      marginTop: '2px',
      marginRight: '3px'
    }
  }
};

export default styles;
