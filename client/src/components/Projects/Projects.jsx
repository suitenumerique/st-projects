import { Button, Select } from '@gouvfr-lasuite/cunningham-react';
import React from 'react';
import PropTypes from 'prop-types';
import { useTranslation, Trans } from 'react-i18next';

import Paths from '../../constants/Paths';
import { push } from '../../lib/redux-router';
import store from '../../store';

import styles from './Projects.module.scss';

const Projects = React.memo(({ currentUser, items, canAdd, onAdd }) => {
  const [t] = useTranslation();

  return (
    <>
      <div className={styles.wrapper}>
        {items.length > 0 ? (
          <>
            <h1 className={styles.title}>
              {t('common.welcomeBack', {
                userName: currentUser.name,
              })}
            </h1>
            <div className={styles.choice}>
              <Select
                label={t('action.selectProject')}
                options={items.map((item) => {
                  return {
                    value: item.id,
                    label: `${item.name}${
                      item.notificationsTotal > 0
                        ? // Unfortunately the select cannot a accept elements for now, so having the fallback version (maybe not useful if notifications panel in the header?)
                          ` (${item.notificationsTotal})`
                        : // <>
                          //   {' '}
                          //   <span className={styles.notification}>{item.notificationsTotal}</span>
                          // </>
                          ''
                    }`,
                  };
                })}
                defaultValue={undefined}
                clearable={false}
                onChange={(event) => {
                  const selectedItem = items.find((item) => {
                    return item.id === event.target.value;
                  });

                  if (selectedItem) {
                    const to = selectedItem.firstBoardId
                      ? Paths.BOARDS.replace(':id', selectedItem.firstBoardId)
                      : Paths.PROJECTS.replace(':id', selectedItem.id);

                    store.dispatch(push(to));
                  }
                }}
              />
              {canAdd && (
                <>
                  ou <Button onClick={onAdd}>{t('action.createProject')}</Button>
                </>
              )}
            </div>
          </>
        ) : (
          <>
            <h1 className={styles.title}>
              {t('common.setupReady', {
                userName: currentUser.name,
              })}
            </h1>
            {/* A new user should always have this right */}
            {canAdd && (
              <div className={styles.firstProjectToCreate}>
                <Trans i18nKey="common.startByCreatingProject">
                  {'you can now '}
                  <Button onClick={onAdd} style={{ display: 'inline-block' }}>
                    create project
                  </Button>
                </Trans>
              </div>
            )}
          </>
        )}
      </div>
      <div className={styles.backgroundWrapper} />
    </>
  );
});

Projects.propTypes = {
  currentUser: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  items: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  canAdd: PropTypes.bool.isRequired,
  onAdd: PropTypes.func.isRequired,
};

export default Projects;
