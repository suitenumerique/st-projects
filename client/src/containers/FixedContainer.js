import { connect } from 'react-redux';

import selectors from '../selectors';
import Fixed from '../components/Fixed';

const mapStateToProps = (state) => {
  const currentBoard = selectors.selectCurrentBoard(state);
  const currentUser = selectors.selectCurrentUser(state);
  const currentUserMembership = selectors.selectCurrentUserMembershipForCurrentBoard(state);

  return {
    board: currentBoard,
    currentUser,
    currentUserMembership,
  };
};

export default connect(mapStateToProps)(Fixed);
