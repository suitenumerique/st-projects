import React, { useCallback, useRef } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { Icon } from '@gouvfr-lasuite/ui-kit';
import { Button } from '@openfun/cunningham-react';
import usePopup from '../../lib/popup/use-popup';

import User from '../User';
import Label from '../Label';
import BoardMembershipsStep from '../../steps/BoardMembershipsStep';
import LabelsStep from '../../steps/LabelsStep';

import styles from './Filters.module.scss';

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

    const BoardMembershipsPopover = usePopup(BoardMembershipsStep);
    const LabelsPopover = usePopup(LabelsStep);

    const searchFieldRef = useRef(null);

    const handleSearchChange = useCallback(
      (_, { value }) => {
        onTextFilterUpdate(value);
      },
      [onTextFilterUpdate],
    );

    return (
      <>
        <span className={styles.filter}>
          <input
            ref={searchFieldRef}
            name="search"
            value={filterText}
            onChange={handleSearchChange}
            className={styles.search}
            placeholder={t('common.searchCards')}
          />
        </span>
        {isCurrentUserMember && (
          <span className={styles.filter}>
            <BoardMembershipsPopover
              items={allBoardMemberships}
              currentUserIds={users.map((user) => user.id)}
              title="common.filterByMembers"
              onUserSelect={onUserAdd}
              onUserDeselect={onUserRemove}
            >
              <Button
                type="button"
                color="secondary"
                icon={<Icon type="outlined" name="filter_alt" size="small" />}
              >
                {users.length === 0 && <span className={styles.filterTitle}>Membres</span>}
                {users.map((user) => (
                  <span key={user.id} className={styles.filterItem}>
                    <User name={user.name} avatarUrl={user.avatarUrl} size="tiny" />
                  </span>
                ))}
              </Button>
            </BoardMembershipsPopover>
          </span>
        )}
        {isCurrentUserMember && (
          <span className={styles.filter}>
            <LabelsPopover
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
              <Button
                type="button"
                color="secondary"
                icon={<Icon type="outlined" name="filter_alt" size="small" />}
              >
                {labels.length === 0 && <span className={styles.filterTitle}>Etiquettes</span>}
                {labels.map((label) => (
                  <span key={label.id} className={styles.filterItem}>
                    <Label name={label.name} color={label.color} size="small" />
                  </span>
                ))}
              </Button>
            </LabelsPopover>
          </span>
        )}
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
