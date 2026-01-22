import React from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { Modal } from '@openfun/cunningham-react';

import GeneralPane from './GeneralPane';

const ProjectSettingsModal = React.memo(
  ({
    name,
    managers,
    searchedUsers,
    isSearchingUsers,
    onUpdate,
    onDelete,
    onManagerCreate,
    onManagerDelete,
    onClose,
    onSearchUsers,
    onClearUserSearch,
  }) => {
    const [t] = useTranslation();

    return (
      <Modal
        isOpen
        title={t('common.projectSettings')}
        closeIcon
        onClose={onClose}
        closeOnClickOutside
      >
        <GeneralPane
          name={name}
          managers={managers}
          searchedUsers={searchedUsers}
          isSearchingUsers={isSearchingUsers}
          onUpdate={onUpdate}
          onDelete={onDelete}
          onManagerCreate={onManagerCreate}
          onManagerDelete={onManagerDelete}
          onSearchUsers={onSearchUsers}
          onClearUserSearch={onClearUserSearch}
        />
      </Modal>
    );
  },
);

ProjectSettingsModal.propTypes = {
  name: PropTypes.string.isRequired,
  /* eslint-disable react/forbid-prop-types */
  managers: PropTypes.array.isRequired,
  searchedUsers: PropTypes.array.isRequired,
  isSearchingUsers: PropTypes.bool.isRequired,
  /* eslint-enable react/forbid-prop-types */
  onUpdate: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onManagerCreate: PropTypes.func.isRequired,
  onManagerDelete: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  onSearchUsers: PropTypes.func.isRequired,
  onClearUserSearch: PropTypes.func.isRequired,
};

ProjectSettingsModal.defaultProps = {};

export default ProjectSettingsModal;
