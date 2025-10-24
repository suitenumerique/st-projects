import React, { useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import { Input, Checkbox } from '@openfun/cunningham-react';

import User from '../../ui/User';
import Label from '../../ui/Label';
import PopoverHeader from '../../ui/Popover/PopoverHeader';
import styles from './FiltersStep.module.scss';

const FiltersStep = React.memo(
  ({
    allBoardMemberships,
    allLabels,
    filterText,
    filterUsers,
    filterLabels,
    onLabelToFilterAdd,
    onLabelFromFilterRemove,
    onTextFilterUpdate,
    onUserToFilterAdd,
    onUserFromFilterRemove,
  }) => {
    const [keywordInput, setKeywordInput] = useState(filterText || '');

    const handleKeywordChange = useCallback(
      (event) => {
        const { value } = event.target;
        setKeywordInput(value);
        onTextFilterUpdate(value);
      },
      [onTextFilterUpdate],
    );

    const handleUserToggle = useCallback(
      (userId) => {
        if (filterUsers.some((user) => user.id === userId)) {
          onUserFromFilterRemove(userId);
        } else {
          onUserToFilterAdd(userId);
        }
      },
      [filterUsers, onUserToFilterAdd, onUserFromFilterRemove],
    );

    const handleLabelToggle = useCallback(
      (labelId) => {
        if (filterLabels.some((label) => label.id === labelId)) {
          onLabelFromFilterRemove(labelId);
        } else {
          onLabelToFilterAdd(labelId);
        }
      },
      [filterLabels, onLabelToFilterAdd, onLabelFromFilterRemove],
    );

    return (
      <>
        <PopoverHeader title="Filtrer le tableau" />
        <div className={styles.content}>
          <div className={styles.section}>
            <h4 className={styles.sectionTitle}>Par mot-clé</h4>
            <Input
              value={keywordInput}
              label="Rechercher dans les titres des cartes..."
              onChange={handleKeywordChange}
              className={styles.keywordInput}
            />
          </div>

          <div className={styles.section}>
            <h4 className={styles.sectionTitle}>Par membre</h4>
            <div className={styles.filterList}>
              {allBoardMemberships.map((membership) => (
                <Checkbox
                  key={membership.user.id}
                  checked={filterUsers.some((user) => user.id === membership.user.id)}
                  onChange={() => handleUserToggle(membership.user.id)}
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
          </div>

          <div className={styles.section}>
            <h4 className={styles.sectionTitle}>Par étiquette</h4>
            <div className={styles.filterList}>
              {allLabels.map((label) => (
                <Checkbox
                  key={label.id}
                  checked={filterLabels.some((l) => l.id === label.id)}
                  onChange={() => handleLabelToggle(label.id)}
                  label={
                    <div className={styles.filterLabel}>
                      <Label name={label.name} color={label.color} size="small" />
                    </div>
                  }
                />
              ))}
            </div>
          </div>
        </div>
      </>
    );
  },
);

FiltersStep.propTypes = {
  allBoardMemberships: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  allLabels: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  filterText: PropTypes.string.isRequired,
  filterUsers: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  filterLabels: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  onTextFilterUpdate: PropTypes.func.isRequired,
  onUserToFilterAdd: PropTypes.func.isRequired,
  onUserFromFilterRemove: PropTypes.func.isRequired,
  onLabelToFilterAdd: PropTypes.func.isRequired,
  onLabelFromFilterRemove: PropTypes.func.isRequired,
};

export default FiltersStep;
