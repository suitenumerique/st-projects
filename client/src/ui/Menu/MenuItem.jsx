import PropTypes from 'prop-types';
import { useCallback } from 'react';

import styles from './MenuItem.module.scss';

function MenuItem({ onClick, children }) {
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
      {children}
    </button>
  );
}

MenuItem.propTypes = {
  onClick: PropTypes.func,
  children: PropTypes.node,
};

MenuItem.defaultProps = {
  onClick: () => {},
  children: undefined,
};

export default MenuItem;
