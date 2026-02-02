import React, { useMemo, useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { Button } from '@openfun/cunningham-react';
import { DropdownMenu } from '@gouvfr-lasuite/ui-kit';
import PopoverHeader from '../../ui/Popover/PopoverHeader';

import { useForm } from '../../hooks';

import styles from './CardMoveStep.module.scss';

const CardMoveStep = React.memo(
  ({ boards, defaultPath, onMove, onTransfer, onBoardFetch, onBack, onClose }) => {
    const [t] = useTranslation();
    const [isBoardDropdownOpen, setIsBoardDropdownOpen] = useState(false);
    const [isListDropdownOpen, setIsListDropdownOpen] = useState(false);

    const [path, handleFieldChange] = useForm(() => ({
      boardId: null,
      listId: null,
    }));

    const selectedBoard = useMemo(
      () => boards.find((board) => board.id === path.boardId) || null,
      [boards, path.boardId],
    );

    const selectedList = useMemo(
      () => (selectedBoard && selectedBoard.lists.find((list) => list.id === path.listId)) || null,
      [selectedBoard, path.listId],
    );

    const handleBoardIdChange = useCallback(
      (targetBoardId) => {
        if (boards.find((board) => board.id === targetBoardId).isFetching === null) {
          onBoardFetch(targetBoardId);
        }

        handleFieldChange(null, { name: 'boardId', value: targetBoardId });
        handleFieldChange(null, { name: 'listId', value: null });
      },
      [handleFieldChange, onBoardFetch, boards],
    );

    const handleListIdChange = useCallback(
      (targetListId) => {
        if (targetListId) {
          handleFieldChange(targetListId, { name: 'listId', value: targetListId });
        }
      },
      [handleFieldChange],
    );

    const handleSubmit = useCallback(
      (event) => {
        event.preventDefault();

        if (!selectedBoard || !selectedList) {
          return;
        }

        if (selectedBoard.id !== defaultPath.boardId) {
          onTransfer(selectedBoard.id, selectedList.id);
        } else if (selectedList.id !== defaultPath.listId) {
          onMove(selectedList.id);
        }

        onClose();
      },
      [defaultPath, onMove, onTransfer, onClose, selectedBoard, selectedList],
    );

    return (
      <>
        <PopoverHeader
          onBack={onBack}
          title={t('common.moveCard', {
            context: 'title',
          })}
        />
        <form onSubmit={handleSubmit}>
          <div className={styles.selectorContainer}>
            <div className={styles.text}>{t('common.board')}</div>
            <DropdownMenu
              name="boardId"
              isOpen={isBoardDropdownOpen}
              onOpenChange={setIsBoardDropdownOpen}
              options={boards.map((board) => ({
                label: board.name,
                value: board.id,
                key: `board-${board.id}`,
              }))}
              selectedValue={selectedBoard && [selectedBoard.id]}
              placeholder={boards.length === 0 ? t('common.noBoards') : t('common.selectBoard')}
              disabled={boards.length === 0}
              onSelectValue={handleBoardIdChange}
            >
              <div className={styles.selector}>
                <Button
                  color="brand"
                  variant="bordered"
                  size="small"
                  onClick={() => setIsBoardDropdownOpen(true)}
                >
                  {selectedBoard ? selectedBoard.name : t('common.selectBoard')}
                </Button>
              </div>
            </DropdownMenu>
          </div>
          {selectedBoard && (
            <div className={styles.selectorContainer}>
              <div className={styles.text}>{t('common.list')}</div>
              <DropdownMenu
                name="listId"
                isOpen={isListDropdownOpen}
                onOpenChange={setIsListDropdownOpen}
                options={selectedBoard.lists.map((list) => ({
                  label: list.name,
                  value: list.id,
                  key: `list-${list.id}`,
                }))}
                selectedValue={selectedList && [selectedList.id]}
                placeholder={
                  selectedBoard.isFetching === false && selectedBoard.lists.length === 0
                    ? t('common.noLists')
                    : t('common.selectList')
                }
                loading={selectedBoard.isFetching !== false}
                disabled={selectedBoard.isFetching !== false || selectedBoard.lists.length === 0}
                onSelectValue={handleListIdChange}
              >
                <div className={styles.selector}>
                  <Button
                    color="brand"
                    variant="bordered"
                    size="small"
                    onClick={() => setIsListDropdownOpen(true)}
                  >
                    {selectedList ? selectedList.name : t('common.selectList')}
                  </Button>
                </div>
              </DropdownMenu>
            </div>
          )}
          <Button
            type="submit"
            disabled={(selectedBoard && selectedBoard.isFetching !== false) || !selectedList}
            color="brand"
            variant="primary"
          >
            {t('action.move')}
          </Button>
        </form>
      </>
    );
  },
);

CardMoveStep.propTypes = {
  boards: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  defaultPath: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  onMove: PropTypes.func.isRequired,
  onTransfer: PropTypes.func.isRequired,
  onBoardFetch: PropTypes.func.isRequired,
  onBack: PropTypes.func,
  onClose: PropTypes.func.isRequired,
};

CardMoveStep.defaultProps = {
  onBack: undefined,
};

export default CardMoveStep;
