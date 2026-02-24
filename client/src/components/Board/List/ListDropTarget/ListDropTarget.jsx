import { useSortable } from '@dnd-kit/react/sortable';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

import styles from '../../Board.module.scss';

// sortable placeholder so the sortable system can always route cards to this list.
// rendered in every list (not just empty ones) so that when the last card is dragged
// away, the plugin still has a target to route the card back to.
function ListDropTarget({ listId, index }) {
  const sortable = useSortable({
    id: `empty-placeholder-${listId}`,
    index,
    group: listId,
    type: 'Card',
    accept: ['Card'],
    sensors: [],
  });

  return (
    <div
      ref={sortable.ref}
      className={classNames(styles.emptyDropZone, sortable.isDropTarget && styles.dropZoneActive)}
    />
  );
}

ListDropTarget.propTypes = {
  listId: PropTypes.string.isRequired,
  index: PropTypes.number.isRequired,
};

export default React.memo(ListDropTarget);
