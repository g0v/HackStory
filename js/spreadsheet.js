/*
 * spreadsheet.js -- provides low-level sheet access with Google.
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
  es6Promisify(gapi.client.load('https://sheets.googleapis.com/$discovery/rest?version=v4')).then(() => {
    apiLoaded = true;
    onApiLoad();
  });
};

// Given spreadsheet id and array of sheet names,
// returns a promise that resolves to an object like:
// {sheetName1: <2d array of the sheet data>, sheetName2: <...>, ...}>
//
// Usage: spreadsheet.readSheets('1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms', ['Class Data']).then(data => console.log('response', data))
//
function readSheets(spreadSheetId, sheetNames) {
  return getClient()
  .then(() => es6Promisify(gapi.client.sheets.spreadsheets.values.batchGet({
    spreadsheetId: spreadSheetId,
    ranges: sheetNames.map(function(sheetName){
      return `${sheetName}`
    }),
  })))
  .then(response => {
    return getIn(response)(['result', 'valueRanges'], []).reduce((result, valueRange, i) => {
      result[sheetNames[i]] = valueRange.values || [];
      return result;
    }, {});
  })
  .catch(reason => {
    if(getIn(reason)(['result', 'error', 'code']) === 400) {
      throw new Error('spreadSheetId or sheetNames does not exist.');
    }
  });
}

// Given a spreadsheet ID, sheet name and row (1-d array) to insert,
// Returns a promise that resolves to UpdateValuesResponse.
// (See: https://developers.google.com/sheets/reference/rest/v4/UpdateValuesResponse )
//
// Usage: spreadsheet.appendRow('1QYSuMMLSfAe8bYz0urXwDVppJ87S5CLafQbvyptZsQw', 'Sheet1', ['apple', 'banana', 'pineapple', 'ppap']).then(d => console.log(d))
//
function appendRow(spreadSheetId, sheetName, row) {
  return getClient()
  .then(() => authorize(false))
  .then(() => es6Promisify(gapi.client.sheets.spreadsheets.values.append({
    spreadsheetId: spreadSheetId,
    range: sheetName,//`"${}"!A1:ZZ1`,
    valueInputOption: 'USER_ENTERED',
    insertDataOption: 'INSERT_ROWS',
    resource: {
      range: sheetName,//'A1:ZZ1',
      majorDimension: 'ROWS',
      values: [row],
    },
  })))
  .then(response => getIn(response)(['result', 'updates']));
}

//
// Utility functions
//

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
        resolve(authResult);
      } else {
        reject(authResult.error);
      }
    });
  })
}

// Fetch data in nested object. Return defaultValue if data cannot be retrieved.
//
function getIn(rootObj) {
  return function(keyPath, defaultValue) {
    const result = (keyPath || []).reduce(
      (obj, key) => obj instanceof Object ? obj[key] : undefined,
      rootObj
    );

    return result === undefined ? defaultValue : result;
  }
}

// The "promise" returned by GOogle API Client Library does not have ".catch"
// so we wrap with the browser's promise implementation (es6 promise) to get .catch() working.
//
function es6Promisify(thenable) {
  return new Promise((resolve, reject) => {
    thenable.then(resolve, reject);
  });
}

window.spreadsheet = {
  readSheets: readSheets,
  appendRow: appendRow,
};

}());
