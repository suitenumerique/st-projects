import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { useTranslation, Trans } from 'react-i18next';
import { Spinner } from '@gouvfr-lasuite/ui-kit';

import BoardContainer from '../../containers/BoardContainer';
import BoardActionsContainer from '../../containers/BoardActionsContainer';

import styles from './Static.module.scss';

function Static({ cardId, currentBoard }) {
  const [t] = useTranslation();

  if (cardId === null) {
    return (
      <div className={classNames(styles.wrapper)}>
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
      <div className={classNames(styles.wrapper)}>
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

  if (currentBoard === undefined) {
    return (
      <div className={classNames(styles.wrapper)}>
        <div className={styles.message}>
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
      <div className={classNames(styles.wrapper)}>
        <div className={styles.loading}>
          <Spinner size="xl" />
        </div>
      </div>
    );
  }

  return (
    <div className={classNames(styles.wrapper)}>
      {currentBoard && !currentBoard.isFetching && <BoardActionsContainer />}
      <BoardContainer />
    </div>
  );
}

Static.propTypes = {
  cardId: PropTypes.string,
  currentBoard: PropTypes.object, // eslint-disable-line react/forbid-prop-types
};

Static.defaultProps = {
  cardId: undefined,
  currentBoard: undefined,
};

export default Static;
