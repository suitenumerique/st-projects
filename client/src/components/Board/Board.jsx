import React, { useState, useEffect, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { Button } from '@openfun/cunningham-react';
import { groupBy } from 'lodash';
import { Icon } from '@gouvfr-lasuite/ui-kit';
import CardModalContainer from '../../containers/CardModalContainer';
import ListCreate from '../ListCreate/ListCreate';
import Card from './Card';

import Column from './Column';
import styles from './Board.module.scss';

function Board({
  currentUser,
  lists,
  cardsFullData,
  isCardModalOpened,
  allBoards,
  allBoardMemberships,
  allBoardLabels,
  canEdit,
  onBoardFetch,
  onListCreate,
  onListUpdate,
  onListMove,
  onListSort,
  onListDelete,
  onCardCreate,
  onCardMove,
  onCardUpdate,
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
  const cardsByListId = useMemo(() => groupBy(cardsFullData, 'listId'), [cardsFullData]);
  const [isListAddOpened, setIsListAddOpened] = useState(false);

  const [columns, setColumns] = useState(lists);
  const [cards, setCards] = useState(cardsByListId);
  const [activeId, setActiveId] = useState(null);

  useEffect(() => {
    setColumns(lists);
  }, [lists]);

  useEffect(() => {
    setCards(cardsByListId);
  }, [cardsByListId]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleAddListClick = useCallback(() => {
    setIsListAddOpened(true);
  }, []);

  const handleAddListClose = useCallback(() => {
    setIsListAddOpened(false);
  }, []);

  const findContainer = (id) => {
    if (id in cards) {
      return id;
    }
    return Object.keys(cards).find((key) => cards[key].some((card) => card.id === id));
  };

  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  const handleDragOver = (event) => {
    const { active, over } = event;
    if (!over) return;

    const draggedId = active.id;
    let overId = over.id;

    // Check if both active and over are columns - use the CURRENT columns state
    const isActiveColumn = columns.some((col) => col.id === draggedId);
    let isOverColumn = columns.some((col) => col.id === overId);

    // If overId is not a column, it might be a card - find its parent column
    if (isActiveColumn && !isOverColumn) {
      const overContainer = findContainer(overId);
      if (overContainer) {
        overId = overContainer;
        isOverColumn = true;
      }
    }

    // Handle column reordering in real-time
    if (isActiveColumn && isOverColumn) {
      setColumns((currentColumns) => {
        const activeIndex = currentColumns.findIndex((col) => col.id === draggedId);
        const overIndex = currentColumns.findIndex((col) => col.id === overId);

        if (activeIndex !== -1 && overIndex !== -1 && activeIndex !== overIndex) {
          return arrayMove(currentColumns, activeIndex, overIndex);
        }
        return currentColumns;
      });
      return;
    }

    // Skip card logic if dragging a column
    if (isActiveColumn) {
      return;
    }

    const activeContainer = findContainer(draggedId);
    const overContainer = findContainer(overId);

    if (!activeContainer || !overContainer || activeContainer === overContainer) {
      return;
    }

    setCards((prev) => {
      const activeItems = prev[activeContainer];
      const overItems = prev[overContainer];

      const activeIndex = activeItems.findIndex((item) => item.id === draggedId);
      const overIndex = overItems.findIndex((item) => item.id === overId);

      let newIndex;
      if (overId in prev) {
        newIndex = overItems.length + 1;
      } else {
        const isBelowLastItem = over && overIndex === overItems.length - 1;
        const modifier = isBelowLastItem ? 1 : 0;
        newIndex = overIndex >= 0 ? overIndex + modifier : overItems.length + 1;
      }

      return {
        ...prev,
        [activeContainer]: prev[activeContainer].filter((item) => item.id !== draggedId),
        [overContainer]: [
          ...prev[overContainer].slice(0, newIndex),
          activeItems[activeIndex],
          ...prev[overContainer].slice(newIndex),
        ],
      };
    });
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over) {
      setActiveId(null);
      return;
    }

    const draggedId = active.id;
    const overId = over.id;

    // Check if dragging a column - reordering already done in handleDragOver
    const isActiveColumn = columns.some((col) => col.id === draggedId);
    if (isActiveColumn) {
      // Find the new index after the drag
      const newIndex = columns.findIndex((col) => col.id === draggedId);

      // Call Redux action to persist the column move
      onListMove(draggedId, newIndex);

      setActiveId(null);
      return;
    }

    const activeContainer = findContainer(draggedId);
    const overContainer = findContainer(overId);

    if (!activeContainer || !overContainer) {
      setActiveId(null);
      return;
    }

    if (activeContainer === overContainer) {
      // Moving within the same column
      const items = cards[activeContainer];
      const oldIndex = items.findIndex((item) => item.id === draggedId);
      const newIndex = items.findIndex((item) => item.id === overId);

      if (oldIndex !== newIndex) {
        setCards((prev) => ({
          ...prev,
          [activeContainer]: arrayMove(items, oldIndex, newIndex),
        }));

        // Call Redux action to persist the move
        onCardMove(draggedId, activeContainer, newIndex);
      }
    } else {
      // Moving between different columns
      const overItems = cards[overContainer];
      const overIndex = overItems.findIndex((item) => item.id === overId);
      const newIndex = overIndex >= 0 ? overIndex : overItems.length;

      // Get the current board ID from the first column
      const currentBoardId = columns[0]?.boardId;

      // Call Redux action to persist the transfer
      if (currentBoardId) {
        onCardTransfer(draggedId, currentBoardId, overContainer, newIndex);
      }
    }

    setActiveId(null);
  };

  const activeColumn = columns.find((col) => col.id === activeId);
  const activeCard =
    activeId && !activeColumn
      ? Object.values(cards)
          .flat()
          .find((card) => card.id === activeId)
      : null;

  useEffect(() => {
    if (isListAddOpened) {
      window.scroll(document.body.scrollWidth, 0);
    }
  }, [columns, isListAddOpened]);

  return (
    <div className={styles.wrapper}>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={columns.map((col) => col.id)}
          strategy={horizontalListSortingStrategy}
        >
          <div className={styles.container}>
            {columns.map((column) => (
              <Column
                key={column.id}
                id={column.id}
                name={column.name}
                isPersisted={column.isPersisted}
                color={column.color}
                cards={cards[column.id] || []}
                currentUser={currentUser}
                allBoards={allBoards}
                allBoardMemberships={allBoardMemberships}
                allBoardLabels={allBoardLabels}
                canEdit={canEdit}
                onBoardFetch={onBoardFetch}
                onUpdate={(data) => onListUpdate(column.id, data)}
                onSort={(data) => onListSort(column.id, data)}
                onDelete={() => onListDelete(column.id)}
                onCardCreate={(data, autoOpen) => onCardCreate(column.id, data, autoOpen)}
                onCardUpdate={onCardUpdate}
                onCardMove={onCardMove}
                onCardTransfer={onCardTransfer}
                onCardDuplicate={onCardDuplicate}
                onCardDelete={onCardDelete}
                onCardUserAdd={onCardUserAdd}
                onCardUserRemove={onCardUserRemove}
                onCardLabelAdd={onCardLabelAdd}
                onCardLabelRemove={onCardLabelRemove}
                onCardLabelCreate={onCardLabelCreate}
                onCardLabelUpdate={onCardLabelUpdate}
                onCardLabelMove={onCardLabelMove}
                onCardLabelDelete={onCardLabelDelete}
              />
            ))}
            {canEdit && (
              <div className={styles.list}>
                {isListAddOpened ? (
                  <ListCreate onCreate={onListCreate} onClose={handleAddListClose} />
                ) : (
                  <Button
                    color="secondary-text"
                    onClick={handleAddListClick}
                    className={styles.addListButton}
                  >
                    <Icon name="add" />
                    <span>
                      {columns.length > 0 ? t('action.addAnotherList') : t('action.addList')}
                    </span>
                  </Button>
                )}
              </div>
            )}
          </div>
        </SortableContext>

        <DragOverlay>
          {activeColumn ? (
            <div className={classNames(styles.dragOverlay, styles.column)}>
              <Column
                id={activeColumn.id}
                name={activeColumn.name}
                isPersisted={activeColumn.isPersisted}
                color={activeColumn.color}
                cards={cards[activeColumn.id] || []}
                currentUser={currentUser}
                allBoards={allBoards}
                allBoardMemberships={allBoardMemberships}
                allBoardLabels={allBoardLabels}
                canEdit={canEdit}
                onBoardFetch={() => {}} // No-op for drag overlay
                onUpdate={() => {}} // No-op for drag overlay
                onDelete={() => {}} // No-op for drag overlay
                onSort={() => {}} // No-op for drag overlay
                onCardCreate={() => {}} // No-op for drag overlay
                onCardUpdate={() => {}} // No-op for drag overlay
                onCardMove={() => {}} // No-op for drag overlay
                onCardTransfer={() => {}} // No-op for drag overlay
                onCardDuplicate={() => {}} // No-op for drag overlay
                onCardDelete={() => {}} // No-op for drag overlay
                onCardUserAdd={() => {}} // No-op for drag overlay
                onCardUserRemove={() => {}} // No-op for drag overlay
                onCardLabelAdd={() => {}} // No-op for drag overlay
                onCardLabelRemove={() => {}} // No-op for drag overlay
                onCardLabelCreate={() => {}} // No-op for drag overlay
                onCardLabelUpdate={() => {}} // No-op for drag overlay
                onCardLabelMove={() => {}} // No-op for drag overlay
                onCardLabelDelete={() => {}} // No-op for drag overlay
              />
            </div>
          ) : (
            activeCard && (
              <Card
                id={activeCard.id}
                name={activeCard.name}
                description={activeCard.description}
                dueDate={activeCard.dueDate}
                isDueDateCompleted={activeCard.isDueDateCompleted}
                stopwatch={activeCard.stopwatch}
                isCompleted={activeCard.isCompleted}
                coverUrl={activeCard.coverUrl}
                boardId={activeCard.boardId}
                listId={activeCard.listId}
                projectId={activeCard.projectId}
                isPersisted={activeCard.isPersisted}
                attachmentsTotal={activeCard.attachmentsTotal}
                notificationsTotal={activeCard.notificationsTotal}
                users={activeCard.users}
                labels={activeCard.labels}
                tasks={activeCard.tasks}
                allBoards={allBoards}
                allBoardMemberships={allBoardMemberships}
                allLabels={allBoardLabels}
                currentUser={currentUser}
                canEdit={canEdit}
                onUpdate={() => {}} // No-op for drag overlay
                onMove={() => {}} // No-op for drag overlay
                onTransfer={() => {}} // No-op for drag overlay
                onDuplicate={() => {}} // No-op for drag overlay
                onDelete={() => {}} // No-op for drag overlay
                onUserAdd={() => {}} // No-op for drag overlay
                onUserRemove={() => {}} // No-op for drag overlay
                onBoardFetch={() => {}} // No-op for drag overlay
                onLabelAdd={() => {}} // No-op for drag overlay
                onLabelRemove={() => {}} // No-op for drag overlay
                onLabelCreate={() => {}} // No-op for drag overlay
                onLabelUpdate={() => {}} // No-op for drag overlay
                onLabelMove={() => {}} // No-op for drag overlay
                onLabelDelete={() => {}} // No-op for drag overlay
              />
            )
          )}
        </DragOverlay>
      </DndContext>
      {isCardModalOpened && <CardModalContainer />}
    </div>
  );
}

Board.propTypes = {
  currentUser: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  lists: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  cardsFullData: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  canEdit: PropTypes.bool.isRequired,
  isCardModalOpened: PropTypes.bool.isRequired,
  allBoards: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  allBoardMemberships: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  allBoardLabels: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  onBoardFetch: PropTypes.func.isRequired,
  onListCreate: PropTypes.func.isRequired,
  onListUpdate: PropTypes.func.isRequired,
  onListMove: PropTypes.func.isRequired,
  onListSort: PropTypes.func.isRequired,
  onListDelete: PropTypes.func.isRequired,
  onCardCreate: PropTypes.func.isRequired,
  onCardMove: PropTypes.func.isRequired,
  onCardUpdate: PropTypes.func.isRequired,
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

export default Board;
