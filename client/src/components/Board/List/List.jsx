import PropTypes from 'prop-types';
import React, { useCallback, useLayoutEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import classNames from 'classnames';
import { Button } from '@gouvfr-lasuite/cunningham-react';
import { Badge, Icon } from '@gouvfr-lasuite/ui-kit';
import { upperFirst, camelCase } from 'lodash';
import styles from '../Board.module.scss';
import SortableCard from '../Card/SortableCard';
import CardCreate from './CardCreate';
import ListDropTarget from './ListDropTarget';
import ListNameEdit from './ListNameEdit';
import usePopup from '../../../lib/popup/use-popup';
import ListActionsStep from '../../../steps/ListActionsStep/ListActionsStep';
import globalStyles from '../../../assets/styles/styles.module.scss';

function List({
  id,
  name,
  isPersisted,
  color,
  cardIds,
  canEdit,
  onUpdate,
  onDelete,
  onSort,
  onCardCreate,
}) {
  const [t] = useTranslation();

  // this is filled by SortableCard on mount (Map<cardId, SortableInstance>)
  const cardSortablesRef = useRef(new Map());

  const handleSortableReady = useCallback((cardId, sortableInstance) => {
    if (sortableInstance) {
      cardSortablesRef.current.set(cardId, sortableInstance);
    } else {
      cardSortablesRef.current.delete(cardId);
    }
  }, []);

  // patching sortable indexes directly will prevent rerendering a lot of time `SortableCard`
  // when moving a card and due to subsequent position changes on other cards, this was putting pressure on the `DragOverlay`
  // unable to hide its overlay because optimistic UI had the priority (triggered from the redux action)
  useLayoutEffect(() => {
    cardIds.forEach((cardId, cardIndex) => {
      const proxied = cardSortablesRef.current.get(cardId);

      if (proxied) {
        proxied.draggable.sortable.index = cardIndex;
      }
    });
  }, [cardIds]);

  const [isAddCardOpened, setIsAddCardOpened] = useState(false);
  const [isListActionsPopoverOpen, setIsListActionsPopoverOpen] = useState(false);

  const nameEdit = useRef(null);

  const ListActionsPopover = usePopup(ListActionsStep);

  const handleHeaderClick = useCallback(() => {
    if (isPersisted && canEdit) {
      nameEdit.current.open();
    }
  }, [isPersisted, canEdit]);

  const handleHeaderKeyDown = useCallback(
    (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        handleHeaderClick();
      }
    },
    [handleHeaderClick],
  );

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
    <>
      <div
        className={classNames(
          styles.listHeader,
          canEdit && styles.listHeaderEditable,
          isListActionsPopoverOpen ? styles.popoverOpened : '',
        )}
      >
        <div
          onClick={handleHeaderClick}
          onKeyDown={handleHeaderKeyDown}
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
              <Badge type="neutral">{cardIds.length}</Badge>
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
        {cardIds.map((cardId) => (
          <SortableCard
            key={cardId}
            id={cardId}
            listId={id}
            canEdit={canEdit}
            onSortableReady={handleSortableReady}
          />
        ))}
        <ListDropTarget listId={id} index={cardIds.length} />
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
          <Button color="brand" variant="tertiary" size="small" onClick={handleAddCardClick}>
            <Icon name="add" />
            {t('action.newCard')}
          </Button>
        </div>
      )}
    </>
  );
}

List.propTypes = {
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  isPersisted: PropTypes.bool.isRequired,
  color: PropTypes.string.isRequired,
  cardIds: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  canEdit: PropTypes.bool.isRequired,
  onUpdate: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onSort: PropTypes.func.isRequired,
  onCardCreate: PropTypes.func.isRequired,
};

export default React.memo(List);
