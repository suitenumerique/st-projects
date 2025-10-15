import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';

import classNames from 'classnames';
import { Input } from '@openfun/cunningham-react';
import { Icon } from '@gouvfr-lasuite/ui-kit';
import { useField } from '../../hooks';
import MenuItem from '../../ui/Menu/MenuItem';
import PopoverHeader from '../../ui/Popover/PopoverHeader';
import Menu from '../../ui/Menu';
import User from '../../components/User';

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

    useEffect(() => {
      searchField.current.focus({
        preventScroll: true,
      });
    }, []);

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
          {filteredItems.length > 0 && (
            <Menu>
              {filteredItems.map((item) => (
                <MenuItem
                  active={currentUserIds.includes(item.user.id)}
                  disabled={!item.isPersisted}
                  key={item.user.id}
                  onClick={() => {
                    if (currentUserIds.includes(item.user.id)) {
                      handleUserDeselect(item.user.id);
                    } else {
                      handleUserSelect(item.user.id);
                    }
                  }}
                >
                  <div className={styles.menuItem}>
                    <User
                      className={styles.user}
                      name={item.user.name}
                      size="small"
                      avatarUrl={item.user.avatarUrl}
                    />
                    <div
                      className={classNames(
                        styles.menuItemText,
                        currentUserIds.includes(item.user.id) && styles.menuItemTextActive,
                      )}
                    >
                      {item.user.name}
                    </div>
                    {currentUserIds.includes(item.user.id) && (
                      <Icon
                        name="check"
                        type="outlined"
                        aria-hidden="true"
                        className={styles.menuItemIcon}
                      />
                    )}
                  </div>
                </MenuItem>
              ))}
            </Menu>
          )}
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
