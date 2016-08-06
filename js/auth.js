// Your Client ID can be retrieved from your project in the Google
// Developer Console, https://console.developers.google.com
var CLIENT_ID = '540045535516-bd21gnjkb2g2rsof4bah1p3i904njtk0.apps.googleusercontent.com';

var SCOPES = ["https://www.googleapis.com/auth/spreadsheets.readonly"];

var loginButton = document.querySelector('#login');

// Invoked after google loads js.
//
function checkAuth() {
  authorize(true);
}

function authorize(immediate) {
  gapi.auth.authorize({
    'client_id': CLIENT_ID,
    'scope': SCOPES.join(' '),
    'immediate': immediate,
  }, function(authResult){

    if(authResult && !authResult.error) {
      // The user has logged in before.
      // Load sheet api now.
      //
      gapi.client.load('https://sheets.googleapis.com/$discovery/rest?version=v4')
        .then(listMajors);
    } else {
      // enable login button.
      loginButton.removeAttribute('disabled');
    }
  });
}

loginButton.addEventListener('click', function () {
  authorize(false);
})

/**
 * Print the names and majors of students in a sample spreadsheet:
 * https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit
 */
function listMajors() {
  gapi.client.sheets.spreadsheets.values.get({
    spreadsheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
    range: 'Class Data!A2:E',
  }).then(function(response) {
    var range = response.result;
    console.log(range)
  }, function(response) {
    console.error(response.result.error.message)
  });
}
