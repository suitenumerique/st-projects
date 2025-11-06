import classNames from 'classnames';
import PropTypes from 'prop-types';
import styles from './Badge.module.scss';

function Badge({ children, uppercased = false, type = 'accent', className, ...props }) {
  return (
    <div
      className={classNames(className, styles.badge, {
        [styles.badgeUppercased]: uppercased,
        [styles.badgeAccent]: type === 'accent',
        [styles.badgeNeutral]: type === 'neutral',
        [styles.badgeDanger]: type === 'danger',
        [styles.badgeSuccess]: type === 'success',
        [styles.badgeWarning]: type === 'warning',
        [styles.badgeInfo]: type === 'info',
      })}
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...props}
    >
      {children}
    </div>
  );
}

Badge.propTypes = {
  children: PropTypes.node.isRequired,
  uppercased: PropTypes.bool,
  type: PropTypes.string,
  className: PropTypes.string,
};

Badge.defaultProps = {
  uppercased: false,
  type: 'accent',
  className: '',
};

export default Badge;
