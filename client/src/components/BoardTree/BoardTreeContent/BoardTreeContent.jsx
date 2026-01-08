import React from 'react';
import PropTypes from 'prop-types';
import { useDroppable } from '@dnd-kit/core';
import styles from './BoardTreeContent.module.scss';

import SortableTreeItem from '../SortableTreeItem';

const BoardTreeContent = React.memo(
  ({
    activeId,
    rootFolders,
    rootBoards,
    expandedFolders,
    renderBoardList,
    handleToggle,
    onFolderEdit,
    onFolderUpdate,
    onFolderDelete,
    canEdit,
  }) => {
    const { setNodeRef: setRootZoneRef, isOver: isOverRootZone } = useDroppable({
      id: 'root-board-drop-zone',
      data: { type: 'root-zone' },
    });

    return (
      <div className={styles.tree}>
        {rootFolders.length > 0 && (
          <div className={styles.folderSection}>
            {rootFolders.map((folder) => {
              const isExpanded = expandedFolders.has(folder.data.id);
              return (
                <SortableTreeItem
                  key={folder.id}
                  id={folder.id}
                  data={folder}
                  isExpanded={isExpanded}
                  onToggle={() => handleToggle(folder.data.id)}
                  canEdit={canEdit}
                  onEdit={onFolderEdit}
                  onUpdate={onFolderUpdate}
                  onDelete={onFolderDelete}
                  disabled
                  disableHover={!!activeId}
                >
                  {isExpanded && folder.children.length > 0 && renderBoardList(folder.children)}
                </SortableTreeItem>
              );
            })}
          </div>
        )}

        {rootBoards.length > 0 ? (
          <div className={styles.rootBoardSection}>{renderBoardList(rootBoards)}</div>
        ) : (
          <div ref={setRootZoneRef} className={styles.rootDropSection}>
            {isOverRootZone && <div className={styles.dropLine} />}
          </div>
        )}
      </div>
    );
  },
);

BoardTreeContent.propTypes = {
  activeId: PropTypes.string,
  rootFolders: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  rootBoards: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  expandedFolders: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  renderBoardList: PropTypes.func.isRequired,
  handleToggle: PropTypes.func.isRequired,
  onFolderEdit: PropTypes.func.isRequired,
  onFolderUpdate: PropTypes.func.isRequired,
  onFolderDelete: PropTypes.func.isRequired,
  canEdit: PropTypes.bool.isRequired,
};

BoardTreeContent.defaultProps = {
  activeId: null,
};

export default BoardTreeContent;
