import React, { useCallback, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import TextareaAutosize from 'react-textarea-autosize';
import { Button } from '@gouvfr-lasuite/cunningham-react';
import { Icon } from '@gouvfr-lasuite/ui-kit';
import { useDidUpdate, useToggle } from '../../../../lib/hooks';

import { useClosableForm, useForm } from '../../../../hooks';

import styles from './CommentCreate.module.scss';

const DEFAULT_DATA = {
  text: '',
};

const CommentCreate = React.memo(({ onCreate }) => {
  const [t] = useTranslation();
  const [isOpened, setIsOpened] = useState(false);
  const [data, handleFieldChange, setData] = useForm(DEFAULT_DATA);
  const [selectTextFieldState, selectTextField] = useToggle();

  const textField = useRef(null);

  const close = useCallback(() => {
    setIsOpened(false);
  }, []);

  const submit = useCallback(() => {
    const cleanData = {
      ...data,
      text: data.text.trim(),
    };

    if (!cleanData.text) {
      textField.current?.select();
      return;
    }

    onCreate(cleanData);

    setData(DEFAULT_DATA);
    selectTextField();
  }, [onCreate, data, setData, selectTextField]);

  const handleFieldFocus = useCallback(() => {
    setIsOpened(true);
  }, []);

  const handleFieldKeyDown = useCallback(
    (event) => {
      if (event.ctrlKey && event.key === 'Enter') {
        submit();
      }
    },
    [submit],
  );

  const [handleFieldBlur, handleControlMouseOver, handleControlMouseOut] = useClosableForm(close);

  const handleSubmit = useCallback(
    (event) => {
      event.preventDefault();
      submit();
    },
    [submit],
  );

  useDidUpdate(() => {
    textField.current?.focus();
  }, [selectTextFieldState]);

  return (
    <form onSubmit={handleSubmit}>
      <TextareaAutosize
        ref={textField}
        name="text"
        value={data.text}
        placeholder={t('common.writeComment')}
        minRows={3}
        spellCheck={false}
        className={styles.field}
        onFocus={handleFieldFocus}
        onKeyDown={handleFieldKeyDown}
        onChange={handleFieldChange}
        onBlur={handleFieldBlur}
      />
      {isOpened && (
        <div className={styles.controls}>
          <Button
            type="submit"
            color="tertiary"
            size="small"
            icon={<Icon name="add" type="outlined" size="small" />}
            onMouseOver={handleControlMouseOver}
            onMouseOut={handleControlMouseOut}
          >
            {t('action.addComment')}
          </Button>
        </div>
      )}
    </form>
  );
});

CommentCreate.propTypes = {
  onCreate: PropTypes.func.isRequired,
};

export default CommentCreate;
