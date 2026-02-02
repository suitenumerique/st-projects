import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import DatePicker from 'react-datepicker';
import { Button } from '@openfun/cunningham-react';
import { Icon } from '@gouvfr-lasuite/ui-kit';
import { useDidUpdate, useToggle } from '../../lib/hooks';

import 'react-datepicker/dist/react-datepicker.css';

import { useForm } from '../../hooks';
import parseTime from '../../utils/parse-time';

import PopoverHeader from '../../ui/Popover/PopoverHeader';

import styles from './DueDateEditStep.module.scss';

const DueDateEditStep = React.memo(({ defaultValue, onUpdate, onBack, onClose }) => {
  const [t] = useTranslation();

  const [data, handleFieldChange, setData] = useForm(() => {
    const date = defaultValue || new Date().setHours(12, 0, 0, 0);

    return {
      date: t('format:date', {
        postProcess: 'formatDate',
        value: date,
      }),
      time: t('format:time', {
        postProcess: 'formatDate',
        value: date,
      }),
    };
  });

  const [selectTimeFieldState, selectTimeField] = useToggle();

  const dateField = useRef(null);
  const timeField = useRef(null);

  const nullableDate = useMemo(() => {
    const date = t('format:date', {
      postProcess: 'parseDate',
      value: data.date,
    });

    if (Number.isNaN(date.getTime())) {
      return null;
    }

    return date;
  }, [data.date, t]);

  const handleDatePickerChange = useCallback(
    (date) => {
      setData((prevData) => ({
        ...prevData,
        date: t('format:date', {
          postProcess: 'formatDate',
          value: date,
        }),
      }));
      selectTimeField();
    },
    [setData, selectTimeField, t],
  );

  const handleSubmit = useCallback(() => {
    if (!nullableDate) {
      dateField.current.select();
      return;
    }

    let value = t('format:dateTime', {
      postProcess: 'parseDate',
      value: `${data.date} ${data.time}`,
    });

    if (Number.isNaN(value.getTime())) {
      value = parseTime(data.time, nullableDate);

      if (Number.isNaN(value.getTime())) {
        timeField.current.select();
        return;
      }
    }

    if (!defaultValue || value.getTime() !== defaultValue.getTime()) {
      onUpdate(value);
    }

    onClose();
  }, [defaultValue, onUpdate, onClose, data, nullableDate, t]);

  const handleClearClick = useCallback(() => {
    if (defaultValue) {
      onUpdate(null);
    }

    onClose();
  }, [defaultValue, onUpdate, onClose]);

  useEffect(() => {
    dateField.current.select();
  }, []);

  useDidUpdate(() => {
    timeField.current.select();
  }, [selectTimeFieldState]);

  return (
    <>
      <PopoverHeader
        onBack={onBack}
        title={t('common.editDueDate', {
          context: 'title',
        })}
      />
      <form onSubmit={handleSubmit} style={{ width: '280px' }}>
        <div className={styles.fieldWrapper}>
          <div className={styles.fieldBox}>
            <div className={styles.text}>{t('common.date')}</div>
            <input
              ref={dateField}
              label={t('common.date')}
              name="date"
              value={data.date}
              onChange={handleFieldChange}
            />
          </div>
          <div className={styles.fieldBox}>
            <div className={styles.text}>{t('common.time')}</div>
            <input
              ref={timeField}
              label={t('common.time')}
              name="time"
              value={data.time}
              onChange={handleFieldChange}
            />
          </div>
        </div>
        <DatePicker
          inline
          disabledKeyboardNavigation
          selected={nullableDate}
          onChange={handleDatePickerChange}
        />
        <div className={styles.buttonsWrapper}>
          <Button type="submit" color="brand" variant="primary">
            {t('action.save')}
          </Button>
          <Button
            color="error"
            variant="bordered"
            icon={<Icon type="outlined" name="delete" />}
            onClick={handleClearClick}
          />
        </div>
      </form>
    </>
  );
});

DueDateEditStep.propTypes = {
  defaultValue: PropTypes.instanceOf(Date),
  onUpdate: PropTypes.func.isRequired,
  onBack: PropTypes.func,
  onClose: PropTypes.func.isRequired,
};

DueDateEditStep.defaultProps = {
  defaultValue: undefined,
  onBack: undefined,
};

export default DueDateEditStep;
