import { dequal } from 'dequal';
import React, { useCallback, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { Button, Input } from '@gouvfr-lasuite/cunningham-react';

import PopoverHeader from '../../ui/Popover/PopoverHeader';
import { useForm, useSteps } from '../../hooks';
import LabelColors from '../../constants/LabelColors';
import DeleteStep from '../DeleteStep';
import ColorPicker from '../../ui/ColorPicker';

import styles from './LabelEditStep.module.scss';

const StepTypes = {
  DELETE: 'DELETE',
};

const LabelEditStep = React.memo(({ defaultData, onUpdate, onDelete, onBack }) => {
  const [t] = useTranslation();

  const nameField = useRef(null);

  useEffect(() => {
    nameField.current.select();
  }, []);

  const [data, handleFieldChange] = useForm(() => ({
    color: LabelColors[0],
    ...defaultData,
    name: defaultData.name || '',
  }));

  const [step, openStep, handleBack] = useSteps();

  const handleSubmit = useCallback(
    (event) => {
      event.preventDefault();

      const cleanData = {
        ...data,
        name: data.name.trim() || null,
      };

      if (!dequal(cleanData, defaultData)) {
        onUpdate(cleanData);
      }

      onBack();
    },
    [defaultData, data, onUpdate, onBack],
  );

  const handleDeleteClick = useCallback(() => {
    openStep(StepTypes.DELETE);
  }, [openStep]);

  if (step && step.type === StepTypes.DELETE) {
    return (
      <DeleteStep
        title="common.deleteLabel"
        content="common.areYouSureYouWantToDeleteThisLabel"
        buttonContent="action.deleteLabel"
        onConfirm={onDelete}
        onBack={handleBack}
      />
    );
  }

  return (
    <div style={{ width: '290px' }}>
      <PopoverHeader
        onBack={onBack}
        title={t('common.editLabel', {
          context: 'title',
        })}
      />
      <form onSubmit={handleSubmit}>
        <div className={styles.fieldLabel}>{t('common.title')}</div>
        <Input
          label="Nom de l'étiquette"
          ref={nameField}
          name="name"
          value={data.name}
          className={styles.field}
          onChange={handleFieldChange}
        />
        <div className={styles.fieldLabel}>{t('common.color')}</div>
        <ColorPicker colors={LabelColors} current={data.color} onChange={handleFieldChange} />
        <div className={styles.controls}>
          <Button type="submit" color="brand" variant="primary">
            {t('action.save')}
          </Button>
          <Button
            color="error"
            variant="bordered"
            className={styles.deleteButton}
            onClick={handleDeleteClick}
          >
            {t('action.delete')}
          </Button>
        </div>
      </form>
    </div>
  );
});

LabelEditStep.propTypes = {
  defaultData: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  onUpdate: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onBack: PropTypes.func.isRequired,
};

export default LabelEditStep;
