import React from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { Modal } from 'semantic-ui-react';

import GeneralPane from './GeneralPane';

const ProjectSettingsModal = React.memo(
  ({ name, managers, allUsers, onUpdate, onDelete, onClose }) => {
    const [t] = useTranslation();

    const panes = [
      {
        menuItem: t('common.general', {
          context: 'title',
        }),
        render: () => <GeneralPane name={name} onUpdate={onUpdate} onDelete={onDelete} />,
      },
    ];

    return (
      <Modal open closeIcon size="small" centered={false} onClose={onClose}>
        <Modal.Content>
          <GeneralPane name={name} onUpdate={onUpdate} onDelete={onDelete} />
        </Modal.Content>
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
  onClose: PropTypes.func.isRequired,
};

export default ProjectSettingsModal;
