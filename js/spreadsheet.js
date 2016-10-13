/*
spreadsheet.js -- provides low-level sheet access with Google.

readSheets(spreadsheetId, sheetNames) => promise<{sheetName1: 2d array of the sheet data, sheetName2:...}>
// spreadsheet.readSheets('1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms', ['Class Data']).then(data => console.log('response', data))

appendRow(spreadsheetId, sheetName, row) => promise<{sheetName: new 2d array of the sheet data}>

authentication occurs when needed (addRow).
*/

(function(){

// Your Client ID can be retrieved from your project in the Google
// Developer Console, https://console.developers.google.com
const CLIENT_ID = '540045535516-bd21gnjkb2g2rsof4bah1p3i904njtk0.apps.googleusercontent.com';
const SCOPES = ["https://www.googleapis.com/auth/spreadsheets"];

// For accessing public spreadsheet without login
//
const API_KEY = 'AIzaSyBYr-2QBLt22nCm51NLWUAc0mHNB79HufA';

var apiLoaded = false;
var onApiLoad = function() {}; // no-op by default

// Invoked by google api initial load
//
window._clientOnload = function() {
  gapi.client.setApiKey(API_KEY); // for public spreadsheet access without logging in
  gapi.client.load('https://sheets.googleapis.com/$discovery/rest?version=v4').then(() => {
    apiLoaded = true;
    onApiLoad();
  });
};

// Resolves to gapi.client with api loaded.
//
function getClient() {
  var loadingPromise;
  if(!apiLoaded) {
    // Override the existing onApiLoad so that it resolves the Promise on load
    //
    return new Promise(function(resolve) {
      onApiLoad = function() {
        resolve(gapi.client);
      }
    })

  } else { // already loaded
    return Promise.resolve(gapi.client);
  }
}

function authorize(immediate = false) {
  return new Promise((resolve, reject) => {
    gapi.auth.authorize({
      'client_id': CLIENT_ID,
      'scope': SCOPES.join(' '),
      'immediate': immediate,
    }, function(authResult){
      if(authResult && !authResult.error) {
        // The user has logged in before.
        //
        resolve(authResult)
      } else {
        reject(authResult && authResult.error)
      }
    });
  })
}

function readSheets(spreadSheetId, sheetNames) {
  return getClient()
  .then(function () {
    return gapi.client.sheets.spreadsheets.values.batchGet({
      spreadsheetId: spreadSheetId,
      ranges: sheetNames.map(function(sheetName){
        return `${sheetName}`
      }),
    })
  }, handleError)
  .then(function(response) {
    return getIn(response)(['result', 'valueRanges'], []).reduce((result, valueRange, i) => {
      result[sheetNames[i]] = valueRange.values || [];
      return result;
    }, {});
  }, function(reason) {
    if(getIn(reason)(['result', 'error', 'code']) === 400) {
      throw new Error('spreadSheetId or sheetNames does not exist.');
    }
    handleError(reason);
  });
}

function appendRow(spreadSheetId, sheetName, row) {
  // needs auth
}

function handleError(reason) {
  console.error(reason);
  throw reason;
}

function getIn(rootObj) {
  return function(keyPath, defaultValue) {
    const result = (keyPath || []).reduce(
      (obj, key) => obj instanceof Object ? obj[key] : undefined,
      rootObj
    );

    return result === undefined ? defaultValue : result;
  }
}
window.getIn = getIn;

window.spreadsheet = {
  readSheets: readSheets,
  appendRow: appendRow,
};

}());
