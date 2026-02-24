import React from 'react';
import PropTypes from 'prop-types';
import { PointerActivationConstraints } from '@dnd-kit/dom';
import { KeyboardSensor, PointerSensor } from '@dnd-kit/react';
import { useSortable } from '@dnd-kit/react/sortable';
import classNames from 'classnames';

import CardContainer from '../../../containers/CardContainer';
import styles from '../Board.module.scss';

const CardPointerSensor = PointerSensor.configure({
  activationConstraints: [
    new PointerActivationConstraints.Distance({
      value: 5,
    }),
  ],
});

function SortableCard({ id, index, listId, canEdit }) {
  const sortable = useSortable({
    id,
    index,
    group: listId,
    type: 'Card',
    accept: ['Card'],
    disabled: !canEdit,
    sensors: [KeyboardSensor, CardPointerSensor],
  });

  return (
    <div
      ref={(el) => {
        sortable.ref(el);
        sortable.handleRef(el);
      }}
      className={classNames(
        styles.card,
        canEdit && styles.draggable,
        sortable.isDragging && styles.dragging,
      )}
    >
      <CardContainer id={id} />
    </div>
  );
}

SortableCard.propTypes = {
  id: PropTypes.string.isRequired,
  index: PropTypes.number.isRequired,
  listId: PropTypes.string.isRequired,
  canEdit: PropTypes.bool.isRequired,
};

export default React.memo(SortableCard);
