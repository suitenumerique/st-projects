import React from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import { Popup } from '../../lib/custom-ui';
import { usePopup } from '../../lib/popup';

import BoardMembershipsStep from '../BoardMembershipsStep';
import LabelsStep from '../LabelsStep';

import styles from './FiltersStep.module.scss';

const FiltersStep = React.memo(
  ({
    allMemberships,
    allLabels,
    currentUserIds,
    currentLabelIds,
    onUserSelect,
    onUserDeselect,
    onLabelSelect,
    onLabelDeselect,
  }) => {
    const BoardMembershipsPopup = usePopup(BoardMembershipsStep);
    const LabelsPopup = usePopup(LabelsStep);

    return (
      <Popup.Content>
        <BoardMembershipsPopup
          items={allMemberships}
          currentUserIds={currentUserIds}
          title="common.filterByMembers"
          onUserSelect={onUserSelect}
          onUserDeselect={onUserDeselect}
        >
          <button
            type="button"
            className={classNames(styles.filterButton, styles.filterButtonMembers)}
          >
            <span className="fr-icon-user-line" aria-hidden="true" />
            <span className={styles.filterTitle}>Membres</span>
            {/* {users.map((user) => (
              <span key={user.id} className={styles.filterItem}>
                <User name={user.name} avatarUrl={user.avatarUrl} size="tiny" />
              </span>
            ))} */}
          </button>
        </BoardMembershipsPopup>
      </Popup.Content>
    );
  },
);

FiltersStep.propTypes = {
  onUserSelect: PropTypes.func.isRequired,
  onUserDeselect: PropTypes.func.isRequired,
  onLabelSelect: PropTypes.func.isRequired,
  onLabelDeselect: PropTypes.func.isRequired,
  /* eslint-disable react/forbid-prop-types */
  allMemberships: PropTypes.array.isRequired,
  allLabels: PropTypes.array.isRequired,
  currentUserIds: PropTypes.array.isRequired,
  currentLabelIds: PropTypes.array.isRequired,
  /* eslint-enable react/forbid-prop-types */
};

export default FiltersStep;
