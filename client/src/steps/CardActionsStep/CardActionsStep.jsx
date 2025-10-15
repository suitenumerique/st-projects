import pick from 'lodash/pick';
import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';

import { useSteps } from '../../hooks';
import BoardMembershipsStep from '../BoardMembershipsStep';
import LabelsStep from '../LabelsStep';
import DueDateEditStep from '../DueDateEditStep/DueDateEditStep';
import StopwatchEditStep from '../StopwatchEditStep/StopwatchEditStep';
import CardMoveStep from '../CardMoveStep/CardMoveStep';
import DeleteStep from '../DeleteStep/DeleteStep';

import Menu from '../../ui/Menu';
import MenuItem from '../../ui/Menu/MenuItem';
import PopoverHeader from '../../ui/Popover/PopoverHeader';

import styles from './CardActionsStep.module.scss';

const StepTypes = {
  USERS: 'USERS',
  LABELS: 'LABELS',
  EDIT_DUE_DATE: 'EDIT_DUE_DATE',
  EDIT_STOPWATCH: 'EDIT_STOPWATCH',
  MOVE: 'MOVE',
  DELETE: 'DELETE',
};

const CardActionsStep = React.memo(
  ({
    card,
    boards,
    boardMemberships,
    currentUserIds,
    labels,
    currentLabelIds,
    onNameEdit,
    onUpdate,
    onMove,
    onTransfer,
    onDuplicate,
    onDelete,
    onUserAdd,
    onUserRemove,
    onBoardFetch,
    onLabelAdd,
    onLabelRemove,
    onLabelCreate,
    onLabelUpdate,
    onLabelMove,
    onLabelDelete,
    onClose,
  }) => {
    const [t] = useTranslation();
    const [step, openStep, handleBack] = useSteps();

    const handleEditNameClick = useCallback(() => {
      onNameEdit();
      onClose();
    }, [onNameEdit, onClose]);

    const handleUsersClick = useCallback(() => {
      openStep(StepTypes.USERS);
    }, [openStep]);

    const handleLabelsClick = useCallback(() => {
      openStep(StepTypes.LABELS);
    }, [openStep]);

    const handleEditDueDateClick = useCallback(() => {
      openStep(StepTypes.EDIT_DUE_DATE);
    }, [openStep]);

    const handleEditStopwatchClick = useCallback(() => {
      openStep(StepTypes.EDIT_STOPWATCH);
    }, [openStep]);

    const handleMoveClick = useCallback(() => {
      openStep(StepTypes.MOVE);
    }, [openStep]);

    const handleDuplicateClick = useCallback(() => {
      onDuplicate();
      onClose();
    }, [onDuplicate, onClose]);

    const handleDeleteClick = useCallback(() => {
      openStep(StepTypes.DELETE);
    }, [openStep]);

    const handleDueDateUpdate = useCallback(
      (dueDate) => {
        onUpdate({
          dueDate,
        });
      },
      [onUpdate],
    );

    const handleStopwatchUpdate = useCallback(
      (stopwatch) => {
        onUpdate({
          stopwatch,
        });
      },
      [onUpdate],
    );

    if (step) {
      switch (step.type) {
        case StepTypes.USERS:
          return (
            <BoardMembershipsStep
              items={boardMemberships}
              currentUserIds={currentUserIds}
              onUserSelect={onUserAdd}
              onUserDeselect={onUserRemove}
              onBack={handleBack}
            />
          );
        case StepTypes.LABELS:
          return (
            <LabelsStep
              items={labels}
              currentIds={currentLabelIds}
              onSelect={onLabelAdd}
              onDeselect={onLabelRemove}
              onCreate={onLabelCreate}
              onUpdate={onLabelUpdate}
              onMove={onLabelMove}
              onDelete={onLabelDelete}
              onBack={handleBack}
            />
          );
        case StepTypes.EDIT_DUE_DATE:
          return (
            <DueDateEditStep
              defaultValue={card.dueDate}
              onUpdate={handleDueDateUpdate}
              onBack={handleBack}
              onClose={onClose}
            />
          );
        case StepTypes.EDIT_STOPWATCH:
          return (
            <StopwatchEditStep
              defaultValue={card.stopwatch}
              onUpdate={handleStopwatchUpdate}
              onBack={handleBack}
              onClose={onClose}
            />
          );
        case StepTypes.MOVE:
          return (
            <CardMoveStep
              defaultPath={pick(card, ['boardId', 'listId'])}
              boards={boards}
              onMove={onMove}
              onTransfer={onTransfer}
              onBoardFetch={onBoardFetch}
              onBack={handleBack}
              onClose={onClose}
            />
          );
        case StepTypes.DELETE:
          return (
            <DeleteStep
              title="common.deleteCard"
              content="common.areYouSureYouWantToDeleteThisCard"
              buttonContent="action.deleteCard"
              onConfirm={onDelete}
              onBack={handleBack}
            />
          );
        default:
      }
    }

    return (
      <>
        <PopoverHeader
          title={t('common.cardActions', {
            context: 'title',
          })}
        />
        <Menu secondary vertical className={styles.menu}>
          <MenuItem className={styles.menuItem} onClick={handleEditNameClick}>
            {t('action.editTitle', {
              context: 'title',
            })}
          </MenuItem>
          <MenuItem className={styles.menuItem} onClick={handleUsersClick}>
            {t('common.members', {
              context: 'title',
            })}
          </MenuItem>
          <MenuItem className={styles.menuItem} onClick={handleLabelsClick}>
            {t('common.labels', {
              context: 'title',
            })}
          </MenuItem>
          <MenuItem className={styles.menuItem} onClick={handleEditDueDateClick}>
            {t('action.editDueDate', {
              context: 'title',
            })}
          </MenuItem>
          <MenuItem className={styles.menuItem} onClick={handleEditStopwatchClick}>
            {t('action.editStopwatch', {
              context: 'title',
            })}
          </MenuItem>
          <MenuItem className={styles.menuItem} onClick={handleMoveClick}>
            {t('action.moveCard', {
              context: 'title',
            })}
          </MenuItem>
          <MenuItem className={styles.menuItem} onClick={handleDuplicateClick}>
            {t('action.duplicateCard', {
              context: 'title',
            })}
          </MenuItem>
          <MenuItem className={styles.menuItem} onClick={handleDeleteClick}>
            {t('action.deleteCard', {
              context: 'title',
            })}
          </MenuItem>
        </Menu>
      </>
    );
  },
);

CardActionsStep.propTypes = {
  /* eslint-disable react/forbid-prop-types */
  boards: PropTypes.array.isRequired,
  card: PropTypes.object.isRequired,
  boardMemberships: PropTypes.array.isRequired,
  currentUserIds: PropTypes.array.isRequired,
  labels: PropTypes.array.isRequired,
  currentLabelIds: PropTypes.array.isRequired,
  /* eslint-enable react/forbid-prop-types */
  onNameEdit: PropTypes.func.isRequired,
  onUpdate: PropTypes.func.isRequired,
  onMove: PropTypes.func.isRequired,
  onTransfer: PropTypes.func.isRequired,
  onDuplicate: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onUserAdd: PropTypes.func.isRequired,
  onUserRemove: PropTypes.func.isRequired,
  onBoardFetch: PropTypes.func.isRequired,
  onLabelAdd: PropTypes.func.isRequired,
  onLabelRemove: PropTypes.func.isRequired,
  onLabelCreate: PropTypes.func.isRequired,
  onLabelUpdate: PropTypes.func.isRequired,
  onLabelMove: PropTypes.func.isRequired,
  onLabelDelete: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default CardActionsStep;
