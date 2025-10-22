import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';

import { Button } from '@openfun/cunningham-react';
import { useForm } from '../../hooks';
import LabelColors from '../../constants/LabelColors';
import Editor from './Editor';

import styles from './AddStep.module.scss';
import PopoverHeader from '../../ui/Popover/PopoverHeader';

const AddStep = React.memo(({ defaultData, onCreate, onBack }) => {
  const [t] = useTranslation();

  const [data, handleFieldChange] = useForm(() => ({
    name: '',
    color: LabelColors[0],
    ...defaultData,
  }));

  const handleSubmit = useCallback(() => {
    const cleanData = {
      ...data,
      name: data.name.trim() || null,
    };

    onCreate(cleanData);
    onBack();
  }, [data, onCreate, onBack]);

  return (
    <div style={{ width: '290px' }}>
      <PopoverHeader
        onBack={onBack}
        title={t('common.createLabel', {
          context: 'title',
        })}
      />
      <form onSubmit={handleSubmit}>
        <Editor data={data} onFieldChange={handleFieldChange} />
        <Button
          type="submit"
          color="primary"
          content={t('action.createLabel')}
          className={styles.submitButton}
        >
          {t('action.createLabel')}
        </Button>
      </form>
    </div>
  );
});

AddStep.propTypes = {
  defaultData: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  onCreate: PropTypes.func.isRequired,
  onBack: PropTypes.func.isRequired,
};

export default AddStep;
