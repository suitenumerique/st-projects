import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { Link } from 'react-router-dom';
import { Button, Icon, Menu } from 'semantic-ui-react';
import { usePopup } from '../../lib/popup';

import Paths from '../../constants/Paths';
import NotificationsStep from './NotificationsStep';
import User from '../User';
import UserStep from '../UserStep';

import logo from '../../assets/images/logo.svg';

import styles from './HeaderOverride.module.scss';

const POPUP_PROPS = {
  position: 'bottom right',
};

const Header = React.memo(
  ({
    project,
    user,
    notifications,
    isLogouting,
    canEditProject,
    canEditUsers,
    onProjectSettingsClick,
    onUsersClick,
    onNotificationDelete,
    onUserSettingsClick,
    onLogout,
  }) => {
    const handleProjectSettingsClick = useCallback(() => {
      if (canEditProject) {
        onProjectSettingsClick();
      }
    }, [canEditProject, onProjectSettingsClick]);

    const NotificationsPopup = usePopup(NotificationsStep, POPUP_PROPS);
    const UserPopup = usePopup(UserStep, POPUP_PROPS);

    return (
      <div className={styles.wrapper}>
        <a href={Paths.ROOT} className={styles.logo}>
          <div>
            <img src={logo} alt="Logo" />

            <div>
              <h2>Projets</h2>
              <span>BETA</span>
            </div>
          </div>
        </a>

        {/* {!project && (
          // <Link to={Paths.ROOT} className={classNames(styles.logo, styles.title)}>
          //   <a>
          // </Link>

        )} */}
        <Menu inverted size="large" className={styles.menu}>
          {/* {project && (
            <Menu.Menu position="left">
              <Menu.Item
                as={Link}
                to={Paths.ROOT}
                className={classNames(styles.item, styles.itemHoverable)}
              >
                <Icon fitted name="arrow left" />
              </Menu.Item>
              <Menu.Item className={classNames(styles.item, styles.title)}>
                {project.name}
                {canEditProject && (
                  <Button
                    className={classNames(styles.editButton, styles.target)}
                    onClick={handleProjectSettingsClick}
                  >
                    <Icon fitted name="pencil" size="small" />
                  </Button>
                )}
              </Menu.Item>
            </Menu.Menu>
          )} */}
          <Menu.Menu position="right">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Menu.Item className={classNames(styles.item)} onClick={onLogout}>
                <p className={styles.logout}>Se déconnecter</p>
              </Menu.Item>
              {/* {canEditUsers && (
                <Menu.Item className={classNames(styles.item)} onClick={onUsersClick}>
                  <Icon fitted name="users" />
                </Menu.Item>
              )}
              <NotificationsPopup items={notifications} onDelete={onNotificationDelete}>
                <Menu.Item className={classNames(styles.item)}>
                  <Icon fitted name="bell" />
                  {notifications.length > 0 && (
                    <span className={styles.notification}>{notifications.length}</span>
                  )}
                </Menu.Item>
              </NotificationsPopup> */}
              <button
                type="button"
                className={styles.gauffre}
                title="Les services de La Suite numérique"
              >
                <span>Les services de La Suite numérique</span>
              </button>
            </div>
            {/* <UserPopup
              isLogouting={isLogouting}
              onSettingsClick={onUserSettingsClick}
              onLogout={onLogout}
            >
              <Menu.Item className={classNames(styles.item, styles.itemHoverable)}>
                <span className={styles.userName}>{user.name}</span>
                <User name={user.name} avatarUrl={user.avatarUrl} size="small" />
              </Menu.Item>
            </UserPopup> */}
          </Menu.Menu>
        </Menu>
      </div>
    );
  },
);

Header.propTypes = {
  /* eslint-disable react/forbid-prop-types */
  project: PropTypes.object,
  user: PropTypes.object.isRequired,
  notifications: PropTypes.array.isRequired,
  /* eslint-enable react/forbid-prop-types */
  isLogouting: PropTypes.bool.isRequired,
  canEditProject: PropTypes.bool.isRequired,
  canEditUsers: PropTypes.bool.isRequired,
  onProjectSettingsClick: PropTypes.func.isRequired,
  onUsersClick: PropTypes.func.isRequired,
  onNotificationDelete: PropTypes.func.isRequired,
  onUserSettingsClick: PropTypes.func.isRequired,
  onLogout: PropTypes.func.isRequired,
};

Header.defaultProps = {
  project: undefined,
};

export default Header;
