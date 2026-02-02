import React, { useCallback, useRef } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { Icon } from '@gouvfr-lasuite/ui-kit';
import { Button } from '@openfun/cunningham-react';
import classNames from 'classnames';
import usePopup from '../../../lib/popup/use-popup';

import User from '../../../ui/User';
import Label from '../../../ui/Label';
import BoardMembershipsStep from '../../../steps/BoardMembershipsStep';
import LabelsStep from '../../../steps/LabelsStep';

import styles from './Filters.module.scss';

const Filters = React.memo(
  ({
    filterText,
    boardLabels,
    filterLabels,
    includeCardsWithoutLabels,
    filterUsers,
    includeCardsWithoutMembers,
    boardMemberships,
    canEdit,
    onTextFilterUpdate,
    onUserAdd,
    onUserRemove,
    onLabelAdd,
    onLabelRemove,
    onLabelCreate,
    onLabelUpdate,
    onLabelMove,
    onLabelDelete,
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
            onChange={(event) => handleSearchChange(event, { value: event.target.value })}
            className={styles.search}
            placeholder={t('common.searchCards')}
          />
        </span>
        <span className={styles.filter}>
          <BoardMembershipsPopover
            items={boardMemberships}
            currentUserIds={filterUsers.map((user) => user.id)}
            displayNoMemberOption
            includeCardsWithoutMembers={includeCardsWithoutMembers}
            title="common.filterByMembers"
            onUserSelect={onUserAdd}
            onUserDeselect={onUserRemove}
            align="middle"
          >
            <Button
              type="button"
              color="brand"
              variant="bordered"
              size="small"
              icon={<Icon type="outlined" name="group" size="small" />}
              className={classNames(
                styles.membersButton,
                filterUsers.length > 0 && styles.membersButtonFilled,
              )}
            >
              {filterUsers.length === 0 && !includeCardsWithoutMembers && (
                <span className={styles.filterTitle}>Membres</span>
              )}
              {includeCardsWithoutMembers && (
                <div className={styles.noMember}>
                  <Icon name="person_off" type="outlined" aria-hidden="true" size="small" />
                </div>
              )}
              {filterUsers.map((user) => (
                <User key={user.id} name={user.name} avatarUrl={user.avatarUrl} size="small" />
              ))}
            </Button>
          </BoardMembershipsPopover>
        </span>
        <span className={styles.filter}>
          <LabelsPopover
            items={boardLabels}
            currentIds={filterLabels.map((label) => label.id)}
            displayNoLabelOption
            includeCardsWithoutLabels={includeCardsWithoutLabels}
            title="common.filterByLabels"
            canEdit={canEdit}
            onSelect={onLabelAdd}
            onDeselect={onLabelRemove}
            onCreate={onLabelCreate}
            onUpdate={onLabelUpdate}
            onMove={onLabelMove}
            onDelete={onLabelDelete}
            align="end"
          >
            <Button
              type="button"
              color="brand"
              variant="bordered"
              size="small"
              icon={<Icon type="outlined" name="label" size="small" />}
              className={classNames(
                styles.labelsButton,
                filterLabels.length > 0 && styles.labelsButtonFilled,
              )}
            >
              {filterLabels.length === 0 && !includeCardsWithoutLabels && (
                <span className={styles.filterTitle}>Etiquettes</span>
              )}
              {includeCardsWithoutLabels && (
                <div className={styles.noLabel}>
                  <Icon name="label_off" type="outlined" aria-hidden="true" size="small" />
                </div>
              )}
              {filterLabels.map((label) => (
                <Label key={label.id} name={label.name} color={label.color} size="small" />
              ))}
            </Button>
          </LabelsPopover>
        </span>
      </>
    );
  },
);

Filters.propTypes = {
  filterText: PropTypes.string.isRequired,
  /* eslint-disable react/forbid-prop-types */
  boardLabels: PropTypes.array.isRequired,
  filterLabels: PropTypes.array.isRequired,
  includeCardsWithoutLabels: PropTypes.bool.isRequired,
  filterUsers: PropTypes.array.isRequired,
  includeCardsWithoutMembers: PropTypes.bool.isRequired,
  boardMemberships: PropTypes.array.isRequired,
  /* eslint-enable react/forbid-prop-types */
  canEdit: PropTypes.bool.isRequired,
  onTextFilterUpdate: PropTypes.func.isRequired,
  onUserAdd: PropTypes.func.isRequired,
  onUserRemove: PropTypes.func.isRequired,
  onLabelAdd: PropTypes.func.isRequired,
  onLabelRemove: PropTypes.func.isRequired,
  onLabelCreate: PropTypes.func.isRequired,
  onLabelUpdate: PropTypes.func.isRequired,
  onLabelMove: PropTypes.func.isRequired,
  onLabelDelete: PropTypes.func.isRequired,
};

export default Filters;
