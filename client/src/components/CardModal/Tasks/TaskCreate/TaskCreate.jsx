import React, { useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import TextareaAutosize from 'react-textarea-autosize';
import { Button } from '@openfun/cunningham-react';
import { useDidUpdate, useToggle } from '../../../../lib/hooks';

import { useClosableForm, useForm } from '../../../../hooks';

import styles from './TaskCreate.module.scss';

const DEFAULT_DATA = {
  name: '',
};

const MULTIPLE_REGEX = /\s*\r?\n\s*/;

const TaskCreate = React.forwardRef(({ children, onCreate }, ref) => {
  const [t] = useTranslation();
  const [isOpened, setIsOpened] = useState(false);
  const [data, handleFieldChange, setData] = useForm(DEFAULT_DATA);
  const [focusNameFieldState, focusNameField] = useToggle();

  const nameField = useRef(null);

  const open = useCallback(() => {
    setIsOpened(true);
  }, []);

  const close = useCallback(() => {
    setIsOpened(false);
  }, []);

  const submit = useCallback(
    (isMultiple = false) => {
      const cleanData = {
        ...data,
        name: data.name.trim(),
      };

      if (!cleanData.name) {
        nameField.current.ref.current.select();
        return;
      }

      if (isMultiple) {
        cleanData.name.split(MULTIPLE_REGEX).forEach((name) => {
          onCreate({
            ...cleanData,
            name,
          });
        });
      } else {
        onCreate(cleanData);
      }

      setData(DEFAULT_DATA);
      focusNameField();
    },
    [onCreate, data, setData, focusNameField],
  );

  useImperativeHandle(
    ref,
    () => ({
      open,
      close,
    }),
    [open, close],
  );

  const handleChildrenClick = useCallback(() => {
    open();
  }, [open]);

  const handleFieldKeyDown = useCallback(
    (event) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        submit(event.ctrlKey);
      }
    },
    [submit],
  );

  const [handleFieldBlur, handleControlMouseOver, handleControlMouseOut] = useClosableForm(
    close,
    isOpened,
  );

  const handleSubmit = useCallback(() => {
    submit();
  }, [submit]);

  useEffect(() => {
    if (isOpened) {
      nameField.current.focus();
    }
  }, [isOpened]);

  useDidUpdate(() => {
    nameField.current.focus();
  }, [focusNameFieldState]);

  if (!isOpened) {
    return React.cloneElement(children, {
      onClick: handleChildrenClick,
    });
  }

  return (
    <form onSubmit={handleSubmit} className={styles.wrapper}>
      <TextareaAutosize
        ref={nameField}
        name="name"
        value={data.name}
        placeholder={t('common.enterTaskDescription')}
        spellCheck={false}
        className={styles.field}
        onKeyDown={handleFieldKeyDown}
        onChange={handleFieldChange}
        onBlur={handleFieldBlur}
      />
      <div>
        {/* eslint-disable-next-line jsx-a11y/mouse-events-have-key-events */}
        <Button
          color="tertiary"
          size="small"
          onMouseOver={handleControlMouseOver}
          onMouseOut={handleControlMouseOut}
        >
          Enregistrer
        </Button>
      </div>
    </form>
  );
});

TaskCreate.propTypes = {
  children: PropTypes.element.isRequired,
  onCreate: PropTypes.func.isRequired,
};

export default React.memo(TaskCreate);
