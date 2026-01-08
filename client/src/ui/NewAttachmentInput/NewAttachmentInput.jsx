import React from 'react';
import PropTypes from 'prop-types';
import { Trans } from 'react-i18next';
import { Icon } from '@gouvfr-lasuite/ui-kit';

import styles from './NewAttachmentInput.module.scss';

const NewAttachmentInput = React.memo(({ onClick }) => {
  const handleKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      if (onClick) {
        onClick(event);
      }
    }
  };

  return (
    <div
      className={styles.wrapper}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
    >
      <div className={styles.content}>
        <div className={styles.iconWrapper}>
          <Icon name="note_add" />
        </div>
        <p className={styles.text}>
          <Trans
            i18nKey="action.selectFile"
            components={[
              <span className={styles.bold} />,
              <br />,
              <span className={styles.link} />,
            ]}
          />
        </p>
      </div>
    </div>
  );
});

NewAttachmentInput.propTypes = {
  onClick: PropTypes.func,
};

NewAttachmentInput.defaultProps = {
  onClick: undefined,
};

export default NewAttachmentInput;
