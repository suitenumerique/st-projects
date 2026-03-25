import React, { useCallback, useRef } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import TextareaAutosize from 'react-textarea-autosize';
import { useDidUpdate, useToggle } from '../../../../lib/hooks';

import { useForm } from '../../../../hooks';

import styles from './CommentCreate.module.scss';

const DEFAULT_DATA = {
  text: '',
};

const CommentCreate = React.memo(({ onCreate }) => {
  const [t] = useTranslation();
  const [data, handleFieldChange, setData] = useForm(DEFAULT_DATA);
  const [selectTextFieldState, selectTextField] = useToggle();

  const textField = useRef(null);

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

  const handleFieldKeyDown = useCallback(
    (event) => {
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        submit();
      }
    },
    [submit],
  );

  useDidUpdate(() => {
    textField.current?.focus();
  }, [selectTextFieldState]);

  return (
    <TextareaAutosize
      ref={textField}
      name="text"
      value={data.text}
      placeholder={t('common.writeComment')}
      minRows={3}
      spellCheck={false}
      className={styles.field}
      onKeyDown={handleFieldKeyDown}
      onChange={handleFieldChange}
    />
  );
});

CommentCreate.propTypes = {
  onCreate: PropTypes.func.isRequired,
};

export default CommentCreate;
