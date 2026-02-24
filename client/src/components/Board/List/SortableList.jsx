import React from 'react';
import PropTypes from 'prop-types';
import { KeyboardSensor, PointerSensor } from '@dnd-kit/react';
import { useSortable } from '@dnd-kit/react/sortable';
import classNames from 'classnames';

import ListContainer from '../../../containers/ListContainer';
import styles from '../Board.module.scss';

function SortableList({ id, index, canEdit }) {
  const sortable = useSortable({
    id,
    index,
    group: 'lists',
    type: 'List',
    accept: ['List'],
    disabled: !canEdit,
    sensors: [KeyboardSensor, PointerSensor],
  });

  return (
    <div
      ref={sortable.ref}
      className={classNames(
        styles.list,
        canEdit ? styles.draggable : '',
        sortable.isDragging ? styles.dragging : '',
      )}
    >
      <ListContainer id={id} />
    </div>
  );
}

SortableList.propTypes = {
  id: PropTypes.string.isRequired,
  index: PropTypes.number.isRequired,
  canEdit: PropTypes.bool.isRequired,
};

export default React.memo(SortableList);
