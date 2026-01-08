import React, { useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { Icon } from '@gouvfr-lasuite/ui-kit';
import { Button, Modal } from '@openfun/cunningham-react';

import styles from './Feedback.module.scss';

import chatIcon from '../../assets/images/feedback/chat.svg';
import surveyIcon from '../../assets/images/feedback/survey.svg';
import videoIcon from '../../assets/images/feedback/video.svg';

const Feedback = React.memo(({ items }) => {
  const { t } = useTranslation();

  const [modalOpen, setModalOpen] = useState(false);
  const handleOpen = useCallback(() => {
    setModalOpen(true);
  }, []);
  const handleClose = useCallback(() => {
    setModalOpen(false);
  }, []);

  return (
    <>
      {/* - */}
      {items.length > 0 && (
        <>
          <Button
            icon={<Icon name="feedback" type="outlined" />}
            className={`${styles.feedbackButton} ${styles.onlySm} c__button--tertiary`} // Tertiary not working from "variant"
            variant="tertiary"
            size="small"
            onClick={handleOpen}
          />
          <Button
            icon={<Icon name="feedback" type="outlined" />}
            className={`${styles.feedbackButton} ${styles.overSm} c__button--tertiary`} // Tertiary not working from "variant"
            variant="tertiary"
            size="small"
            onClick={handleOpen}
          >
            {t('common.support')}
          </Button>

          <Modal
            isOpen={modalOpen}
            title={t('action.giveFeedback', {
              context: 'title',
            })}
            closeIcon
            onClose={handleClose}
            closeOnClickOutside
          >
            <p>{t('common.feedbackIntroduction')}</p>
            <div className={styles.items}>
              {items.map((item, itemIndex) => {
                let iconSrc;
                switch (item.type) {
                  case 'chat':
                    iconSrc = chatIcon;
                    break;
                  case 'survey':
                    iconSrc = surveyIcon;
                    break;
                  case 'video':
                    iconSrc = videoIcon;
                    break;
                  default:
                    iconSrc = chatIcon;
                    break;
                }

                return (
                  <a
                    // eslint-disable-next-line react/no-array-index-key
                    key={itemIndex}
                    className={styles.item}
                    href={item.href}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <img src={iconSrc} alt="" />
                    <div>
                      <p className={styles.itemTitle}>{item.title}</p>
                      <p className={styles.itemDescription}>{item.description}</p>
                    </div>
                  </a>
                );
              })}
            </div>
          </Modal>
        </>
      )}
    </>
  );
});

Feedback.propTypes = {
  items: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
};

export default Feedback;
