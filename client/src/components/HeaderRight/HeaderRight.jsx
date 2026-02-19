import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import { Button } from '@gouvfr-lasuite/cunningham-react';
import { DropdownMenu, Icon, LaGaufreV2 } from '@gouvfr-lasuite/ui-kit';

import NotificationsStep from '../../steps/NotificationsStep';
import usePopup from '../../lib/popup/use-popup';

import styles from './HeaderRight.module.scss';

const HeaderRight = React.memo(
  ({
    currentUser,
    notifications,
    lagaufreWidgetApiUrl,
    lagaufreWidgetPath,
    onNotificationDelete,
    onSettingsClick,
    onLogin,
    onLogout,
  }) => {
    const [isOpen, setIsOpen] = useState(false);
    const { t } = useTranslation();

    const NotificationsPopover = usePopup(NotificationsStep);

    return (
      <>
        {currentUser ? (
          <>
            <NotificationsPopover
              items={notifications}
              onDelete={onNotificationDelete}
              side="bottom"
              align="center"
            >
              <Button
                variant="tertiary"
                icon={
                  <>
                    <Icon type="outlined" name="notifications" />
                    {notifications.length > 0 && (
                      <span className={styles.notification}>{notifications.length}</span>
                    )}
                  </>
                }
                className={styles.notificationButton}
              />
            </NotificationsPopover>

            <DropdownMenu
              options={[
                {
                  label: t('common.settings', {
                    context: 'title',
                  }),
                  icon: <Icon name="manage_accounts" type="outlined" />,
                  callback: onSettingsClick,
                },
                {
                  label: t('action.logOut_title'),
                  icon: <Icon name="logout" type="outlined" />,
                  callback: onLogout,
                },
              ]}
              isOpen={isOpen}
              onOpenChange={setIsOpen}
            >
              <Button
                className={styles.onlySm}
                variant="tertiary"
                icon={<Icon name="person" type="outlined" />}
                onClick={() => setIsOpen(!isOpen)}
              />
              <Button
                className={styles.overSm}
                variant="tertiary"
                onClick={() => setIsOpen(!isOpen)}
                icon={
                  <span className="material-icons">
                    {isOpen ? 'arrow_drop_up' : 'arrow_drop_down'}
                  </span>
                }
                iconPosition="right"
              >
                {t('common.myAccount')}
              </Button>
            </DropdownMenu>
          </>
        ) : (
          <Button color="brand" variant="tertiary" onClick={onLogin}>
            Connexion
          </Button>
        )}

        <LaGaufreV2 widgetPath={lagaufreWidgetPath} apiUrl={lagaufreWidgetApiUrl} />
      </>
    );
  },
);

HeaderRight.propTypes = {
  currentUser: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  notifications: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  lagaufreWidgetApiUrl: PropTypes.string.isRequired,
  lagaufreWidgetPath: PropTypes.string.isRequired,
  onSettingsClick: PropTypes.func.isRequired,
  onLogin: PropTypes.func.isRequired,
  onLogout: PropTypes.func.isRequired,
  onNotificationDelete: PropTypes.func.isRequired,
};

HeaderRight.defaultProps = {};

export default HeaderRight;
