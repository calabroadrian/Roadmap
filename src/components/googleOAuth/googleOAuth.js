// googleOAuth.js

export function initializeGoogleSignIn(clientId, onSuccess, onFailure) {
    gapi.load('auth2', () => {
      gapi.auth2.init({
        client_id: clientId,
      }).then(() => {
        const auth2 = gapi.auth2.getAuthInstance();
  
        const googleSignInButton = document.getElementById('google-signin-button');
        googleSignInButton.addEventListener('click', () => {
          auth2.signIn()
            .then(onSuccess)
            .catch(onFailure);
        });
      });
    });
  }
  