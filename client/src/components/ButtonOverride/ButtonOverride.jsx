import React from 'react';
import PropTypes from 'prop-types';

import styles from './ButtonOverride.module.scss';

const ButtonOverride = React.memo(
  ({ priority, type, className, onClick, onMouseOver, onMouseOut, onFocus, onBlur, ...props }) => {
    const classNames = [styles.buttonOverride, styles[priority], className].join(' ');

    return (
      /* eslint-disable react/button-has-type */
      <button
        type={type}
        className={classNames}
        onClick={onClick}
        onMouseOver={onMouseOver}
        onMouseOut={onMouseOut}
        onFocus={onFocus}
        onBlur={onBlur}
      >
        {props.children}
      </button>
      /* eslint-enable react/button-has-type */
    );
  },
);

ButtonOverride.propTypes = {
  children: PropTypes.node.isRequired,
  priority: PropTypes.oneOf(['primary', 'secondary', 'tertiary']),
  type: PropTypes.string,
  onClick: PropTypes.func,
  className: PropTypes.string,
  onMouseOver: PropTypes.func,
  onMouseOut: PropTypes.func,
  onFocus: PropTypes.func,
  onBlur: PropTypes.func,
};

ButtonOverride.defaultProps = {
  priority: 'primary',
  type: 'button',
  className: '',
  onClick: () => {},
  onMouseOver: () => {},
  onMouseOut: () => {},
  onFocus: () => {},
  onBlur: () => {},
};

export default ButtonOverride;
