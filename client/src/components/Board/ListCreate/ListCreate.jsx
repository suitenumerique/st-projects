import React, { useCallback, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { Input, Button } from '@openfun/cunningham-react';
import { useDidUpdate, useToggle } from '../../../lib/hooks';

import { useForm } from '../../../hooks';

import styles from './ListCreate.module.scss';

const DEFAULT_DATA = {
  name: '',
};

const ListAdd = React.memo(({ onCreate, onClose }) => {
  const [t] = useTranslation();
  const [data, handleFieldChange, setData] = useForm(DEFAULT_DATA);
  const [focusNameFieldState, focusNameField] = useToggle();

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

      setData(DEFAULT_DATA);
      focusNameField();
    },
    [onCreate, data, setData, focusNameField],
  );

  useEffect(() => {
    nameField.current.focus();
  }, []);

  useDidUpdate(() => {
    nameField.current.focus();
  }, [focusNameFieldState]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    const handleClickOutside = (event) => {
      if (
        nameField.current &&
        !nameField.current.closest('[data-list-create]')?.contains(event.target)
      ) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  return (
    <form className={styles.wrapper} onSubmit={handleSubmit} data-list-create>
      <div className={styles.fieldWrapper}>
        <Input
          ref={nameField}
          name="name"
          value={data.name}
          label={t('common.enterListTitle')}
          className={styles.input}
          onChange={(event) =>
            handleFieldChange(event, { name: 'name', value: event.target.value })
          }
        />
      </div>
      <div className={styles.controls}>
        <Button color="brand" variant="primary" size="small" type="submit">
          Valider
        </Button>
      </div>
    </form>
  );
});

ListAdd.propTypes = {
  onCreate: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default ListAdd;
