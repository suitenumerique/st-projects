import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import selectors from '../selectors';
import entryActions from '../entry-actions';
import { BoardMembershipRoles } from '../constants/Enums';
import Board from '../components/Board';

const mapStateToProps = (state) => {
  const { cardId } = selectors.selectPath(state);
  const currentUser = selectors.selectCurrentUser(state);

  const lists = selectors.selectListsForCurrentBoard(state);
  const cardsWithDetails = selectors.selectCardsWithDetailsForCurrentBoard(state);
  const editableBoards = selectors.selectEditableBoardsForCurrentUser(state);
  const allBoardMemberships = selectors.selectMembershipsForCurrentBoard(state);
  const allBoardLabels = selectors.selectLabelsForCurrentBoard(state);

  const currentUserMembership = selectors.selectCurrentUserMembershipForCurrentBoard(state);
  const isCurrentUserEditor =
    !!currentUserMembership && currentUserMembership.role === BoardMembershipRoles.EDITOR;

  return {
    currentUser,
    lists,
    cards: cardsWithDetails,
    editableBoards,
    allBoardMemberships,
    allBoardLabels,
    isCardModalOpened: !!cardId,
    canEdit: isCurrentUserEditor,
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
