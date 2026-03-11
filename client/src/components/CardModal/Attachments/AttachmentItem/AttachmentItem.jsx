import React, { useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { Button } from '@gouvfr-lasuite/cunningham-react';
import { Icon, Spinner } from '@gouvfr-lasuite/ui-kit';

import usePopup from '../../../../lib/popup';

import AttachmentActionsStep from '../../../../steps/AttachmentActionsStep';

import styles from './AttachmentItem.module.scss';

const AttachmentItem = React.forwardRef(
  (
    {
      name,
      url,
      coverUrl,
      createdAt,
      isCover,
      isPersisted,
      canEdit,
      onCoverSelect,
      onCoverDeselect,
      onClick,
      onUpdate,
      onDelete,
    },
    ref,
  ) => {
    const [t] = useTranslation();
    const [isAttachmentActionsPopoverOpen, setIsAttachmentActionsPopoverOpen] = useState(false);

    const handleClick = useCallback(() => {
      if (onClick) {
        onClick();
      } else {
        window.open(url, '_blank');
      }
    }, [url, onClick]);

    const handleToggleCoverClick = useCallback(
      (event) => {
        event.stopPropagation();

        if (isCover) {
          onCoverDeselect();
        } else {
          onCoverSelect();
        }
      },
      [isCover, onCoverSelect, onCoverDeselect],
    );

    const AttachmentActionsPopover = usePopup(AttachmentActionsStep);

    if (!isPersisted) {
      return (
        <div className={classNames(styles.wrapper, styles.wrapperSubmitting)}>
          <Spinner />
        </div>
      );
    }

    const filename = url.split('/').pop();
    const extension = filename.slice((Math.max(0, filename.lastIndexOf('.')) || Infinity) + 1);

    return (
      /* eslint-disable-next-line jsx-a11y/click-events-have-key-events,
                                  jsx-a11y/no-static-element-interactions */
      <div
        ref={ref}
        className={classNames(
          styles.wrapper,
          isAttachmentActionsPopoverOpen && styles.popoverOpened,
        )}
        onClick={handleClick}
      >
        <div
          className={styles.thumbnail}
          style={{
            background: coverUrl && `url("${coverUrl}") center / cover`,
          }}
        >
          <span className={styles.extension}>{extension || '-'}</span>
        </div>
        <div className={styles.details}>
          <span className={styles.name}>{name}</span>
          <span className={styles.date}>
            {t('format:longDateTime', {
              postProcess: 'formatDate',
              value: createdAt,
            })}
          </span>
          {coverUrl && canEdit && (
            <span className={styles.options}>
              <button type="button" className={styles.option} onClick={handleToggleCoverClick}>
                <span className={styles.optionText}>
                  {isCover
                    ? t('action.removeCover', {
                        context: 'title',
                      })
                    : t('action.makeCover', {
                        context: 'title',
                      })}
                </span>
              </button>
            </span>
          )}
        </div>
        {canEdit && (
          <AttachmentActionsPopover
            defaultData={{
              name,
            }}
            onUpdate={onUpdate}
            onDelete={onDelete}
            onOpenChange={setIsAttachmentActionsPopoverOpen}
          >
            <Button
              className={styles.attachmentActionsButton}
              color="tertiary-text"
              size="small"
              icon={<Icon name="more_horiz" type="outlined" size="small" />}
            />
          </AttachmentActionsPopover>
        )}
      </div>
    );
  },
);

AttachmentItem.propTypes = {
  name: PropTypes.string.isRequired,
  url: PropTypes.string,
  coverUrl: PropTypes.string,
  createdAt: PropTypes.instanceOf(Date),
  isCover: PropTypes.bool.isRequired,
  isPersisted: PropTypes.bool.isRequired,
  canEdit: PropTypes.bool.isRequired,
  onClick: PropTypes.func,
  onCoverSelect: PropTypes.func.isRequired,
  onCoverDeselect: PropTypes.func.isRequired,
  onUpdate: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

AttachmentItem.defaultProps = {
  url: undefined,
  coverUrl: undefined,
  createdAt: undefined,
  onClick: undefined,
};

export default React.memo(AttachmentItem);
