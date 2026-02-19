import React from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { Button } from '@gouvfr-lasuite/cunningham-react';

import PopoverHeader from '../../ui/Popover/PopoverHeader';

import styles from './DeleteStep.module.scss';

const DeleteStep = React.memo(({ title, content, buttonContent, onConfirm, onBack }) => {
  const [t] = useTranslation();

  return (
    <>
      <PopoverHeader
        title={t(title, {
          context: 'title',
        })}
        onBack={onBack}
      />
      <div>
        <div className={styles.content}>{t(content)}</div>
        <div className={styles.buttons}>
          <Button color="error" variant="primary" onClick={onConfirm}>
            {t(buttonContent)}
          </Button>
        </div>
      </div>
    </>
  );
});

DeleteStep.propTypes = {
  title: PropTypes.string.isRequired,
  content: PropTypes.string.isRequired,
  buttonContent: PropTypes.string.isRequired,
  onConfirm: PropTypes.func.isRequired,
  onBack: PropTypes.func,
};

DeleteStep.defaultProps = {
  onBack: undefined,
};

export default DeleteStep;
