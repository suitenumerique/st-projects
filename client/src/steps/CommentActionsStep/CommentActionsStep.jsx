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

const CommentActionsStep = React.memo(({ canEdit, canDelete, onEdit, onDelete, onClose }) => {
  const [t] = useTranslation();

  const [step, openStep, handleBack] = useSteps();

  const handleEditClick = useCallback(() => {
    onEdit();
    onClose();
  }, [onEdit, onClose]);

  const handleDeleteClick = useCallback(() => {
    openStep(StepTypes.DELETE);
  }, [openStep]);

  if (step && step.type === StepTypes.DELETE) {
    return (
      <DeleteStep
        title="common.deleteComment"
        content="common.areYouSureYouWantToDeleteThisComment"
        buttonContent="action.deleteComment"
        onConfirm={onDelete}
        onBack={handleBack}
      />
    );
  }

  return (
    <Menu>
      {canEdit && (
        <MenuItem icon="edit" onClick={handleEditClick}>
          {t('action.edit')}
        </MenuItem>
      )}
      {canDelete && (
        <MenuItem icon="delete" onClick={handleDeleteClick}>
          {t('common.deleteComment', {
            context: 'title',
          })}
        </MenuItem>
      )}
    </Menu>
  );
});

CommentActionsStep.propTypes = {
  canEdit: PropTypes.bool.isRequired,
  canDelete: PropTypes.bool.isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default CommentActionsStep;
