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
    const currentUserMembership = selectCurrentUserMembershipForBoard(state, id);
    const isCurrentUserEditor =
      !!currentUserMembership && currentUserMembership.role === BoardMembershipRoles.EDITOR;

    return {
      id,
      board,
      canEdit: isCurrentUserEditor,
    };
  };
};

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      onBoardUpdate: entryActions.updateBoard,
      onBoardDelete: entryActions.deleteBoard,
    },
    dispatch,
  );

export default connect(makeMapStateToProps, mapDispatchToProps)(BoardListItem);
