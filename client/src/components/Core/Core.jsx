import React from 'react';
import PropTypes from 'prop-types';
import { useTranslation, Trans } from 'react-i18next';
import { Header, MainLayout, Spinner } from '@gouvfr-lasuite/ui-kit';
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

    const contentNode = () => {
      if (currentUser) {
        return (
          <MainLayout
            enableResize
            rightHeaderContent={<HeaderRightContainer />}
            leftPanelContent={currentUser && <LeftMenuContainer />}
            icon={<img src={logo} alt="logo" />}
          >
            <StaticContainer />
            <FeedbackWidget
              apiUrl={reactAppFeedbackWidgetApiUrl}
              widgetPath={reactAppFeedbackWidgetPath}
              channel={reactAppFeedbackWidgetChannel}
            />
          </MainLayout>
        );
      }
      return (
        <div className={styles.noAuthWrapper}>
          <div className={styles.noAuthHeader}>
            <Header leftIcon={<img src={logo} alt="logo" />} rightIcon={<HeaderRightContainer />} />
          </div>
          <div className={styles.noAuthContent}>
            <StaticContainer />
          </div>
        </div>
      );
    };

    return (
      <>
        {isInitializing ? (
          <div className={styles.loading}>
            <Spinner size="xl" />
          </div>
        ) : (
          contentNode()
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
