import React, { useCallback, useEffect, useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import { ShareModal, ShareModalCopyLinkFooter, Icon } from '@gouvfr-lasuite/ui-kit';
import { Button } from '@openfun/cunningham-react';

import { useUsersSearch } from '../../hooks';
import { BoardMembershipRoles } from '../../constants/Enums';
import Badge from '../../ui/Badge';
import Filters from './Filters';
import styles from './BoardActions.module.scss';

const BoardActions = React.memo(
  ({
    currentBoardId,
    currentBoardName,
    filterText,
    filterUsers,
    includeCardsWithoutMembers,
    boardLabels,
    filterLabels,
    includeCardsWithoutLabels,
    boardMemberships,
    isCurrentUserMember,
    canEdit,
    isBoardPublic,
    searchedUsers,
    isSearchingUsers,
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
    onSearchUsers,
    onClearUserSearch,
  }) => {
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);

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

      onClearUserSearch(); // Empty the search for a proper next modal opening
    }, [onClearUserSearch]);

    const userIdsToExclude = useMemo(
      () => boardMemberships.map((membership) => membership.userId),
      [boardMemberships],
    );
    const [debouncedHandleUsersQuery] = useUsersSearch(userIdsToExclude, onSearchUsers);

    const formattedSearchedUsers = useMemo(() => {
      return searchedUsers.map((user) => {
        return {
          id: user.id,
          full_name: user.name,
          email: user.email,
        };
      });
    }, [searchedUsers]);

    const modalMembers = useMemo(() => {
      return boardMemberships.map((membership) => {
        return {
          id: membership.id,
          role: membership.role,
          user: {
            id: membership.user.id,
            full_name: membership.user.name,
            email: membership.user.email,
          },
        };
      });
    }, [boardMemberships]);

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
              includeCardsWithoutLabels={includeCardsWithoutLabels}
              filterUsers={filterUsers}
              includeCardsWithoutMembers={includeCardsWithoutMembers}
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
                <Button
                  onClick={handleShareClick}
                  title="Share board"
                  color="neutral"
                  variant="tertiary"
                >
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
          key={isShareModalOpen ? 'open' : 'closed'} // [WORKAROUND] To avoid previous search input to appear again after opening the modal
          // TODO: should be adjusted to avoid letting inviting random email since it has no reality then (ref: https://github.com/suitenumerique/ui-kit/issues/151)
          // for now we are using `patch-package` to fix this
          isOpen={isShareModalOpen}
          onClose={handleShareModalClose}
          modalTitle="Partager le tableau"
          canUpdate={canEdit}
          canView
          accesses={modalMembers}
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
          onSearchUsers={debouncedHandleUsersQuery}
          loading={isSearchingUsers}
          hasNextMembers={false}
          hasNextInvitations={false}
          searchUsersResult={formattedSearchedUsers}
          onInviteUser={(users, role) => {
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
  filterUsers: PropTypes.array.isRequired,
  includeCardsWithoutMembers: PropTypes.bool.isRequired,
  boardLabels: PropTypes.array.isRequired,
  filterLabels: PropTypes.array.isRequired,
  includeCardsWithoutLabels: PropTypes.bool.isRequired,
  boardMemberships: PropTypes.array.isRequired,
  searchedUsers: PropTypes.array.isRequired,
  isSearchingUsers: PropTypes.bool.isRequired,
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
  onSearchUsers: PropTypes.func.isRequired,
  onClearUserSearch: PropTypes.func.isRequired,
};

export default BoardActions;
