import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import selectors from '../selectors';
import entryActions from '../entry-actions';
import { BoardMembershipRoles } from '../constants/Enums';
import List from '../components/Board/List';

const makeMapStateToProps = () => {
  const selectListById = selectors.makeSelectListById();
  const selectCardIdsByListId = selectors.makeSelectCardIdsByListId();

  return (state, { id }) => {
    const { name, color, isPersisted } = selectListById(state, id);
    const cardIds = selectCardIdsByListId(state, id);
    const currentUserMembership = selectors.selectCurrentUserMembershipForCurrentBoard(state);

    const isCurrentUserEditor =
      !!currentUserMembership && currentUserMembership.role === BoardMembershipRoles.EDITOR;

    return {
      name,
      color,
      isPersisted,
      cardIds,
      canEdit: isCurrentUserEditor,
    };
  };
};

const mapDispatchToProps = (dispatch, { id }) =>
  bindActionCreators(
    {
      onUpdate: (data) => entryActions.updateList(id, data),
      onSort: (data) => entryActions.sortList(id, data),
      onDelete: () => entryActions.deleteList(id),
      onCardCreate: (data, autoOpen) => entryActions.createCard(id, data, autoOpen),
    },
    dispatch,
  );

export default connect(makeMapStateToProps, mapDispatchToProps)(List);
