
/*
 * Store for app data. Will store and update app data on changes from UI and
 * server.
 */

import Immutable from 'immutable';

import BaseStore from './base_store.js';
import cfApi from '../util/cf_api.js';
import { appStates, appActionTypes } from '../constants.js';

class AppStore extends BaseStore {
  constructor() {
    super();
    this._data = new Immutable.List();
    this._currentAppGuid = null;
    this.subscribe(() => this._registerToActions.bind(this));
  }

  isRestarting(app) {
    return app.state === appStates.restarting;
  }

  isRunning(app) {
    return app.state === appStates.running || app.state === appStates.started;
  }

  _registerToActions(action) {
    switch (action.type) {
      case appActionTypes.APP_FETCH:
        this.load([cfApi.fetchApp(action.appGuid)]);
        this.emitChange();
        break;

      case appActionTypes.APP_STATS_FETCH:
        cfApi.fetchAppStats(action.appGuid);
        break;

      case appActionTypes.APP_RECEIVED:
        this.merge('guid', action.app, () => { });
        this.emitChange();
        break;

      case appActionTypes.APP_STATS_RECEIVED: {
        const app = Object.assign({}, action.app, { guid: action.appGuid });
        this.merge('guid', app, (changed) => {
          if (changed) this.emitChange();
        });
        break;
      }

      case appActionTypes.APP_ALL_FETCH: {
        this.load([cfApi.fetchAppAll(action.appGuid)]);
        this.emitChange();
        break;
      }

      case appActionTypes.APP_ALL_RECEIVED: {
        this.emitChange();
        break;
      }

      case appActionTypes.APP_CHANGE_CURRENT: {
        this._currentAppGuid = action.appGuid;
        this.emitChange();
        break;
      }

      case appActionTypes.APP_RESTART: {
        cfApi.postAppRestart(action.appGuid);
        const app = this.get(action.appGuid);
        if (app) {
          const restartingApp = Object.assign({}, app,
            { state: appStates.restarting });
          this.merge('guid', restartingApp, (changed) => {
            if (changed) this.emitChange();
          });
        }
        break;
      }

      case appActionTypes.APP_RESTARTED: {
        this.poll(
          (app) => app.data.running_instances > 0,
          cfApi.fetchAppStatus.bind(cfApi, action.appGuid)
        ).then((app) => {
          this.merge('guid', app, () => {});
          cfApi.fetchAppAll(action.appGuid);
          this.emitChange();
        });
        break;
      }

      case appActionTypes.APP_ERROR: {
        const app = this.get(action.appGuid);
        if (app) {
          const erroredApp = Object.assign({}, app, { error: action.error });
          this.merge('guid', erroredApp, () => {});
          this.emitChange();
          setTimeout(() => { cfApi.fetchAppAll(action.appGuid); }, 3000);
        }
        break;
      }

      default:
        break;
    }
  }

  get currentAppGuid() {
    return this._currentAppGuid;
  }
}

const _AppStore = new AppStore();

export default _AppStore;
