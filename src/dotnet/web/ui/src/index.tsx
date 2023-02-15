import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import './index.css';
import reportWebVitals from './reportWebVitals';
import { AuthenticationResult, EventMessage, EventType, PublicClientApplication } from '@azure/msal-browser';
import { MsalProvider as MsalReactProvider } from '@azure/msal-react';
import { msalConfig } from './msalConfig';
// Just to be sure web.config will be part of the bundle
import './web.config';

// Instantiate MSAL-Browser
const pca = new PublicClientApplication(msalConfig);

// Account selection logic is app dependent. Adjust as needed for different use cases.
const accounts = pca.getAllAccounts();
if (accounts.length > 0) {
  pca.setActiveAccount(accounts[0]);
}

pca.addEventCallback((event: EventMessage) => {
  if (event.eventType === EventType.LOGIN_SUCCESS && event.payload) {
    const payload = event.payload as AuthenticationResult;
    const account = payload.account;
    pca.setActiveAccount(account);
  }
});

ReactDOM.render(
  <React.StrictMode>
    <MsalReactProvider instance={pca}>
      <App />
    </MsalReactProvider>
  </React.StrictMode>,
  document.getElementById('root'),
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
