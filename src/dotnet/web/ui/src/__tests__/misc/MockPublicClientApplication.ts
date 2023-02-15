import { IPublicClientApplication, Logger, LogLevel } from '@azure/msal-browser';
import { testAccount, testResult } from './Constants';

export const getMockPublicClientApplication = (): IPublicClientApplication => {
  return {
    initialize: () => {
      return Promise.resolve();
    },
    acquireTokenPopup: () => {
      return Promise.resolve(testResult);
    },
    acquireTokenRedirect: () => {
      return Promise.resolve();
    },
    acquireTokenSilent: () => {
      return Promise.resolve(testResult);
    },
    acquireTokenByCode: () => {
      return Promise.resolve(testResult);
    },
    getAllAccounts: () => {
      return [testAccount];
    },
    getAccountByHomeId: () => {
      return testAccount;
    },
    getAccountByUsername: () => {
      return testAccount;
    },
    getAccountByLocalId: () => {
      return testAccount;
    },
    handleRedirectPromise: () => {
      return Promise.resolve(testResult);
    },
    loginPopup: () => {
      return Promise.resolve(testResult);
    },
    loginRedirect: () => {
      return Promise.resolve();
    },
    logout: () => {
      return Promise.resolve();
    },
    logoutRedirect: () => {
      return Promise.resolve();
    },
    logoutPopup: () => {
      return Promise.resolve();
    },
    ssoSilent: () => {
      return Promise.resolve(testResult);
    },
    addEventCallback: () => {
      return null;
    },
    removeEventCallback: () => {
      return;
    },
    addPerformanceCallback: () => {
      return '';
    },
    removePerformanceCallback: () => {
      return false;
    },
    enableAccountStorageEvents: () => {
      return;
    },
    disableAccountStorageEvents: () => {
      return;
    },
    getTokenCache: () => {
      return null;
    },
    getLogger: () => {
      const loggerOptions = {
        loggerCallback: (level: LogLevel, message: string, containsPii: boolean) => {},
        piiLoggingEnabled: false,
        logLevel: LogLevel.Error,
        correlationId: 'mock_test',
      };

      const logger = new Logger(loggerOptions);

      return logger;
    },
    setLogger: () => {
      return;
    },
    setActiveAccount: () => {
      return;
    },
    getActiveAccount: () => {
      return testAccount;
    },
    initializeWrapperLibrary: () => {
      return;
    },
    setNavigationClient: () => {
      return;
    },
    getConfiguration: () => {
      return null;
    },
  };
};
