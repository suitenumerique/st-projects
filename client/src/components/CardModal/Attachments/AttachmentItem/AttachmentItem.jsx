import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { Button } from '@openfun/cunningham-react';
import { Icon } from '@gouvfr-lasuite/ui-kit';

import usePopup from '../../../../lib/popup';

import AttachmentEditStep from '../../../../steps/AttachmentEditStep';

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

    const AttachmentEditPopover = usePopup(AttachmentEditStep);

    if (!isPersisted) {
      return (
        <div className={classNames(styles.wrapper, styles.wrapperSubmitting)}>Chargement...</div>
      );
    }

    const filename = url.split('/').pop();
    const extension = filename.slice((Math.max(0, filename.lastIndexOf('.')) || Infinity) + 1);

    return (
      /* eslint-disable-next-line jsx-a11y/click-events-have-key-events,
                                  jsx-a11y/no-static-element-interactions */
      <div ref={ref} className={styles.wrapper} onClick={handleClick}>
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
          <AttachmentEditPopover
            defaultData={{
              name,
            }}
            onUpdate={onUpdate}
            onDelete={onDelete}
          >
            <Button
              className={styles.attachmentActionsButton}
              color="tertiary-text"
              size="small"
              icon={<Icon name="more_horiz" type="outlined" size="small" />}
            />
          </AttachmentEditPopover>
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
