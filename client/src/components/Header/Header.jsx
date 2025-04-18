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
        {!project && (
          // <Link to={Paths.ROOT} className={classNames(styles.logo, styles.title)}>
          //   <a>
          // </Link>
          <a href={Paths.ROOT} className={styles.logo}>
            <div className="sc-84f88048-0 cYoDnk">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 32 33"
                aria-label="Logo Docs"
                width="32"
              >
                <path
                  fill="#C9191E"
                  d="M21.63 29.581c1.168-.327 2.287-.925 3.02-1.98.725-1.035.929-2.346.929-3.608V5.5q0-.492-.057-.98.87.344 1.34 1.131.556.898.556 2.362v18.782q0 1.983-.972 2.969-.973.984-2.93.985H16.42l.505-.091a54 54 0 0 0 4.693-1.074z"
                />
                <path
                  fill="#000091"
                  fillRule="evenodd"
                  d="M4.582 26.405V7.598q0-1.718.922-2.602.934-.885 2.476-.973a77 77 0 0 0 4.307-.379 77 77 0 0 0 7.528-1.313q1.819-.43 2.791.43.973.858.973 2.74v18.492q0 1.654-.569 2.463-.569.82-1.92 1.2-2.4.656-4.521 1.035a51 51 0 0 1-4.143.594q-2.021.202-4.143.316-1.755.1-2.728-.733-.973-.82-.973-2.463m4.627-15.393q2.781-.177 5.099-.544a84 84 0 0 0 1.121-.19.816.816 0 0 0 .672-.805.826.826 0 0 0-.966-.811q-.434.074-.871.144a54 54 0 0 1-5.069.542c-.277.018-.497.104-.639.276a.9.9 0 0 0-.2.581q0 .342.23.587l.002.002a.76.76 0 0 0 .62.218m-.001 4.194q2.783-.178 5.1-.544a82 82 0 0 0 4.603-.885c.308-.069.539-.177.654-.344a.93.93 0 0 0 .17-.55q-.001-.347-.259-.59c-.184-.174-.441-.215-.746-.152h-.002a70 70 0 0 1-4.465.858 54 54 0 0 1-5.068.542c-.277.018-.497.104-.639.277a.87.87 0 0 0-.2.568q0 .353.23.6l.004.004a.82.82 0 0 0 .616.216zm0 4.193a58 58 0 0 0 5.1-.556 75 75 0 0 0 4.603-.873c.309-.069.54-.18.655-.357a.9.9 0 0 0 .169-.536c0-.23-.088-.43-.259-.59-.184-.175-.441-.215-.746-.152h-.001q-2.17.48-4.465.845a57 57 0 0 1-5.069.555c-.277.018-.497.104-.639.276a.87.87 0 0 0-.2.569q0 .353.23.599l.004.004a.82.82 0 0 0 .616.217zm5.1 3.608a55 55 0 0 1-5.1.544.76.76 0 0 1-.62-.218l-.002-.002a.83.83 0 0 1-.23-.587q0-.336.2-.581c.142-.172.362-.259.64-.277a54 54 0 0 0 5.939-.685c.503-.086.966.3.966.811a.816.816 0 0 1-.672.804q-.56.1-1.122.191"
                  clipRule="evenodd"
                />
              </svg>

              <div className="sc-84f88048-0 kbdgfp">
                <h2 className="sc-84f88048-0 sc-82726244-0 hZfzbe bLTRUG">Projets</h2>
                <span className="sc-84f88048-0 sc-82726244-0 inLuuM hcnswn">BETA</span>
              </div>
            </div>
          </a>
        )}
        <Menu inverted size="large" className={styles.menu}>
          {project && (
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
          )}
          <Menu.Menu position="right">
            {canEditUsers && (
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
            </NotificationsPopup>
            <button
              type="button"
              className={styles.gauffre}
              title="Les services de La Suite numérique"
            >
              <span>Les services de La Suite numérique</span>
            </button>
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
