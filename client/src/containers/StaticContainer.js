import { connect } from 'react-redux';

import selectors from '../selectors';
import Static from '../components/Static';

const mapStateToProps = (state) => {
  const { cardId, projectId } = selectors.selectPath(state);
  const currentBoard = selectors.selectCurrentBoard(state);

  console.log(cardId, projectId, currentBoard);

  return {
    projectId,
    cardId,
    currentBoard,
  };
};

export default connect(mapStateToProps)(Static);
