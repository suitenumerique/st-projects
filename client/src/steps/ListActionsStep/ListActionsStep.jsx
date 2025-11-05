import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';

import { HorizontalSeparator } from '@gouvfr-lasuite/ui-kit';
import Menu from '../../ui/Menu';
import MenuItem from '../../ui/Menu/MenuItem';
import PopoverHeader from '../../ui/Popover/PopoverHeader';

import ListColors from '../../constants/ListColors';
import { useSteps } from '../../hooks';
import ColorPicker from '../../ui/ColorPicker';
import ListSortStep from '../ListSortStep/ListSortStep';
import DeleteStep from '../DeleteStep/DeleteStep';

import styles from './ListActionsStep.module.scss';

const StepTypes = {
  DELETE: 'DELETE',
  SORT: 'SORT',
  EDIT_COLOR: 'CHANGE_COLOR',
};

const ActionsStep = React.memo(
  ({ onNameEdit, onCardAdd, onSort, onDelete, onClose, onColorEdit, color }) => {
    const [t] = useTranslation();
    const [step, openStep, handleBack] = useSteps();

    const handleEditNameClick = useCallback(() => {
      onNameEdit();
      onClose();
    }, [onNameEdit, onClose]);

    const handleAddCardClick = useCallback(() => {
      onCardAdd();
      onClose();
    }, [onCardAdd, onClose]);

    const handleSortClick = useCallback(() => {
      openStep(StepTypes.SORT);
    }, [openStep]);

    const handleDeleteClick = useCallback(() => {
      openStep(StepTypes.DELETE);
    }, [openStep]);

    const hanndleEditColorClick = useCallback(() => {
      openStep(StepTypes.EDIT_COLOR);
    }, [openStep]);

    const handleSortTypeSelect = useCallback(
      (type) => {
        onSort({
          type,
        });

        onClose();
      },
      [onSort, onClose],
    );

    const handleColorChange = useCallback(
      (e) => {
        onColorEdit(e.currentTarget.value);
      },
      [onColorEdit],
    );

    if (step && step.type) {
      switch (step.type) {
        case StepTypes.SORT:
          return <ListSortStep onTypeSelect={handleSortTypeSelect} onBack={handleBack} />;
        case StepTypes.DELETE:
          return (
            <DeleteStep
              title="common.deleteList"
              content="common.areYouSureYouWantToDeleteThisList"
              buttonContent="action.deleteList"
              onConfirm={onDelete}
              onBack={handleBack}
            />
          );
        case StepTypes.EDIT_COLOR:
          return (
            <>
              <PopoverHeader
                onBack={handleBack}
                title={t('action.editColor', {
                  context: 'title',
                })}
              />
              <ColorPicker
                colors={ListColors}
                current={color}
                allowDeletion
                onChange={handleColorChange}
              />
            </>
          );
        default:
      }
    }

    return (
      <div>
        <Menu secondary vertical className={styles.menu}>
          <MenuItem icon="edit" className={styles.menuItem} onClick={handleEditNameClick}>
            {t('action.editTitle', {
              context: 'title',
            })}
          </MenuItem>
          <MenuItem icon="palette" className={styles.menuItem} onClick={hanndleEditColorClick}>
            {t('action.editColor', {
              context: 'title',
            })}
          </MenuItem>
          <MenuItem icon="add" className={styles.menuItem} onClick={handleAddCardClick}>
            {t('action.addCard', {
              context: 'title',
            })}
          </MenuItem>
          <MenuItem icon="sort" className={styles.menuItem} onClick={handleSortClick}>
            {t('action.sortList', {
              context: 'title',
            })}
          </MenuItem>
          <HorizontalSeparator withPadding={false} />
          <MenuItem icon="delete" className={styles.menuItem} onClick={handleDeleteClick}>
            {t('action.deleteList', {
              context: 'title',
            })}
          </MenuItem>
        </Menu>
      </div>
    );
  },
);

ActionsStep.propTypes = {
  onNameEdit: PropTypes.func.isRequired,
  onCardAdd: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onSort: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  onColorEdit: PropTypes.func.isRequired,
  color: PropTypes.string,
};

ActionsStep.defaultProps = {
  color: undefined,
};

export default ActionsStep;
