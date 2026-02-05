import React, { useCallback, useState, useEffect, useRef, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import classNames from 'classnames';

// eslint-disable-next-line import/no-unresolved
import '@mdxeditor/editor/style.css';
import {
  MDXEditor,
  headingsPlugin,
  listsPlugin,
  thematicBreakPlugin,
  markdownShortcutPlugin,
  linkPlugin,
  linkDialogPlugin,
  toolbarPlugin,
  BoldItalicUnderlineToggles,
  CodeToggle,
  CreateLink,
  ListsToggle,
  BlockTypeSelect,
  Separator,
} from '@mdxeditor/editor';

import styles from './CardModalDescription.module.scss';

function EditorToolbar() {
  return (
    <>
      <BlockTypeSelect />
      <Separator />
      <BoldItalicUnderlineToggles />
      <Separator />
      <ListsToggle options={['bullet', 'number']} />
      <Separator />
      <CodeToggle />
      <CreateLink />
    </>
  );
}

const readOnlyPlugins = [
  headingsPlugin({ allowedHeadingLevels: [1, 2, 3] }),
  listsPlugin(),
  thematicBreakPlugin(),
  linkPlugin(),
];

function DescriptionComponent({ description, canEdit, onUpdate }) {
  const [t] = useTranslation();
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(description || '');
  const editorRef = useRef(null);

  const editorPlugins = useMemo(
    () => [
      headingsPlugin({ allowedHeadingLevels: [1, 2, 3] }),
      listsPlugin(),
      thematicBreakPlugin(),
      markdownShortcutPlugin(),
      linkPlugin(),
      linkDialogPlugin(),
      toolbarPlugin({
        toolbarContents: EditorToolbar,
      }),
    ],
    [],
  );

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
        // Check if clicking on MDXEditor popover/dropdown (rendered in portal)
        const isEditorPopover =
          event.target.closest('[data-radix-popper-content-wrapper]') ||
          event.target.closest('[data-radix-select-viewport]');
        if (isEditorPopover) {
          return;
        }
        handleSave();
      }
    };

    if (isEditing) {
      // Use mouseup instead of mousedown to let Radix handle its click first
      document.addEventListener('mouseup', handleClickOutside);
      return () => {
        document.removeEventListener('mouseup', handleClickOutside);
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
          plugins={editorPlugins}
          contentEditableClassName={styles.editorContent}
        />
      </div>
    );
  }

  if (!description && canEdit) {
    return (
      <button
        type="button"
        className={classNames(
          styles.descriptionButton,
          !description && styles.descriptionButtonEmpty,
        )}
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
        <MDXEditor key={description} markdown={description} plugins={readOnlyPlugins} readOnly />
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
          <MDXEditor key={description} markdown={description} plugins={readOnlyPlugins} readOnly />
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
