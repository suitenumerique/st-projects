import React from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { Modal } from '@openfun/cunningham-react';

import GeneralPane from './GeneralPane';

const ProjectSettingsModal = React.memo(
  ({ name, managers, allUsers, onUpdate, onDelete, onManagerCreate, onManagerDelete, onClose }) => {
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
          allUsers={allUsers}
          onUpdate={onUpdate}
          onDelete={onDelete}
          onManagerCreate={onManagerCreate}
          onManagerDelete={onManagerDelete}
        />
      </Modal>
    );
  },
);

ProjectSettingsModal.propTypes = {
  name: PropTypes.string.isRequired,
  /* eslint-disable react/forbid-prop-types */
  managers: PropTypes.array.isRequired,
  allUsers: PropTypes.array.isRequired,
  /* eslint-enable react/forbid-prop-types */
  onUpdate: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onManagerCreate: PropTypes.func.isRequired,
  onManagerDelete: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

ProjectSettingsModal.defaultProps = {};

export default ProjectSettingsModal;
