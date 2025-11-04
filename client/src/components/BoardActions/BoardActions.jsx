import React, { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { ShareModal, ShareModalCopyLinkFooter, Icon } from '@gouvfr-lasuite/ui-kit';
import { Button } from '@openfun/cunningham-react';
import Badge from '../../ui/Badge';
import Filters from './Filters';
import styles from './BoardActions.module.scss';

const BoardActions = React.memo(
  ({
    currentBoardId,
    currentBoardName,
    filterText,
    allUsers,
    filterUsers,
    boardLabels,
    filterLabels,
    boardMemberships,
    isCurrentUserMember,
    canEdit,
    isBoardPublic,
    onTextFilterUpdate,
    onUserToFilterAdd,
    onUserFromFilterRemove,
    onLabelToFilterAdd,
    onLabelFromFilterRemove,
    onLabelCreate,
    onLabelUpdate,
    onLabelMove,
    onLabelDelete,
    onMembershipCreate,
    onMembershipUpdate,
    onMembershipDelete,
    onBoardUpdate,
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
            (user.email.includes(search) || user.name.includes(search)) &&
            !boardMemberships.some((membership) => membership.user.id === user.id)
          );
        });
        setSearchedUsers(filteredUsers);
      },
      [allUsers, boardMemberships],
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
        <h4 className={styles.boardName}>{currentBoardName}</h4>
        <div className={styles.actions}>
          <div className={styles.action}>
            <Filters
              filterText={filterText}
              boardLabels={boardLabels}
              filterLabels={filterLabels}
              filterUsers={filterUsers}
              boardMemberships={boardMemberships}
              canEdit={canEdit}
              onTextFilterUpdate={onTextFilterUpdate}
              onUserAdd={onUserToFilterAdd}
              onUserRemove={onUserFromFilterRemove}
              onLabelAdd={onLabelToFilterAdd}
              onLabelRemove={onLabelFromFilterRemove}
              onLabelCreate={onLabelCreate}
              onLabelUpdate={onLabelUpdate}
              onLabelMove={onLabelMove}
              onLabelDelete={onLabelDelete}
            />
          </div>
          {isCurrentUserMember && (
            <div className={styles.action}>
              {boardMemberships.length === 1 && canEdit ? (
                <Button onClick={handleShareClick} title="Share board" color="tertiary-text">
                  Partager
                </Button>
              ) : (
                <Badge style={{ cursor: 'pointer' }} onClick={handleShareClick}>
                  <Icon type="outlined" name="group" />
                  <span style={{ fontSize: '16px' }}>{boardMemberships.length}</span>
                </Badge>
              )}
            </div>
          )}
        </div>

        <ShareModal
          isOpen={isShareModalOpen}
          onClose={handleShareModalClose}
          modalTitle="Partager le tableau"
          canUpdate={canEdit}
          canView
          accesses={boardMemberships}
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
          linkReach={isBoardPublic ? 'public' : 'restricted'}
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
  currentBoardId: PropTypes.string.isRequired,
  currentBoardName: PropTypes.string.isRequired,
  filterText: PropTypes.string.isRequired,
  /* eslint-disable react/forbid-prop-types */
  allUsers: PropTypes.array.isRequired,
  filterUsers: PropTypes.array.isRequired,
  boardLabels: PropTypes.array.isRequired,
  filterLabels: PropTypes.array.isRequired,
  boardMemberships: PropTypes.array.isRequired,
  /* eslint-enable react/forbid-prop-types */
  canEdit: PropTypes.bool.isRequired,
  isCurrentUserMember: PropTypes.bool.isRequired,
  isBoardPublic: PropTypes.bool.isRequired,
  onTextFilterUpdate: PropTypes.func.isRequired,
  onUserToFilterAdd: PropTypes.func.isRequired,
  onUserFromFilterRemove: PropTypes.func.isRequired,
  onLabelToFilterAdd: PropTypes.func.isRequired,
  onLabelFromFilterRemove: PropTypes.func.isRequired,
  onLabelCreate: PropTypes.func.isRequired,
  onLabelUpdate: PropTypes.func.isRequired,
  onLabelMove: PropTypes.func.isRequired,
  onLabelDelete: PropTypes.func.isRequired,
  onMembershipCreate: PropTypes.func.isRequired,
  onMembershipUpdate: PropTypes.func.isRequired,
  onMembershipDelete: PropTypes.func.isRequired,
  onBoardUpdate: PropTypes.func.isRequired,
};

export default BoardActions;
