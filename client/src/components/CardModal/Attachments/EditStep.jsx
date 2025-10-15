import { dequal } from 'dequal';
import React, { useCallback, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { Button } from '@openfun/cunningham-react';

import { useForm, useSteps } from '../../../hooks';
import DeleteStep from '../../../steps/DeleteStep/DeleteStep';
import PopoverHeader from '../../../ui/Popover/PopoverHeader';

import styles from './EditStep.module.scss';

const StepTypes = {
  DELETE: 'DELETE',
};

const EditStep = React.memo(({ defaultData, onUpdate, onDelete, onClose }) => {
  const [t] = useTranslation();

  const [data, handleFieldChange] = useForm(() => ({
    name: '',
    ...defaultData,
  }));

  const [step, openStep, handleBack] = useSteps();

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

    if (!dequal(cleanData, defaultData)) {
      onUpdate(cleanData);
    }

    onClose();
  }, [defaultData, onUpdate, onClose, data]);

  const handleDeleteClick = useCallback(() => {
    openStep(StepTypes.DELETE);
  }, [openStep]);

  useEffect(() => {
    nameField.current.select();
  }, []);

  if (step && step.type === StepTypes.DELETE) {
    return (
      <DeleteStep
        title="common.deleteAttachment"
        content="common.areYouSureYouWantToDeleteThisAttachment"
        buttonContent="action.deleteAttachment"
        onConfirm={onDelete}
        onBack={handleBack}
      />
    );
  }

  return (
    <>
      <PopoverHeader
        onBack={onBack}
        title={t('common.editAttachment', {
          context: 'title',
        })}
      />
      <form onSubmit={handleSubmit}>
        <div className={styles.text}>{t('common.title')}</div>
        <input
          ref={nameField}
          name="name"
          value={data.name}
          className={styles.field}
          onChange={handleFieldChange}
        />
        <Button positive content={t('action.save')} />
      </form>
      <Button
        content={t('action.delete')}
        className={styles.deleteButton}
        onClick={handleDeleteClick}
      />
    </>
  );
});

EditStep.propTypes = {
  defaultData: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  onUpdate: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default EditStep;
