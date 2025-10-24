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
    filterUsers,
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
            title="common.filterByMembers"
            onUserSelect={onUserAdd}
            onUserDeselect={onUserRemove}
            align="middle"
          >
            <Button
              type="button"
              color="secondary"
              size="small"
              icon={<Icon type="outlined" name="group" size="small" />}
              className={classNames(
                styles.membersButton,
                filterUsers.length > 0 && styles.membersButtonFilled,
              )}
            >
              {filterUsers.length === 0 && <span className={styles.filterTitle}>Membres</span>}
              {filterUsers.map((user) => (
                <span key={user.id} className={styles.filterItem}>
                  <User name={user.name} avatarUrl={user.avatarUrl} size="tiny" />
                </span>
              ))}
            </Button>
          </BoardMembershipsPopover>
        </span>
        <span className={styles.filter}>
          <LabelsPopover
            items={boardLabels}
            currentIds={filterLabels.map((label) => label.id)}
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
              color="secondary"
              size="small"
              icon={<Icon type="outlined" name="label" size="small" />}
              className={classNames(
                styles.labelsButton,
                filterLabels.length > 0 && styles.labelsButtonFilled,
              )}
            >
              {filterLabels.length === 0 && <span className={styles.filterTitle}>Etiquettes</span>}
              {filterLabels.map((label) => (
                <span key={label.id} className={styles.filterItem}>
                  <Label name={label.name} color={label.color} size="small" />
                </span>
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
  filterUsers: PropTypes.array.isRequired,
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
