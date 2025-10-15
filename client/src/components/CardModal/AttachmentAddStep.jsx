import React from 'react';
// import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';

import PopoverHeader from '../../ui/Popover/PopoverHeader';
import Menu from '../../ui/Menu';
// import FilePicker from '../../ui/FilePicker';

import styles from './AttachmentAddStep.module.scss';

const AttachmentAddStep = React.memo(() => {
  // { onCreate, onClose }
  const [t] = useTranslation();

  // const handleFileSelect = useCallback(
  //   (file) => {
  //     onCreate({
  //       file,
  //     });
  //     onClose();
  //   },
  //   [onCreate, onClose],
  // );

  return (
    <>
      <PopoverHeader
        title={t('common.addAttachment', {
          context: 'title',
        })}
      />
      <Menu secondary vertical className={styles.menu}>
        {/* <FilePicker multiple onSelect={handleFileSelect}>
          <Menu.Item className={styles.menuItem}>
            {t('common.fromComputer', {
              context: 'title',
            })}
          </Menu.Item>
        </FilePicker> */}
      </Menu>
    </>
  );
});

// AttachmentAddStep.propTypes = {
//   onCreate: PropTypes.func.isRequired,
//   onClose: PropTypes.func.isRequired,
// };

export default AttachmentAddStep;
