/* global window */
/* eslint no-alert: 0 */

import { Observable } from 'rxjs/Observable';
import { push } from 'react-router-redux';
import cookieHelper from 'mcs-lite-ui/lib/utils/cookieHelper';
import { actions as devicesActions } from './devices';
import { actions as datapointsActions } from './datapoints';
import { actions as uiActions } from './ui';
import { success, failure, accessTokenSelector$ } from '../utils/cycleHelper';

// ----------------------------------------------------------------------------
// 1. Constants
// ----------------------------------------------------------------------------

const REQUIRE_AUTH = 'mcs-lite-mobile-web/auth/REQUIRE_AUTH';
const TRY_ENTER = 'mcs-lite-mobile-web/auth/TRY_ENTER';
const SIGNOUT = 'mcs-lite-mobile-web/auth/SIGNOUT';
const CHANGE_PASSWORD = 'mcs-lite-mobile-web/auth/CHANGE_PASSWORD';
const SET_USERINFO = 'mcs-lite-mobile-web/auth/SET_USERINFO';
const CLEAR = 'mcs-lite-mobile-web/auth/CLEAR';

export const constants = {
  REQUIRE_AUTH,
  TRY_ENTER,
  SIGNOUT,
  CHANGE_PASSWORD,
  SET_USERINFO,
  CLEAR,
};

// ----------------------------------------------------------------------------
// 2. Action Creators (Sync)
// ----------------------------------------------------------------------------

const requireAuth = () => ({ type: REQUIRE_AUTH });
const tryEnter = () => ({ type: TRY_ENTER });
const signout = (confirmMessage, isForce) => ({
  type: SIGNOUT,
  payload: { message: confirmMessage, isForce },
});
const setUserInfo = userData => ({ type: SET_USERINFO, payload: userData });
const changePassword = ({ password, message }) => ({
  type: CHANGE_PASSWORD,
  payload: { password, message },
});
const clear = () => ({ type: CLEAR });

export const actions = {
  requireAuth,
  tryEnter,
  signout,
  setUserInfo,
  changePassword,
  clear,
};

// ----------------------------------------------------------------------------
// 3. Cycle (Side-effects)
// ----------------------------------------------------------------------------

function requireAuthCycle(sources) {
  const cookieToken$ = sources.ACTION.filter(
    action => action.type === REQUIRE_AUTH,
  ).map(cookieHelper.getCookieToken);

  const request$ = cookieToken$.map(cookieToken => ({
    url: '/oauth/cookies/mobile',
    method: 'POST',
    send: { token: cookieToken },
    category: REQUIRE_AUTH,
  }));

  const successRes$ = sources.HTTP.select(REQUIRE_AUTH).switchMap(success);

  const action$ = successRes$.pluck('body', 'results').map(setUserInfo);

  return {
    ACTION: action$,
    HTTP: request$,
  };
}

function tryEnterCycle(sources) {
  const cookieToken$ = sources.ACTION.filter(
    action => action.type === TRY_ENTER,
  ).map(cookieHelper.getCookieToken);

  const action$ = cookieToken$
    .filter(cookieToken => !!cookieToken) // Hint: Go to devices list if cookieToken avaliable
    .mapTo(push('/'));

  return {
    ACTION: action$,
  };
}

function signoutCycle(sources) {
  const confirm$ = sources.ACTION.filter(
    action => action.type === SIGNOUT,
  ).switchMap(action => {
    const { message, isForce } = action.payload;
    if (isForce || window.confirm(message)) {
      return Observable.of(action);
    }
    return Observable.empty();
  });

  const action$ = confirm$
    .switchMap(() =>
      Observable.of(
        push('/login'),
        clear(),
        devicesActions.clear(),
        datapointsActions.clear(),
      ),
    )
    .do(cookieHelper.removeCookieToken);

  return {
    ACTION: action$,
  };
}

function changePasswordCycle(sources) {
  const accessToken$ = accessTokenSelector$(sources.STATE);

  const payload$ = sources.ACTION.filter(
    action => action.type === CHANGE_PASSWORD,
  ).pluck('payload');

  const password$ = payload$.pluck('password');
  const message$ = payload$.pluck('message');

  const request$ = password$.withLatestFrom(
    accessToken$,
    (password, accessToken) => ({
      url: '/api/users/changepassword',
      method: 'PUT',
      headers: { Authorization: `Bearer ${accessToken}` },
      send: { password },
      category: CHANGE_PASSWORD,
    }),
  );

  const response$ = sources.HTTP.select(CHANGE_PASSWORD).switchMap(success);

  const action$ = response$.withLatestFrom(message$, (response, message) =>
    uiActions.addToast({
      kind: 'success',
      children: message,
    }),
  );

  return {
    ACTION: action$,
    HTTP: request$,
  };
}

function httpErrorCycle(sources) {
  // Remind: handle all http errors here
  const failureRes$ = sources.HTTP.select()
    .concatMap(failure)
    .pluck('response')
    .do(response => console.log('httpErrorCycle', response)); // eslint-disable-line

  const action$ = failureRes$.concatMap(({ status, statusText }) =>
    Observable.from([
      uiActions.addToast({
        kind: 'error',
        children: ` (${status} ${statusText})`,
      }),
      uiActions.setLoaded(), // Hint: set loading anyway
      ...(status === 401 && [
        signout('', true), // Remind: Force signout
      ]),
    ]),
  );

  return {
    ACTION: action$,
  };
}

export const cycles = {
  requireAuthCycle,
  tryEnterCycle,
  signoutCycle,
  changePasswordCycle,
  httpErrorCycle,
};

// ----------------------------------------------------------------------------
// 4. Reducer as default (State shaper)
// ----------------------------------------------------------------------------

const initialState = {};

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case SET_USERINFO:
      return {
        ...state,
        ...action.payload,
      };
    case CLEAR:
      return initialState;
    default:
      return state;
  }
}
