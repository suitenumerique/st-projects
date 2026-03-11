import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import selectors from '../selectors';
import entryActions from '../entry-actions';
import { BoardMembershipRoles } from '../constants/Enums';
import Board from '../components/Board';

const mapStateToProps = (state) => {
  const { cardId, boardId } = selectors.selectPath(state);
  const currentUserMembership = selectors.selectCurrentUserMembershipForCurrentBoard(state);
  const listIds = selectors.selectListIdsForCurrentBoard(state);

  const isCurrentUserEditor =
    !!currentUserMembership &&
    (currentUserMembership.role === BoardMembershipRoles.EDITOR ||
      currentUserMembership.role === BoardMembershipRoles.OWNER);

  return {
    boardId,
    listIds,
    isCardModalOpened: !!cardId,
    canEdit: isCurrentUserEditor,
  };
};

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      onListCreate: entryActions.createListInCurrentBoard,
      onListMove: entryActions.moveList,
      onCardMove: entryActions.moveCard,
      onCardTransfer: entryActions.transferCard,
    },
    dispatch,
  );

export default connect(mapStateToProps, mapDispatchToProps)(Board);
