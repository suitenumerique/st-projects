import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { useTranslation, Trans } from 'react-i18next';
import { MainLayout } from '@gouvfr-lasuite/ui-kit';
import StaticContainer from '../../containers/StaticContainer';
import LeftMenuContainer from '../../containers/LeftMenuContainer';
import HeaderRightContainer from '../../containers/HeaderRightContainer';
import { FeedbackWidget } from '../../ui/FeedbackWidget/index.tsx';
import styles from './Core.module.scss';
import logo from '../../assets/images/projets_logo.svg';

const Core = React.memo(
  ({
    isInitializing,
    isSocketDisconnected,
    currentUser,
    reactAppFeedbackWidgetApiUrl,
    reactAppFeedbackWidgetPath,
    reactAppFeedbackWidgetChannel,
  }) => {
    const [t] = useTranslation();

    return (
      <>
        {isInitializing ? (
          <p>Chargement...</p>
        ) : (
          <MainLayout
            enableResize
            rightHeaderContent={<HeaderRightContainer />}
            leftPanelContent={currentUser && <LeftMenuContainer />}
            icon={
              <div className={styles.logoWrapper}>
                <img src={logo} alt="logo" />
                <span>BETA</span>
              </div>
            }
          >
            <StaticContainer />
            <FeedbackWidget
              apiUrl={reactAppFeedbackWidgetApiUrl}
              widgetPath={reactAppFeedbackWidgetPath}
              channel={reactAppFeedbackWidgetChannel}
            />
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
  currentUser: PropTypes.object,
  /* eslint-enable react/forbid-prop-types */
  reactAppFeedbackWidgetApiUrl: PropTypes.string.isRequired,
  reactAppFeedbackWidgetPath: PropTypes.string.isRequired,
  reactAppFeedbackWidgetChannel: PropTypes.string.isRequired,
};

Core.defaultProps = {
  currentUser: undefined,
};

export default Core;
