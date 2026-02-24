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

export default connect(makeMapStateToProps, mapDispatchToProps)(Card);
