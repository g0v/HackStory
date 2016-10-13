/*
spreadsheet.js -- provides low-level sheet access with Google.

readSheets(spreadsheetId, sheetNames) => promise<{sheetName1: 2d array of the sheet data, sheetName2:...}>
appendRow(spreadsheetId, sheetName, row) => promise<{sheetName: new 2d array of the sheet data}>

authentication occurs when needed (addRow).
*/

(function(){

var clientLoaded = false;
var apiLoaded = false;

// Initial _clientOnload implementation
//
window._clientOnload = function() {
  clientLoaded = true;
};

// Resolves to gapi.client with api loaded.
//
function getClient() {
  var loadingPromise;
  if(!clientLoaded) {
    loadingPromise = new Promise(function(resolve, reject){
      // _clientOnload not invoked yet, override it with resolve() inside.
      //
      window._clientOnload = function() {
        clientLoaded = true;
        resolve(gapi.client.load('https://sheets.googleapis.com/$discovery/rest?version=v4'));
      };
    });
  } else if(!apiLoaded) {
    loadingPromise = gapi.client.load('https://sheets.googleapis.com/$discovery/rest?version=v4');
  } else {
    loadingPromise = Promise.resolve(gapi.client);
  }

  return loadingPromise.then(() => {
    apiLoaded = true;
    return gapi.client;
  });
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
