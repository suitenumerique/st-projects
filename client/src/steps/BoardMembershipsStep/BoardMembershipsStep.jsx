import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';

import { Input, Checkbox } from '@openfun/cunningham-react';
import { Icon } from '@gouvfr-lasuite/ui-kit';
import { useField } from '../../hooks';
import PopoverHeader from '../../ui/Popover/PopoverHeader';
import User from '../../ui/User';

import styles from './BoardMembershipsStep.module.scss';

const BoardMembershipsStep = React.memo(
  ({ items, currentUserIds, title, onUserSelect, onUserDeselect, onBack }) => {
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
      <>
        <PopoverHeader
          onBack={onBack}
          title={t(title || 'common.members', {
            context: 'title',
          })}
        />
        <>
          <Input
            ref={searchField}
            value={search}
            name="search"
            className={styles.search}
            label={t('common.searchMembers')}
            icon={<Icon name="search" type="outlined" aria-hidden="true" />}
            onChange={(event) => handleSearchChange(event, { value: event.target.value })}
          />
          <div className={styles.filterList}>
            {filteredItems.map((membership) => (
              <Checkbox
                key={membership.user.id}
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
                    <User
                      name={membership.user.name}
                      avatarUrl={membership.user.avatarUrl}
                      size="small"
                    />
                    <span>{membership.user.name}</span>
                  </div>
                }
              />
            ))}
          </div>
        </>
      </>
    );
  },
);

BoardMembershipsStep.propTypes = {
  /* eslint-disable react/forbid-prop-types */
  items: PropTypes.array.isRequired,
  currentUserIds: PropTypes.array.isRequired,
  /* eslint-enable react/forbid-prop-types */
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
