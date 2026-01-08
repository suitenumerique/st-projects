import { useEffect, useCallback } from 'react';
import { Modal, Button, Input } from '@openfun/cunningham-react';
import PropTypes from 'prop-types';
import { useForm } from '../../../hooks';

function FolderEditModal({ initialData, isOpen, onClose, onSubmit }) {
  const [data, handleFieldChange] = useForm({
    name: '',
    ...initialData,
  });

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        const input = document.querySelector('input[name="name"]');
        input?.focus();
      }, 50);
    }
  }, [isOpen]);

  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();
      onSubmit(data);
      onClose();
    },
    [onSubmit, onClose, data],
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="small"
      closeOnClickOutside
      rightActions={
        <>
          <Button color="secondary" onClick={onClose}>
            Annuler
          </Button>
          <Button color="primary" type="submit" form="folder-create-modal-form">
            {data.id ? 'Renommer' : 'Créer'}
          </Button>
        </>
      }
      title={data.id ? 'Renommer le dossier' : 'Créer un dossier'}
    >
      <form id="folder-create-modal-form" onSubmit={handleSubmit}>
        <Input
          name="name"
          label={data.id ? 'Nom du dossier' : 'Nom du nouveau dossier'}
          value={data.name}
          required
          onChange={handleFieldChange}
        />
      </form>
    </Modal>
  );
}

FolderEditModal.propTypes = {
  initialData: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
};

export default FolderEditModal;
