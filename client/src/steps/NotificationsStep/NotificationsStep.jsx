import truncate from 'lodash/truncate';
import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { useTranslation, Trans } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Icon } from '@gouvfr-lasuite/ui-kit';
import { Button } from '@gouvfr-lasuite/cunningham-react';
import PopoverHeader from '../../ui/Popover/PopoverHeader';

import Paths from '../../constants/Paths';
import { ActivityTypes } from '../../constants/Enums';
import User from '../../ui/User';

import styles from './NotificationsStep.module.scss';

const NotificationsStep = React.memo(({ items, onDelete, onClose }) => {
  const [t] = useTranslation();

  const handleDelete = useCallback(
    (id) => {
      onDelete(id);
    },
    [onDelete],
  );

  const handleDeleteAll = useCallback(() => {
    items.forEach((item) => {
      onDelete(item.id);
    });
  }, [items, onDelete]);

  const renderItemContent = useCallback(
    ({ activity, card }) => {
      switch (activity.type) {
        case ActivityTypes.MOVE_CARD:
          return (
            <Trans
              i18nKey="common.userMovedCardFromListToList"
              values={{
                user: activity.user.name,
                card: card.name,
                fromList: activity.data.fromList.name,
                toList: activity.data.toList.name,
              }}
            >
              {activity.user.name}
              {' moved '}
              <Link to={Paths.CARDS.replace(':id', card.id)} onClick={onClose}>
                {card.name}
              </Link>
              {' from '}
              {activity.data.fromList.name}
              {' to '}
              {activity.data.toList.name}
            </Trans>
          );
        case ActivityTypes.COMMENT_CARD: {
          const commentText = truncate(activity.data.text);

          return (
            <Trans
              i18nKey="common.userLeftNewCommentToCard"
              values={{
                user: activity.user.name,
                comment: commentText,
                card: card.name,
              }}
            >
              {activity.user.name}
              {` left a new comment «${commentText}» to `}
              <Link to={Paths.CARDS.replace(':id', card.id)} onClick={onClose}>
                {card.name}
              </Link>
            </Trans>
          );
        }
        default:
      }

      return null;
    },
    [onClose],
  );

  return (
    <>
      <PopoverHeader
        title={t('common.notifications', {
          context: 'title',
        })}
      />
      <div>
        {items.length > 0 ? (
          <div className={styles.wrapper}>
            {items.length > 1 && (
              <div className={styles.deleteAllButtonWrapper}>
                <Button
                  color="error"
                  variant="primary"
                  onClick={handleDeleteAll}
                  icon={<Icon name="delete_sweep" type="outlined" />}
                  size="nano"
                  className={styles.deleteAllButton}
                >
                  {t('action.deleteNotifications')}
                </Button>
              </div>
            )}
            {items.map((item) => (
              <div key={item.id} className={styles.itemWrapper}>
                <div key={item.id} className={styles.item}>
                  {item.card && item.activity ? (
                    <>
                      <User
                        name={item.activity.user.name}
                        avatarUrl={item.activity.user.avatarUrl}
                        size="medium"
                      />
                      <span className={styles.itemContent}>{renderItemContent(item)}</span>
                    </>
                  ) : (
                    <div className={styles.itemDeleted}>{t('common.cardOrActionAreDeleted')}</div>
                  )}
                  <Button
                    onClick={() => handleDelete(item.id)}
                    color="error"
                    variant="primary"
                    icon={<Icon name="delete" type="outlined" />}
                    size="nano"
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <span className={styles.noUnreadNotifications}>{t('common.noUnreadNotifications')}</span>
        )}
      </div>
    </>
  );
});

NotificationsStep.propTypes = {
  items: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  onDelete: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default NotificationsStep;
