import ActionTypes from '../../constants/ActionTypes';

const initialState = null;

// eslint-disable-next-line default-param-last
export default (state = initialState, { type, payload }) => {
  switch (type) {
    case ActionTypes.ATTACHMENT_CREATE__FAILURE:
      return payload.error.code || 'unknown';
    case ActionTypes.ATTACHMENT_CREATE: // if a new retry is failing the reset is import before the second attempt so UI detects a new change
    case ActionTypes.LOCATION_CHANGE_HANDLE: // changing the page should reset the error state to not be displayed if coming back
      return initialState;
    default:
      return state;
  }
};
