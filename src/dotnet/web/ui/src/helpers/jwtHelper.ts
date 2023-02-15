export const decodeJwt = (token: string) => {
  try {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(function (c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join(''),
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error(error);
    return undefined;
  }
};

export const isTokenExpired = (expiresOn: string) => {
  try {
    const expirationSec = Number(expiresOn) || 0;
    let currentTimeSec = Math.round(new Date().getTime() / 1000.0);

    // If current time + offset is greater than token expiration time, then token is expired.
    return currentTimeSec > expirationSec;
  } catch (error) {
    console.error(error);
    return true;
  }
};
