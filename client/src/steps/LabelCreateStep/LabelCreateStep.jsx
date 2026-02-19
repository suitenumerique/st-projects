import React, { useCallback, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { Button, Input } from '@gouvfr-lasuite/cunningham-react';

import { useForm } from '../../hooks';
import LabelColors from '../../constants/LabelColors';
import ColorPicker from '../../ui/ColorPicker';
import PopoverHeader from '../../ui/Popover/PopoverHeader';

import styles from './LabelCreateStep.module.scss';

const LabelCreateStep = React.memo(({ defaultData, onCreate, onBack }) => {
  const [t] = useTranslation();

  const [data, handleFieldChange] = useForm(() => ({
    name: '',
    color: LabelColors[0],
    ...defaultData,
  }));

  const nameField = useRef(null);

  useEffect(() => {
    nameField.current.select();
  }, []);

  const handleSubmit = useCallback(
    (event) => {
      event.preventDefault();

      const cleanData = {
        ...data,
        name: data.name.trim() || null,
      };

      onCreate(cleanData);
      onBack();
    },
    [data, onCreate, onBack],
  );

  return (
    <div style={{ width: '290px' }}>
      <PopoverHeader
        onBack={onBack}
        title={t('common.createLabel', {
          context: 'title',
        })}
      />
      <form onSubmit={handleSubmit}>
        {/* <LabelEditor data={data} onFieldChange={handleFieldChange} /> */}
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
          <Button type="submit" color="brand" variant="primary" className={styles.submitButton}>
            {t('action.createLabel')}
          </Button>
        </div>
      </form>
    </div>
  );
});

LabelCreateStep.propTypes = {
  defaultData: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  onCreate: PropTypes.func.isRequired,
  onBack: PropTypes.func.isRequired,
};

export default LabelCreateStep;
