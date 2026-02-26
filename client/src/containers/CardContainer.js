import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import selectors from '../selectors';
import entryActions from '../entry-actions';
import { BoardMembershipRoles } from '../constants/Enums';
import Card from '../components/Board/Card';

const makeMapStateToProps = () => {
  const selectCardById = selectors.makeSelectCardById();
  const selectUsersByCardId = selectors.makeSelectUsersByCardId();
  const selectLabelsByCardId = selectors.makeSelectLabelsByCardId();
  const selectTasksByCardId = selectors.makeSelectTasksByCardId();
  const selectAttachmentsTotalByCardId = selectors.makeSelectAttachmentsTotalByCardId();
  const selectNotificationsTotalByCardId = selectors.makeSelectNotificationsTotalByCardId();

  return (state, { id }) => {
    const { projectId } = selectors.selectPath(state);
    const currentUser = selectors.selectCurrentUser(state);
    const editableBoards = selectors.selectEditableBoardsForCurrentUser(state);
    const allBoardMemberships = selectors.selectMembershipsForCurrentBoard(state);
    const allLabels = selectors.selectLabelsForCurrentBoard(state);
    const currentUserMembership = selectors.selectCurrentUserMembershipForCurrentBoard(state);

    const {
      name,
      description,
      dueDate,
      isDueDateCompleted,
      stopwatch,
      isCompleted,
      coverUrl,
      boardId,
      listId,
      isPersisted,
    } = selectCardById(state, id);

    const users = selectUsersByCardId(state, id);
    const labels = selectLabelsByCardId(state, id);
    const tasks = selectTasksByCardId(state, id);
    const attachmentsTotal = selectAttachmentsTotalByCardId(state, id);
    const notificationsTotal = selectNotificationsTotalByCardId(state, id);

    const isCurrentUserEditor =
      !!currentUserMembership && currentUserMembership.role === BoardMembershipRoles.EDITOR;

    return {
      name,
      description,
      dueDate,
      isDueDateCompleted,
      stopwatch,
      isCompleted,
      coverUrl,
      boardId,
      listId,
      projectId,
      isPersisted,
      attachmentsTotal,
      notificationsTotal,
      users,
      labels,
      tasks,
      editableBoards,
      allBoardMemberships,
      allLabels,
      currentUser,
      canEdit: isCurrentUserEditor,
    };
  };
};

const mapDispatchToProps = (dispatch, { id }) =>
  bindActionCreators(
    {
      onUpdate: (data) => entryActions.updateCard(id, data),
      onMove: (listId, index) => entryActions.moveCard(id, listId, index),
      onTransfer: (boardId, listId) => entryActions.transferCard(id, boardId, listId),
      onDuplicate: () => entryActions.duplicateCard(id),
      onDelete: () => entryActions.deleteCard(id),
      onUserAdd: (userId) => entryActions.addUserToCard(userId, id),
      onUserRemove: (userId) => entryActions.removeUserFromCard(userId, id),
      onBoardFetch: entryActions.fetchBoard,
      onLabelAdd: (labelId) => entryActions.addLabelToCard(labelId, id),
      onLabelRemove: (labelId) => entryActions.removeLabelFromCard(labelId, id),
      onLabelCreate: entryActions.createLabelInCurrentBoard,
      onLabelUpdate: entryActions.updateLabel,
      onLabelMove: entryActions.moveLabel,
      onLabelDelete: entryActions.deleteLabel,
    },
    dispatch,
  );

// helper to check if any row referenced by a foreign key index changed for a given foreign key value
function associatedEntityIndexChanged(nTable, pTable, indexField, fkValue) {
  const nIds = nTable.indexes?.[indexField]?.[fkValue];
  const pIds = pTable.indexes?.[indexField]?.[fkValue];

  if (nIds !== pIds) {
    return true; // rows added or removed
  }

  if (!nIds) {
    return false; // no rows for this foreign key value
  }

  return nIds.some((rowId) => nTable.itemsById[rowId] !== pTable.itemsById[rowId]);
}

// helper to check if any entity row (User or Label...) referenced through a many-to-many junction changed for this card
function associatedEntityIndexChangedAmongManyToMany(nJunction, nEntity, pEntity, cardId, toField) {
  const junctionIds = nJunction.indexes?.fromCardId?.[cardId];

  if (!junctionIds) {
    return false;
  }

  return junctionIds.some((jId) => {
    const entityId = nJunction.itemsById[jId]?.[toField];

    return entityId && nEntity.itemsById[entityId] !== pEntity.itemsById[entityId];
  });
}

// when having a lot of cards the comparaison below saving ressources by skipping `makeMapStateToProps`,
// it's useful when an index has changed due to a drag&drop (since moreover moving a card may affect multiple others position)
function areStatesEqual(next, prev, nextOwnProps) {
  const n = next.orm;
  const p = prev.orm;

  // ORM unchanged (e.g. router-only change)
  if (n === p) {
    return true;
  }

  const cardId = nextOwnProps.id;

  // current card's own row changed (name, description, dueDate, stopwatch...)
  if (n.Card.itemsById[cardId] !== p.Card.itemsById[cardId]) {
    return false;
  }

  // then below check any entities that could be linked to this card and that is potentially
  // displayed in the card (excluding card modal), meaning a change inside may modify the card rendering
  if (
    n.CardUsers !== p.CardUsers &&
    associatedEntityIndexChanged(n.CardUsers, p.CardUsers, 'fromCardId', cardId)
  ) {
    return false;
  }

  if (
    n.CardLabels !== p.CardLabels &&
    associatedEntityIndexChanged(n.CardLabels, p.CardLabels, 'fromCardId', cardId)
  ) {
    return false;
  }

  if (
    n.User !== p.User &&
    associatedEntityIndexChangedAmongManyToMany(n.CardUsers, n.User, p.User, cardId, 'toUserId')
  ) {
    return false;
  }

  if (
    n.Label !== p.Label &&
    associatedEntityIndexChangedAmongManyToMany(n.CardLabels, n.Label, p.Label, cardId, 'toLabelId')
  ) {
    return false;
  }

  if (n.Task !== p.Task && associatedEntityIndexChanged(n.Task, p.Task, 'cardId', cardId)) {
    return false;
  }

  if (
    n.Attachment !== p.Attachment &&
    associatedEntityIndexChanged(n.Attachment, p.Attachment, 'cardId', cardId)
  ) {
    return false;
  }

  if (
    n.Notification !== p.Notification &&
    associatedEntityIndexChanged(n.Notification, p.Notification, 'cardId', cardId)
  ) {
    return false;
  }

  return true;
}

export default connect(makeMapStateToProps, mapDispatchToProps, null, { areStatesEqual })(Card);
