import React, { useCallback, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { Button, Form, Header, Modal } from 'semantic-ui-react';
import { Input } from '../../lib/custom-ui';
import ButtonOverride from '../ButtonOverride';

import { useForm } from '../../hooks';

import styles from './ProjectAddModalOverride.module.scss';

const ProjectAddModal = React.memo(({ defaultData, isSubmitting, onCreate, onClose }) => {
  const [t] = useTranslation();

  const [data, handleFieldChange] = useForm(() => ({
    name: '',
    ...defaultData,
  }));

  const nameField = useRef(null);

  const handleSubmit = useCallback(() => {
    const cleanData = {
      ...data,
      name: data.name.trim(),
    };

    if (!cleanData.name) {
      nameField.current.select();
      return;
    }

    onCreate(cleanData);
  }, [onCreate, data]);

  useEffect(() => {
    nameField.current.focus();
  }, []);

  return (
    <Modal open basic closeIcon size="tiny" onClose={onClose}>
      <Modal.Content className={styles.modalContent}>
        <Header inverted size="huge">
          {t('common.createProject', {
            context: 'title',
          })}
        </Header>
        <p>{t('common.enterProjectTitle')}</p>
        <Form onSubmit={handleSubmit}>
          <Input
            fluid
            inverted
            ref={nameField}
            name="name"
            value={data.name}
            readOnly={isSubmitting}
            className={styles.field}
            onChange={handleFieldChange}
          />
          <div className={styles.buttonContainer}>
            {/* <Button
              inverted
              color="green"
              icon="checkmark"
              content={t('action.createProject')}
              loading={isSubmitting}
              disabled={isSubmitting}
            /> */}
            <ButtonOverride type="submit">{t('action.createProject')}</ButtonOverride>
          </div>
        </Form>
      </Modal.Content>
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
