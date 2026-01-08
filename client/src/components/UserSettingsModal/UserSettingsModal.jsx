import React from 'react';
import PropTypes from 'prop-types';
import { Modal } from '@openfun/cunningham-react';

import AccountPane from './AccountPane';
import User from '../../ui/User';

import styles from './UserSettingsModal.module.scss';

const UserSettingsModal = React.memo(
  ({
    email,
    name,
    avatarUrl,
    phone,
    organization,
    language,
    subscribeToOwnCards,
    onUpdate,
    onLanguageUpdate,
    onClose,
  }) => {
    return (
      <Modal
        isOpen
        title={
          <div className={styles.modalTitle}>
            <User name={name} avatarUrl={avatarUrl} size="medium" />
            <span>Profil utilisateur</span>
          </div>
        }
        closeIcon
        onClose={onClose}
        closeOnClickOutside
      >
        <AccountPane
          email={email}
          name={name}
          phone={phone}
          organization={organization}
          language={language}
          subscribeToOwnCards={subscribeToOwnCards}
          onUpdate={onUpdate}
          onLanguageUpdate={onLanguageUpdate}
        />
      </Modal>
    );
  },
);

UserSettingsModal.propTypes = {
  email: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  avatarUrl: PropTypes.string,
  phone: PropTypes.string,
  organization: PropTypes.string,
  language: PropTypes.string,
  subscribeToOwnCards: PropTypes.bool.isRequired,
  onUpdate: PropTypes.func.isRequired,
  onLanguageUpdate: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

UserSettingsModal.defaultProps = {
  avatarUrl: undefined,
  phone: undefined,
  organization: undefined,
  language: undefined,
};

export default UserSettingsModal;
