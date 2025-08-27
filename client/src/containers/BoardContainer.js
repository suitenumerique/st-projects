import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import selectors from '../selectors';
import entryActions from '../entry-actions';
import { BoardMembershipRoles } from '../constants/Enums';
import Board from '../components/Board';

const mapStateToProps = (state) => {
  const { cardId } = selectors.selectPath(state);
  const currentUserMembership = selectors.selectCurrentUserMembershipForCurrentBoard(state);
  const listIds = selectors.selectListIdsForCurrentBoard(state);
  const currentBoard = selectors.selectCurrentBoard(state);
  const isCurrentUserEditor =
    !!currentUserMembership && currentUserMembership.role === BoardMembershipRoles.EDITOR;

  const isCurrentUserOwner =
    !!currentUserMembership && currentUserMembership.role === BoardMembershipRoles.OWNER;

  return {
    currentBoard,
    listIds,
    isCardModalOpened: !!cardId,
    canEdit: isCurrentUserEditor || isCurrentUserOwner,
  };
};

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      onListCreate: entryActions.createListInCurrentBoard,
      onListMove: entryActions.moveList,
      onCardMove: entryActions.moveCard,
    },
    dispatch,
  );

export default connect(mapStateToProps, mapDispatchToProps)(Board);
