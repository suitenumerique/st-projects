import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import PropTypes from 'prop-types';
import { AutoScroller } from '@dnd-kit/dom';
import { DragDropProvider, DragOverlay } from '@dnd-kit/react';
import { isSortable } from '@dnd-kit/react/sortable';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { groupBy } from 'lodash';
import { Button } from '@gouvfr-lasuite/cunningham-react';
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

  useEffect(() => {
    setListItems(lists);
  }, [lists]);

  useEffect(() => {
    setCardItems(groupedCards);
  }, [groupedCards]);

  const [isListAddOpened, setIsListAddOpened] = useState(false);

  const handleAddListClick = useCallback(() => {
    setIsListAddOpened(true);
  }, []);

  const handleAddListClose = useCallback(() => {
    setIsListAddOpened(false);
  }, []);

  // track the card's original parent DOM node so we can revert the
  // OptimisticSortingPlugin's cross-container DOM move before React reconciles
  // otherwise it was throwing: `Failed to execute 'removeChild' on 'Node'`
  // and managing `event.preventDefault()` as in https://github.com/clauderic/dnd-kit/issues/1747 was not ideal
  // since managing all the state manually
  const originalCardParentRef = useRef(null);

  /**
   * @type {NonNullable<
   *   import("react").ComponentProps<
   *     typeof import("@dnd-kit/react").DragDropProvider
   *   >["onDragStart"]
   * >}
   */
  const handleDragStart = (event) => {
    const { source } = event.operation;

    if (source && isSortable(source) && source.type === 'Card') {
      originalCardParentRef.current = source.sortable.element?.parentNode || null;
    }
  };

  /**
   * @type {NonNullable<
   *   import("react").ComponentProps<
   *     typeof import("@dnd-kit/react").DragDropProvider
   *   >["onDragEnd"]
   * >}
   */
  const handleDragEnd = (event) => {
    const { source } = event.operation;

    if (event.canceled || !source || !isSortable(source)) {
      originalCardParentRef.current = null;

      return;
    }

    // check if dragging a list
    if (source.type === 'List') {
      if (source.index !== source.initialIndex) {
        onListMove(source.id, source.index);
      }
    } else if (source.type === 'Card') {
      // card drag
      // the card may be moved either inside its current list or across lists
      if (source.group !== source.initialGroup) {
        // the OptimisticSortingPlugin physically moved the card's DOM to the
        // target list during dragover. Move it back before dispatching Redux
        // so React can reconcile without removeChild errors.
        // note: overriding plugins would not work since common to all `useSortable`, that's not what we want (also, not having it would require managing all states during dragging)
        const cardElement = source.sortable.element;
        const originalParent = originalCardParentRef.current;

        if (cardElement && originalParent && cardElement.parentNode !== originalParent) {
          cardElement.style.display = 'none';
          originalParent.appendChild(cardElement);
        }

        // the placeholder sortable sits at index cards.length in every list,
        // so cap the index to the actual card count (handles empty lists and
        // drops after the last card).
        const targetCards = cardItems[source.group] || [];
        const targetIndex = Math.min(source.index, targetCards.length);

        if (listItems.length > 0) {
          onCardTransfer(source.id, listItems[0].boardId, source.group, targetIndex);
        }
      } else if (source.index !== source.initialIndex) {
        // same-list reorder detected by the plugin
        onCardMove(source.id, source.group, source.index);
      }

      originalCardParentRef.current = null;
    }
  };

  useEffect(() => {
    if (isListAddOpened) {
      window.scroll(document.body.scrollWidth, 0);
    }
  }, [listItems, isListAddOpened]);

  return (
    <div className={styles.wrapper}>
      <DragDropProvider
        plugins={(defaults) => [
          ...defaults,
          AutoScroller.configure({
            // it avoids having the scrollbar jumps when dragging on the cards container border
            layoutShiftCompensation: false,
          }),
        ]}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className={styles.container}>
          {listItems.map((list, listIndex) => (
            <List
              key={list.id}
              id={list.id}
              index={listIndex}
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
                  color="brand"
                  variant="tertiary"
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

        <DragOverlay>
          {(source) => {
            const activeList = listItems.find((col) => col.id === source.id);

            if (activeList) {
              return (
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
              );
            }

            const activeCard = Object.values(cardItems)
              .flat()
              .find((card) => card.id === source.id);

            if (activeCard) {
              return (
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
              );
            }

            return null;
          }}
        </DragOverlay>
      </DragDropProvider>
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
