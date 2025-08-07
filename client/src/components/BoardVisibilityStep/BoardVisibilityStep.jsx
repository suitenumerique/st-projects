import React from 'react';
import PropTypes from 'prop-types';
import { Popup } from '../../lib/custom-ui';

import styles from './BoardVisibilityStep.module.scss';

const BoardVisibilityStep = React.memo(({ handleToggle, onClose }) => {
  return (
    <Popup.Content>
      <div className={styles.visibilityStepWrapper}>
        <button
          className={styles.visibilityStep}
          onClick={() => handleToggle('private', onClose)}
          type="button"
        >
          <div className={styles.visibilityStepTitle}>
            <span className="fr-icon-lock-line" aria-hidden="true" />
            Privé
          </div>
          <div className={styles.visibilityStepDescription}>
            Seules les personnes invitées peuvent accéder au tableau
          </div>
        </button>
        <button
          className={styles.visibilityStep}
          onClick={() => handleToggle('public', onClose)}
          type="button"
        >
          <div className={styles.visibilityStepTitle}>
            <span className="fr-icon-earth-fill" aria-hidden="true" />
            Public
          </div>
          <div className={styles.visibilityStepDescription}>
            N&apos;importe qui avec le lien peut voir le tableau
          </div>
        </button>
      </div>
    </Popup.Content>
  );
});

BoardVisibilityStep.propTypes = {
  handleToggle: PropTypes.func.isRequired,
  onClose: PropTypes.func,
};

BoardVisibilityStep.defaultProps = {
  onClose: undefined,
};

export default BoardVisibilityStep;
