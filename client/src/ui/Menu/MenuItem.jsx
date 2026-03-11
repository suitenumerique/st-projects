import PropTypes from 'prop-types';
import React, { useCallback } from 'react';

import { Icon } from '@gouvfr-lasuite/ui-kit';
import styles from './MenuItem.module.scss';

function MenuItem({ onClick, children, icon }) {
  const onKeyDown = useCallback(
    (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        onClick();
      }
    },
    [onClick],
  );

  return (
    <button
      type="button"
      onClick={onClick}
      tabIndex={0}
      onKeyDown={onKeyDown}
      className={styles.menuItem}
    >
      {icon && <Icon name={icon} className={styles.icon} type="outlined" />}
      {children}
    </button>
  );
}

MenuItem.propTypes = {
  onClick: PropTypes.func,
  children: PropTypes.node,
  icon: PropTypes.string,
};

MenuItem.defaultProps = {
  onClick: () => {},
  children: undefined,
  icon: undefined,
};

export default React.memo(MenuItem);
