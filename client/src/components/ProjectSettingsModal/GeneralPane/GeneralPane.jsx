import React, { useCallback, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { Button } from '@openfun/cunningham-react';
import { HorizontalSeparator, ShareModal } from '@gouvfr-lasuite/ui-kit';

import { useUsersSearch } from '../../../hooks';
import usePopup from '../../../lib/popup/use-popup';
import InformationEdit from './InformationEdit';
import DeleteStep from '../../../steps/DeleteStep';

import styles from './GeneralPane.module.scss';

const GeneralPane = React.memo(
  ({
    name,
    managers,
    searchedUsers,
    isSearchingUsers,
    onUpdate,
    onDelete,
    onManagerCreate,
    onManagerDelete,
    onSearchUsers,
    onClearUserSearch,
  }) => {
    const [t] = useTranslation();

    const [isShareModalOpen, setIsShareModalOpen] = useState(false);

    const handleShareClick = useCallback(() => {
      setIsShareModalOpen(true);
    }, []);

    const handleShareModalClose = useCallback(() => {
      setIsShareModalOpen(false);

      onClearUserSearch(); // Empty the search for a proper next modal opening
    }, [onClearUserSearch]);

    const userIdsToExclude = useMemo(() => managers.map((manager) => manager.user.id), [managers]);
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
      return managers.map((manager) => {
        return {
          id: manager.id,
          role: 'manager',
          user: {
            id: manager.user.id,
            full_name: manager.user.name,
            email: manager.user.email,
          },
        };
      });
    }, [managers]);

    const DeletePopup = usePopup(DeleteStep);

    return (
      <div className={styles.pane}>
        <InformationEdit
          defaultData={{
            name,
          }}
          onUpdate={onUpdate}
        />
        <HorizontalSeparator />
        <div className={styles.permissionsSection}>
          <h4>
            {t('common.permissions', {
              context: 'title',
            })}
          </h4>
          <div>
            <Button onClick={handleShareClick}>{t('common.editProjectManagers')}</Button>
          </div>
        </div>
        <HorizontalSeparator />
        <div className={styles.dangerSection}>
          <h4>
            {t('common.dangerZone', {
              context: 'title',
            })}
          </h4>
          <div>
            <DeletePopup
              title="common.deleteProject"
              content="common.areYouSureYouWantToDeleteThisProject"
              buttonContent="action.delete"
              onConfirm={onDelete}
            >
              <Button color="danger">
                {t('action.deleteProject', {
                  context: 'title',
                })}
              </Button>
            </DeletePopup>
          </div>
        </div>

        <ShareModal
          key={isShareModalOpen ? 'open' : 'closed'} // [WORKAROUND] To avoid previous search input to appear again after opening the modal
          // TODO: should be adjusted to avoid letting inviting random email since it has no reality then (ref: https://github.com/suitenumerique/ui-kit/issues/151)
          // for now we are using `patch-package` to fix this
          isOpen={isShareModalOpen}
          onClose={handleShareModalClose}
          modalTitle={t('common.managers_title')} // For whatever reason `{ context: 'title' }` is not working here, so using directly the suffix (missing context since modal?)
          canView
          canUpdate
          accesses={modalMembers}
          invitationRoles={[
            {
              label: t('common.manager'),
              value: 'manager',
            },
          ]}
          onDeleteAccess={(e) => {
            onManagerDelete(e.id);
          }}
          onDeleteInvitation={() => {}}
          onUpdateInvitation={() => {}}
          onUpdateAccess={() => {
            // No need since only 1 role
          }}
          onSearchUsers={debouncedHandleUsersQuery}
          loading={isSearchingUsers}
          hasNextMembers={false}
          hasNextInvitations={false}
          searchUsersResult={formattedSearchedUsers}
          onInviteUser={(users) => {
            users.forEach((user) => {
              onManagerCreate({
                userId: user.id,
              });
            });
          }}
        />
      </div>
    );
  },
);

GeneralPane.propTypes = {
  name: PropTypes.string.isRequired,
  managers: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  searchedUsers: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  isSearchingUsers: PropTypes.bool.isRequired, // eslint-disable-line react/forbid-prop-types
  onUpdate: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onManagerCreate: PropTypes.func.isRequired,
  onManagerDelete: PropTypes.func.isRequired,
  onSearchUsers: PropTypes.func.isRequired,
  onClearUserSearch: PropTypes.func.isRequired,
};

export default GeneralPane;
