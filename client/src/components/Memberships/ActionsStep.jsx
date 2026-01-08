import pick from 'lodash/pick';
import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { Button } from '@openfun/cunningham-react';
import PopoverHeader from '../../ui/Popover/PopoverHeader';

import { useSteps } from '../../hooks';
import User from '../../ui/User';
import DeleteStep from '../../steps/DeleteStep';

import styles from './ActionsStep.module.scss';

const StepTypes = {
  EDIT_PERMISSIONS: 'EDIT_PERMISSIONS',
  DELETE: 'DELETE',
};

const ActionsStep = React.memo(
  ({
    membership,
    permissionsSelectStep,
    title,
    leaveButtonContent,
    leaveConfirmationTitle,
    leaveConfirmationContent,
    leaveConfirmationButtonContent,
    deleteButtonContent,
    deleteConfirmationTitle,
    deleteConfirmationContent,
    deleteConfirmationButtonContent,
    canEdit,
    canLeave,
    onUpdate,
    onDelete,
    onBack,
    onClose,
  }) => {
    const [t] = useTranslation();
    const [step, openStep, handleBack] = useSteps();

    const handleEditPermissionsClick = useCallback(() => {
      openStep(StepTypes.EDIT_PERMISSIONS);
    }, [openStep]);

    const handleDeleteClick = useCallback(() => {
      openStep(StepTypes.DELETE);
    }, [openStep]);

    const handleRoleSelect = useCallback(
      (data) => {
        if (onUpdate) {
          onUpdate(data);
        }
      },
      [onUpdate],
    );

    const handleDeleteConfirm = useCallback(() => {
      onDelete();
      onClose();
    }, [onDelete, onClose]);

    if (step) {
      switch (step.type) {
        case StepTypes.EDIT_PERMISSIONS: {
          const PermissionsSelectStep = permissionsSelectStep;

          return (
            <PermissionsSelectStep
              defaultData={pick(membership, ['role', 'canComment'])}
              title="common.editPermissions"
              buttonContent="action.save"
              onSelect={handleRoleSelect}
              onBack={handleBack}
              onClose={onClose}
            />
          );
        }
        case StepTypes.DELETE:
          return (
            <DeleteStep
              title={membership.user.isCurrent ? leaveConfirmationTitle : deleteConfirmationTitle}
              content={
                membership.user.isCurrent ? leaveConfirmationContent : deleteConfirmationContent
              }
              buttonContent={
                membership.user.isCurrent
                  ? leaveConfirmationButtonContent
                  : deleteConfirmationButtonContent
              }
              onConfirm={handleDeleteConfirm}
              onBack={handleBack}
            />
          );
        default:
      }
    }

    const contentNode = (
      <>
        <span className={styles.user}>
          <User name={membership.user.name} avatarUrl={membership.user.avatarUrl} size="large" />
        </span>
        <span className={styles.content}>
          <div className={styles.name}>{membership.user.name}</div>
          <div className={styles.email}>{membership.user.email}</div>
        </span>
        {permissionsSelectStep && canEdit && (
          <Button className={styles.button} onClick={handleEditPermissionsClick}>
            {t('action.editPermissions')}
          </Button>
        )}
        {membership.user.isCurrent
          ? canLeave && (
              <Button className={styles.button} onClick={handleDeleteClick}>
                {t(leaveButtonContent)}
              </Button>
            )
          : canEdit && (
              <Button className={styles.button} onClick={handleDeleteClick}>
                {t(deleteButtonContent)}
              </Button>
            )}
      </>
    );

    return onBack ? (
      <>
        <PopoverHeader
          onBack={onBack}
          title={t(title, {
            context: 'title',
          })}
        />
        {contentNode}
      </>
    ) : (
      contentNode
    );
  },
);

ActionsStep.propTypes = {
  membership: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  permissionsSelectStep: PropTypes.elementType,
  title: PropTypes.string,
  leaveButtonContent: PropTypes.string,
  leaveConfirmationTitle: PropTypes.string,
  leaveConfirmationContent: PropTypes.string,
  leaveConfirmationButtonContent: PropTypes.string,
  deleteButtonContent: PropTypes.string,
  deleteConfirmationTitle: PropTypes.string,
  deleteConfirmationContent: PropTypes.string,
  deleteConfirmationButtonContent: PropTypes.string,
  canEdit: PropTypes.bool.isRequired,
  canLeave: PropTypes.bool.isRequired,
  onUpdate: PropTypes.func,
  onDelete: PropTypes.func.isRequired,
  onBack: PropTypes.func,
  onClose: PropTypes.func.isRequired,
};

ActionsStep.defaultProps = {
  permissionsSelectStep: undefined,
  title: 'common.memberActions',
  leaveButtonContent: 'action.leaveBoard',
  leaveConfirmationTitle: 'common.leaveBoard',
  leaveConfirmationContent: 'common.areYouSureYouWantToLeaveBoard',
  leaveConfirmationButtonContent: 'action.leaveBoard',
  deleteButtonContent: 'action.removeFromBoard',
  deleteConfirmationTitle: 'common.removeMember',
  deleteConfirmationContent: 'common.areYouSureYouWantToRemoveThisMemberFromBoard',
  deleteConfirmationButtonContent: 'action.removeMember',
  onUpdate: undefined,
  onBack: undefined,
};

export default ActionsStep;
