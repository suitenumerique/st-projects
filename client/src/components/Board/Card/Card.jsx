import React, { useCallback, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { PointerActivationConstraints } from '@dnd-kit/dom';
import { KeyboardSensor, PointerSensor } from '@dnd-kit/react';
import { useSortable } from '@dnd-kit/react/sortable';
import classNames from 'classnames';
import { Link } from 'react-router-dom';
import { Button } from '@gouvfr-lasuite/cunningham-react';
import { Icon } from '@gouvfr-lasuite/ui-kit';
import styles from '../Board.module.scss';
import Label from '../../../ui/Label';
import DueDate from '../../../ui/DueDate';
import Stopwatch from '../../../ui/Stopwatch';
import User from '../../../ui/User';
import CardNameEdit from './CardNameEdit';

import Paths from '../../../constants/Paths';
import { stopStopwatch, startStopwatch } from '../../../utils/stopwatch';
import CardActionsStep from '../../../steps/CardActionsStep';
import usePopup from '../../../lib/popup/use-popup';

const CardPointerSensor = PointerSensor.configure({
  activationConstraints: [
    new PointerActivationConstraints.Distance({
      value: 5, // Allow clicking the card through draggable area
    }),
  ],
});

function Card({
  id,
  name,
  description,
  dueDate,
  isDueDateCompleted,
  stopwatch,
  // isCompleted,
  coverUrl,
  boardId,
  listId,
  projectId,
  isPersisted,
  attachmentsTotal,
  // notificationsTotal,
  users,
  labels,
  tasks,
  editableBoards,
  allBoardMemberships,
  allLabels,
  canEdit,
  onUpdate,
  onMove,
  onTransfer,
  onDuplicate,
  onDelete,
  onUserAdd,
  onUserRemove,
  onBoardFetch,
  onLabelAdd,
  onLabelRemove,
  onLabelCreate,
  onLabelUpdate,
  onLabelMove,
  onLabelDelete,
  currentUser,
  index,
}) {
  const sortable = useSortable({
    id,
    index,
    group: listId,
    type: 'Card',
    accept: ['Card'],
    disabled: !canEdit,
    sensors: [KeyboardSensor, CardPointerSensor],
  });

  const CardActionsPopover = usePopup(CardActionsStep);
  const nameEdit = useRef(null);
  const [isCardActionsPopoverOpen, setIsCardActionsPopoverOpen] = useState(false);

  const handleClick = useCallback(() => {
    if (document.activeElement) {
      document.activeElement.blur();
    }
  }, []);

  const handleToggleStopwatchClick = useCallback(
    (event) => {
      event.preventDefault();

      onUpdate({
        stopwatch: stopwatch.startedAt ? stopStopwatch(stopwatch) : startStopwatch(stopwatch),
      });
    },
    [stopwatch, onUpdate],
  );

  const handleNameUpdate = useCallback(
    (newName) => {
      onUpdate({
        name: newName,
      });
    },
    [onUpdate],
  );

  const handleNameEdit = useCallback(() => {
    nameEdit.current.open();
  }, []);

  const contentNode = (
    <>
      {coverUrl && <img src={coverUrl} alt="" className={styles.cardCover} />}
      <div>
        {labels.length > 0 && (
          <span className={styles.cardLabels}>
            {labels.map((label) => (
              <span
                key={label.id}
                className={classNames(styles.cardAttachment, styles.cardAttachmentLeft)}
              >
                <Label name={label.name} color={label.color} size="tiny" />
              </span>
            ))}
          </span>
        )}
        <div className={styles.cardName}>
          <span>{name}</span>
        </div>
        <div className={styles.cardInfos}>
          <div className={styles.cardInfosLeft}>
            {dueDate && (
              <div className={styles.cardInfo}>
                <DueDate value={dueDate} isCompleted={isDueDateCompleted} size="tiny" />
              </div>
            )}
            {description && (
              <div className={styles.cardInfo}>
                <Icon name="format_align_left" type="outlined" size="small" />
              </div>
            )}
            {tasks.length > 0 && (
              <div className={styles.cardInfo}>
                <Icon name="check_box" type="outlined" size="small" />{' '}
                {tasks.filter((task) => task.isCompleted).length}/{tasks.length}
              </div>
            )}
            {attachmentsTotal > 0 && (
              <div className={styles.cardInfo}>
                <Icon name="attach_file" type="outlined" size="small" />
                {attachmentsTotal}
              </div>
            )}
            {stopwatch && (
              <div className={styles.cardInfo}>
                <Stopwatch
                  as="span"
                  startedAt={stopwatch.startedAt}
                  total={stopwatch.total}
                  size="tiny"
                  onClick={canEdit ? handleToggleStopwatchClick : undefined}
                />
              </div>
            )}
          </div>
          <div className={styles.cardInfosRight}>
            {users.length > 0 && (
              <div className={classNames(styles.cardInfo, styles.cardUsers)}>
                {users.map((user) => (
                  <User key={user.id} name={user.name} avatarUrl={user.avatarUrl} size="small" />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );

  return (
    <div
      ref={(el) => {
        sortable.ref(el);
        sortable.handleRef(el);
      }}
      className={classNames(
        styles.card,
        canEdit ? styles.draggable : '',
        sortable.isDragging ? styles.dragging : '',
        isCardActionsPopoverOpen ? styles.popoverOpened : '',
      )}
    >
      <CardNameEdit ref={nameEdit} defaultValue={name} onUpdate={handleNameUpdate}>
        <div>
          {isPersisted && currentUser ? (
            <>
              <Link
                to={Paths.CARDS.replace(':id', id)}
                className={styles.cardContent}
                onClick={handleClick}
              >
                {contentNode}
              </Link>
              {canEdit && (
                <CardActionsPopover
                  card={{
                    dueDate,
                    stopwatch,
                    boardId,
                    listId,
                    projectId,
                  }}
                  editableBoards={editableBoards}
                  boardMemberships={allBoardMemberships}
                  currentUserIds={users.map((user) => user.id)}
                  labels={allLabels}
                  currentLabelIds={labels.map((label) => label.id)}
                  onNameEdit={handleNameEdit}
                  onUpdate={onUpdate}
                  onMove={onMove}
                  onTransfer={onTransfer}
                  onDuplicate={onDuplicate}
                  onDelete={onDelete}
                  onUserAdd={onUserAdd}
                  onUserRemove={onUserRemove}
                  onBoardFetch={onBoardFetch}
                  onLabelAdd={onLabelAdd}
                  onLabelRemove={onLabelRemove}
                  onLabelCreate={onLabelCreate}
                  onLabelUpdate={onLabelUpdate}
                  onLabelMove={onLabelMove}
                  onLabelDelete={onLabelDelete}
                  onOpenChange={setIsCardActionsPopoverOpen}
                >
                  <Button
                    className={classNames(styles.cardActionsButton)}
                    color="neutral"
                    variant="tertiary"
                    icon={<Icon name="edit" type="outlined" />}
                    size="small"
                  />
                </CardActionsPopover>
              )}
            </>
          ) : (
            <span className={styles.content}>{contentNode}</span>
          )}
        </div>
      </CardNameEdit>
    </div>
  );
}

Card.propTypes = {
  id: PropTypes.string.isRequired,
  index: PropTypes.number.isRequired,
  name: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  dueDate: PropTypes.string.isRequired,
  isDueDateCompleted: PropTypes.bool.isRequired,
  stopwatch: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  isCompleted: PropTypes.bool.isRequired, // eslint-disable-line react/no-unused-prop-types
  coverUrl: PropTypes.string.isRequired,
  boardId: PropTypes.string.isRequired,
  listId: PropTypes.string.isRequired,
  projectId: PropTypes.string.isRequired,
  isPersisted: PropTypes.bool.isRequired,
  attachmentsTotal: PropTypes.number.isRequired,
  notificationsTotal: PropTypes.number.isRequired, // eslint-disable-line react/no-unused-prop-types
  users: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  labels: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  tasks: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  editableBoards: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  allBoardMemberships: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  allLabels: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  currentUser: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  canEdit: PropTypes.bool.isRequired,
  onUpdate: PropTypes.func.isRequired,
  onMove: PropTypes.func.isRequired,
  onTransfer: PropTypes.func.isRequired,
  onDuplicate: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onUserAdd: PropTypes.func.isRequired,
  onUserRemove: PropTypes.func.isRequired,
  onBoardFetch: PropTypes.func.isRequired,
  onLabelAdd: PropTypes.func.isRequired,
  onLabelRemove: PropTypes.func.isRequired,
  onLabelCreate: PropTypes.func.isRequired,
  onLabelUpdate: PropTypes.func.isRequired,
  onLabelMove: PropTypes.func.isRequired,
  onLabelDelete: PropTypes.func.isRequired,
};

export default React.memo(Card);
