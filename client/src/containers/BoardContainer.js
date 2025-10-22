import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import selectors from '../selectors';
import entryActions from '../entry-actions';
import { BoardMembershipRoles } from '../constants/Enums';
import Board from '../components/Board';
// import BoardNew from '../components/BoardNew';

const mapStateToProps = (state) => {
  const { cardId } = selectors.selectPath(state);
  const currentBoard = selectors.selectCurrentBoard(state);
  const lists = selectors.selectListsForCurrentBoard(state);
  const cardsWithDetails = selectors.selectCardsWithDetailsForCurrentBoard(state);
  const allBoards = selectors.selectBoardsForCurrentProject(state);
  const allBoardMemberships = selectors.selectMembershipsForCurrentBoard(state);
  const allBoardLabels = selectors.selectLabelsForCurrentBoard(state);

  const currentUserMembership = selectors.selectCurrentUserMembershipForCurrentBoard(state);
  const isCurrentUserEditor =
    !!currentUserMembership && currentUserMembership.role === BoardMembershipRoles.EDITOR;

  const isCurrentUserOwner =
    !!currentUserMembership && currentUserMembership.role === BoardMembershipRoles.OWNER;

  const currentUser = selectors.selectCurrentUser(state);

  return {
    currentBoard,
    currentUser,
    lists,
    cardsFullData: cardsWithDetails,
    allBoards,
    allBoardMemberships,
    allBoardLabels,
    isCardModalOpened: !!cardId,
    canEdit: isCurrentUserEditor || isCurrentUserOwner,
  };
};

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      onBoardFetch: entryActions.fetchBoard,
      onListCreate: entryActions.createListInCurrentBoard,
      onListUpdate: entryActions.updateList,
      onListMove: entryActions.moveList,
      onListSort: entryActions.sortList,
      onListDelete: entryActions.deleteList,
      onCardCreate: entryActions.createCard,
      onCardMove: entryActions.moveCard,
      onCardUpdate: entryActions.updateCard,
      onCardTransfer: entryActions.transferCard,
      onCardDuplicate: entryActions.duplicateCard,
      onCardDelete: entryActions.deleteCard,
      onCardUserAdd: entryActions.addUserToCard,
      onCardUserRemove: entryActions.removeUserFromCard,
      onCardLabelAdd: entryActions.addLabelToCard,
      onCardLabelRemove: entryActions.removeLabelFromCard,
      onCardLabelCreate: entryActions.createLabelInCurrentBoard,
      onCardLabelUpdate: entryActions.updateLabel,
      onCardLabelMove: entryActions.moveLabel,
      onCardLabelDelete: entryActions.deleteLabel,
    },
    dispatch,
  );

export default connect(mapStateToProps, mapDispatchToProps)(Board);
