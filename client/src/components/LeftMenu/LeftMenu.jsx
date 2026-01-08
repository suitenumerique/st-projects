import React, { useCallback, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Button, useModal } from '@openfun/cunningham-react';
import { Icon } from '@gouvfr-lasuite/ui-kit';
import usePopup from '../../lib/popup/use-popup';
import BoardTree from '../BoardTree/BoardTree';
import BoardCreateStep from '../../steps/BoardCreateStep';
import FolderEditModal from './FolderEditModal';
// import BoardListItemContainer from '../../containers/BoardListItemContainer';
import styles from './LeftMenu.module.scss';
import { push } from '../../lib/redux-router';
import Paths from '../../constants/Paths';
import store from '../../store';

const LeftMenu = React.memo(
  ({
    currentBoardId,
    privateBoards,
    sharedBoards,
    privateFolders,
    sharedFolders,
    userBoardPreferences,
    templateBoards,
    onBoardAdd,
    onBoardDuplicate,
    onBoardUpdate,
    onBoardDelete,
    onFolderAdd,
    onFolderUpdate,
    onFolderDelete,
    canEdit,
  }) => {
    const BoardCreateStepPopover = usePopup(BoardCreateStep);
    const folderEditModal = useModal();
    const [folderEditModalData, setFolderEditModalData] = useState({
      name: '',
      isPrivate: true,
    });

    const goToBoard = useCallback((boardId) => {
      store.dispatch(push(Paths.BOARDS.replace(':id', boardId)));
    }, []);

    const onFolderEdit = useCallback(
      (folder) => {
        setFolderEditModalData(folder);
        folderEditModal.open();
      },
      [folderEditModal],
    );

    const onFolderSubmit = useCallback(
      (data) => {
        if (data.id) {
          onFolderUpdate(data.id, data);
        } else {
          onFolderAdd(data);
        }
      },
      [onFolderAdd, onFolderUpdate],
    );

    useEffect(() => {
      // console.log('userBoardPreferences', userBoardPreferences);
    }, [userBoardPreferences]);

    return (
      <div className={styles.wrapper}>
        <div className={styles.topBar}>
          <BoardCreateStepPopover
            onCreate={onBoardAdd}
            onCreateFromTemplate={onBoardDuplicate}
            templateBoards={templateBoards}
            hideCloseButton
          >
            <Button
              className={styles.addBoardButton}
              icon={<Icon name="add" type="outlined" />}
              size="medium"
            >
              Nouveau tableau
            </Button>
          </BoardCreateStepPopover>
        </div>
        <div className={styles.spaces}>
          <div className={styles.space}>
            <div className={styles.spaceHeader}>
              <p className={styles.spaceTitle}>Mon espace</p>
              <Button
                className={styles.addFolderButton}
                size="nano"
                color="primary"
                icon={<span className="material-icons">add</span>}
                onClick={(e) => {
                  e.stopPropagation();
                  setFolderEditModalData({
                    name: '',
                    isPrivate: true,
                  });
                  folderEditModal.open();
                }}
              />
            </div>
            {privateBoards.length === 0 && privateFolders.length === 0 ? (
              <p className={styles.emptySpace}>Aucun tableau</p>
            ) : (
              <div className={styles.boards}>
                <BoardTree
                  boards={privateBoards}
                  folders={privateFolders || []}
                  userBoardPreferences={userBoardPreferences || []}
                  currentBoardId={currentBoardId}
                  onBoardClick={goToBoard}
                  onBoardUpdate={onBoardUpdate}
                  onBoardDelete={onBoardDelete}
                  onFolderEdit={onFolderEdit}
                  onFolderUpdate={onFolderUpdate}
                  onFolderDelete={onFolderDelete}
                  canEdit={canEdit}
                />
              </div>
            )}
          </div>
          <div className={styles.space}>
            <div className={styles.spaceHeader}>
              <p className={styles.spaceTitle}>Espace partagé</p>
              <Button
                className={styles.addFolderButton}
                size="nano"
                color="primary"
                icon={<span className="material-icons">add</span>}
                onClick={(e) => {
                  e.stopPropagation();
                  setFolderEditModalData({
                    name: '',
                    isPrivate: false,
                  });
                  folderEditModal.open();
                }}
              />
            </div>
            {sharedBoards.length === 0 && sharedFolders.length === 0 ? (
              <p className={styles.emptySpace}>Aucun tableau</p>
            ) : (
              <div className={styles.boards}>
                <BoardTree
                  boards={sharedBoards}
                  folders={sharedFolders || []}
                  userBoardPreferences={userBoardPreferences || []}
                  currentBoardId={currentBoardId}
                  onBoardClick={goToBoard}
                  onBoardUpdate={onBoardUpdate}
                  onBoardDelete={onBoardDelete}
                  onFolderEdit={onFolderEdit}
                  onFolderUpdate={onFolderUpdate}
                  onFolderDelete={onFolderDelete}
                  canEdit={canEdit}
                />
              </div>
            )}
          </div>
        </div>
        {folderEditModal.isOpen && (
          <FolderEditModal
            initialData={folderEditModalData}
            isOpen={folderEditModal.isOpen}
            onClose={folderEditModal.close}
            onSubmit={onFolderSubmit}
          />
        )}
      </div>
    );
  },
);

LeftMenu.propTypes = {
  currentBoardId: PropTypes.string,
  privateBoards: PropTypes.array, // eslint-disable-line react/forbid-prop-types
  sharedBoards: PropTypes.array, // eslint-disable-line react/forbid-prop-types
  privateFolders: PropTypes.array, // eslint-disable-line react/forbid-prop-types
  sharedFolders: PropTypes.array, // eslint-disable-line react/forbid-prop-types
  userBoardPreferences: PropTypes.array, // eslint-disable-line react/forbid-prop-types
  templateBoards: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  onBoardAdd: PropTypes.func.isRequired,
  onBoardDuplicate: PropTypes.func.isRequired,
  onBoardUpdate: PropTypes.func.isRequired,
  onBoardDelete: PropTypes.func.isRequired,
  onFolderAdd: PropTypes.func.isRequired,
  onFolderUpdate: PropTypes.func.isRequired,
  onFolderDelete: PropTypes.func.isRequired,
  canEdit: PropTypes.bool.isRequired,
};

LeftMenu.defaultProps = {
  privateBoards: [],
  sharedBoards: [],
  privateFolders: [],
  sharedFolders: [],
  currentBoardId: undefined,
  userBoardPreferences: [],
};

export default LeftMenu;
