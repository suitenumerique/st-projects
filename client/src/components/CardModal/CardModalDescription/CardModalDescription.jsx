import React, { useCallback, useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';

// eslint-disable-next-line import/no-unresolved
import '@mdxeditor/editor/style.css';
import {
  MDXEditor,
  headingsPlugin,
  listsPlugin,
  quotePlugin,
  thematicBreakPlugin,
  markdownShortcutPlugin,
  linkPlugin,
  linkDialogPlugin,
  toolbarPlugin,
  UndoRedo,
  BoldItalicUnderlineToggles,
  CodeToggle,
  CreateLink,
  ListsToggle,
  BlockTypeSelect,
  Separator,
} from '@mdxeditor/editor';

import Markdown from '../../../ui/Markdown';

import styles from './CardModalDescription.module.scss';

function EditorToolbar() {
  return (
    <>
      <UndoRedo />
      <Separator />
      <BoldItalicUnderlineToggles />
      <CodeToggle />
      <Separator />
      <BlockTypeSelect />
      <Separator />
      <CreateLink />
      <Separator />
      <ListsToggle options={['bullet', 'number']} />
    </>
  );
}

function DescriptionComponent({ description, canEdit, onUpdate }) {
  const [t] = useTranslation();
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(description || '');
  const editorRef = useRef(null);

  const handleClick = useCallback(() => {
    if (canEdit && !isEditing) {
      setIsEditing(true);
      setEditValue(description || '');
    }
  }, [canEdit, isEditing, description]);

  const handleSave = useCallback(() => {
    const cleanValue = editValue.trim() || null;
    if (cleanValue !== description) {
      onUpdate(cleanValue);
    }
    setIsEditing(false);
  }, [editValue, description, onUpdate]);

  const handleCancel = useCallback(() => {
    setEditValue(description || '');
    setIsEditing(false);
  }, [description]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isEditing && editorRef.current && !editorRef.current.contains(event.target)) {
        handleSave();
      }
    };

    if (isEditing) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
    return undefined;
  }, [isEditing, handleSave]);

  const handleKeyDown = useCallback(
    (event) => {
      if (event.key === 'Escape') {
        handleCancel();
      } else if (event.key === 'Enter' && event.ctrlKey) {
        handleSave();
      }
    },
    [handleCancel, handleSave],
  );

  if (!description && !canEdit) {
    return null;
  }

  if (isEditing) {
    return (
      <div
        ref={editorRef}
        className={styles.descriptionEditor}
        onKeyDown={handleKeyDown}
        role="textbox"
        tabIndex={0}
        aria-label={t('common.description')}
      >
        <MDXEditor
          markdown={editValue}
          onChange={setEditValue}
          plugins={[
            headingsPlugin(),
            listsPlugin(),
            quotePlugin(),
            thematicBreakPlugin(),
            markdownShortcutPlugin(),
            linkPlugin(),
            linkDialogPlugin(),
            toolbarPlugin({
              toolbarContents: EditorToolbar,
            }),
          ]}
          contentEditableClassName={styles.editorContent}
        />
      </div>
    );
  }

  if (!description && canEdit) {
    return (
      <button
        type="button"
        className={styles.descriptionButton}
        onClick={handleClick}
        aria-label={t('action.addMoreDetailedDescription')}
      >
        <span className={styles.descriptionButtonText}>
          {t('action.addMoreDetailedDescription')}
        </span>
      </button>
    );
  }

  if (description && !canEdit) {
    return (
      <div className={styles.descriptionText}>
        <Markdown linkStopPropagation linkTarget="_blank">
          {description}
        </Markdown>
      </div>
    );
  }

  if (description && canEdit) {
    return (
      <button
        type="button"
        className={styles.descriptionButton}
        onClick={handleClick}
        aria-label={t('action.editDescription')}
      >
        <div className={styles.descriptionText}>
          <Markdown linkStopPropagation linkTarget="_blank">
            {description}
          </Markdown>
        </div>
      </button>
    );
  }

  return null;
}

DescriptionComponent.propTypes = {
  description: PropTypes.string,
  canEdit: PropTypes.bool.isRequired,
  onUpdate: PropTypes.func.isRequired,
};

DescriptionComponent.defaultProps = {
  description: undefined,
};

export default React.memo(DescriptionComponent);
