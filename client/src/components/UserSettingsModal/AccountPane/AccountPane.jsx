import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { Input, Select, Switch } from '@openfun/cunningham-react';
import { HorizontalSeparator } from '@gouvfr-lasuite/ui-kit';

import locales from '../../../locales';

import styles from './AccountPane.module.scss';

const AccountPane = React.memo(
  ({
    email,
    name,
    phone,
    organization,
    language,
    subscribeToOwnCards,
    onUpdate,
    onLanguageUpdate,
  }) => {
    const [t] = useTranslation();

    const handleSubscribeToOwnCardsChange = useCallback(() => {
      onUpdate({
        subscribeToOwnCards: !subscribeToOwnCards,
      });
    }, [subscribeToOwnCards, onUpdate]);

    const handleLanguageChange = useCallback(
      (_, { value }) => {
        onLanguageUpdate(value === 'auto' ? null : value); // FIXME: hack
      },
      [onLanguageUpdate],
    );

    return (
      <div className={styles.wrapper}>
        <div className={styles.info}>
          <Input name="email" label={t('common.email')} value={email} disabled fullWidth />
          <Input name="name" label={t('common.name')} value={name} disabled fullWidth />
          {!!phone && (
            <Input name="phone" label={t('common.phone')} value={phone} disabled fullWidth />
          )}
          {!!organization && (
            <Input
              name="organization"
              label={t('common.organization')}
              value={organization}
              disabled
              fullWidth
            />
          )}
        </div>
        <HorizontalSeparator />
        <Switch
          label={t('common.subscribeToMyOwnCardsByDefault')}
          checked={subscribeToOwnCards}
          onChange={handleSubscribeToOwnCardsChange}
        />
        <HorizontalSeparator />
        <Select
          label={t('common.language', {
            context: 'title',
          })}
          options={[
            {
              value: 'auto',
              label: t('common.detectAutomatically'),
            },
            ...locales.map((locale) => ({
              value: locale.language,
              label: locale.name,
            })),
          ]}
          defaultValue={language || 'auto'}
          clearable={false}
          onChange={(event) => {
            handleLanguageChange(event.target.value);
          }}
          fullWidth
        />
      </div>
    );
  },
);

AccountPane.propTypes = {
  email: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  phone: PropTypes.string,
  organization: PropTypes.string,
  language: PropTypes.string,
  subscribeToOwnCards: PropTypes.bool.isRequired,
  onUpdate: PropTypes.func.isRequired,
  onLanguageUpdate: PropTypes.func.isRequired,
};

AccountPane.defaultProps = {
  phone: undefined,
  organization: undefined,
  language: undefined,
};

export default AccountPane;
