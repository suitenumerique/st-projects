import React, { useCallback, useRef } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { Button, Input, Modal } from '@openfun/cunningham-react';

import { useForm } from '../../hooks';

import styles from './ProjectAddModal.module.scss';

const ProjectAddModal = React.memo(({ defaultData, isSubmitting, onCreate, onClose }) => {
  const [t] = useTranslation();

  const [data, handleFieldChange] = useForm(() => ({
    name: '',
    ...defaultData,
  }));

  const nameField = useRef(null);

  const handleSubmit = useCallback(
    (event) => {
      event.preventDefault();

      const cleanData = {
        ...data,
        name: data.name.trim(),
      };

      if (!cleanData.name) {
        nameField.current.select();
        return;
      }

      onCreate(cleanData);
    },
    [onCreate, data],
  );

  const setNameFieldRef = useCallback((node) => {
    // Using a function for the ref to set the focus when the element is available
    if (node) {
      nameField.current = node;
      node.focus();
    }
  }, []);

  return (
    <Modal
      isOpen
      title={t('common.createProject', { context: 'title' })}
      closeIcon
      onClose={onClose}
      hideCloseButton
      closeOnClickOutside
    >
      <form onSubmit={handleSubmit}>
        <Input
          ref={setNameFieldRef}
          name="name"
          value={data.name}
          label={t('common.projectTitle')}
          readOnly={isSubmitting}
          className={styles.field}
          onChange={(event) =>
            handleFieldChange(event, { name: 'name', value: event.target.value })
          }
        />
        <div>
          <Button loading={isSubmitting.toString()} disabled={isSubmitting}>
            {t('action.createProject')}
          </Button>
        </div>
      </form>
    </Modal>
  );
});

ProjectAddModal.propTypes = {
  defaultData: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  isSubmitting: PropTypes.bool.isRequired,
  onCreate: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default ProjectAddModal;
