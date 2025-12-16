import React from 'react';
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
    onAuthenticateUsingOidc,
    reactAppFeedbackWidgetApiUrl,
    reactAppFeedbackWidgetPath,
    reactAppFeedbackWidgetChannel,
  }) => {
    // const { t } = useTranslation();

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
                label: "Conditions générales d'utilisation",
                href: 'https://docs.suite.anct.gouv.fr/docs/bf7ff5c9-766a-409c-8f62-d4acc9517218/',
              },
              {
                label: 'Politique de confidentialité',
                href: 'https://docs.suite.anct.gouv.fr/docs/b77fef2d-ee20-4f3b-b795-e8210849331c/',
              },
              {
                label: "Déclaration d'accessibilité",
                href: 'https://docs.suite.anct.gouv.fr/docs/ec1f62fd-1af3-419c-8f72-1d7fe64c13ac/',
              },
              {
                label: 'Mentions légales',
                href: 'https://docs.suite.anct.gouv.fr/docs/714f5518-4d1a-47f2-8878-3b7216ae902b/',
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
  onAuthenticateUsingOidc: PropTypes.func.isRequired,
  // onMessageDismiss: PropTypes.func.isRequired,
  reactAppFeedbackWidgetApiUrl: PropTypes.string.isRequired,
  reactAppFeedbackWidgetPath: PropTypes.string.isRequired,
  reactAppFeedbackWidgetChannel: PropTypes.string.isRequired,
};

export default Login;
