import PropTypes from 'prop-types';

import styles from './Menu.module.scss';

function Menu({ children }) {
  return <div className={styles.menuWrapper}>{children}</div>;
}

Menu.propTypes = {
  children: PropTypes.node.isRequired,
};

export default Menu;
