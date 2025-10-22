import React, { useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { Button } from '@openfun/cunningham-react'; // eslint-disable-next-line import/no-extraneous-dependencies
import Paths from '../../constants/Paths';
import BoardListItem from '../BoardListItem/BoardListItem';
import { push } from '../../lib/redux-router';
import usePopup from '../../lib/popup/use-popup';

import store from '../../store';

import BoardCreateStep from '../../steps/BoardCreateStep';

import styles from './LeftMenu.module.scss';
import { SurveyButton as FeedbackButton } from '../../ui/FeedbackButton/index.tsx';

const LeftMenu = React.memo(
  ({
    privateBoards,
    sharedBoards,
    currentBoardId,
    currentProject,
    projects,
    currentUser,
    onBoardAdd,
    onBoardUpdate,
    onBoardDelete,
    onBoardDuplicate,
    templateBoards,
    reactAppFeedbackWidgetApiUrl,
    reactAppFeedbackWidgetPath,
    reactAppFeedbackWidgetChannel,
  }) => {
    const BoardCreateStepPopover = usePopup(BoardCreateStep);

    const handleUpdate = useCallback(
      (id, data) => {
        onBoardUpdate(id, data);
      },
      [onBoardUpdate],
    );

    const handleDelete = useCallback(
      (id) => {
        onBoardDelete(id);
      },
      [onBoardDelete],
    );

    const goToBoard = useCallback((boardId) => {
      store.dispatch(push(Paths.BOARDS.replace(':id', boardId)));
    }, []);

    useEffect(() => {
      if (!currentProject) {
        const mainProject = projects.find((project) => project.siret === currentUser.siret);
        if (mainProject) {
          window.location.href = `/projects/${mainProject.id}`;
        }
      }
    }, [currentBoardId, projects, currentUser, currentProject]);

    return (
      <div className={styles.wrapper}>
        <div className={styles.topBar}>
          <BoardCreateStepPopover
            onCreate={onBoardAdd}
            onCreateFromTemplate={(id) => onBoardDuplicate(id)}
            templateBoards={templateBoards}
            hideCloseButton
          >
            <Button icon={<span className="material-icons">add</span>} size="medium">
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
                  <BoardListItem
                    key={board.id}
                    board={board}
                    handleClick={() => goToBoard(board.id)}
                    showDescription={false}
                    editable
                    projectName={
                      board.project && board.project.siret !== currentUser.siret
                        ? board.project.name
                        : undefined
                    }
                    isActive={board.id === currentBoardId}
                    onUpdate={(data) => handleUpdate(board.id, data)}
                    onDelete={() => handleDelete(board.id)}
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
                  <BoardListItem
                    key={board.id}
                    board={board}
                    handleClick={() => goToBoard(board.id)}
                    showDescription={false}
                    editable
                    projectName={
                      board.project && board.project.siret !== currentUser.siret
                        ? board.project.name
                        : undefined
                    }
                    isActive={board.id === currentBoardId}
                    onUpdate={(data) => handleUpdate(board.id, data)}
                    onDelete={() => handleDelete(board.id)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
        <div className={styles.bottomBar}>
          <FeedbackButton
            apiUrl={reactAppFeedbackWidgetApiUrl}
            widgetPath={reactAppFeedbackWidgetPath}
            channel={reactAppFeedbackWidgetChannel}
          />
        </div>
      </div>
    );
  },
);

LeftMenu.propTypes = {
  privateBoards: PropTypes.array, // eslint-disable-line react/forbid-prop-types
  sharedBoards: PropTypes.array, // eslint-disable-line react/forbid-prop-types
  currentBoardId: PropTypes.string,
  currentProject: PropTypes.object, // eslint-disable-line react/forbid-prop-types
  projects: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  onBoardAdd: PropTypes.func.isRequired,
  onBoardUpdate: PropTypes.func.isRequired,
  onBoardDelete: PropTypes.func.isRequired,
  onBoardDuplicate: PropTypes.func.isRequired,
  currentUser: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  /* eslint-disable react/forbid-prop-types */
  templateBoards: PropTypes.array.isRequired,
  reactAppFeedbackWidgetApiUrl: PropTypes.string.isRequired,
  reactAppFeedbackWidgetPath: PropTypes.string.isRequired,
  reactAppFeedbackWidgetChannel: PropTypes.string.isRequired,
};

LeftMenu.defaultProps = {
  privateBoards: [],
  sharedBoards: [],
  currentBoardId: undefined,
  currentProject: undefined,
};

export default LeftMenu;
