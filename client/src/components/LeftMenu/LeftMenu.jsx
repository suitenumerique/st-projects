import React, { useState, useEffect, useCallback } from 'react';
import classNames from 'classnames';
import pick from 'lodash/pick';
import PropTypes from 'prop-types';

import selectors from '../../selectors';
import store from '../../store';
import actions from '../../actions';
import ButtonOverride from '../ButtonOverride';
import { usePopup } from '../../lib/popup';
import entryActions from '../../entry-actions';

import ProjectSettingsModalContainer from '../../containers/ProjectSettingsModalContainer';

import AddStep from './AddStep';
import EditStep from './EditStep';

import styles from './LeftMenu.module.scss';

const LeftMenu = React.memo(
  ({
    boards,
    currentBoardId,
    currentProject,
    projects,
    canEditProject,
    isSettingsModalOpened,
    onProjectAdd,
    onProjectSettingsClick,
    onBoardAdd,
    onBoardUpdate,
    onBoardDelete,
  }) => {
    const [projectsAndBoards, setProjectsAndBoards] = useState([]);

    const AddPopup = usePopup(AddStep);
    const EditPopup = usePopup(EditStep);

    useEffect(() => {
      const state = store.getState();
      const data = (projects || []).map((proj) => ({
        ...proj,
        boards: selectors.selectBoardsForSpecificProject(state, proj.id),
      }));
      setProjectsAndBoards(data);
    }, [projects, currentProject]);

    // useEffect(() => {
    //   setProjectsAndBoards((prev) =>
    //     prev.map((p) => ({ ...p, isOpen: p.id === currentProject?.id ? true : p.isOpen })),
    //   );
    // }, [currentProject]);

    const handleProjectOpen = useCallback((id) => {
      const projectBoards = selectors.selectBoardsForSpecificProject(store.getState(), id);
      actions.handleLocationChange(projectBoards[0]);
    }, []);

    const handleProjectSettingsClick = useCallback(() => {
      if (canEditProject) {
        onProjectSettingsClick();
      }
    }, [canEditProject, onProjectSettingsClick]);

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

    useEffect(() => {
      if (!currentProject && projectsAndBoards.length > 0) {
        window.location.href = `/projects/${projectsAndBoards[0].id}`;
      }
    }, [currentProject, projectsAndBoards]);

    return (
      <>
        <div className={styles.wrapper}>
          {/* {projectsAndBoards.length === 0 ? (
            <div className={styles.topBar}>
              <ButtonOverride onClick={onProjectAdd} priority="primary">
                Nouveau projet
              </ButtonOverride>
            </div>
          ) : null} */}
          <div className={styles.space}>
            <p>Mes tableaux</p>
            {currentProject && (
              <div className={styles.currentProject}>
                <div className={styles.boards}>
                  {boards.map((board) => (
                    <div className={styles.boardWrapper} key={board.id}>
                      <a
                        href={`/boards/${board.id}`}
                        className={classNames(
                          styles.board,
                          board.id === currentBoardId && styles.boardActive,
                        )}
                        key={board.id}
                      >
                        {board.name === 'Mairie +' ? (
                          <span
                            style={{ backgroundColor: '#000091' }}
                            className={classNames(styles.boardIcon, 'fr-icon-calendar-event-fill')}
                            aria-hidden="true"
                          />
                        ) : (
                          <span
                            className={classNames(styles.boardIcon, 'fr-icon-bank-line')}
                            aria-hidden="true"
                          />
                        )}
                        {board.name}
                      </a>
                      <div className={styles.moreIconWrapper}>
                        <EditPopup
                          defaultData={pick(board, 'name')}
                          onUpdate={(data) => handleUpdate(board.id, data)}
                          onDelete={() => handleDelete(board.id)}
                        >
                          <button type="button" aria-label="Options">
                            <span className="fr-icon-pencil-line" aria-hidden="true" />
                          </button>
                        </EditPopup>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <AddPopup onCreate={onBoardAdd}>
              <button type="button" className={styles.addBoard}>
                <span className="fr-icon-add-line" aria-hidden="true" />
                Ajouter un tableau
              </button>
            </AddPopup>
            {/* <p className={styles.otherProjects}>
              {currentProject ? 'Mes autres communes' : 'Mes communes'}
            </p>
            {projectsAndBoards
              .filter((project) => project.id !== currentProject?.id)
              .map((project) => (
                <a href={`/projects/${project.id}`} key={project.id}>
                  <div>
                    <div className={styles.project} key={project.id}>
                      <button type="button" onClick={() => handleProjectOpen(project.id)}>
                        {project.name}
                      </button>
                      <div className={styles.moreIconWrapper}>
                        <button
                          type="button"
                          aria-label="Plus d'options"
                          onClick={handleProjectSettingsClick}
                        >
                          <span className="fr-icon-pencil-line" aria-hidden="true" />
                        </button>
                      </div>
                    </div>
                  </div>
                </a>
              ))} */}
          </div>
          <div className={styles.separator} />
          <div className={styles.space}>
            <p>Espace partagé</p>
            <div>
              <p className={styles.emptySpace}>Aucun tableau partagé</p>
            </div>
          </div>
        </div>
        {isSettingsModalOpened && <ProjectSettingsModalContainer />}
      </>
    );
  },
);

LeftMenu.propTypes = {
  boards: PropTypes.array, // eslint-disable-line react/forbid-prop-types
  currentBoardId: PropTypes.string,
  currentProject: PropTypes.object, // eslint-disable-line react/forbid-prop-types
  projects: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  canEditProject: PropTypes.bool.isRequired,
  isSettingsModalOpened: PropTypes.bool.isRequired,
  onProjectAdd: PropTypes.func.isRequired,
  onProjectSettingsClick: PropTypes.func.isRequired,
  onBoardAdd: PropTypes.func.isRequired,
  onBoardUpdate: PropTypes.func.isRequired,
  onBoardDelete: PropTypes.func.isRequired,
};

LeftMenu.defaultProps = {
  boards: [],
  currentBoardId: undefined,
  currentProject: undefined,
};

export default LeftMenu;
