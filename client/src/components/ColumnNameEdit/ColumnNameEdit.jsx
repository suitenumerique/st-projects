import React, { useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import TextareaAutosize from 'react-textarea-autosize';

import { useField } from '../../hooks';
import { focusEnd } from '../../utils/element-helpers';

import styles from './ColumnNameEdit.module.scss';

const ColumnNameEdit = React.forwardRef(({ children, defaultValue, onUpdate }, ref) => {
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
      // Stop propagation for all keys to prevent parent handlers from interfering
      event.stopPropagation();

      switch (event.key) {
        case 'Enter':
          event.preventDefault();

          submit();

          break;
        case 'Escape':
          event.preventDefault();
          close();

          break;
        default:
          break;
      }
    },
    [submit, close],
  );

  const handleFieldBlur = useCallback(() => {
    submit();
  }, [submit]);

  useEffect(() => {
    if (isOpened) {
      focusEnd(field.current);
    }
  }, [isOpened]);

  if (!isOpened) {
    return children;
  }

  return (
    <TextareaAutosize
      ref={field}
      as={TextareaAutosize}
      value={value}
      className={styles.field}
      spellCheck={false}
      onClick={handleFieldClick}
      onKeyDown={handleFieldKeyDown}
      onChange={(event) => handleFieldChange(event, { name: 'name', value: event.target.value })}
      onBlur={handleFieldBlur}
    />
  );
});

ColumnNameEdit.propTypes = {
  children: PropTypes.element.isRequired,
  defaultValue: PropTypes.string.isRequired,
  onUpdate: PropTypes.func.isRequired,
};

export default React.memo(ColumnNameEdit);
