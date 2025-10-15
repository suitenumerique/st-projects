import React, { useState, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';

import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import classNames from 'classnames';
import { Button } from '@openfun/cunningham-react';
import { Icon } from '@gouvfr-lasuite/ui-kit';
// import { useTranslation } from 'react-i18next';
import { upperFirst, camelCase } from 'lodash';
import styles from '../Board.module.scss';
import Card from '../Card';
import CardCreate from '../../CardCreate/CardCreate';
import ColumnNameEdit from '../../ColumnNameEdit';
import usePopup from '../../../lib/popup/use-popup';
import ColumnActionsStep from '../../../steps/ColumnActionsStep/ColumnActionsStep';
import globalStyles from '../../../assets/styles/styles.module.scss';

function Column({
  id,
  name,
  isPersisted,
  color,
  currentUser,
  cards,
  canEdit,
  allBoards,
  allBoardMemberships,
  allBoardLabels,
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
  onCardBoardFetch,
  onCardLabelAdd,
  onCardLabelRemove,
  onCardLabelCreate,
  onCardLabelUpdate,
  onCardLabelMove,
  onCardLabelDelete,
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
  });

  // const [t] = useTranslation();
  const [isAddCardOpened, setIsAddCardOpened] = useState(false);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const nameEdit = useRef(null);

  const ActionsPopup = usePopup(ColumnActionsStep);

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
      className={classNames(styles.column, isDragging ? styles.dragging : '')}
    >
      <div
        {...attributes} // eslint-disable-line react/jsx-props-no-spreading
        {...listeners} // eslint-disable-line react/jsx-props-no-spreading
        className={classNames(styles.columnHeader, canEdit && styles.columnHeaderEditable)}
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
          className={styles.columnHeaderNameEdit}
          tabIndex={canEdit ? 0 : -1}
        >
          <ColumnNameEdit ref={nameEdit} defaultValue={name} onUpdate={handleNameUpdate}>
            <div className={styles.columnHeaderContent}>
              {color && (
                <Icon
                  name="circle"
                  className={classNames(
                    styles.columnColor,
                    globalStyles[`color${upperFirst(camelCase(color))}`],
                  )}
                />
              )}
              <p className={styles.columnName}>{name}</p>
            </div>
          </ColumnNameEdit>
        </div>

        {isPersisted && canEdit && (
          <ActionsPopup
            onNameEdit={handleNameEdit}
            onCardAdd={handleCardAdd}
            onDelete={onDelete}
            onSort={onSort}
            color={color}
            onColorEdit={handleColorEdit}
          >
            <Button className={styles.columnHeaderButton}>
              <Icon outlined name="more_horiz" />
            </Button>
          </ActionsPopup>
        )}
      </div>
      <SortableContext items={cards.map((c) => c.id)} strategy={verticalListSortingStrategy}>
        <div className={styles.cardsContainer}>
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
              allBoards={allBoards}
              allBoardMemberships={allBoardMemberships}
              allLabels={allBoardLabels}
              currentUser={currentUser}
              canEdit={canEdit}
              onUpdate={(data) => onCardUpdate(card.id, data)}
              onMove={(listId, index) => onCardMove(card.id, listId, index)}
              onTransfer={(boardId, listId) => onCardTransfer(card.id, boardId, listId)}
              onDuplicate={() => onCardDuplicate(card.id)}
              onDelete={() => onCardDelete(card.id)}
              onUserAdd={(userId) => onCardUserAdd(userId, card.id)}
              onUserRemove={(userId) => onCardUserRemove(userId, card.id)}
              onCardBoardFetch={onCardBoardFetch}
              onLabelAdd={(labelId) => onCardLabelAdd(labelId, card.id)}
              onLabelRemove={(labelId) => onCardLabelRemove(labelId, card.id)}
              onLabelCreate={(data) => onCardLabelCreate(data)}
              onLabelUpdate={(labelId, data) => onCardLabelUpdate(labelId, data)}
              onLabelMove={(labelId, index) => onCardLabelMove(labelId, index)}
              onLabelDelete={(labelId) => onCardLabelDelete(labelId)}
            />
          ))}
          {canEdit && (
            <CardCreate
              isOpened={isAddCardOpened}
              onCreate={onCardCreate}
              onClose={handleAddCardClose}
            />
          )}
        </div>
        {!isAddCardOpened && (
          <div className={styles.addCardButton}>
            <Button
              color="tertiary-text"
              size="small"
              onClick={() => {
                handleAddCardClick();
              }}
            >
              <Icon name="add" />
              Ajouter une carte
            </Button>
          </div>
        )}
      </SortableContext>
    </div>
  );
}

Column.propTypes = {
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
  allBoards: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  allBoardMemberships: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  allBoardLabels: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  canEdit: PropTypes.bool.isRequired,
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
  onCardBoardFetch: PropTypes.func.isRequired,
  onCardLabelAdd: PropTypes.func.isRequired,
  onCardLabelRemove: PropTypes.func.isRequired,
  onCardLabelCreate: PropTypes.func.isRequired,
  onCardLabelUpdate: PropTypes.func.isRequired,
  onCardLabelMove: PropTypes.func.isRequired,
  onCardLabelDelete: PropTypes.func.isRequired,
};

export default Column;
