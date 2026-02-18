import truncate from 'lodash/truncate';
import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { useTranslation, Trans } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Button } from '@openfun/cunningham-react';
import { Icon } from '@gouvfr-lasuite/ui-kit';
import PopoverHeader from '../../ui/Popover/PopoverHeader';

import Paths from '../../constants/Paths';
import { ActivityTypes } from '../../constants/Enums';
import User from '../../ui/User';

import styles from './NotificationsStep.module.scss';

const NotificationsStep = React.memo(({ items, onMarkAsRead, onClose }) => {
  const [t] = useTranslation();

  const handleMarkAsRead = useCallback(
    (id) => {
      onMarkAsRead(id);
    },
    [onMarkAsRead],
  );

  const handleMarkAllAsRead = useCallback(() => {
    items.forEach((item) => {
      onMarkAsRead(item.id);
    });
  }, [items, onMarkAsRead]);

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
              <strong />
              <Link to={Paths.CARDS.replace(':id', card.id)} onClick={onClose}>
                {card.name}
              </Link>
              <strong />
              <strong />
            </Trans>
          );
        case ActivityTypes.ADD_MEMBER_TO_CARD:
          return (
            <Trans
              i18nKey="common.userAssignedYouToCard"
              values={{
                user: activity.user.name,
                member: activity.data.member.name,
                card: card.name,
              }}
            >
              <strong />
              <Link to={Paths.CARDS.replace(':id', card.id)} onClick={onClose}>
                {card.name}
              </Link>
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
              <strong />
              <Link to={Paths.CARDS.replace(':id', card.id)} onClick={onClose}>
                {card.name}
              </Link>
            </Trans>
          );
        }
        case ActivityTypes.CHANGE_DUE_DATE:
          return (
            <Trans
              i18nKey="common.userChangedDueDateOfCard"
              values={{
                user: activity.user.name,
                card: card.name,
              }}
            >
              <strong />
              <Link to={Paths.CARDS.replace(':id', card.id)} onClick={onClose} />
            </Trans>
          );
        case ActivityTypes.ADD_ATTACHMENT:
          return (
            <Trans
              i18nKey="common.userAddedAttachmentToCard"
              values={{
                user: activity.user.name,
                card: card.name,
              }}
            >
              <strong />
              <Link to={Paths.CARDS.replace(':id', card.id)} onClick={onClose}>
                {card.name}
              </Link>
            </Trans>
          );
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
          <>
            <div className={styles.wrapper}>
              {items.map((item) => (
                <div key={item.id} className={styles.item}>
                  {item.card && item.activity ? (
                    <>
                      <User
                        name={item.activity.user.name}
                        avatarUrl={item.activity.user.avatarUrl}
                        size="small"
                      />
                      <span className={styles.itemContent}>{renderItemContent(item)}</span>
                    </>
                  ) : (
                    <div className={styles.itemDeleted}>{t('common.cardOrActionAreDeleted')}</div>
                  )}
                  <Button
                    type="button"
                    color="neutral"
                    variant="tertiary"
                    size="small"
                    onClick={() => handleMarkAsRead(item.id)}
                  >
                    <Icon name="check_circle" type="outlined" size="small" />
                  </Button>
                </div>
              ))}
            </div>
            {items.length > 1 && (
              <div className={styles.markAllAsReadButton}>
                <Button
                  type="button"
                  color="neutral"
                  variant="tertiary"
                  onClick={handleMarkAllAsRead}
                >
                  <Icon name="check_circle" type="outlined" size="small" />
                  &nbsp;{t('action.markAllAsRead')}
                </Button>
              </div>
            )}
          </>
        ) : (
          <span className={styles.noUnreadNotifications}>{t('common.noUnreadNotifications')}</span>
        )}
      </div>
    </>
  );
});

NotificationsStep.propTypes = {
  items: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  onMarkAsRead: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default NotificationsStep;
