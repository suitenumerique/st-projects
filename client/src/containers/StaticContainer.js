import { connect } from 'react-redux';

import selectors from '../selectors';
import Static from '../components/Static';

const mapStateToProps = (state) => {
  const { cardId, projectId } = selectors.selectPath(state);
  const currentBoard = selectors.selectCurrentBoard(state);
  const currentUserMembership = selectors.selectCurrentUserMembershipForCurrentBoard(state);

  return {
    projectId,
    cardId,
    currentBoard,
    currentUserMembership,
  };
};

export default connect(mapStateToProps)(Static);
