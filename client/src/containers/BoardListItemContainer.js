import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import selectors from '../selectors';
import entryActions from '../entry-actions';
import { BoardMembershipRoles } from '../constants/Enums';
import BoardListItem from '../components/BoardListItem/BoardListItem';

const makeMapStateToProps = () => {
  const selectBoardById = selectors.makeSelectBoardById();
  const selectCurrentUserMembershipForBoard =
    selectors.makeSelectCurrentUserMembershipForBoardById();

  return (state, { id }) => {
    const board = selectBoardById(state, id);
    const project = selectors.selectProjectById(state, board.projectId);
    const currentUser = selectors.selectCurrentUser(state);
    const currentUserMembership = selectCurrentUserMembershipForBoard(state, id);
    const isCurrentUserEditor =
      !!currentUserMembership && currentUserMembership.role === BoardMembershipRoles.EDITOR;
    const isCurrentUserOwner =
      !!currentUserMembership && currentUserMembership.role === BoardMembershipRoles.OWNER;

    return {
      id,
      board,
      project,
      currentUser,
      canEdit: isCurrentUserEditor || isCurrentUserOwner,
    };
  };
};

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      onBoardUpdate: entryActions.updateBoard,
      onBoardDelete: entryActions.deleteBoard,
      onBoardDuplicate: entryActions.duplicateBoard,
    },
    dispatch,
  );

export default connect(makeMapStateToProps, mapDispatchToProps)(BoardListItem);
