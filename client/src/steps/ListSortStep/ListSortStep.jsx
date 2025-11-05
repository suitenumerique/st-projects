import React from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { ListSortTypes } from '../../constants/Enums';
import PopoverHeader from '../../ui/Popover/PopoverHeader';

import Menu from '../../ui/Menu';
import MenuItem from '../../ui/Menu/MenuItem';

import styles from './ListSortStep.module.scss';

const ListSortStep = React.memo(({ onTypeSelect, onBack }) => {
  const [t] = useTranslation();

  return (
    <>
      <PopoverHeader
        onBack={onBack}
        title={t('common.sortList', {
          context: 'title',
        })}
      />
      <Menu secondary vertical className={styles.menu}>
        <MenuItem
          icon="sort_by_alpha"
          className={styles.menuItem}
          onClick={() => onTypeSelect(ListSortTypes.NAME_ASC)}
        >
          {t('common.title')}
        </MenuItem>
        <MenuItem
          icon="calendar_today"
          className={styles.menuItem}
          onClick={() => onTypeSelect(ListSortTypes.DUE_DATE_ASC)}
        >
          {t('common.dueDate')}
        </MenuItem>
        <MenuItem
          icon="arrow_downward"
          className={styles.menuItem}
          onClick={() => onTypeSelect(ListSortTypes.CREATED_AT_ASC)}
        >
          {t('common.oldestFirst')}
        </MenuItem>
        <MenuItem
          icon="arrow_upward"
          className={styles.menuItem}
          onClick={() => onTypeSelect(ListSortTypes.CREATED_AT_DESC)}
        >
          {t('common.newestFirst')}
        </MenuItem>
      </Menu>
    </>
  );
});

ListSortStep.propTypes = {
  onTypeSelect: PropTypes.func.isRequired,
  onBack: PropTypes.func,
};

ListSortStep.defaultProps = {
  onBack: undefined,
};

export default ListSortStep;
