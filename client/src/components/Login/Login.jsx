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
// import { Button } from '@openfun/cunningham-react';
import HeaderRightContainer from '../../containers/HeaderRightContainer';
import styles from './Login.module.scss';

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

const Login = React.memo(({ isOidcEnforced, onAuthenticate, onAuthenticateUsingOidc }) => {
  // const { t } = useTranslation();

  useEffect(() => {
    if (!isOidcEnforced) {
      onAuthenticate({
        emailOrUsername: process.env.REACT_APP_DEFAULT_EMAIL,
        password: process.env.REACT_APP_DEFAULT_PASSWORD,
      });
    }
  }, [isOidcEnforced, onAuthenticate]);
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
            {/* <Button
              id="feedback-button"
              color="tertiary"
              size="medium"
              className={styles.feedbackButton}
              icon={
                <Icon name="information" type="filled" style={{ width: '1em', height: '1em' }} />
              }
            >
              Faire un retour
            </Button> */}
          </>
        }
        rightHeaderContent={<HeaderRightContainer />}
      >
        <HomeGutter>
          <Hero
            logo={<div className="drive__logo-icon" />}
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
        {/* <footer className="fr-footer" role="contentinfo" id="footer-7475">
            <div className="fr-container">
              <div className="fr-footer__body">
                <div className="fr-footer__brand fr-enlarge-link">
                  <p className="fr-logo">
                    République
                    <br />
                    Française
                  </p>
                  <a
                    className="fr-footer__brand-link"
                    href="/"
                    title="Agence Nationale de la Cohésion des Territoires"
                  >
                    <img
                      className="fr-footer__logo"
                      style={{ maxWidth: '13rem' }}
                      src="logo-anct.svg"
                      alt="Agence Nationale de la Cohésion des Territoires"
                    />
                  </a>
                </div>
                <div className="fr-footer__content">
                  <p className="fr-footer__content-desc">
                    L&apos;Incubateur des Territoires est une mission de l&apos;
                    <a
                      href="https://anct.gouv.fr/"
                      target="_blank"
                      title="Visiter le site de l'ANCT"
                      rel="noreferrer"
                    >
                      Agence Nationale de la Cohésion des Territoires
                    </a>
                    . Le code source de ce site web est disponible en licence libre. Le design de ce
                    site est conçu avec le{' '}
                    <a
                      href="https://www.systeme-de-design.gouv.fr/"
                      target="_blank"
                      title="Consulter la documentation du Système de Design de l'État"
                      rel="noopener noreferrer"
                    >
                      système de design de l&apos;État
                    </a>
                  </p>
                  <ul className="fr-footer__content-list">
                    <li className="fr-footer__content-item">
                      <a
                        target="_blank"
                        rel="noopener external noreferrer"
                        title="legifrance.gouv.fr - nouvelle fenêtre"
                        id="footer__content-link-7364"
                        className="fr-footer__content-link"
                        href="https://legifrance.gouv.fr"
                      >
                        legifrance.gouv.fr
                      </a>
                    </li>
                    <li className="fr-footer__content-item">
                      <a
                        target="_blank"
                        rel="noopener external noreferrer"
                        title="info.gouv.fr - nouvelle fenêtre"
                        id="footer__content-link-7362"
                        className="fr-footer__content-link"
                        href="https://info.gouv.fr"
                      >
                        gouvernement.fr
                      </a>
                    </li>
                    <li className="fr-footer__content-item">
                      <a
                        target="_blank"
                        rel="noopener external noreferrer"
                        title="service-public.fr - nouvelle fenêtre"
                        id="footer__content-link-7363"
                        className="fr-footer__content-link"
                        href="https://service-public.fr"
                      >
                        service-public.fr
                      </a>
                    </li>
                    <li className="fr-footer__content-item">
                      <a
                        target="_blank"
                        rel="noopener external noreferrer"
                        title="data.gouv.fr - nouvelle fenêtre"
                        id="footer__content-link-7365"
                        className="fr-footer__content-link"
                        href="https://data.gouv.fr"
                      >
                        data.gouv.fr
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
              <div className="fr-footer__bottom">
                <ul className="fr-footer__bottom-list">
                  <li className="fr-footer__bottom-item">
                    <a className="fr-footer__bottom-link" href="/plan-du-site">
                      Plan du site
                    </a>
                  </li>
                  <li className="fr-footer__bottom-item">
                    <a className="fr-footer__bottom-link" href="/accessibilite">
                      Accessibilité : non/partiellement/totalement conforme
                    </a>
                  </li>
                  <li className="fr-footer__bottom-item">
                    <a className="fr-footer__bottom-link" href="/mentions-legales">
                      Mentions légales
                    </a>
                  </li>
                  <li className="fr-footer__bottom-item">
                    <a className="fr-footer__bottom-link" href="/donnees-personnelles">
                      Données personnelles
                    </a>
                  </li>
                  <li className="fr-footer__bottom-item">
                    <a className="fr-footer__bottom-link" href="/gestion-des-cookies">
                      Gestion des cookies
                    </a>
                  </li>
                </ul>
                <div className="fr-footer__bottom-copy">
                  <p>
                    Sauf mention explicite de propriété intellectuelle détenue par des tiers, les
                    contenus de ce site sont proposés sous{' '}
                    <a
                      href="https://github.com/etalab/licence-ouverte/blob/master/LO.md"
                      target="_blank"
                      rel="noopener external noreferrer"
                      title="Licence etalab - nouvelle fenêtre"
                    >
                      licence etalab-2.0
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </footer> */}
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
      </MainLayout>
    </div>
  );
});

Login.propTypes = {
  isOidcEnforced: PropTypes.bool.isRequired,
  onAuthenticate: PropTypes.func.isRequired,
  onAuthenticateUsingOidc: PropTypes.func.isRequired,
  // onMessageDismiss: PropTypes.func.isRequired,
};

export default Login;
