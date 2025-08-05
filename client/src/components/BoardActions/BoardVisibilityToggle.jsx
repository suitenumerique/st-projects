import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { Button, Icon } from 'semantic-ui-react';

import styles from './BoardVisibilityToggle.module.scss';

const BoardVisibilityToggle = React.memo(({ isPublic, onToggle }) => {
  const handleToggle = useCallback(() => {
    onToggle(!isPublic);
  }, [isPublic, onToggle]);

  return (
    <div className={styles.wrapper}>
      <Button
        icon
        labelPosition="left"
        size="small"
        onClick={handleToggle}
        className={styles.toggleButton}
      >
        <Icon name={isPublic ? 'unlock' : 'lock'} />
        {isPublic ? 'Public' : 'Privé'}
      </Button>
    </div>
  );
});

BoardVisibilityToggle.propTypes = {
  isPublic: PropTypes.bool.isRequired,
  onToggle: PropTypes.func.isRequired,
};

export default BoardVisibilityToggle;
