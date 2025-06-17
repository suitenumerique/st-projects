import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { Popup } from '../../../lib/custom-ui';

import styles from './ProjectStepOverride.module.scss';

const ProjectStep = React.memo(
  ({ projects, onClose, onProjectSelect, onProjectAdd, currentProjectId }) => {
    return (
      <Popup.Content>
        <div className={styles.projectList}>
          {projects.map((project) => (
            <div
              className={classNames(
                styles.projectItem,
                project.id === currentProjectId && styles.projectItemActive,
              )}
              key={project.id}
              onClick={() => onProjectSelect(project)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  onProjectSelect(project);
                }
              }}
            >
              <div className={styles.projectItem}>
                <div className={styles.projectItemIcon}>
                  <span className="fr-icon-bank-line" aria-hidden="true" />
                </div>
                <span className={styles.projectName}>{project.name}</span>
              </div>
            </div>
          ))}
        </div>
        <div
          className={styles.addProject}
          onClick={() => {
            onProjectAdd();
            onClose();
          }}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              onProjectAdd();
            }
          }}
        >
          <div className={styles.addProjectIcon}>
            <span className="fr-icon-add-line" aria-hidden="true" />
          </div>
          <span>Ajouter un espace de travail</span>
        </div>
      </Popup.Content>
    );
  },
);

ProjectStep.propTypes = {
  projects: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
    }),
  ).isRequired,
  onClose: PropTypes.func.isRequired,
  onProjectSelect: PropTypes.func.isRequired,
  onProjectAdd: PropTypes.func.isRequired,
  currentProjectId: PropTypes.string.isRequired,
};

export default ProjectStep;
