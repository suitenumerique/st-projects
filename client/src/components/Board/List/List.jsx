import React, { useState, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';

import { KeyboardSensor, PointerSensor } from '@dnd-kit/react';
import { useSortable } from '@dnd-kit/react/sortable';
import classNames from 'classnames';
import { Button } from '@gouvfr-lasuite/cunningham-react';
import { Badge, Icon } from '@gouvfr-lasuite/ui-kit';
// import { useTranslation } from 'react-i18next';
import { upperFirst, camelCase } from 'lodash';
import styles from '../Board.module.scss';
import Card from '../Card';
import CardCreate from './CardCreate';
import ListNameEdit from './ListNameEdit';
import usePopup from '../../../lib/popup/use-popup';
import ListActionsStep from '../../../steps/ListActionsStep/ListActionsStep';
import globalStyles from '../../../assets/styles/styles.module.scss';

// sortable placeholder so the sortable system can always route cards to this list.
// rendered in every list (not just empty ones) so that when the last card is dragged
// away, the plugin still has a target to route the card back to.
function ListDropTarget({ listId, index }) {
  const sortable = useSortable({
    id: `empty-placeholder-${listId}`,
    index,
    group: listId,
    type: 'Card',
    accept: ['Card'],
    sensors: [],
  });

  return (
    <div
      ref={sortable.ref}
      className={classNames(styles.emptyDropZone, sortable.isDropTarget && styles.dropZoneActive)}
    />
  );
}

ListDropTarget.propTypes = {
  listId: PropTypes.string.isRequired,
  index: PropTypes.number.isRequired,
};

function List({
  id,
  index,
  name,
  isPersisted,
  color,
  currentUser,
  cards,
  canEdit,
  editableBoards,
  allBoardMemberships,
  allBoardLabels,
  onBoardFetch,
  onUpdate,
  onDelete,
  onSort,
  onCardCreate,
  onCardUpdate,
  onCardMove,
  onCardTransfer,
  onCardDuplicate,
  onCardDelete,
  onCardUserAdd,
  onCardUserRemove,
  onCardLabelAdd,
  onCardLabelRemove,
  onCardLabelCreate,
  onCardLabelUpdate,
  onCardLabelMove,
  onCardLabelDelete,
}) {
  const [t] = useTranslation();

  const sortable = useSortable({
    id,
    index,
    group: 'lists',
    type: 'List',
    accept: ['List'],
    disabled: !canEdit,
    sensors: [KeyboardSensor, PointerSensor],
  });

  // const [t] = useTranslation();
  const [isAddCardOpened, setIsAddCardOpened] = useState(false);
  const [isListActionsPopoverOpen, setIsListActionsPopoverOpen] = useState(false);

  const nameEdit = useRef(null);

  const ListActionsPopover = usePopup(ListActionsStep);

  const handleHeaderClick = useCallback(() => {
    if (isPersisted && canEdit) {
      nameEdit.current.open();
    }
  }, [isPersisted, canEdit]);

  const handleNameUpdate = useCallback(
    (newName) => {
      onUpdate({
        name: newName,
      });
    },
    [onUpdate],
  );

  const handleColorEdit = useCallback(
    (newColor) => {
      onUpdate({
        color: newColor,
      });
    },
    [onUpdate],
  );

  const handleAddCardClick = useCallback(() => {
    setIsAddCardOpened(true);
  }, []);

  const handleAddCardClose = useCallback(() => {
    setIsAddCardOpened(false);
  }, []);

  const handleNameEdit = useCallback(() => {
    nameEdit.current.open();
  }, []);

  const handleCardAdd = useCallback(() => {
    setIsAddCardOpened(true);
  }, []);

  return (
    <div
      ref={sortable.ref}
      className={classNames(
        styles.list,
        canEdit ? styles.draggable : '',
        sortable.isDragging ? styles.dragging : '',
        isListActionsPopoverOpen ? styles.popoverOpened : '',
      )}
    >
      <div className={classNames(styles.listHeader, canEdit && styles.listHeaderEditable)}>
        <div
          onClick={() => {
            handleHeaderClick();
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleHeaderClick();
            }
          }}
          role="button"
          className={styles.listHeaderNameEdit}
          tabIndex={canEdit ? 0 : -1}
        >
          <ListNameEdit ref={nameEdit} defaultValue={name} onUpdate={handleNameUpdate}>
            <div className={styles.listHeaderContent}>
              {color && (
                <Icon
                  name="circle"
                  className={classNames(
                    styles.listColor,
                    globalStyles[`color${upperFirst(camelCase(color))}`],
                  )}
                />
              )}
              <p className={styles.listName}>{name}</p>
              <Badge type="neutral">{cards.length}</Badge>
            </div>
          </ListNameEdit>
        </div>

        {isPersisted && canEdit && (
          <ListActionsPopover
            onNameEdit={handleNameEdit}
            onCardAdd={handleCardAdd}
            onDelete={onDelete}
            onSort={onSort}
            color={color}
            onColorEdit={handleColorEdit}
            onOpenChange={setIsListActionsPopoverOpen}
          >
            <Button className={styles.listHeaderButton} color="brand" variant="tertiary">
              <Icon type="outlined" name="more_horiz" />
            </Button>
          </ListActionsPopover>
        )}
      </div>
      <div className={classNames(styles.cardsContainer)}>
        {cards.map((card, cardIndex) => (
          <Card
            key={card.id}
            id={card.id}
            index={cardIndex}
            name={card.name}
            description={card.description}
            dueDate={card.dueDate}
            isDueDateCompleted={card.isDueDateCompleted}
            stopwatch={card.stopwatch}
            coverUrl={card.coverUrl}
            boardId={card.boardId}
            listId={card.listId}
            projectId={card.projectId}
            isPersisted={card.isPersisted}
            attachmentsTotal={card.attachmentsTotal}
            notificationsTotal={card.notificationsTotal}
            users={card.users}
            labels={card.labels}
            tasks={card.tasks}
            editableBoards={editableBoards}
            allBoardMemberships={allBoardMemberships}
            allLabels={allBoardLabels}
            currentUser={currentUser}
            canEdit={canEdit}
            onBoardFetch={onBoardFetch}
            onUpdate={(data) => onCardUpdate(card.id, data)}
            onMove={(listId, targetIndex) => onCardMove(card.id, listId, targetIndex)}
            onTransfer={(boardId, listId) => onCardTransfer(card.id, boardId, listId)}
            onDuplicate={() => onCardDuplicate(card.id)}
            onDelete={() => onCardDelete(card.id)}
            onUserAdd={(userId) => onCardUserAdd(userId, card.id)}
            onUserRemove={(userId) => onCardUserRemove(userId, card.id)}
            onLabelAdd={(labelId) => onCardLabelAdd(labelId, card.id)}
            onLabelRemove={(labelId) => onCardLabelRemove(labelId, card.id)}
            onLabelCreate={(data) => onCardLabelCreate(data)}
            onLabelUpdate={(labelId, data) => onCardLabelUpdate(labelId, data)}
            onLabelMove={(labelId, targetIndex) => onCardLabelMove(labelId, targetIndex)}
            onLabelDelete={(labelId) => onCardLabelDelete(labelId)}
          />
        ))}
        <ListDropTarget listId={id} index={cards.length} />
        {canEdit && (
          <CardCreate
            isOpened={isAddCardOpened}
            onCreate={onCardCreate}
            onClose={handleAddCardClose}
          />
        )}
      </div>
      {!isAddCardOpened && canEdit && (
        <div className={styles.addCardButton}>
          <Button
            color="brand"
            variant="tertiary"
            size="small"
            onClick={() => {
              handleAddCardClick();
            }}
          >
            <Icon name="add" />
            {t('action.newCard')}
          </Button>
        </div>
      )}
    </div>
  );
}

List.propTypes = {
  id: PropTypes.string.isRequired,
  index: PropTypes.number.isRequired,
  name: PropTypes.string.isRequired,
  isPersisted: PropTypes.bool.isRequired,
  color: PropTypes.string.isRequired,
  currentUser: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  cards: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      content: PropTypes.string.isRequired,
    }),
  ).isRequired,
  editableBoards: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  allBoardMemberships: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  allBoardLabels: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  canEdit: PropTypes.bool.isRequired,
  onBoardFetch: PropTypes.func.isRequired,
  onUpdate: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onSort: PropTypes.func.isRequired,
  onCardCreate: PropTypes.func.isRequired,
  onCardUpdate: PropTypes.func.isRequired,
  onCardMove: PropTypes.func.isRequired,
  onCardTransfer: PropTypes.func.isRequired,
  onCardDuplicate: PropTypes.func.isRequired,
  onCardDelete: PropTypes.func.isRequired,
  onCardUserAdd: PropTypes.func.isRequired,
  onCardUserRemove: PropTypes.func.isRequired,
  onCardLabelAdd: PropTypes.func.isRequired,
  onCardLabelRemove: PropTypes.func.isRequired,
  onCardLabelCreate: PropTypes.func.isRequired,
  onCardLabelUpdate: PropTypes.func.isRequired,
  onCardLabelMove: PropTypes.func.isRequired,
  onCardLabelDelete: PropTypes.func.isRequired,
};

export default List;
