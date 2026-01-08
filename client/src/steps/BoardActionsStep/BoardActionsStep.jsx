import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';

import Menu from '../../ui/Menu';
import MenuItem from '../../ui/Menu/MenuItem';
import { useSteps } from '../../hooks';
import BoardEditStep from '../BoardEditStep';
import DeleteStep from '../DeleteStep';

const StepTypes = {
  EDIT_NAME: 'EDIT_NAME',
  DELETE: 'DELETE',
};

const BoardActionsStep = React.memo(({ defaultData, onUpdate, onDelete, onClose }) => {
  const { t } = useTranslation();

  const [step, openStep, handleBack] = useSteps();

  const handleEditNameClick = useCallback(() => {
    openStep(StepTypes.EDIT_NAME);
  }, [openStep]);

  const handleDeleteClick = useCallback(() => {
    openStep(StepTypes.DELETE);
  }, [openStep]);

  if (step) {
    switch (step.type) {
      case StepTypes.EDIT_NAME:
        return (
          <BoardEditStep
            defaultData={defaultData}
            onUpdate={onUpdate}
            onBack={handleBack}
            onClose={onClose}
          />
        );
      case StepTypes.DELETE:
        return (
          <DeleteStep
            title="common.deleteBoard"
            content="common.areYouSureYouWantToDeleteThisBoard"
            buttonContent="action.deleteBoard"
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
        {t('action.rename')}
      </MenuItem>
      <MenuItem icon="delete" onClick={handleDeleteClick}>
        {t('action.remove')}
      </MenuItem>
    </Menu>
  );
});

BoardActionsStep.propTypes = {
  defaultData: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  onUpdate: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default BoardActionsStep;
