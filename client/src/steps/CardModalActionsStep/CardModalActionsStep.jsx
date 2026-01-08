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

// {
//   label: isSubscribed ? t('action.unsubscribe') : t('action.subscribe'),
//   value: isSubscribed ? 'unsubscribe' : 'subscribe',
//   icon: <Icon name="notifications" size="small" />,
//   callback: handleToggleSubscriptionClick,
// },

const CardModalActionsStep = React.memo(({ onDuplicate, onDelete, onClose }) => {
  const [t] = useTranslation();
  const [step, openStep, handleBack] = useSteps();

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
});

CardModalActionsStep.propTypes = {
  onDuplicate: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default CardModalActionsStep;
