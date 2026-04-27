import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';

import Config from '../constants/Config';

const OIDC_ID_TOKEN_KEY = 'oidc-id-token';

export const setIdToken = (idToken) => {
  if (idToken) {
    window.localStorage.setItem(OIDC_ID_TOKEN_KEY, idToken);
  }
};

export const getIdToken = () => window.localStorage.getItem(OIDC_ID_TOKEN_KEY);

export const removeIdToken = () => window.localStorage.removeItem(OIDC_ID_TOKEN_KEY);

export const setAccessToken = (accessToken) => {
  const { exp } = jwtDecode(accessToken);
  const expires = new Date(exp * 1000);

  Cookies.set(Config.ACCESS_TOKEN_KEY, accessToken, {
    expires,
    secure: window.location.protocol === 'https:',
    sameSite: 'strict',
  });

  Cookies.set(Config.ACCESS_TOKEN_VERSION_KEY, Config.ACCESS_TOKEN_VERSION, {
    expires,
  });
};

export const removeAccessToken = () => {
  Cookies.remove(Config.ACCESS_TOKEN_KEY);
  Cookies.remove(Config.ACCESS_TOKEN_VERSION_KEY);
};

export const getAccessToken = () => {
  let accessToken = Cookies.get(Config.ACCESS_TOKEN_KEY);
  const accessTokenVersion = Cookies.get(Config.ACCESS_TOKEN_VERSION_KEY);

  if (accessToken && accessTokenVersion !== Config.ACCESS_TOKEN_VERSION) {
    removeAccessToken();
    accessToken = undefined;
  }

  return accessToken;
};
