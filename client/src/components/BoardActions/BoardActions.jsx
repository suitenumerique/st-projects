import React, { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { ShareModal, ShareModalCopyLinkFooter, Icon } from '@gouvfr-lasuite/ui-kit';
import { Button } from '@openfun/cunningham-react';

// import Filters from '../Filters';

import styles from './BoardActions.module.scss';

const BoardActions = React.memo(
  ({
    memberships,
    // labels,
    // filterUsers,
    filterLabels,
    // filterText,
    allUsers,
    canEdit,
    // canEditMemberships,
    isPublic,
    onMembershipCreate,
    onMembershipUpdate,
    onMembershipDelete,
    // onUserToFilterAdd,
    // onUserFromFilterRemove,
    onLabelToFilterAdd,
    // onLabelFromFilterRemove,
    // onLabelCreate,
    // onLabelUpdate,
    // onLabelMove,
    // onLabelDelete,
    // onTextFilterUpdate,
    onBoardUpdate,
    currentBoardId,
    // isCurrentUserMember,
  }) => {
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [searchedUsers, setSearchedUsers] = useState([]);

    const handleUpdate = useCallback(
      (data) => {
        onBoardUpdate(currentBoardId, data);
      },
      [onBoardUpdate, currentBoardId],
    );

    const handleShareClick = useCallback(() => {
      setIsShareModalOpen(true);
    }, []);

    const handleShareModalClose = useCallback(() => {
      setIsShareModalOpen(false);
    }, []);

    const onSearchUsers = useCallback(
      (search) => {
        const filteredUsers = allUsers.filter((user) => {
          return (
            (user.email.includes(search) ||
              user.name.includes(search) ||
              user.username.includes(search)) &&
            !memberships.some((membership) => membership.user.id === user.id)
          );
        });
        setSearchedUsers(filteredUsers);
      },
      [allUsers, memberships],
    );

    useEffect(() => {
      const urlParams = new URLSearchParams(window.location.search);
      const labelsParam = urlParams.get('labels');
      if (labelsParam) {
        const labelIds = labelsParam.split(',').filter((id) => id.trim());
        labelIds.forEach((labelId) => {
          if (labelId.trim() && !filterLabels.some((label) => label.id === labelId.trim())) {
            onLabelToFilterAdd(labelId.trim());
          }
        });
      }
    }, [filterLabels, onLabelToFilterAdd]);

    return (
      <div className={styles.wrapper}>
        <div className={styles.actions}>
          <div className={styles.action}>
            {/* <Filters
              users={filterUsers}
              labels={filterLabels}
              filterText={filterText}
              allBoardMemberships={memberships}
              allLabels={labels}
              canEdit={canEdit}
              isCurrentUserMember={isCurrentUserMember}
              onUserAdd={onUserToFilterAdd}
              onUserRemove={onUserFromFilterRemove}
              onLabelAdd={onLabelToFilterAdd}
              onLabelRemove={onLabelFromFilterRemove}
              onLabelCreate={onLabelCreate}
              onLabelUpdate={onLabelUpdate}
              onLabelMove={onLabelMove}
              onLabelDelete={onLabelDelete}
              onTextFilterUpdate={onTextFilterUpdate}
            /> */}
          </div>
          <div className={styles.action}>
            <Button
              icon={<Icon type="outlined" name="filter_alt" />}
              color="secondary"
              // onClick={handleShareClick}
              title="Filtrer"
            >
              Filtrer
            </Button>
            <Button
              icon={<Icon type="outlined" name="group" />}
              onClick={handleShareClick}
              title="Share board"
            >
              Partager
            </Button>
          </div>
        </div>

        <ShareModal
          isOpen={isShareModalOpen}
          onClose={handleShareModalClose}
          modalTitle="Partager le tableau"
          canUpdate={canEdit}
          canView
          accesses={memberships}
          invitationRoles={[
            {
              label: 'Editeur',
              value: 'editor',
            },
            {
              label: 'Lecteur',
              value: 'viewer',
            },
            {
              label: 'Propriétaire',
              value: 'owner',
            },
          ]}
          onDeleteAccess={(e) => {
            onMembershipDelete(e.id);
          }}
          onDeleteInvitation={() => {}}
          onUpdateInvitation={() => {}}
          onUpdateAccess={(e, role) => {
            onMembershipUpdate(e.id, { role });
          }}
          onSearchUsers={onSearchUsers}
          hasNextMembers={false}
          hasNextInvitations={false}
          searchUsersResult={searchedUsers || []}
          onInviteUser={(users) => {
            users.forEach((user) => {
              onMembershipCreate({ userId: user.id, role: 'editor' });
            });
          }}
          outsideSearchContent={
            <ShareModalCopyLinkFooter
              onCopyLink={() => {
                navigator.clipboard.writeText(window.location.href);
              }}
              onOk={() => {
                handleShareModalClose();
              }}
            />
          }
          linkSettings={canEdit}
          linkReach={isPublic ? 'public' : 'restricted'}
          linkReachChoices={[
            {
              value: 'public',
            },
            {
              value: 'restricted',
            },
          ]}
          onUpdateLinkReach={(value) => {
            handleUpdate({ isPublic: value === 'public' });
          }}
        />
      </div>
    );
  },
);

BoardActions.propTypes = {
  /* eslint-disable react/forbid-prop-types */
  memberships: PropTypes.array.isRequired,
  // labels: PropTypes.array.isRequired,
  // filterUsers: PropTypes.array.isRequired,
  filterLabels: PropTypes.array.isRequired,
  // filterText: PropTypes.string.isRequired,
  allUsers: PropTypes.array.isRequired,
  /* eslint-enable react/forbid-prop-types */
  canEdit: PropTypes.bool.isRequired,
  // canEditMemberships: PropTypes.bool.isRequired,
  isPublic: PropTypes.bool.isRequired,
  onMembershipCreate: PropTypes.func.isRequired,
  onMembershipUpdate: PropTypes.func.isRequired,
  onMembershipDelete: PropTypes.func.isRequired,
  // onUserToFilterAdd: PropTypes.func.isRequired,
  // onUserFromFilterRemove: PropTypes.func.isRequired,
  onLabelToFilterAdd: PropTypes.func.isRequired,
  // onLabelFromFilterRemove: PropTypes.func.isRequired,
  // onLabelCreate: PropTypes.func.isRequired,
  // onLabelUpdate: PropTypes.func.isRequired,
  // onLabelMove: PropTypes.func.isRequired,
  // onLabelDelete: PropTypes.func.isRequired,
  // onTextFilterUpdate: PropTypes.func.isRequired,
  onBoardUpdate: PropTypes.func.isRequired,
  /* eslint-disable react/forbid-prop-types */
  currentBoardId: PropTypes.string.isRequired,
  // isCurrentUserMember: PropTypes.bool.isRequired,
};

export default BoardActions;
