import React, { useState, useEffect, useCallback, useMemo } from 'react';
import classNames from 'classnames';
import pick from 'lodash/pick';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import Paths from '../../constants/Paths';

import selectors from '../../selectors';
import store from '../../store';
import actions from '../../actions';
import ButtonOverride from '../ButtonOverride';
import { usePopup } from '../../lib/popup';
import entryActions from '../../entry-actions';

import ProjectSettingsModalContainer from '../../containers/ProjectSettingsModalContainer';

import AddStep from './AddStep';
import EditStep from './EditStep';
import ProjectStep from './ProjectStep';

import styles from './LeftMenu.module.scss';

const LeftMenu = React.memo(
  ({
    boards,
    currentBoardId,
    currentProject,
    projects,
    canEditProject,
    isSettingsModalOpened,
    currentUser,
    onProjectAdd,
    onProjectSettingsClick,
    onBoardAdd,
    onBoardUpdate,
    onBoardDelete,
    onBoardDuplicate,
    templateBoards,
    templateProjectId,
  }) => {
    const [projectsAndBoards, setProjectsAndBoards] = useState([]);

    const ProjectPopup = usePopup(ProjectStep);
    const AddPopup = usePopup(AddStep);
    const EditPopup = usePopup(EditStep);

    const projectIsEditable = useMemo(() => {
      return !currentProject?.siret && currentProject?.id !== templateProjectId;
    }, [currentProject, templateProjectId]);

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

    const handleBoardClick = useCallback((id) => {
      actions.handleLocationChange.fetchBoard(id);
    }, []);

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

    const handleProjectSelect = useCallback((project) => {
      window.location.href = `/projects/${project.id}`;
    }, []);

    useEffect(() => {
      // if (!currentProject) {
      //   const mainProject = projects.find((project) => project.siret === currentUser.siret);
      //   if (mainProject) {
      //     window.location.href = `/projects/${mainProject.id}`;
      //   }
      // }
      // if (boards.length > 0 && !currentBoardId) {
      //   window.location.href = `/boards/${boards[0].id}`;
      // }
    }, [boards, currentBoardId, projects, currentUser, currentProject]);

    return (
      <>
        <div className={styles.wrapper}>
          <div className={styles.space}>
            <ProjectPopup
              projects={projects}
              hideCloseButton
              onProjectSelect={handleProjectSelect}
              onProjectAdd={onProjectAdd}
              currentProjectId={currentProject?.id}
            >
              <button type="button" className={styles.selectProject}>
                <div className={styles.projectItemIcon}>
                  <span className="fr-icon-bank-line" aria-hidden="true" />
                </div>
                <span className={styles.projectName}>{currentProject?.name}</span>
                <span
                  className={classNames('fr-icon-arrow-down-s-line', styles.arrowDown)}
                  aria-hidden="true"
                />
              </button>
            </ProjectPopup>
            {currentProject && (
              <div className={styles.boards}>
                {boards.map((board) => (
                  <div className={styles.boardWrapper} key={board.id}>
                    <Link
                      to={Paths.BOARDS.replace(':id', board.id)}
                      title={board.name}
                      className={classNames(
                        styles.board,
                        board.id === currentBoardId && styles.boardActive,
                      )}
                    >
                      <div className={styles.boardIcon}>
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="#ffffff"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M9 3H4C3.44772 3 3 3.44772 3 4V11C3 11.5523 3.44772 12 4 12H9C9.55228 12 10 11.5523 10 11V4C10 3.44772 9.55228 3 9 3Z"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M20 3H15C14 3 14 3 14 6.6V19.0118C14 21 14 21 15 21H20C21 21 21 21 21 17.4V6.6C21 3 21 3 20 3Z"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>
                      <span>{board.name}</span>
                    </Link>
                    {canEditProject && (
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
                    )}
                  </div>
                ))}
                {canEditProject && (
                  <AddPopup
                    onCreate={onBoardAdd}
                    onCreateFromTemplate={(id) => onBoardDuplicate(id, currentProject.id)}
                    templateBoards={templateBoards}
                  >
                    <button type="button" className={styles.addBoard}>
                      <span className="fr-icon-add-line" aria-hidden="true" />
                      Ajouter un tableau
                    </button>
                  </AddPopup>
                )}
              </div>
            )}
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
          {canEditProject && projectIsEditable && (
            <div className={styles.bottomBar}>
              <button
                type="button"
                className={styles.editProject}
                aria-label="Modifier"
                onClick={handleProjectSettingsClick}
              >
                <span className="fr-icon-pencil-line" aria-hidden="true" />
                Paramètres
              </button>
            </div>
          )}
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
  onBoardDuplicate: PropTypes.func.isRequired,
  currentUser: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  /* eslint-disable react/forbid-prop-types */
  templateBoards: PropTypes.array.isRequired,
  templateProjectId: PropTypes.string.isRequired,
};

LeftMenu.defaultProps = {
  boards: [],
  currentBoardId: undefined,
  currentProject: undefined,
};

export default LeftMenu;
