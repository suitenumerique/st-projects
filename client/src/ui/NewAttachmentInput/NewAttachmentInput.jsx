import React from 'react';
import PropTypes from 'prop-types';

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
          <span className={styles.bold}>Glisser déposer</span> ou
          <br />
          <span className={styles.link}>cliquer ici pour téléverser un fichier</span>
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
