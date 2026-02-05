import React, { useState, useRef, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';

import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import classNames from 'classnames';
import { Button } from '@openfun/cunningham-react';
import { Icon, Badge } from '@gouvfr-lasuite/ui-kit';
// import { useTranslation } from 'react-i18next';
import { upperFirst, camelCase } from 'lodash';
import styles from '../Board.module.scss';
import Card from '../Card';
import CardCreate from './CardCreate';
import ListNameEdit from './ListNameEdit';
import usePopup from '../../../lib/popup/use-popup';
import ListActionsStep from '../../../steps/ListActionsStep/ListActionsStep';
import globalStyles from '../../../assets/styles/styles.module.scss';

function List({
  id,
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
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
    data: { type: 'List', id },
    disabled: !canEdit,
  });

  const { setNodeRef: setDropRef } = useDroppable({
    id: `list-drop-${id}`,
  });

  // const [t] = useTranslation();
  const [isAddCardOpened, setIsAddCardOpened] = useState(false);
  const [isListActionsPopoverOpen, setIsListActionsPopoverOpen] = useState(false);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const cardsIds = useMemo(() => {
    return cards.map((card) => card.id);
  }, [cards]);

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
      ref={setNodeRef}
      style={style}
      className={classNames(
        styles.list,
        canEdit ? styles.draggable : '',
        isDragging ? styles.dragging : '',
        isListActionsPopoverOpen ? styles.popoverOpened : '',
      )}
    >
      <div
        {...attributes} // eslint-disable-line react/jsx-props-no-spreading
        {...listeners} // eslint-disable-line react/jsx-props-no-spreading
        className={classNames(styles.listHeader, canEdit && styles.listHeaderEditable)}
      >
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
            <Button className={styles.listHeaderButton} color="neutral" variant="tertiary">
              <Icon outlined name="more_horiz" size="small" />
            </Button>
          </ListActionsPopover>
        )}
      </div>
      <SortableContext items={cardsIds} strategy={verticalListSortingStrategy}>
        <div ref={setDropRef} className={classNames(styles.cardsContainer)}>
          {cards.map((card) => (
            <Card
              key={card.id}
              id={card.id}
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
              onMove={(listId, index) => onCardMove(card.id, listId, index)}
              onTransfer={(boardId, listId) => onCardTransfer(card.id, boardId, listId)}
              onDuplicate={() => onCardDuplicate(card.id)}
              onDelete={() => onCardDelete(card.id)}
              onUserAdd={(userId) => onCardUserAdd(userId, card.id)}
              onUserRemove={(userId) => onCardUserRemove(userId, card.id)}
              onLabelAdd={(labelId) => onCardLabelAdd(labelId, card.id)}
              onLabelRemove={(labelId) => onCardLabelRemove(labelId, card.id)}
              onLabelCreate={(data) => onCardLabelCreate(data)}
              onLabelUpdate={(labelId, data) => onCardLabelUpdate(labelId, data)}
              onLabelMove={(labelId, index) => onCardLabelMove(labelId, index)}
              onLabelDelete={(labelId) => onCardLabelDelete(labelId)}
            />
          ))}
          {cards.length === 0 && <div className={styles.emptyDropZone} />}
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
              Nouvelle carte
            </Button>
          </div>
        )}
      </SortableContext>
    </div>
  );
}

List.propTypes = {
  id: PropTypes.string.isRequired,
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
