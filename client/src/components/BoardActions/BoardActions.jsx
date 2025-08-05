import React, { useCallback } from 'react';
import PropTypes from 'prop-types';

import Filters from './Filters';
import Memberships from '../Memberships';
import BoardMembershipPermissionsSelectStep from '../BoardMembershipPermissionsSelectStep';
import BoardVisibilityToggle from './BoardVisibilityToggle';

import styles from './BoardActionsOverride.module.scss';

const BoardActions = React.memo(
  ({
    memberships,
    labels,
    filterUsers,
    filterLabels,
    filterText,
    allUsers,
    canEdit,
    canEditMemberships,
    isPublic,
    onMembershipCreate,
    onMembershipUpdate,
    onMembershipDelete,
    onUserToFilterAdd,
    onUserFromFilterRemove,
    onLabelToFilterAdd,
    onLabelFromFilterRemove,
    onLabelCreate,
    onLabelUpdate,
    onLabelMove,
    onLabelDelete,
    onTextFilterUpdate,
    onBoardUpdate,
    currentUser,
    currentBoardId,
  }) => {
    const handleUpdate = useCallback(
      (id, data) => {
        onBoardUpdate(id, data);
      },
      [onBoardUpdate],
    );

    return (
      <div className={styles.wrapper}>
        <div className={styles.actions}>
          <div className={styles.action}>
            {currentUser && (
              <Memberships
                items={memberships}
                allUsers={allUsers}
                permissionsSelectStep={BoardMembershipPermissionsSelectStep}
                canEdit={canEditMemberships}
                onCreate={onMembershipCreate}
                onUpdate={onMembershipUpdate}
                onDelete={onMembershipDelete}
                currentUser={currentUser}
              />
            )}
            <div style={{ marginLeft: '10px' }}>
              {canEdit && (
                <BoardVisibilityToggle
                  isPublic={isPublic}
                  onToggle={(value) => handleUpdate(currentBoardId, { isPublic: value })}
                />
              )}
            </div>
          </div>
          <div className={styles.action}>
            <Filters
              users={filterUsers}
              labels={filterLabels}
              filterText={filterText}
              allBoardMemberships={memberships}
              allLabels={labels}
              canEdit={canEdit}
              onUserAdd={onUserToFilterAdd}
              onUserRemove={onUserFromFilterRemove}
              onLabelAdd={onLabelToFilterAdd}
              onLabelRemove={onLabelFromFilterRemove}
              onLabelCreate={onLabelCreate}
              onLabelUpdate={onLabelUpdate}
              onLabelMove={onLabelMove}
              onLabelDelete={onLabelDelete}
              onTextFilterUpdate={onTextFilterUpdate}
            />
          </div>
        </div>
      </div>
    );
  },
);

BoardActions.propTypes = {
  /* eslint-disable react/forbid-prop-types */
  memberships: PropTypes.array.isRequired,
  labels: PropTypes.array.isRequired,
  filterUsers: PropTypes.array.isRequired,
  filterLabels: PropTypes.array.isRequired,
  filterText: PropTypes.string.isRequired,
  allUsers: PropTypes.array.isRequired,
  /* eslint-enable react/forbid-prop-types */
  canEdit: PropTypes.bool.isRequired,
  canEditMemberships: PropTypes.bool.isRequired,
  isPublic: PropTypes.bool.isRequired,
  onMembershipCreate: PropTypes.func.isRequired,
  onMembershipUpdate: PropTypes.func.isRequired,
  onMembershipDelete: PropTypes.func.isRequired,
  onUserToFilterAdd: PropTypes.func.isRequired,
  onUserFromFilterRemove: PropTypes.func.isRequired,
  onLabelToFilterAdd: PropTypes.func.isRequired,
  onLabelFromFilterRemove: PropTypes.func.isRequired,
  onLabelCreate: PropTypes.func.isRequired,
  onLabelUpdate: PropTypes.func.isRequired,
  onLabelMove: PropTypes.func.isRequired,
  onLabelDelete: PropTypes.func.isRequired,
  onTextFilterUpdate: PropTypes.func.isRequired,
  onBoardUpdate: PropTypes.func.isRequired,
  /* eslint-disable react/forbid-prop-types */
  currentUser: PropTypes.object.isRequired,
  currentBoardId: PropTypes.string.isRequired,
};

export default BoardActions;
