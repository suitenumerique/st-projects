import React, { useCallback, useEffect, useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { ShareModal, ShareModalCopyLinkFooter, Icon } from '@gouvfr-lasuite/ui-kit';
import { Button } from '@openfun/cunningham-react';

import { BoardMembershipRoles } from '../../constants/Enums';
import Badge from '../../ui/Badge';
import Filters from './Filters';
import styles from './BoardActions.module.scss';

const BoardActions = React.memo(
  ({
    currentUser,
    currentBoardId,
    currentBoardName,
    filterText,
    allUsers,
    filterUsers,
    includeCardsWithoutMembers,
    boardLabels,
    filterLabels,
    includeCardsWithoutLabels,
    boardMemberships,
    canSeeMemberships,
    canEdit,
    canEditMemberships,
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
    const [t] = useTranslation();

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

    const searchableUsers = useMemo(() => {
      return allUsers.map((user) => {
        return {
          id: user.id,
          full_name: user.name,
          email: user.email,
        };
      });
    }, [allUsers]);

    const onSearchUsers = useCallback(
      (search) => {
        const filteredUsers = searchableUsers.filter((user) => {
          return (
            (user.email.includes(search) || user.full_name.includes(search)) &&
            !boardMemberships.some((membership) => membership.user.id === user.id)
          );
        });

        setSearchedUsers(filteredUsers);
      },
      [searchableUsers, boardMemberships],
    );

    const modalMembers = useMemo(() => {
      return boardMemberships.map((membership) => {
        return {
          id: membership.id,
          role:
            // We have to virtually manage another role for the commenting option for viewers
            membership.role === BoardMembershipRoles.VIEWER && membership.canComment === true
              ? 'commenter'
              : membership.role,
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
          {canSeeMemberships && (
            <div className={styles.action}>
              {canEditMemberships &&
              boardMemberships.length === 1 &&
              boardMemberships.some(
                (boardMembership) => boardMembership.userId === currentUser.id,
              ) ? (
                <Button onClick={handleShareClick} title="Share board" color="tertiary-text">
                  {t('action.share')}
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
          modalTitle={t('common.boardPermissions', {
            context: 'title',
          })}
          canUpdate={canEditMemberships}
          canView
          accesses={modalMembers}
          invitationRoles={[
            {
              label: t('common.viewer'),
              value: BoardMembershipRoles.VIEWER,
            },
            {
              label: t('common.commenter'),
              value: 'commenter',
            },
            {
              label: t('common.editor'),
              value: BoardMembershipRoles.EDITOR,
            },
          ]}
          onDeleteAccess={(e) => {
            onMembershipDelete(e.id);
          }}
          onDeleteInvitation={() => {}}
          onUpdateInvitation={() => {}}
          onUpdateAccess={(e, role) => {
            onMembershipUpdate(
              e.id,
              // Replace the virtual commenter role if needed
              role === 'commenter'
                ? {
                    role: BoardMembershipRoles.VIEWER,
                    canComment: true,
                  }
                : {
                    role,
                    canComment: null,
                  },
            );
          }}
          onSearchUsers={onSearchUsers}
          hasNextMembers={false}
          hasNextInvitations={false}
          searchUsersResult={searchedUsers || []}
          onInviteUser={(users, role) => {
            users.forEach((user) => {
              onMembershipCreate({
                userId: user.id,
                ...// Replace the virtual commenter role if needed
                (role === 'commenter'
                  ? {
                      role: BoardMembershipRoles.VIEWER,
                      canComment: true,
                    }
                  : {
                      role,
                      canComment: null,
                    }),
              });
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
          linkSettings={canEditMemberships}
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
  currentUser: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  currentBoardId: PropTypes.string.isRequired,
  currentBoardName: PropTypes.string.isRequired,
  filterText: PropTypes.string.isRequired,
  /* eslint-disable react/forbid-prop-types */
  allUsers: PropTypes.array.isRequired,
  filterUsers: PropTypes.array.isRequired,
  includeCardsWithoutMembers: PropTypes.bool.isRequired,
  boardLabels: PropTypes.array.isRequired,
  filterLabels: PropTypes.array.isRequired,
  includeCardsWithoutLabels: PropTypes.bool.isRequired,
  boardMemberships: PropTypes.array.isRequired,
  /* eslint-enable react/forbid-prop-types */
  canEdit: PropTypes.bool.isRequired,
  canEditMemberships: PropTypes.bool.isRequired,
  canSeeMemberships: PropTypes.bool.isRequired,
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
