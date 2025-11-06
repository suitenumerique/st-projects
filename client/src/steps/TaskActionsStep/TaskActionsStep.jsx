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

const ActionsStep = React.memo(({ onNameEdit, onDelete, onClose }) => {
  const [t] = useTranslation();
  const [step, openStep, handleBack] = useSteps();

  const handleEditNameClick = useCallback(() => {
    onNameEdit();
    onClose();
  }, [onNameEdit, onClose]);

  const handleDeleteClick = useCallback(() => {
    openStep(StepTypes.DELETE);
  }, [openStep]);

  if (step && step.type === StepTypes.DELETE) {
    return (
      <DeleteStep
        title="common.deleteTask"
        content="common.areYouSureYouWantToDeleteThisTask"
        buttonContent="action.deleteTask"
        onConfirm={onDelete}
        onBack={handleBack}
      />
    );
  }

  return (
    <Menu>
      <MenuItem icon="edit" onClick={handleEditNameClick}>
        Modifier
      </MenuItem>
      <MenuItem icon="delete" onClick={handleDeleteClick}>
        {t('action.deleteTask', {
          context: 'title',
        })}
      </MenuItem>
    </Menu>
  );
});

ActionsStep.propTypes = {
  onNameEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default ActionsStep;
