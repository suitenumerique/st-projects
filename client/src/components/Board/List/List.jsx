import React, { useState, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';

import { KeyboardSensor, PointerSensor } from '@dnd-kit/react';
import { useSortable } from '@dnd-kit/react/sortable';
import classNames from 'classnames';
import { Button } from '@gouvfr-lasuite/cunningham-react';
import { Badge, Icon } from '@gouvfr-lasuite/ui-kit';
import { upperFirst, camelCase } from 'lodash';
import styles from '../Board.module.scss';
import CardContainer from '../../../containers/CardContainer';
import CardCreate from './CardCreate';
import ListDropTarget from './ListDropTarget';
import ListNameEdit from './ListNameEdit';
import usePopup from '../../../lib/popup/use-popup';
import ListActionsStep from '../../../steps/ListActionsStep/ListActionsStep';
import globalStyles from '../../../assets/styles/styles.module.scss';

function List({
  id,
  index,
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

  const sortable = useSortable({
    id,
    index,
    group: 'lists',
    type: 'List',
    accept: ['List'],
    disabled: !canEdit,
    sensors: [KeyboardSensor, PointerSensor],
  });

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
        {cardIds.map((cardId, cardIndex) => (
          <CardContainer key={cardId} id={cardId} index={cardIndex} />
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
    </div>
  );
}

List.propTypes = {
  id: PropTypes.string.isRequired,
  index: PropTypes.number.isRequired,
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
