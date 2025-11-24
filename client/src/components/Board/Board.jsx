import React, { useState, useEffect, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import {
  DndContext,
  DragOverlay,
  closestCenter,
  pointerWithin,
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
import ListCreate from './ListCreate';
import Card from './Card';
import List from './List';
import styles from './Board.module.scss';

function Board({
  currentUser,
  lists,
  cards,
  editableBoards,
  allBoardMemberships,
  allBoardLabels,
  isCardModalOpened,
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
  const [listItems, setListItems] = useState(lists);
  const groupedCards = useMemo(() => groupBy(cards, 'listId'), [cards]);
  const [cardItems, setCardItems] = useState(groupedCards);
  const [activeId, setActiveId] = useState(null);

  useEffect(() => {
    setListItems(lists);
  }, [lists]);

  useEffect(() => {
    setCardItems(groupedCards);
  }, [groupedCards]);

  const [isListAddOpened, setIsListAddOpened] = useState(false);

  const listsIds = useMemo(() => listItems.map((list) => list.id), [listItems]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
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

  const findContainer = useCallback(
    (id) => {
      if (id in cardItems) {
        return id;
      }
      return Object.keys(cardItems).find((key) => cardItems[key].some((card) => card.id === id));
    },
    [cardItems],
  );

  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  const handleDragOver = (event) => {
    const { active, over } = event;

    if (!over) return;

    const draggedId = active.id;
    let overId = over.id;

    // Check if both active and over are lists
    const isActiveList = listItems.some((col) => col.id === draggedId);
    let isOverList = listItems.some((col) => col.id === overId);

    // Check if overId is a list drop zone
    const isOverListDropZone = overId.startsWith('list-drop-');
    if (isOverListDropZone) {
      overId = overId.replace('list-drop-', '');
      isOverList = true;
    }

    // If overId is not a list, it might be a card - find its parent list
    if (isActiveList && !isOverList) {
      const overContainer = findContainer(overId);
      if (overContainer) {
        overId = overContainer;
        isOverList = true;
      }
    }

    // Handle list reordering in real-time
    if (isActiveList && isOverList) {
      setTimeout(() => {
        setListItems((currentListItems) => {
          const activeIndex = currentListItems.findIndex((col) => col.id === draggedId);
          const overIndex = currentListItems.findIndex((col) => col.id === overId);

          if (activeIndex !== -1 && overIndex !== -1 && activeIndex !== overIndex) {
            return arrayMove(currentListItems, activeIndex, overIndex);
          }
          return currentListItems;
        });
      }, 0);
    }

    // Skip card logic if dragging a list
    if (isActiveList) {
      return;
    }

    const activeContainer = findContainer(draggedId);
    let overContainer = findContainer(overId);

    // Handle dropping into empty list via drop zone
    if (isOverListDropZone) {
      overContainer = overId;
    }

    if (!activeContainer || !overContainer || activeContainer === overContainer) {
      return;
    }

    setTimeout(() => {
      setCardItems((prev) => {
        const activeItems = prev[activeContainer];
        const overItems = prev[overContainer] || [];

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
            ...(prev[overContainer] || []).slice(0, newIndex),
            activeItems[activeIndex],
            ...(prev[overContainer] || []).slice(newIndex),
          ],
        };
      });
    }, 0);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (!over) {
      setActiveId(null);
      return;
    }

    const draggedId = active.id;
    let overId = over.id;

    // Check if overId is a list drop zone
    const isOverListDropZone = overId.startsWith('list-drop-');
    if (isOverListDropZone) {
      overId = overId.replace('list-drop-', '');
    }

    // Check if dragging a list - reordering already done in handleDragOver
    const isActiveList = listItems.some((col) => col.id === draggedId);
    if (isActiveList) {
      // Find the new index after the drag
      const newIndex = listItems.findIndex((col) => col.id === draggedId);

      // Call Redux action to persist the list move
      onListMove(draggedId, newIndex);

      setActiveId(null);
      return;
    }

    // Find the original container from props (before any drag state changes)
    const originalContainer = Object.keys(groupedCards).find((key) =>
      groupedCards[key].some((card) => card.id === draggedId),
    );
    const activeContainer = originalContainer || findContainer(draggedId);
    let overContainer = findContainer(overId);

    // Handle dropping into empty list via drop zone
    if (isOverListDropZone) {
      overContainer = overId;
    }

    // Special case: when active.id === over.id (e.g., dragging first card into empty list)
    // The card might have been moved to a different container during handleDragOver
    if (draggedId === overId && activeContainer) {
      // Check if the card is now in a different container (moved during drag)
      const currentContainer = findContainer(draggedId);
      if (currentContainer && currentContainer !== activeContainer) {
        // Card was moved to a different container, use that as the target
        overContainer = currentContainer;
        overId = null; // No specific card target, just the container
      } else if (activeContainer === currentContainer) {
        // Card wasn't moved, this might be a no-op
        // If active and over are the same and in same container, treat as no-op
        setActiveId(null);
        return;
      }
    }

    if (!activeContainer || !overContainer) {
      setActiveId(null);
      return;
    }

    if (activeContainer === overContainer) {
      // Moving within the same list
      const items = cardItems[activeContainer];
      const oldIndex = items.findIndex((item) => item.id === draggedId);
      const newIndex = overId ? items.findIndex((item) => item.id === overId) : items.length;

      if (oldIndex !== newIndex) {
        setCardItems((prev) => ({
          ...prev,
          [activeContainer]: arrayMove(items, oldIndex, newIndex),
        }));

        // Call Redux action to persist the move
        onCardMove(draggedId, activeContainer, newIndex);
      }
    } else {
      // Moving between different lists
      const overItems = cardItems[overContainer] || [];
      const overIndex = overId ? overItems.findIndex((item) => item.id === overId) : -1;
      const newIndex = overIndex >= 0 ? overIndex : overItems.length;

      // Get the current board ID from the first list
      const currentBoardId = listItems[0]?.boardId;

      // Call Redux action to persist the transfer
      if (currentBoardId) {
        onCardTransfer(draggedId, currentBoardId, overContainer, newIndex);
      }
    }

    setActiveId(null);
  };

  const activeList = listItems.find((col) => col.id === activeId);
  const activeCard = useMemo(() => {
    if (!activeId || activeList) return null;
    return Object.values(cardItems)
      .flat()
      .find((card) => card.id === activeId);
  }, [activeId, activeList, cardItems]);

  useEffect(() => {
    if (isListAddOpened) {
      window.scroll(document.body.scrollWidth, 0);
    }
  }, [listItems, isListAddOpened]);

  return (
    <div className={styles.wrapper}>
      <DndContext
        sensors={sensors}
        collisionDetection={pointerWithin}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={listsIds} strategy={horizontalListSortingStrategy}>
          <div className={styles.container}>
            {listItems.map((list) => (
              <List
                key={list.id}
                id={list.id}
                name={list.name}
                isPersisted={list.isPersisted}
                color={list.color}
                cards={cardItems[list.id] || []}
                currentUser={currentUser}
                editableBoards={editableBoards}
                allBoardMemberships={allBoardMemberships}
                allBoardLabels={allBoardLabels}
                canEdit={canEdit}
                onBoardFetch={onBoardFetch}
                onUpdate={(data) => onListUpdate(list.id, data)}
                onSort={(data) => onListSort(list.id, data)}
                onDelete={() => onListDelete(list.id)}
                onCardCreate={(data, autoOpen) => onCardCreate(list.id, data, autoOpen)}
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
                    color="tertiary-text"
                    size="small"
                    onClick={handleAddListClick}
                    className={styles.addListButton}
                  >
                    <Icon name="add" />
                    <span>
                      {listItems.length > 0 ? t('action.addAnotherList') : t('action.addList')}
                    </span>
                  </Button>
                )}
              </div>
            )}
          </div>
        </SortableContext>

        <DragOverlay>
          {activeList ? (
            <div className={classNames(styles.dragOverlay, styles.list)}>
              <List
                id={activeList.id}
                name={activeList.name}
                isPersisted={activeList.isPersisted}
                color={activeList.color}
                cards={cardItems[activeList.id] || []}
                currentUser={currentUser}
                editableBoards={editableBoards}
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
                editableBoards={editableBoards}
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
  cards: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  editableBoards: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  allBoardMemberships: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  allBoardLabels: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  isCardModalOpened: PropTypes.bool.isRequired,
  canEdit: PropTypes.bool.isRequired,
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
