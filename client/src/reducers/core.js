import { LOCATION_CHANGE_HANDLE } from '../lib/redux-router';

import ActionTypes from '../constants/ActionTypes';
import ModalTypes from '../constants/ModalTypes';

const initialState = {
  isLogouting: false,
  currentModal: null,
  searchedUsers: [],
  isSearchingUsers: false,
};

// eslint-disable-next-line default-param-last
export default (state = initialState, { type, payload }) => {
  switch (type) {
    case LOCATION_CHANGE_HANDLE:
    case ActionTypes.MODAL_CLOSE:
      return {
        ...state,
        currentModal: null,
      };
    case ActionTypes.LOGOUT__ACCESS_TOKEN_INVALIDATE:
      return {
        ...state,
        isLogouting: true,
      };
    case ActionTypes.MODAL_OPEN:
      return {
        ...state,
        currentModal: payload.type,
      };
    case ActionTypes.USER_UPDATE_HANDLE:
      if (state.currentModal === ModalTypes.USERS && payload.isCurrent && !payload.user.isAdmin) {
        return {
          ...state,
          currentModal: null,
        };
      }

      return state;
    case ActionTypes.USER_SEARCH:
      return {
        ...state,
        isSearchingUsers: true,
        searchedUsers: [],
      };
    case ActionTypes.USER_SEARCH__SUCCESS:
      return {
        ...state,
        isSearchingUsers: false,
        searchedUsers: payload.users,
      };
    case ActionTypes.USER_SEARCH__FAILURE:
      return {
        ...state,
        isSearchingUsers: false,
        searchedUsers: [],
      };
    case ActionTypes.USER_SEARCH_CLEAR:
      return {
        ...state,
        searchedUsers: [],
      };
    case ActionTypes.PROJECT_MANAGER_DELETE:
    case ActionTypes.PROJECT_MANAGER_DELETE_HANDLE:
      if (
        state.currentModal === ModalTypes.PROJECT_SETTINGS &&
        payload.isCurrentUser &&
        payload.isCurrentProject
      ) {
        return {
          ...state,
          currentModal: null,
        };
      }

      return state;
    default:
      return state;
  }
};
