import React, { useCallback } from 'react';
import PropTypes from 'prop-types';

import Menu from '../../ui/Menu';
import MenuItem from '../../ui/Menu/MenuItem';
import { useSteps } from '../../hooks';
import DeleteStep from '../DeleteStep';

const StepTypes = {
  DELETE: 'DELETE',
};

const FolderActionsStep = React.memo(({ onEdit, onDelete, onClose }) => {
  const [step, openStep, handleBack] = useSteps();

  const handleEditNameClick = useCallback(() => {
    onEdit();
    onClose();
  }, [onEdit, onClose]);

  const handleDeleteClick = useCallback(() => {
    openStep(StepTypes.DELETE);
  }, [openStep]);

  if (step) {
    switch (step.type) {
      case StepTypes.DELETE:
        return (
          <DeleteStep
            title="common.deleteFolder"
            content="common.areYouSureYouWantToDeleteThisFolder"
            buttonContent="action.deleteFolder"
            onConfirm={onDelete}
            onClose={onClose}
            onBack={handleBack}
          />
        );
      default:
        return null;
    }
  }

  return (
    <Menu>
      <MenuItem icon="edit" onClick={handleEditNameClick}>
        Renommer
      </MenuItem>
      <MenuItem icon="delete" onClick={handleDeleteClick}>
        Supprimer
      </MenuItem>
    </Menu>
  );
});

FolderActionsStep.propTypes = {
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default FolderActionsStep;
