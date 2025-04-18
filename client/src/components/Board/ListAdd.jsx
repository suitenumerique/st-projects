import React, { useCallback, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { Button, Form, Input } from 'semantic-ui-react';
import { useDidUpdate, useToggle } from '../../lib/hooks';

import InputOverride from '../InputOverride';
import ButtonOverride from '../ButtonOverride';
import { useClosableForm, useForm } from '../../hooks';

import styles from './ListAddOverride.module.scss';

const DEFAULT_DATA = {
  name: '',
};

const ListAdd = React.memo(({ onCreate, onClose }) => {
  const [t] = useTranslation();
  const [data, handleFieldChange, setData] = useForm(DEFAULT_DATA);
  const [focusNameFieldState, focusNameField] = useToggle();

  const nameField = useRef(null);

  const handleFieldKeyDown = useCallback(
    (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    },
    [onClose],
  );

  const [handleFieldBlur, handleControlMouseOver, handleControlMouseOut] = useClosableForm(onClose);

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

    setData(DEFAULT_DATA);
    focusNameField();
  }, [onCreate, data, setData, focusNameField]);

  useEffect(() => {
    nameField.current.focus();
  }, []);

  useDidUpdate(() => {
    nameField.current.focus();
  }, [focusNameFieldState]);

  return (
    <Form className={styles.wrapper} onSubmit={handleSubmit}>
      {/* <Input
        ref={nameField}
        name="name"
        value={data.name}
        placeholder={t('common.enterListTitle')}
        className={styles.field}
        onKeyDown={handleFieldKeyDown}
        onChange={handleFieldChange}
        onBlur={handleFieldBlur}
      /> */}
      <InputOverride
        ref={nameField}
        name="name"
        value={data.name}
        placeholder={t('common.enterListTitle')}
        onChange={handleFieldChange}
        onBlur={handleFieldBlur}
        onKeyDown={handleFieldKeyDown}
        className={styles.field}
      />
      <div className={styles.controls}>
        {/* eslint-disable-next-line jsx-a11y/mouse-events-have-key-events */}
        {/* <Button
          positive
          content={t('action.addList')}
          className={styles.button}
          onMouseOver={handleControlMouseOver}
          onMouseOut={handleControlMouseOut}
        /> */}
        <ButtonOverride
          type="submit"
          priority="primary"
          onMouseOver={handleControlMouseOver}
          onMouseOut={handleControlMouseOut}
        >
          {t('action.addList')}
        </ButtonOverride>
      </div>
    </Form>
  );
});

ListAdd.propTypes = {
  onCreate: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default ListAdd;
