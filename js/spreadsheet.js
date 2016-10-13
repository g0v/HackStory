/*
spreadsheet.js -- provides low-level sheet access with Google.

readSheets(spreadsheetId, sheetNames) => promise<{sheetName1: 2d array of the sheet data, sheetName2:...}>
appendRow(spreadsheetId, sheetName, row) => promise<{sheetName: new 2d array of the sheet data}>

authentication occurs when needed (addRow).
*/

(function(){

var apiLoaded = false;
var onApiLoad = function() {
  apiLoaded = true;
};

// Invoked by google api initial load
//
window._clientOnload = function() {
  gapi.client.load('https://sheets.googleapis.com/$discovery/rest?version=v4').then(onApiLoad);
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
        apiLoaded = true;
        resolve(gapi.client);
      }
    })

  } else { // already loaded
    return Promise.resolve(gapi.client);
  }
}

function readSheets(spreadSheetId, sheetNames) {
  return getClient().then(function () {
    return gapi.client.sheets.spreadsheets.values.batchGet({
      spreadsheetId: spreadSheetId,
      ranges: sheetNames.map(function(sheetName){
        return `${sheetName}!A1:1`
      }),
    })
  }, handleError).then(function(response) {
    console.log(response);
  }, handleError);
}

function appendRow(spreadSheetId, sheetName, row) {

}

function handleError(reason) {
  console.error(reason);
}

window.spreadsheet = {
  readSheets: readSheets,
  appendRow: appendRow,
};

}());
