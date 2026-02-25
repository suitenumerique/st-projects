import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';

import { useSteps } from '../../hooks';
import DeleteStep from '../DeleteStep';
import Menu from '../../ui/Menu';
import MenuItem from '../../ui/Menu/MenuItem';

const StepTypes = {
  DELETE: 'DELETE',
};

const CardModalActionsStep = React.memo(
  ({ onDuplicate, onDelete, onClose, onToggleSubscription, isSubscribed }) => {
    const [t] = useTranslation();
    const [step, openStep, handleBack] = useSteps();

    const handleToggleSubscriptionClick = useCallback(() => {
      onToggleSubscription();
      onClose();
    }, [onToggleSubscription, onClose]);

    const handleDuplicateClick = useCallback(() => {
      onDuplicate();
      onClose();
    }, [onDuplicate, onClose]);

    const handleDeleteClick = useCallback(() => {
      openStep(StepTypes.DELETE);
    }, [openStep]);

    if (step && step.type === StepTypes.DELETE) {
      return (
        <DeleteStep
          title="common.deleteCard"
          content="common.areYouSureYouWantToDeleteThisCard"
          buttonContent="action.deleteCard"
          onConfirm={onDelete}
          onBack={handleBack}
        />
      );
    }

    return (
      <Menu>
        <MenuItem
          icon={isSubscribed ? 'notifications_off' : 'notifications'}
          onClick={handleToggleSubscriptionClick}
        >
          {isSubscribed ? t('action.unsubscribe') : t('action.subscribe')}
        </MenuItem>
        <MenuItem icon="copy" onClick={handleDuplicateClick}>
          {t('action.duplicateCard', {
            context: 'title',
          })}
        </MenuItem>
        <MenuItem icon="delete" onClick={handleDeleteClick}>
          {t('action.deleteCard', {
            context: 'title',
          })}
        </MenuItem>
      </Menu>
    );
  },
);

CardModalActionsStep.propTypes = {
  onDuplicate: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  onToggleSubscription: PropTypes.func.isRequired,
  isSubscribed: PropTypes.bool.isRequired,
};

export default CardModalActionsStep;
