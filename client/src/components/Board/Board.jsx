import React, { useState, useEffect, useCallback, useRef } from 'react';
import PropTypes from 'prop-types';
import { AutoScroller } from '@dnd-kit/dom';
import { DragDropProvider, DragOverlay } from '@dnd-kit/react';
import { isSortable } from '@dnd-kit/react/sortable';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { Button } from '@gouvfr-lasuite/cunningham-react';
import { Icon } from '@gouvfr-lasuite/ui-kit';

import CardContainer from '../../containers/CardContainer';
import CardModalContainer from '../../containers/CardModalContainer';
import ListContainer from '../../containers/ListContainer';
import ListCreate from './ListCreate';
import styles from './Board.module.scss';

function Board({
  listIds,
  boardId,
  isCardModalOpened,
  canEdit,
  onListCreate,
  onListMove,
  onCardMove,
  onCardTransfer,
}) {
  const [t] = useTranslation();
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
   *   >["plugins"]
   * >}
   */
  const providerPlugins = useCallback(
    (defaults) => [
      ...defaults,
      AutoScroller.configure({
        // it avoids having the scrollbar jumps when dragging on the cards container border
        layoutShiftCompensation: false,
      }),
    ],
    [],
  );

  /**
   * @type {NonNullable<
   *   import("react").ComponentProps<
   *     typeof import("@dnd-kit/react").DragDropProvider
   *   >["onDragStart"]
   * >}
   */
  const handleDragStart = useCallback((event) => {
    const { source } = event.operation;

    if (source && isSortable(source) && source.type === 'Card') {
      originalCardParentRef.current = source.sortable.element?.parentNode || null;
    }
  }, []);

  /**
   * @type {NonNullable<
   *   import("react").ComponentProps<
   *     typeof import("@dnd-kit/react").DragDropProvider
   *   >["onDragEnd"]
   * >}
   */
  const handleDragEnd = useCallback(
    (event) => {
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

          onCardTransfer(source.id, boardId, source.group, source.index);
        } else if (source.index !== source.initialIndex) {
          // same-list reorder detected by the plugin
          onCardMove(source.id, source.group, source.index);
        }

        originalCardParentRef.current = null;
      }
    },
    [boardId, onListMove, onCardTransfer, onCardMove],
  );

  useEffect(() => {
    if (isListAddOpened) {
      window.scroll(document.body.scrollWidth, 0);
    }
  }, [listIds, isListAddOpened]);

  return (
    <div className={styles.wrapper}>
      <DragDropProvider
        plugins={providerPlugins}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className={styles.container}>
          {listIds.map((listId, listIndex) => (
            <ListContainer key={listId} id={listId} index={listIndex} />
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
                    {listIds.length > 0 ? t('action.addAnotherList') : t('action.addList')}
                  </span>
                </Button>
              )}
            </div>
          )}
        </div>

        <DragOverlay>
          {(source) => {
            if (source.type === 'List') {
              return (
                <div className={classNames(styles.dragOverlay, styles.list)}>
                  <ListContainer id={source.id} index={source.index} />
                </div>
              );
            }

            if (source.type === 'Card') {
              return <CardContainer id={source.id} index={source.index} />;
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
  listIds: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  boardId: PropTypes.string.isRequired,
  isCardModalOpened: PropTypes.bool.isRequired,
  canEdit: PropTypes.bool.isRequired,
  onListCreate: PropTypes.func.isRequired,
  onListMove: PropTypes.func.isRequired,
  onCardMove: PropTypes.func.isRequired,
  onCardTransfer: PropTypes.func.isRequired,
};

export default React.memo(Board);
