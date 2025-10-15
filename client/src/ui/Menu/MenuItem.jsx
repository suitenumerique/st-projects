import PropTypes from 'prop-types';
import { useCallback } from 'react';
import classNames from 'classnames';

import styles from './MenuItem.module.scss';

function MenuItem({ onClick, active, children }) {
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
      className={classNames(styles.menuItem, active && styles.menuItemActive)}
    >
      {children}
    </button>
  );
}

MenuItem.propTypes = {
  onClick: PropTypes.func,
  active: PropTypes.bool,
  children: PropTypes.node,
};

MenuItem.defaultProps = {
  onClick: () => {},
  active: false,
  children: undefined,
};

export default MenuItem;
