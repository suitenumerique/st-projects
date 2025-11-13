import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { Button } from '@openfun/cunningham-react';
import { Icon } from '@gouvfr-lasuite/ui-kit';
import usePopup from '../../lib/popup/use-popup';
// import { SurveyButton as FeedbackButton } from '../../ui/FeedbackButton/index.tsx';
import BoardListItemContainer from '../../containers/BoardListItemContainer';
import BoardCreateStep from '../../steps/BoardCreateStep';
import styles from './LeftMenu.module.scss';
import { push } from '../../lib/redux-router';
import Paths from '../../constants/Paths';
import store from '../../store';

const LeftMenu = React.memo(
  ({
    currentBoardId,
    privateBoards,
    sharedBoards,
    templateBoards,
    // reactAppFeedbackWidgetApiUrl,
    // reactAppFeedbackWidgetPath,
    // reactAppFeedbackWidgetChannel,
    onBoardAdd,
    onBoardDuplicate,
  }) => {
    const BoardCreateStepPopover = usePopup(BoardCreateStep);

    const goToBoard = useCallback((boardId) => {
      store.dispatch(push(Paths.BOARDS.replace(':id', boardId)));
    }, []);

    return (
      <div className={styles.wrapper}>
        <div className={styles.topBar}>
          <BoardCreateStepPopover
            onCreate={onBoardAdd}
            onCreateFromTemplate={onBoardDuplicate}
            templateBoards={templateBoards}
            hideCloseButton
          >
            <Button
              className={styles.addBoardButton}
              icon={<Icon name="add" type="outlined" />}
              size="medium"
            >
              Nouveau tableau
            </Button>
          </BoardCreateStepPopover>
        </div>
        <div className={styles.spaces}>
          <div className={styles.space}>
            <p className={styles.spaceTitle}>Mon espace</p>
            {privateBoards.length === 0 ? (
              <p className={styles.emptySpace}>Aucun tableau</p>
            ) : (
              <div className={styles.boards}>
                {privateBoards.map((board) => (
                  <BoardListItemContainer
                    key={board.id}
                    id={board.id}
                    showDescription={false}
                    editable
                    isActive={board.id === currentBoardId}
                    handleClick={() => goToBoard(board.id)}
                  />
                ))}
              </div>
            )}
          </div>
          <div className={styles.space}>
            <p className={styles.spaceTitle}>Espace partagé</p>
            {sharedBoards.length === 0 ? (
              <p className={styles.emptySpace}>Aucun tableau</p>
            ) : (
              <div className={styles.boards}>
                {sharedBoards.map((board) => (
                  <BoardListItemContainer
                    key={board.id}
                    id={board.id}
                    showDescription={false}
                    editable
                    isActive={board.id === currentBoardId}
                    handleClick={() => goToBoard(board.id)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
        {/* <div className={styles.bottomBar}>
          <FeedbackButton
            apiUrl={reactAppFeedbackWidgetApiUrl}
            widgetPath={reactAppFeedbackWidgetPath}
            channel={reactAppFeedbackWidgetChannel}
          />
        </div> */}
      </div>
    );
  },
);

LeftMenu.propTypes = {
  currentBoardId: PropTypes.string,
  privateBoards: PropTypes.array, // eslint-disable-line react/forbid-prop-types
  sharedBoards: PropTypes.array, // eslint-disable-line react/forbid-prop-types
  templateBoards: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  // reactAppFeedbackWidgetApiUrl: PropTypes.string.isRequired,
  // reactAppFeedbackWidgetPath: PropTypes.string.isRequired,
  // reactAppFeedbackWidgetChannel: PropTypes.string.isRequired,
  onBoardAdd: PropTypes.func.isRequired,
  onBoardDuplicate: PropTypes.func.isRequired,
};

LeftMenu.defaultProps = {
  privateBoards: [],
  sharedBoards: [],
  currentBoardId: undefined,
};

export default LeftMenu;
