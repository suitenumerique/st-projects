import React, { useCallback, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import TextareaAutosize from 'react-textarea-autosize';
import { useDidUpdate, usePrevious } from '../../lib/hooks';

import { useField } from '../../hooks';

import styles from './CardModalNameEdit.module.scss';

const CardModalNameEdit = React.memo(({ defaultValue, onUpdate }) => {
  const prevDefaultValue = usePrevious(defaultValue);
  const [value, handleChange, setValue] = useField(defaultValue);

  const isFocused = useRef(false);
  const textareaRef = useRef(null);

  const handleFocus = useCallback(() => {
    isFocused.current = true;
  }, []);

  const handleKeyDown = useCallback((event) => {
    if (event.key === 'Enter') {
      event.preventDefault();

      event.target.blur();
    }
  }, []);

  const handleBlur = useCallback(() => {
    isFocused.current = false;

    const cleanValue = value.trim();

    if (cleanValue) {
      if (cleanValue !== defaultValue) {
        onUpdate(cleanValue);
      }
    } else {
      setValue(defaultValue);
    }
  }, [defaultValue, onUpdate, value, setValue]);

  useDidUpdate(() => {
    if (!isFocused.current && defaultValue !== prevDefaultValue) {
      setValue(defaultValue);
    }
  }, [defaultValue, prevDefaultValue, setValue]);

  useEffect(() => {
    if (textareaRef.current) {
      const timeoutId = setTimeout(() => {
        if (textareaRef.current) {
          if (typeof textareaRef.current.resize === 'function') {
            textareaRef.current.resize();
          } else {
            textareaRef.current.dispatchEvent(new Event('input', { bubbles: true }));
          }
        }
      }, 100);

      return () => clearTimeout(timeoutId);
    }

    return () => {};
  }, [value, defaultValue]);

  return (
    <TextareaAutosize
      ref={textareaRef}
      key={defaultValue}
      value={value}
      minRows={1}
      cacheMeasurements={false}
      spellCheck={false}
      className={styles.field}
      onFocus={handleFocus}
      onKeyDown={handleKeyDown}
      onChange={(event) => handleChange(event, { name: 'name', value: event.target.value })}
      onBlur={handleBlur}
    />
  );
});

CardModalNameEdit.propTypes = {
  defaultValue: PropTypes.string.isRequired,
  onUpdate: PropTypes.func.isRequired,
};

export default CardModalNameEdit;
