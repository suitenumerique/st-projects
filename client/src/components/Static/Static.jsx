import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { useTranslation, Trans } from 'react-i18next';
import { Icon, Loader } from '../../lib/migration-helpers';

import BoardContainer from '../../containers/BoardContainer';
import BoardActionsContainer from '../../containers/BoardActionsContainer';

import styles from './Static.module.scss';

function Static({ projectId, cardId, currentBoard }) {
  const [t] = useTranslation();

  if (cardId === null) {
    return (
      <div className={classNames(styles.wrapper, styles.wrapperFlex)}>
        <div className={styles.message}>
          <h1>
            {t('common.cardNotFound', {
              context: 'title',
            })}
          </h1>
        </div>
      </div>
    );
  }

  if (currentBoard === null) {
    return (
      <div className={classNames(styles.wrapper, styles.wrapperFlex)}>
        <div className={styles.message}>
          <h1>
            {t('common.boardNotFound', {
              context: 'title',
            })}
          </h1>
        </div>
      </div>
    );
  }

  if (projectId === null) {
    return (
      <div className={classNames(styles.wrapper, styles.wrapperFlex)}>
        <div className={styles.message}>
          <h1>
            {t('common.projectNotFound', {
              context: 'title',
            })}
          </h1>
        </div>
      </div>
    );
  }

  if (currentBoard === undefined) {
    return (
      <div className={classNames(styles.wrapper, styles.wrapperFlex, styles.wrapperProject)}>
        <div className={styles.message}>
          <Icon inverted name="hand point up outline" size="huge" className={styles.messageIcon} />
          <h1 className={styles.messageTitle}>
            {t('common.openBoard', {
              context: 'title',
            })}
          </h1>
          <div className={styles.messageContent}>
            <Trans i18nKey="common.createNewOneOrSelectExistingOne" />
          </div>
        </div>
      </div>
    );
  }

  if (currentBoard.isFetching) {
    return (
      <div className={classNames(styles.wrapper, styles.wrapperLoader, styles.wrapperProject)}>
        <Loader active size="big" />
      </div>
    );
  }

  return (
    <div className={classNames(styles.wrapper, styles.wrapperFlex, styles.wrapperBoard)}>
      {currentBoard && !currentBoard.isFetching && <BoardActionsContainer />}
      <BoardContainer />
    </div>
  );
}

Static.propTypes = {
  projectId: PropTypes.string,
  cardId: PropTypes.string,
  currentBoard: PropTypes.object, // eslint-disable-line react/forbid-prop-types
};

Static.defaultProps = {
  projectId: undefined,
  cardId: undefined,
  currentBoard: undefined,
};

export default Static;
