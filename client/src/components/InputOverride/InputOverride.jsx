import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';

import styles from './InputOverride.module.scss';

const InputOverride = React.memo(
  forwardRef(({ name, value, className, placeholder, onChange, onKeyDown, onBlur }, ref) => {
    const classNames = [styles.inputOverride, className].join(' ');

    const handleChange = (event) => {
      onChange(event, {
        name,
        value: event.target.value,
      });
    };

    return (
      <input
        ref={ref}
        name={name}
        value={value}
        onChange={handleChange}
        className={classNames}
        placeholder={placeholder}
        onKeyDown={onKeyDown}
        onBlur={onBlur}
      />
    );
  }),
);

InputOverride.propTypes = {
  name: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  className: PropTypes.string,
  placeholder: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  onKeyDown: PropTypes.func,
  onBlur: PropTypes.func,
};

InputOverride.defaultProps = {
  className: '',
  placeholder: '',
  onKeyDown: () => {},
  onBlur: () => {},
};

export default InputOverride;
