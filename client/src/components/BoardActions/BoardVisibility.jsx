import React, { useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import { usePopup } from '../../lib/popup';

import BoardVisibilityStep from '../BoardVisibilityStep';

import styles from './BoardVisibility.module.scss';

const BoardVisibility = React.memo(({ isPublic, onToggle }) => {
  const BoardVisibilityPopup = usePopup(BoardVisibilityStep);
  const [isCopied, setIsCopied] = useState(false);

  const handleToggle = useCallback(
    (data, onClose) => {
      const newValue = data === 'public';
      if (newValue !== isPublic) {
        onToggle({ isPublic: newValue });
      }
      if (onClose) {
        onClose();
      }
    },
    [isPublic, onToggle],
  );

  return (
    <div className={styles.visibilityWrapper}>
      <BoardVisibilityPopup handleToggle={handleToggle} hideCloseButton>
        <button type="button" className={styles.visibilityButton}>
          <span
            aria-hidden="true"
            className={isPublic ? 'fr-icon-earth-fill' : 'fr-icon-lock-line'}
          />
          <span className={styles.visibilityTitle}>{isPublic ? 'Public' : 'Privé'}</span>
          <span className="fr-icon-arrow-down-s-line" aria-hidden="true" />
        </button>
      </BoardVisibilityPopup>
      {isPublic && (
        <button
          onClick={() => {
            navigator.clipboard.writeText(window.location.href);
            setIsCopied(true);
            setTimeout(() => {
              setIsCopied(false);
            }, 2000);
          }}
          type="button"
          className={styles.copyLinkButton}
        >
          <span
            className={isCopied ? 'fr-icon-check-line' : 'fr-icon-links-line'}
            aria-hidden="true"
          />
          <span className={styles.copyLinkButtonText}>
            {isCopied ? 'Lien copié' : 'Copier le lien'}
          </span>
        </button>
      )}
    </div>
  );
});

BoardVisibility.propTypes = {
  isPublic: PropTypes.bool.isRequired,
  onToggle: PropTypes.func.isRequired,
};

export default BoardVisibility;
