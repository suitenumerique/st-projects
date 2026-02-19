import pickBy from 'lodash/pickBy';
import React, { useCallback, useMemo, useRef } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { Button, Input } from '@gouvfr-lasuite/cunningham-react';

import { useForm } from '../../../hooks';

import styles from './InformationEdit.module.scss';

const InformationEdit = React.memo(({ defaultData, onUpdate }) => {
  const [t] = useTranslation();

  const [data, handleFieldChange] = useForm(() => ({
    name: '',
    ...pickBy(defaultData),
  }));

  const cleanData = useMemo(
    () => ({
      ...data,
      name: data.name.trim(),
    }),
    [data],
  );

  const nameField = useRef(null);

  const handleSubmit = useCallback(
    (event) => {
      event.preventDefault();

      if (!cleanData.name) {
        nameField.current.select();
        return;
      }

      onUpdate(cleanData);
    },
    [onUpdate, cleanData],
  );

  return (
    <form onSubmit={handleSubmit}>
      <Input
        ref={nameField}
        name="name"
        value={data.name}
        label={t('common.projectTitle')}
        className={styles.field}
        onChange={handleFieldChange}
      />
      <div>
        <Button>{t('action.save')}</Button>
      </div>
    </form>
  );
});

InformationEdit.propTypes = {
  defaultData: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  onUpdate: PropTypes.func.isRequired,
};

export default InformationEdit;
