import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import { DropdownMenu, UserMenu } from '@gouvfr-lasuite/ui-kit';
import { Button } from '@openfun/cunningham-react';
import LaGaufreButton from '../../ui/LaGaufreButton';

// import NotificationsStep from '../../steps/NotificationsStep';
// import usePopup from '../../lib/popup';

const HeaderRight = React.memo(
  ({
    currentUser,
    reactAppLagaufreWidgetApiUrl,
    reactAppLagaufreWidgetPath,
    onLogout,
    onLogin,
  }) => {
    // const NotificationsPopover = usePopup(NotificationsStep, {
    //   side: 'bottom',
    //   align: 'end',
    // });

    if (currentUser) {
      window.posthog.identify(currentUser.id, {
        email: currentUser.email,
      });
    }

    return (
      <>
        {/* <NotificationsPopover items={notifications} onDelete={onNotificationDelete}>
          <Button color="brand" variant="tertiary" className={styles.notificationButton}>
            <Icon type="outlined" name="notifications" />
            {/* {notifications.length >= 0 && (
            <span className={styles.notification}>{notifications.length}</span>
          )}
          </Button>
        </NotificationsPopover> */}

        <LaGaufreButton
          reactAppLagaufreWidgetApiUrl={reactAppLagaufreWidgetApiUrl}
          reactAppLagaufreWidgetPath={reactAppLagaufreWidgetPath}
        />

        {currentUser ? (
          <UserMenu user={currentUser} logout={onLogout} />
        ) : (
          <Button color="brand" variant="tertiary" onClick={onLogin}>
            Connexion
          </Button>
        )}

        {/* <LanguagePicker currentUser={currentUser} onLanguageUpdate={onLanguageUpdate} /> */}
      </>
    );
  },
);

const LanguagePicker = React.memo(({ currentUser, onLanguageUpdate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { i18n } = useTranslation();

  const [selectedValues, setSelectedValues] = useState([
    currentUser?.language || i18n.language.toLowerCase(),
  ]);

  const languages = [
    { label: 'Français', value: 'fr-fr' },
    { label: 'English', value: 'en-us' },
  ];

  useEffect(() => {
    if (currentUser?.language) {
      i18n.changeLanguage(currentUser.language);
    }
  }, [currentUser?.language, i18n]);

  return (
    <DropdownMenu
      options={languages}
      isOpen={isOpen}
      onOpenChange={setIsOpen}
      onSelectValue={(value) => {
        setSelectedValues([value]);
        i18n.changeLanguage(value);
        onLanguageUpdate(value);
      }}
      selectedValues={selectedValues}
    >
      <Button
        onClick={() => setIsOpen(!isOpen)}
        color="brand"
        variant="tertiary"
        className="c__language-picker"
        icon={
          <span className="material-icons">{isOpen ? 'arrow_drop_up' : 'arrow_drop_down'}</span>
        }
        iconPosition="right"
      >
        <span className="material-icons">translate</span>
        <span className="c__language-picker__label">
          {languages.find((lang) => lang.value === selectedValues[0])?.label}
        </span>
      </Button>
    </DropdownMenu>
  );
});

LanguagePicker.propTypes = {
  /* eslint-disable react/forbid-prop-types */
  currentUser: PropTypes.object.isRequired,
  onLanguageUpdate: PropTypes.func.isRequired,
};

HeaderRight.propTypes = {
  /* eslint-disable react/forbid-prop-types */
  currentUser: PropTypes.object.isRequired,
  onLogout: PropTypes.func.isRequired,
  onLogin: PropTypes.func.isRequired,
  // notifications: PropTypes.array.isRequired,
  // onNotificationDelete: PropTypes.func.isRequired,
  // onLanguageUpdate: PropTypes.func.isRequired,
  reactAppLagaufreWidgetApiUrl: PropTypes.string.isRequired,
  reactAppLagaufreWidgetPath: PropTypes.string.isRequired,
};

HeaderRight.defaultProps = {};

export default HeaderRight;
