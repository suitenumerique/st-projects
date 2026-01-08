import React, { useCallback, useMemo, useRef } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';

import { Checkbox } from '@openfun/cunningham-react';
import { Icon } from '@gouvfr-lasuite/ui-kit';
import { useField } from '../../hooks';
import PopoverHeader from '../../ui/Popover/PopoverHeader';
import User from '../../ui/User';

import styles from './BoardMembershipsStep.module.scss';

const BoardMembershipsStep = React.memo(
  ({
    items,
    currentUserIds,
    displayNoMemberOption,
    includeCardsWithoutMembers,
    title,
    onUserSelect,
    onUserDeselect,
    onBack,
  }) => {
    const [t] = useTranslation();
    const [search, handleSearchChange] = useField('');
    const cleanSearch = useMemo(() => search.trim().toLowerCase(), [search]);

    const filteredItems = useMemo(
      () =>
        items.filter(
          ({ user }) =>
            user.email.includes(cleanSearch) ||
            user.name.toLowerCase().includes(cleanSearch) ||
            (user.username && user.username.includes(cleanSearch)),
        ),
      [items, cleanSearch],
    );

    const searchField = useRef(null);

    const handleUserSelect = useCallback(
      (id) => {
        onUserSelect(id);
      },
      [onUserSelect],
    );

    const handleUserDeselect = useCallback(
      (id) => {
        onUserDeselect(id);
      },
      [onUserDeselect],
    );

    return (
      <div style={{ width: '300px' }}>
        <PopoverHeader
          onBack={onBack}
          title={t(title || 'common.members', {
            context: 'title',
          })}
        />
        <div className={styles.searchContainer}>
          <Icon name="search" type="outlined" aria-hidden="true" />
          <input
            ref={searchField}
            value={search}
            name="search"
            className={styles.search}
            onChange={(event) => handleSearchChange(event, { value: event.target.value })}
            placeholder={t('common.searchMembers')}
          />
        </div>
        <div className={styles.filterList}>
          {displayNoMemberOption && (
            <div className={styles.filterItem}>
              <Checkbox
                checked={includeCardsWithoutMembers}
                onChange={() => {
                  if (includeCardsWithoutMembers) {
                    handleUserDeselect(null);
                  } else {
                    handleUserSelect(null);
                  }
                }}
                label={
                  <div className={styles.filterLabel}>
                    <div className={styles.noMember}>
                      <Icon name="person_off" type="outlined" size="small" aria-hidden="true" />
                    </div>
                    <span className={styles.userName}>{t('common.noMembers')}</span>
                  </div>
                }
              />
            </div>
          )}
          {filteredItems.map((membership) => (
            <div className={styles.filterItem} key={membership.user.id}>
              <Checkbox
                disabled={!membership.isPersisted}
                checked={currentUserIds.includes(membership.user.id)}
                onChange={() => {
                  if (currentUserIds.includes(membership.user.id)) {
                    handleUserDeselect(membership.user.id);
                  } else {
                    handleUserSelect(membership.user.id);
                  }
                }}
                label={
                  <div className={styles.filterLabel}>
                    <div className={styles.userAvatar}>
                      <User
                        name={membership.user.name}
                        avatarUrl={membership.user.avatarUrl}
                        size="small"
                      />
                    </div>
                    <span className={styles.userName}>{membership.user.name}</span>
                  </div>
                }
              />
            </div>
          ))}
        </div>
      </div>
    );
  },
);

BoardMembershipsStep.propTypes = {
  /* eslint-disable react/forbid-prop-types */
  items: PropTypes.array.isRequired,
  currentUserIds: PropTypes.array.isRequired,
  displayNoMemberOption: PropTypes.bool.isRequired,
  /* eslint-enable react/forbid-prop-types */
  includeCardsWithoutMembers: PropTypes.bool.isRequired,
  title: PropTypes.string,
  onUserSelect: PropTypes.func.isRequired,
  onUserDeselect: PropTypes.func.isRequired,
  onBack: PropTypes.func,
};

BoardMembershipsStep.defaultProps = {
  title: 'common.members',
  onBack: undefined,
};

export default BoardMembershipsStep;
