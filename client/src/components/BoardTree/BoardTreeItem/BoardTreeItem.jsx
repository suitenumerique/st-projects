import React from 'react';
import PropTypes from 'prop-types';

import BoardListItem from '../../BoardListItem/BoardListItem';
import FolderListItem from '../FolderListItem';

const BoardTreeItem = React.memo(
  ({
    item,
    isExpanded,
    isActive,
    isDropTarget,
    canEdit,
    onToggle,
    onClick,
    onEdit,
    onUpdate,
    onDelete,
    disableHover,
  }) => {
    if (item.type === 'board') {
      return (
        <BoardListItem
          board={item.data}
          project={item.data.project}
          showDescription={false}
          editable={canEdit}
          isActive={isActive}
          currentUser={item.data.currentUser}
          canEdit={canEdit}
          handleClick={onClick}
          onBoardUpdate={onUpdate}
          onBoardDelete={onDelete}
          disableHover={disableHover}
        />
      );
    }

    return (
      <FolderListItem
        folder={item.data}
        isDropTarget={isDropTarget}
        disableHover={disableHover}
        onToggle={onToggle}
        isExpanded={isExpanded}
        canEdit={canEdit}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    );
  },
);

BoardTreeItem.propTypes = {
  item: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  isExpanded: PropTypes.bool,
  isActive: PropTypes.bool,
  isDropTarget: PropTypes.bool,
  canEdit: PropTypes.bool.isRequired,
  onToggle: PropTypes.func,
  onClick: PropTypes.func,
  onUpdate: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  disableHover: PropTypes.bool,
};

BoardTreeItem.defaultProps = {
  isExpanded: false,
  isActive: false,
  isDropTarget: false,
  disableHover: false,
  onToggle: null,
  onClick: null,
};

export default BoardTreeItem;
