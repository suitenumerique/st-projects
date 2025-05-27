import isEmail from 'validator/lib/isEmail';
import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { Button, Form, Grid, Header, Message } from 'semantic-ui-react';
import { useDidUpdate, usePrevious, useToggle } from '../../lib/hooks';
import { Input } from '../../lib/custom-ui';

import { useForm } from '../../hooks';
import { isUsername } from '../../utils/validator';

import styles from './LoginOverride.module.scss';

import logo from '../../assets/images/logo.svg';
import illustration from '../../assets/images/illustration.jpg';

const createMessage = (error) => {
  if (!error) {
    return error;
  }

  switch (error.message) {
    case 'Invalid credentials':
      return {
        type: 'error',
        content: 'common.invalidCredentials',
      };
    case 'Invalid email or username':
      return {
        type: 'error',
        content: 'common.invalidEmailOrUsername',
      };
    case 'Invalid password':
      return {
        type: 'error',
        content: 'common.invalidPassword',
      };
    case 'Use single sign-on':
      return {
        type: 'error',
        content: 'common.useSingleSignOn',
      };
    case 'Email already in use':
      return {
        type: 'error',
        content: 'common.emailAlreadyInUse',
      };
    case 'Username already in use':
      return {
        type: 'error',
        content: 'common.usernameAlreadyInUse',
      };
    case 'Failed to fetch':
      return {
        type: 'warning',
        content: 'common.noInternetConnection',
      };
    case 'Network request failed':
      return {
        type: 'warning',
        content: 'common.serverConnectionFailed',
      };
    default:
      return {
        type: 'warning',
        content: 'common.unknownError',
      };
  }
};

const Login = React.memo(
  ({
    defaultData,
    isSubmitting,
    isSubmittingUsingOidc,
    error,
    withOidc,
    isOidcEnforced,
    onAuthenticate,
    onAuthenticateUsingOidc,
    onMessageDismiss,
  }) => {
    // useEffect(() => {
    //   onAuthenticate({
    //     emailOrUsername: 'julien.demoutiez@ext.anct.gouv.fr',
    //     password: 'Testplanka!',
    //   });
    // }, [onAuthenticate]);

    return (
      <div className={classNames(styles.wrapper, styles.fullHeight)}>
        <header role="banner" className="fr-header">
          <div className="fr-header__body">
            <div className="fr-container">
              <div className="fr-header__body-row">
                <div className="fr-header__brand fr-enlarge-link">
                  <div className="fr-header__brand-top">
                    <div className="fr-header__logo">
                      <p className="fr-logo">GOUVERNEMENT</p>
                    </div>
                  </div>
                  <div className="fr-header__service">
                    <a href="/" className={styles.logo}>
                      <div>
                        <img src={logo} alt="Logo" />

                        <div>
                          <h2>Projets</h2>
                          <span>BETA</span>
                        </div>
                      </div>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className={styles.banner}>
          <div className="fr-container-fluid fr-container">
            <div className="fr-grid-row fr-grid-row--gutters fr-grid-row--middle fr-grid-row--center">
              <div className="fr-col-12 fr-col-offset-lg-1 fr-col-lg-4">
                <div className={styles.bannerContent}>
                  <img src={logo} alt="Logo" />
                  <h1>
                    La gestion de
                    <br />
                    projet partagée
                  </h1>
                  <p className={styles.bannerContentDescription}>
                    Visualisez et organisez toutes vos tâches
                    <br />
                    dans un espace collaboratif.
                  </p>
                  <div className="fr-connect-group">
                    <button
                      onClick={onAuthenticateUsingOidc}
                      type="button"
                      className={classNames(styles.proConnect, 'fr-connect')}
                    >
                      <span className="fr-connect__login">S’identifier avec</span>
                      <span className="fr-connect__brand">ProConnect</span>
                    </button>
                  </div>
                </div>
              </div>
              <div className="fr-col-12 fr-col-lg-4">
                <div className={styles.bannerIllustration}>
                  <img src={illustration} alt="Illustration" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <footer className="fr-footer" role="contentinfo" id="footer-7475">
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
        </footer>
      </div>
    );
  },
);

Login.propTypes = {
  /* eslint-disable react/forbid-prop-types */
  defaultData: PropTypes.object.isRequired,
  /* eslint-enable react/forbid-prop-types */
  isSubmitting: PropTypes.bool.isRequired,
  isSubmittingUsingOidc: PropTypes.bool.isRequired,
  error: PropTypes.object, // eslint-disable-line react/forbid-prop-types
  withOidc: PropTypes.bool.isRequired,
  isOidcEnforced: PropTypes.bool.isRequired,
  onAuthenticate: PropTypes.func.isRequired,
  onAuthenticateUsingOidc: PropTypes.func.isRequired,
  onMessageDismiss: PropTypes.func.isRequired,
};

Login.defaultProps = {
  error: undefined,
};

export default Login;
