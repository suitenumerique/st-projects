import React, { useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import TextareaAutosize from 'react-textarea-autosize';
import { Button } from '@openfun/cunningham-react';

import { useClosableForm, useField } from '../../../../hooks';
import { focusEnd } from '../../../../utils/element-helpers';

import styles from './CardNameEdit.module.scss';

const CardNameEdit = React.forwardRef(({ children, defaultValue, onUpdate }, ref) => {
  const [t] = useTranslation();
  const [isOpened, setIsOpened] = useState(false);
  const [value, handleFieldChange, setValue] = useField(defaultValue);

  const field = useRef(null);

  const open = useCallback(() => {
    setIsOpened(true);
    setValue(defaultValue);
  }, [defaultValue, setValue]);

  const close = useCallback(() => {
    setIsOpened(false);
    setValue(null);
  }, [setValue]);

  const submit = useCallback(() => {
    const cleanValue = value.trim();

    if (!cleanValue) {
      field.current.ref.current.select();
      return;
    }

    if (cleanValue !== defaultValue) {
      onUpdate(cleanValue);
    }

    close();
  }, [defaultValue, onUpdate, value, close]);

  useImperativeHandle(
    ref,
    () => ({
      open,
      close,
    }),
    [open, close],
  );

  const handleFieldKeyDown = useCallback(
    (event) => {
      switch (event.key) {
        case 'Enter':
          event.preventDefault();

          submit();

          break;
        case 'Escape':
          close();

          break;
        case ' ':
          if (event.target === event.currentTarget && document.activeElement === event.target) {
            event.stopPropagation();
          }
          break;
        default:
          break;
      }
    },
    [close, submit],
  );

  const [handleFieldBlur, handleControlMouseOver, handleControlMouseOut] = useClosableForm(
    close,
    isOpened,
  );

  const handleSubmit = useCallback(
    (event) => {
      event.preventDefault();
      submit();
    },
    [submit],
  );

  const handleFormMouseDown = useCallback((event) => {
    event.stopPropagation();
  }, []);

  const handleFormDragStart = useCallback((event) => {
    event.preventDefault();
    event.stopPropagation();
  }, []);

  useEffect(() => {
    if (isOpened) {
      focusEnd(field.current);
    }
  }, [isOpened]);

  if (!isOpened) {
    return children;
  }

  return (
    // eslint-disable-next-line jsx-a11y/no-static-element-interactions
    <div
      className={styles.form}
      onMouseDown={handleFormMouseDown}
      onDragStart={handleFormDragStart}
    >
      <form className={styles.form} onSubmit={handleSubmit}>
        <TextareaAutosize
          ref={field}
          value={value}
          spellCheck={false}
          className={styles.field}
          onKeyDown={handleFieldKeyDown}
          onChange={(e) => handleFieldChange(e, { name: 'name', value: e.target.value })}
          onBlur={handleFieldBlur}
          onMouseDown={handleFormMouseDown}
          onDragStart={handleFormDragStart}
        />
        <div className={styles.buttons}>
          <Button
            color="primary"
            type="submit"
            onMouseOver={handleControlMouseOver}
            onMouseOut={handleControlMouseOut}
            onMouseDown={handleFormMouseDown}
            onDragStart={handleFormDragStart}
          >
            {t('action.save')}
          </Button>
        </div>
      </form>
    </div>
  );
});

CardNameEdit.propTypes = {
  children: PropTypes.element.isRequired,
  defaultValue: PropTypes.string.isRequired,
  onUpdate: PropTypes.func.isRequired,
};

export default React.memo(CardNameEdit);
