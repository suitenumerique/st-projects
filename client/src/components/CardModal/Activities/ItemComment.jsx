import React, { useCallback, useRef } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';

import { Button } from '@openfun/cunningham-react';
import { Icon } from '@gouvfr-lasuite/ui-kit';
import getDateFormat from '../../../utils/get-date-format';
import CommentEdit from './CommentEdit';
import User from '../../User';
import CommentActionsStep from '../../../steps/CommentActionsStep';
import usePopup from '../../../lib/popup';

import styles from './ItemComment.module.scss';

const ItemComment = React.memo(
  ({ data, createdAt, isPersisted, user, canEdit, onUpdate, onDelete }) => {
    const [t] = useTranslation();

    const CommentActionsPopover = usePopup(CommentActionsStep);

    const commentEdit = useRef(null);

    const handleEditClick = useCallback(() => {
      commentEdit.current.open();
    }, []);

    return (
      <div className={styles.itemComment}>
        <span className={styles.user}>
          <User size="small" name={user.name} avatarUrl={user.avatarUrl} />
        </span>
        <div className={classNames(styles.content)}>
          <CommentEdit
            ref={commentEdit}
            defaultData={data}
            onUpdate={onUpdate}
            text={<div className={styles.text}>{data.text}</div>}
            actions={
              <div className={styles.header}>
                <div className={styles.title}>
                  <span>
                    <span className={styles.author}>{user.name}</span>
                    <span className={styles.date}>
                      {t(`format:${getDateFormat(createdAt)}`, {
                        postProcess: 'formatDate',
                        value: createdAt,
                      })}
                    </span>
                  </span>
                </div>
                <div className={styles.actions}>
                  {canEdit && isPersisted && (
                    <CommentActionsPopover onEdit={handleEditClick} onDelete={onDelete}>
                      <Button
                        className={styles.commentActionsButton}
                        color="tertiary-text"
                        size="small"
                        icon={<Icon name="more_horiz" type="outlined" size="small" />}
                      />
                    </CommentActionsPopover>
                  )}
                </div>
              </div>
            }
          />
        </div>
      </div>
    );
  },
);

ItemComment.propTypes = {
  data: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  createdAt: PropTypes.instanceOf(Date).isRequired,
  isPersisted: PropTypes.bool.isRequired,
  user: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  canEdit: PropTypes.bool.isRequired,
  onUpdate: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

export default ItemComment;
