import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import selectors from '../selectors';
import entryActions from '../entry-actions';
import { BoardMembershipRoles } from '../constants/Enums';
import BoardActions from '../components/BoardActions';

const mapStateToProps = (state) => {
  const currentBoard = selectors.selectCurrentBoard(state);
  const currentBoardId = currentBoard ? currentBoard.id : null;
  const currentBoardName = currentBoard ? currentBoard.name : null;
  const filterText = selectors.selectFilterTextForCurrentBoard(state);
  const boardLabels = selectors.selectLabelsForCurrentBoard(state);
  const filterLabels = selectors.selectFilterLabelsForCurrentBoard(state);
  const allUsers = selectors.selectUsers(state);
  const filterUsers = selectors.selectFilterUsersForCurrentBoard(state);
  const boardMemberships = selectors.selectMembershipsForCurrentBoard(state);

  const currentUserMembership = selectors.selectCurrentUserMembershipForCurrentBoard(state);
  const isCurrentUserMember = !!currentUserMembership;
  const isCurrentUserEditor =
    !!currentUserMembership && currentUserMembership.role === BoardMembershipRoles.EDITOR;
  const isCurrentUserOwner =
    !!currentUserMembership && currentUserMembership.role === BoardMembershipRoles.OWNER;

  return {
    currentBoardId,
    currentBoardName,
    filterText,
    allUsers,
    filterUsers,
    boardLabels,
    filterLabels,
    boardMemberships,
    canEdit: isCurrentUserEditor || isCurrentUserOwner,
    isCurrentUserMember,
    isBoardPublic: currentBoard ? currentBoard.isPublic : false,
  };
};

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      onTextFilterUpdate: entryActions.filterText,
      onUserToFilterAdd: entryActions.addUserToFilterInCurrentBoard,
      onUserFromFilterRemove: entryActions.removeUserFromFilterInCurrentBoard,
      onLabelToFilterAdd: entryActions.addLabelToFilterInCurrentBoard,
      onLabelFromFilterRemove: entryActions.removeLabelFromFilterInCurrentBoard,
      onLabelCreate: entryActions.createLabelInCurrentBoard,
      onLabelUpdate: entryActions.updateLabel,
      onLabelMove: entryActions.moveLabel,
      onLabelDelete: entryActions.deleteLabel,
      onMembershipCreate: entryActions.createMembershipInCurrentBoard,
      onMembershipUpdate: entryActions.updateBoardMembership,
      onMembershipDelete: entryActions.deleteBoardMembership,
      onBoardUpdate: entryActions.updateBoard,
    },
    dispatch,
  );

export default connect(mapStateToProps, mapDispatchToProps)(BoardActions);
