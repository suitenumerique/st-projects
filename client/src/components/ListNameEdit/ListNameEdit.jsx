import React, { useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import TextareaAutosize from 'react-textarea-autosize';

import { useField } from '../../hooks';

import styles from './ListNameEdit.module.scss';

const NameEdit = React.forwardRef(({ children, defaultValue, onUpdate }, ref) => {
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

    if (cleanValue && cleanValue !== defaultValue) {
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

  const handleFieldClick = useCallback((event) => {
    event.stopPropagation();
  }, []);

  const handleFieldKeyDown = useCallback(
    (event) => {
      switch (event.key) {
        case 'Enter':
          event.preventDefault();

          submit();

          break;
        case 'Escape':
          submit();

          break;
        default:
      }
    },
    [submit],
  );

  const handleFieldBlur = useCallback(() => {
    submit();
  }, [submit]);

  // Close the textarea when clicking outside of it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isOpened && field.current && !field.current.contains(event.target)) {
        submit();
      }
    };

    if (isOpened) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpened, submit]);

  if (!isOpened) {
    return <div className={styles.headerName}>{children}</div>;
  }

  return (
    <TextareaAutosize
      ref={field}
      value={value}
      spellCheck={false}
      className={styles.inputField}
      onClick={handleFieldClick}
      onKeyDown={handleFieldKeyDown}
      onChange={(event) => handleFieldChange(event, { name: 'name', value: event.target.value })}
      onBlur={handleFieldBlur}
    />
  );
});

NameEdit.propTypes = {
  children: PropTypes.element.isRequired,
  defaultValue: PropTypes.string.isRequired,
  onUpdate: PropTypes.func.isRequired,
};

export default React.memo(NameEdit);
