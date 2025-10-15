import { dequal } from 'dequal';
import React, { useCallback, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { Button, Input } from '@openfun/cunningham-react';

import { useForm, useSteps } from '../../hooks';
import DeleteStep from '../DeleteStep/DeleteStep';
import PopoverHeader from '../../ui/Popover/PopoverHeader';

import styles from './BoardEditStep.module.scss';

const StepTypes = {
  DELETE: 'DELETE',
};

const EditBoardStep = React.memo(({ defaultData, onUpdate, onDelete, onClose }) => {
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
        title="common.deleteBoard"
        content="common.areYouSureYouWantToDeleteThisBoard"
        buttonContent="action.deleteBoard"
        onConfirm={onDelete}
        onBack={handleBack}
      />
    );
  }

  return (
    <>
      <PopoverHeader title={t('common.editBoard', { context: 'title' })} />
      <form onSubmit={handleSubmit}>
        <Input
          ref={nameField}
          name="name"
          label="Nom du tableau"
          value={data.name}
          onChange={handleFieldChange}
          className={styles.createInput}
        />

        <div style={{ display: 'flex', gap: '8px', justifyContent: 'space-between' }}>
          <Button type="submit" size="medium">
            {t('action.save')}
          </Button>
          <Button type="button" size="medium" color="secondary" onClick={handleDeleteClick}>
            {t('action.delete')}
          </Button>
        </div>
      </form>
    </>
  );
});

EditBoardStep.propTypes = {
  defaultData: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  onUpdate: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default EditBoardStep;
