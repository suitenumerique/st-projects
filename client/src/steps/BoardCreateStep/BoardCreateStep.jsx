import React, { useCallback, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { Button, Input } from '@openfun/cunningham-react';
import { useDidUpdate, useToggle } from '../../lib/hooks';
import BoardListItem from '../../components/BoardListItem/BoardListItem';
import PopoverHeader from '../../ui/Popover/PopoverHeader';

import { useForm } from '../../hooks'; // useSteps

import styles from './BoardCreateStep.module.scss';

// const StepTypes = {
//   IMPORT: 'IMPORT',
// };

const BoardCreateStep = React.memo(
  ({ onCreate, onClose, onCreateFromTemplate, templateBoards }) => {
    const [t] = useTranslation();

    const [data, handleFieldChange] = useForm({
      // setData
      name: '',
      import: null,
    });

    // const [openStep, handleBack] = useSteps();
    const [focusNameFieldState] = useToggle(); // focusNameField

    const nameField = useRef(null);

    // const handleImportSelect = useCallback(
    //   (nextImport) => {
    //     setData((prevData) => ({
    //       ...prevData,
    //       import: nextImport,
    //     }));
    //   },
    //   [setData],
    // );

    // const handleImportBack = useCallback(() => {
    //   handleBack();
    //   focusNameField();
    // }, [handleBack, focusNameField]);

    const handleTemplateClick = useCallback(
      (boardId) => {
        onCreateFromTemplate(boardId);
        onClose();
      },
      [onCreateFromTemplate, onClose],
    );

    const handleSubmit = useCallback(
      (e) => {
        e.preventDefault();

        const cleanData = {
          ...data,
          name: data.name.trim(),
        };

        if (!cleanData.name) {
          nameField.current.select();
          return;
        }

        onCreate(cleanData);
        onClose();
      },
      [onClose, data, onCreate],
    );

    // const handleImportClick = useCallback(() => {
    //   openStep(StepTypes.IMPORT);
    // }, [openStep]);

    useEffect(() => {
      nameField.current.focus({
        preventScroll: true,
      });
    }, []);

    useDidUpdate(() => {
      nameField.current.focus();
    }, [focusNameFieldState]);

    // if (step && step.type === StepTypes.IMPORT) {
    //   return <ImportStep onSelect={handleImportSelect} onBack={handleImportBack} />;
    // }

    return (
      <>
        <PopoverHeader title={t('action.createBoard')} />
        <form onSubmit={handleSubmit}>
          <Input
            ref={nameField}
            name="name"
            label={t('common.boardName')}
            value={data.name}
            onChange={handleFieldChange}
            className={styles.createInput}
          />
          <div className={styles.controls}>
            <Button size="medium" type="submit">
              {t('action.create')}
            </Button>
            {/* <Button type="button" className={styles.importButton} onClick={handleImportClick}>
          <Icon
            name={data.import ? data.import.type : 'arrow down'}
            className={styles.importButtonIcon}
          />
          {data.import ? data.import.file.name : t('action.import')}
        </Button> */}
          </div>
          {templateBoards && templateBoards.length > 0 && (
            <div className={styles.templatesWrapper}>
              <p>{t('common.orChooseTemplateBoard')}</p>
              <div className={styles.templatesList}>
                {(templateBoards || []).map((board) => (
                  <BoardListItem
                    key={board.id}
                    board={board}
                    handleClick={() => handleTemplateClick(board.id)}
                    showDescription
                    editable={false}
                  />
                ))}
              </div>
            </div>
          )}
        </form>
      </>
    );
  },
);

BoardCreateStep.propTypes = {
  onCreate: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  onCreateFromTemplate: PropTypes.func.isRequired,
  templateBoards: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
};

export default BoardCreateStep;
