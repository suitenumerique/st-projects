import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { useTranslation, Trans } from 'react-i18next';
import { MainLayout } from '@gouvfr-lasuite/ui-kit';
// import { Button } from '@openfun/cunningham-react';

import { Loader } from '../../lib/migration-helpers';

import StaticContainer from '../../containers/StaticContainer';
import LeftMenuContainer from '../../containers/LeftMenuContainer';

import styles from './Core.module.scss';
import logo from '../../assets/images/projets_logo.svg';
import HeaderRightContainer from '../../containers/HeaderRightContainer';

const Core = React.memo(
  ({
    isInitializing,
    isSocketDisconnected,
    currentProject,
    currentBoard,
    currentUser,
    currentUserMembership,
  }) => {
    const [t] = useTranslation();

    const defaultTitle = useRef(document.title);

    useEffect(() => {
      let title;
      if (currentProject) {
        title = currentProject.name;

        if (currentBoard) {
          title += ` | ${currentBoard.name}`;
        }
      } else {
        title = defaultTitle.current;
      }

      document.title = title;
    }, [currentProject, currentBoard]);

    return (
      <>
        {isInitializing ? (
          <Loader active size="massive" />
        ) : (
          <MainLayout
            enableResize
            leftPanelContent={<LeftMenuContainer />}
            leftPanelIsOpen={currentUser && (!currentBoard || currentUserMembership)}
            icon={
              <>
                <div className={styles.logoWrapper}>
                  <img src={logo} alt="logo" />
                  <span>BETA</span>
                </div>
                {/* {currentUser && (
                  <Button
                    id="feedback-button"
                    color="tertiary"
                    size="medium"
                    className={styles.feedbackButton}
                    icon={
                      <Icon
                        name="information"
                        type="filled"
                        style={{ width: '1em', height: '1em' }}
                      />
                    }
                  >
                    Faire un retour
                  </Button>
                )} */}
              </>
            }
            rightHeaderContent={<HeaderRightContainer />}
          >
            <StaticContainer />
          </MainLayout>
        )}
        {isSocketDisconnected && (
          <div className={styles.message}>
            <div className={styles.messageHeader}>{t('common.noConnectionToServer')}</div>
            <div className={styles.messageContent}>
              <Trans i18nKey="common.allChangesWillBeAutomaticallySavedAfterConnectionRestored">
                All changes will be automatically saved
                <br />
                after connection restored
              </Trans>
            </div>
          </div>
        )}
      </>
    );
  },
);

Core.propTypes = {
  isInitializing: PropTypes.bool.isRequired,
  isSocketDisconnected: PropTypes.bool.isRequired,
  /* eslint-disable react/forbid-prop-types */
  currentProject: PropTypes.object,
  currentBoard: PropTypes.object,
  currentUser: PropTypes.object,
  currentUserMembership: PropTypes.object,
  /* eslint-enable react/forbid-prop-types */
};

Core.defaultProps = {
  currentProject: undefined,
  currentBoard: undefined,
  currentUser: undefined,
  currentUserMembership: undefined,
};

export default Core;
