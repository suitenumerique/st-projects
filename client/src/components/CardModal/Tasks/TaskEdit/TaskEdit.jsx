import React, { useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import TextareaAutosize from 'react-textarea-autosize';
import { Button } from '@openfun/cunningham-react';
import { Icon } from '@gouvfr-lasuite/ui-kit';

import { useField } from '../../../../hooks';
import { focusEnd } from '../../../../utils/element-helpers';

import styles from './TaskEdit.module.scss';

const TaskEdit = React.forwardRef(({ children, defaultValue, onUpdate }, ref) => {
  const [t] = useTranslation();
  const [isOpened, setIsOpened] = useState(false);
  const [value, handleFieldChange, setValue] = useField(null);

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

  const handleFieldKeyDown = useCallback(
    (event) => {
      if (event.key === 'Enter') {
        event.preventDefault();

        submit();
      }
    },
    [submit],
  );

  const handleFieldBlur = useCallback(() => {
    submit();
  }, [submit]);

  const handleSubmit = useCallback(() => {
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
    <form onSubmit={handleSubmit} className={styles.wrapper}>
      <TextareaAutosize
        ref={field}
        value={value}
        spellCheck={false}
        className={styles.field}
        onKeyDown={handleFieldKeyDown}
        onChange={(e) => handleFieldChange(e, { name: 'name', value: e.target.value })}
        onBlur={handleFieldBlur}
      />
      <div>
        <Button
          color="brand"
          variant="primary"
          size="small"
          icon={<Icon name="save" type="outlined" size="small" />}
        >
          {t('action.save')}
        </Button>
      </div>
    </form>
  );
});

TaskEdit.propTypes = {
  children: PropTypes.element.isRequired,
  defaultValue: PropTypes.string.isRequired,
  onUpdate: PropTypes.func.isRequired,
};

export default React.memo(TaskEdit);
