import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Hero,
  // Icon,
  MainLayout,
  ProConnectButton,
  HomeGutter,
  Footer,
} from '@gouvfr-lasuite/ui-kit';
// import { useTranslation } from 'react-i18next';
import HeaderRightContainer from '../../containers/HeaderRightContainer';
import styles from './Login.module.scss';
import { FeedbackWidget } from '../../ui/FeedbackWidget/index.tsx';

import logo from '../../assets/images/projets_logo.svg';
import logoGouv from '../../assets/images/logo-gouv.svg';
import illustration from '../../assets/images/illustration.jpg';

// const createMessage = (error) => {
//   if (!error) {
//     return error;
//   }

//   switch (error.message) {
//     case 'Invalid credentials':
//       return {
//         type: 'error',
//         content: 'common.invalidCredentials',
//       };
//     case 'Invalid email or username':
//       return {
//         type: 'error',
//         content: 'common.invalidEmailOrUsername',
//       };
//     case 'Invalid password':
//       return {
//         type: 'error',
//         content: 'common.invalidPassword',
//       };
//     case 'Use single sign-on':
//       return {
//         type: 'error',
//         content: 'common.useSingleSignOn',
//       };
//     case 'Email already in use':
//       return {
//         type: 'error',
//         content: 'common.emailAlreadyInUse',
//       };
//     case 'Username already in use':
//       return {
//         type: 'error',
//         content: 'common.usernameAlreadyInUse',
//       };
//     case 'Failed to fetch':
//       return {
//         type: 'warning',
//         content: 'common.noInternetConnection',
//       };
//     case 'Network request failed':
//       return {
//         type: 'warning',
//         content: 'common.serverConnectionFailed',
//       };
//     default:
//       return {
//         type: 'warning',
//         content: 'common.unknownError',
//       };
//   }
// };

const Login = React.memo(
  ({
    isOidcEnforced,
    onAuthenticate,
    onAuthenticateUsingOidc,
    reactAppDefaultEmail,
    reactAppDefaultPassword,
    reactAppFeedbackWidgetApiUrl,
    reactAppFeedbackWidgetPath,
    reactAppFeedbackWidgetChannel,
  }) => {
    // const { t } = useTranslation();

    useEffect(() => {
      if (!isOidcEnforced) {
        onAuthenticate({
          emailOrUsername: reactAppDefaultEmail,
          password: reactAppDefaultPassword,
        });
      }
    }, [isOidcEnforced, onAuthenticate, reactAppDefaultEmail, reactAppDefaultPassword]);

    return (
      <div className="projets_login">
        <MainLayout
          hideLeftPanelOnDesktop
          icon={
            <>
              <img src={logoGouv} alt="" className={styles.logoGouv} />
              <div className={styles.logoWrapper}>
                <img src={logo} alt="logo" />
                <span>BETA</span>
              </div>
            </>
          }
          rightHeaderContent={<HeaderRightContainer />}
        >
          <HomeGutter>
            <Hero
              banner={illustration}
              title="La gestion de projet partagée"
              subtitle="Visualisez et organisez toutes vos tâches dans un espace collaboratif."
              mainButton={
                <div className="c__hero__buttons">
                  <div>
                    <ProConnectButton onClick={onAuthenticateUsingOidc} />
                  </div>
                </div>
              }
            />
          </HomeGutter>
          <Footer
            legalLinks={[
              {
                label: 'Mentions légales',
                href: '#',
              },
              {
                label: 'Données personnelles et cookies',
                href: '#',
              },
              {
                label: 'Accessibilité: non conforme',
                href: '#',
              },
            ]}
            externalLinks={[
              {
                label: 'Github',
                href: 'https://github.com/suitenumerique/drive/',
              },
              {
                label: 'DINUM',
                href: 'https://www.numerique.gouv.fr/dinum/',
              },
              {
                label: 'ANCT',
                href: 'https://anct.gouv.fr/',
              },
            ]}
            license={{
              label: 'Sauf mention contraire, tout le contenu de ce site est sous',
              link: {
                label: 'licence etalab-2.0',
                href: 'https://github.com/etalab/licence-ouverte/blob/master/LO.md',
              },
            }}
          />
          <FeedbackWidget
            apiUrl={reactAppFeedbackWidgetApiUrl}
            widgetPath={reactAppFeedbackWidgetPath}
            channel={reactAppFeedbackWidgetChannel}
          />
        </MainLayout>
      </div>
    );
  },
);

Login.propTypes = {
  isOidcEnforced: PropTypes.bool.isRequired,
  onAuthenticate: PropTypes.func.isRequired,
  onAuthenticateUsingOidc: PropTypes.func.isRequired,
  // onMessageDismiss: PropTypes.func.isRequired,
  reactAppDefaultEmail: PropTypes.string.isRequired,
  reactAppDefaultPassword: PropTypes.string.isRequired,
  reactAppFeedbackWidgetApiUrl: PropTypes.string.isRequired,
  reactAppFeedbackWidgetPath: PropTypes.string.isRequired,
  reactAppFeedbackWidgetChannel: PropTypes.string.isRequired,
};

export default Login;
