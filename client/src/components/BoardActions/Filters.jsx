import React, { useCallback, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { Icon } from 'semantic-ui-react';
import { usePopup } from '../../lib/popup';
import { Input } from '../../lib/custom-ui';

import User from '../User';
import Label from '../Label';
import BoardMembershipsStep from '../BoardMembershipsStep';
import LabelsStep from '../LabelsStep';

import InputOverride from '../InputOverride';

import styles from './FiltersOverride.module.scss';

const Filters = React.memo(
  ({
    users,
    labels,
    filterText,
    allBoardMemberships,
    allLabels,
    canEdit,
    onUserAdd,
    onUserRemove,
    onLabelAdd,
    onLabelRemove,
    onLabelCreate,
    onLabelUpdate,
    onLabelMove,
    onLabelDelete,
    onTextFilterUpdate,
    isCurrentUserMember,
  }) => {
    const [t] = useTranslation();
    const [isSearchFocused, setIsSearchFocused] = useState(false);

    const searchFieldRef = useRef(null);

    const cancelSearch = useCallback(() => {
      onTextFilterUpdate('');
      searchFieldRef.current.blur();
    }, [onTextFilterUpdate]);

    const handleRemoveUserClick = useCallback(
      (id) => {
        onUserRemove(id);
      },
      [onUserRemove],
    );

    const handleRemoveLabelClick = useCallback(
      (id) => {
        onLabelRemove(id);
      },
      [onLabelRemove],
    );

    const handleSearchChange = useCallback(
      (_, { value }) => {
        onTextFilterUpdate(value);
      },
      [onTextFilterUpdate],
    );

    const handleSearchFocus = useCallback(() => {
      setIsSearchFocused(true);
    }, []);

    const handleSearchKeyDown = useCallback(
      (event) => {
        if (event.key === 'Escape') {
          cancelSearch();
        }
      },
      [cancelSearch],
    );

    const handleSearchBlur = useCallback(() => {
      setIsSearchFocused(false);
    }, []);

    const handleCancelSearchClick = useCallback(() => {
      cancelSearch();
    }, [cancelSearch]);

    const BoardMembershipsPopup = usePopup(BoardMembershipsStep);
    const LabelsPopup = usePopup(LabelsStep);

    const isSearchActive = filterText || isSearchFocused;

    return (
      <>
        {isCurrentUserMember && (
          <span className={styles.filter}>
            <BoardMembershipsPopup
              items={allBoardMemberships}
              currentUserIds={users.map((user) => user.id)}
              title="common.filterByMembers"
              onUserSelect={onUserAdd}
              onUserDeselect={onUserRemove}
            >
              <button
                type="button"
                className={classNames(styles.filterButton, styles.filterButtonMembers)}
              >
                <span className="fr-icon-user-line" aria-hidden="true" />
                {users.length === 0 && <span className={styles.filterTitle}>Membres</span>}
                {users.map((user) => (
                  <span key={user.id} className={styles.filterItem}>
                    <User name={user.name} avatarUrl={user.avatarUrl} size="tiny" />
                  </span>
                ))}
              </button>
            </BoardMembershipsPopup>
          </span>
        )}
        {isCurrentUserMember && (
          <span className={styles.filter}>
            <LabelsPopup
              items={allLabels}
              currentIds={labels.map((label) => label.id)}
              title="common.filterByLabels"
              canEdit={canEdit}
              onSelect={onLabelAdd}
              onDeselect={onLabelRemove}
              onCreate={onLabelCreate}
              onUpdate={onLabelUpdate}
              onMove={onLabelMove}
              onDelete={onLabelDelete}
            >
              <button
                type="button"
                className={classNames(styles.filterButton, styles.filterButtonLabels)}
              >
                <Icon name="bookmark outline" className={styles.filterIcon} />
                {labels.length === 0 && <span className={styles.filterTitle}>Etiquettes</span>}
                {labels.map((label) => (
                  <span key={label.id} className={styles.filterItem}>
                    <Label name={label.name} color={label.color} size="small" />
                  </span>
                ))}
              </button>
            </LabelsPopup>
          </span>
        )}
        <span className={styles.filter}>
          {/* <Input
            ref={searchFieldRef}
            value={filterText}
            placeholder={t('common.searchCards')}
            icon={
              isSearchActive ? (
                <Icon link name="cancel" onClick={handleCancelSearchClick} />
              ) : (
                'search'
              )
            }
            className={classNames(styles.search, !isSearchActive && styles.searchInactive)}
            onFocus={handleSearchFocus}
            onKeyDown={handleSearchKeyDown}
            onChange={handleSearchChange}
            onBlur={handleSearchBlur}
          /> */}
          <InputOverride
            ref={searchFieldRef}
            value={filterText}
            placeholder={t('common.searchCards')}
            icon={
              isSearchActive ? (
                <Icon link name="cancel" onClick={handleCancelSearchClick} />
              ) : (
                'search'
              )
            }
            className={classNames(styles.search, !isSearchActive && styles.searchInactive)}
            onFocus={handleSearchFocus}
            onKeyDown={handleSearchKeyDown}
            onChange={handleSearchChange}
            onBlur={handleSearchBlur}
          />
        </span>
      </>
    );
  },
);

Filters.propTypes = {
  /* eslint-disable react/forbid-prop-types */
  users: PropTypes.array.isRequired,
  labels: PropTypes.array.isRequired,
  filterText: PropTypes.string.isRequired,
  allBoardMemberships: PropTypes.array.isRequired,
  allLabels: PropTypes.array.isRequired,
  /* eslint-enable react/forbid-prop-types */
  canEdit: PropTypes.bool.isRequired,
  onUserAdd: PropTypes.func.isRequired,
  onUserRemove: PropTypes.func.isRequired,
  onLabelAdd: PropTypes.func.isRequired,
  onLabelRemove: PropTypes.func.isRequired,
  onLabelCreate: PropTypes.func.isRequired,
  onLabelUpdate: PropTypes.func.isRequired,
  onLabelMove: PropTypes.func.isRequired,
  onLabelDelete: PropTypes.func.isRequired,
  onTextFilterUpdate: PropTypes.func.isRequired,
  isCurrentUserMember: PropTypes.bool.isRequired,
};

export default Filters;
