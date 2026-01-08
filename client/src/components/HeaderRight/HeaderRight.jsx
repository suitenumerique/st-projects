import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import { DropdownMenu, Icon, LaGaufre } from '@gouvfr-lasuite/ui-kit';
import { Button } from '@openfun/cunningham-react';

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
    onLogout,
  }) => {
    const [isOpen, setIsOpen] = useState(false);
    const { t } = useTranslation();

    const NotificationsPopover = usePopup(NotificationsStep);

    return (
      <>
        {currentUser && (
          <>
            <NotificationsPopover
              items={notifications}
              onDelete={onNotificationDelete}
              side="bottom"
              align="center"
            >
              <Button
                color="primary-text"
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
                color="primary-text"
                icon={<Icon name="person" type="outlined" />}
                onClick={() => setIsOpen(!isOpen)}
              />
              <Button
                className={styles.overSm}
                color="primary-text"
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
        )}

        <LaGaufre widgetPath={lagaufreWidgetPath} apiUrl={lagaufreWidgetApiUrl} />
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
  onLogout: PropTypes.func.isRequired,
  onNotificationDelete: PropTypes.func.isRequired,
};

HeaderRight.defaultProps = {};

export default HeaderRight;
