(function() {


// Your Client ID can be retrieved from your project in the Google
// Developer Console, https://console.developers.google.com
var CLIENT_ID = '540045535516-bd21gnjkb2g2rsof4bah1p3i904njtk0.apps.googleusercontent.com';
var SCOPES = ["https://www.googleapis.com/auth/spreadsheets"];
var SPREADSHEET_ID = getFromSearchString('source') || '1Pn6E321fuwnrvgoLrl6Qsrb2aPbL9hN9ahptedPtSQE';
var SHEET_NAMES = (getFromSearchString('sheets') || 'od1').split(',');

window.getSpreadsheet = () => {
  return Promise((resolve, reject) => {

  })
}

});



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
        .then(fetchColumnHeaders);
    } else {
      // enable login button.
      loginButton.removeAttribute('disabled');
    }
  });
}

loginButton.addEventListener('click', function () {
  authorize(false);
})

var columnNameForSheets = {};

/**
 * Print the names and majors of students in a sample spreadsheet:
 * https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit
 */
function fetchColumnHeaders() {
  gapi.client.sheets.spreadsheets.values.batchGet({
    spreadsheetId: SPREADSHEET_ID,
    ranges: SHEET_NAMES.map(function(sheetName){
      return `${sheetName}!A1:1`
    }),
  }).then(function(response) {
    response.result.valueRanges.forEach(function(data, i){
      var sheetName = SHEET_NAMES[i];
      var values = data.values;
      columnNameForSheets[sheetName] = values[0];
    });

    console.log(columnNameForSheets)
  }, function(response) {
    console.error(response.result.error.message)
  });
}

// Usage: addEvent('od1', {Year: 2013, Month: 12, ...(keys in the column)...})
//
function addEvent(sheetName, dataObj) {
  if(!columnNameForSheets[sheetName]) {
    throw Error('This sheet is not loaded');
  }

  var row = columnNameForSheets[sheetName].map(function(columnName){
    return dataObj[columnName];
  });

  return gapi.client.sheets.spreadsheets.values.append({
    spreadsheetId: SPREADSHEET_ID,
    range: 'A1:ZZ1',
    valueInputOption: 'USER_ENTERED',
    // insertDataOption: 'INSERT_ROWS',
    resource: {
      range: 'A1:ZZ1',
      majorDimension: 'ROWS',
      values: [row],
    },
  })
}

// Utils
//

function getFromSearchString(key) {
  var matches = (RegExp(`${key}=([^&]+)`)).exec(location.search);
  return matches && matches[1];
}
