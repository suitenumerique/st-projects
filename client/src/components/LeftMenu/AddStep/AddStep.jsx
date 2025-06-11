import React, { useCallback, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { Button, Form, Icon } from 'semantic-ui-react';
import { useDidUpdate, useToggle } from '../../../lib/hooks';
import { Input, Popup } from '../../../lib/custom-ui';

import InputOverride from '../../InputOverride/InputOverride';
import ButtonOverride from '../../ButtonOverride';

import { useForm, useSteps } from '../../../hooks';
import ImportStep from './ImportStep';

import styles from './AddStepOverride.module.scss';

const StepTypes = {
  IMPORT: 'IMPORT',
};

const AddStep = React.memo(({ onCreate, onClose, onCreateFromTemplate, templateBoards }) => {
  const [t] = useTranslation();

  const [data, handleFieldChange, setData] = useForm({
    name: '',
    import: null,
  });

  const [step, openStep, handleBack] = useSteps();
  const [focusNameFieldState, focusNameField] = useToggle();

  const nameField = useRef(null);

  const handleImportSelect = useCallback(
    (nextImport) => {
      setData((prevData) => ({
        ...prevData,
        import: nextImport,
      }));
    },
    [setData],
  );

  const handleImportBack = useCallback(() => {
    handleBack();
    focusNameField();
  }, [handleBack, focusNameField]);

  const handleTemplateClick = useCallback(
    (board) => {
      onCreateFromTemplate(board.id);
      onClose();
    },
    [onCreateFromTemplate, onClose],
  );

  const handleSubmit = useCallback(() => {
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
  }, [onClose, data, onCreate]);

  const handleImportClick = useCallback(() => {
    openStep(StepTypes.IMPORT);
  }, [openStep]);

  useEffect(() => {
    nameField.current.focus({
      preventScroll: true,
    });
  }, []);

  useDidUpdate(() => {
    nameField.current.focus();
  }, [focusNameFieldState]);

  if (step && step.type === StepTypes.IMPORT) {
    return <ImportStep onSelect={handleImportSelect} onBack={handleImportBack} />;
  }

  return (
    <>
      <Popup.Header>
        {t('common.createBoard', {
          context: 'title',
        })}
      </Popup.Header>
      <Popup.Content>
        <Form onSubmit={handleSubmit}>
          {/* <Input
            fluid
            ref={nameField}
            name="name"
            value={data.name}
            className={styles.field}
            onChange={handleFieldChange}
          /> */}
          <InputOverride
            ref={nameField}
            name="name"
            value={data.name}
            className={styles.field}
            onChange={handleFieldChange}
          />
          <div className={styles.controls}>
            {/* <Button positive content={t('action.createBoard')} className={styles.createButton} /> */}
            <ButtonOverride type="submit" priority="primary">
              {t('action.createBoard')}
            </ButtonOverride>
            {/* <Button type="button" className={styles.importButton} onClick={handleImportClick}>
              <Icon
                name={data.import ? data.import.type : 'arrow down'}
                className={styles.importButtonIcon}
              />
              {data.import ? data.import.file.name : t('action.import')}
            </Button> */}
          </div>
          <div className={styles.templatesWrapper}>
            <p>Ou choisissez un tableau pré-défini :</p>
            <div className={styles.templatesList}>
              {(templateBoards || []).map((board) => (
                <div
                  className={styles.board}
                  onClick={() => handleTemplateClick(board)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && handleTemplateClick(board)}
                  key={board.id}
                >
                  <div className={styles.boardIcon}>
                    {true ? (
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#ffffff"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M8 5H4C3.44772 5 3 5.44772 3 6V10C3 10.5523 3.44772 11 4 11H8C8.55228 11 9 10.5523 9 10V6C9 5.44772 8.55228 5 8 5Z"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M3 17L5 19L9 15"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M13 6H21"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M13 12H21"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M13 18H21"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    ) : (
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#ffffff"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M9 3H4C3.44772 3 3 3.44772 3 4V11C3 11.5523 3.44772 12 4 12H9C9.55228 12 10 11.5523 10 11V4C10 3.44772 9.55228 3 9 3Z"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M20 3H15C14 3 14 3 14 6.6V19.0118C14 21 14 21 15 21H20C21 21 21 21 21 17.4V6.6C21 3 21 3 20 3Z"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </div>
                  <span>{board.name}</span>
                </div>
              ))}
            </div>
          </div>
        </Form>
      </Popup.Content>
    </>
  );
});

AddStep.propTypes = {
  onCreate: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  onCreateFromTemplate: PropTypes.func.isRequired,
  /* eslint-disable react/forbid-prop-types */
  templateBoards: PropTypes.array.isRequired,
  /* eslint-enable react/forbid-prop-types */
};

export default AddStep;
