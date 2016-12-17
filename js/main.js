const headers = ["Date", "Time", "Location", "Description"]
const sampleData = ["2016/12/15", "00:00", "Taiwan", "Cool description"]
const form = document.getElementById('spreadsheet')
const entryForm = document.getElementById('entry-form')
const container = document.getElementById('timeline-container')
const loadBtn = document.getElementById('load-spreadsheet')

const spreadsheetIdField = document.getElementById('spreadsheet-id')
const sheetsField = document.getElementById('sheet-names')

let spreadsheetData = {}

parseQuery()
entryForm.querySelector('#close-entry-form').addEventListener('click', e => entryForm.hidden = true)

form.addEventListener('submit', (e) => {
  spreadsheetIdField.value = spreadsheetIdField.value.replace(/\s/g, '')
  sheetsField.value = sheetsField.value.replace(/\s/g, '')
})

function parseQuery () {
  const params = {}
  location.search.substr(1).split('&').forEach(t => params[t.split('=')[0]] = decodeURIComponent(t.split('=')[1]))

  if(params.spreadsheetId && params.sheets) {
    spreadsheetIdField.value = params.spreadsheetId
    sheetsField.value = params.sheets.split(',').map(name => name.trim())

    loadSpreadsheetData(params.spreadsheetId, sheetsField.value.split(','))
  }
}

function loadSpreadsheetData (spreadsheetId, sheets) {
  spreadsheet.readSheets(spreadsheetId, sheets).then(renderData)
  updateEntryForm(spreadsheetId, sheets)
  loadBtn.hidden = false
  loadBtn.innerText = 'Loaded: ' + spreadsheetId

  form.hidden = true
  container.hidden = false
  container.classList.add('pv5')
  container.innerText = '讀取中'
}

entryForm.addEventListener('submit', (e) => {
  e.preventDefault()
  e.target.disabled = true

  const sheetName = entryForm.querySelector('#Timeline-select').value
  const rowData = headers.map(header => entryForm.querySelector('#' + header).value)
  const result = spreadsheet.appendRow(entryForm.getAttribute('data-id'), sheetName, rowData)
  result.then(r => {
    alert('Success!')
    e.target.disabled = false
    spreadsheetData[sheetName].push(rowData)
    entryForm.hidden = true

    renderData()
  }).catch(obj => {
    e.target.disabled = false
    alert(obj.result.error.message)
  })
})

loadBtn.addEventListener('click', (e) => {
  entryForm.hidden = true
  container.hidden = form.hidden
  form.hidden = !form.hidden
})

function updateEntryForm (spreadsheetId, sheets) {
  entryForm.setAttribute('data-id', spreadsheetId)
  sheets.forEach(name => {
    const option = document.createElement('option')
    option.value = option.innerText = name
    entryForm.querySelector('select').appendChild(option)
  })
}

document.addEventListener('click', e => {
  if (e.target.getAttribute('data-timeline')) {
    openEntryForm(e)
  }
})

function openEntryForm (e) {
  entryForm.hidden = false
  entryForm.querySelector('#Timeline-select').value = e.target.getAttribute('data-timeline')
}

function renderData (data) {
  if (data) spreadsheetData = data

  container.classList.remove('pv5')
  container.innerHTML = ''
  renderTimeline(spreadsheetData, container)
}

const sheetHeaders = {
    startDate: 0,
    startTime: 1,
    endDate: 99,
    endTime: 99,
    title: 2,
    content: 3
}

// input - result from spreadsheet.readSheets
// format: {
//     <sheet name>: [
//       [ <cellA1>, <colB1>, <colC1> ],
//       [ <cellA2>, <colB2>, <colC2> ],
// }
function renderTimeline( spreadsheet, container ) {

    var curEventId = 0, // just to make it unique in this page
        curGroupId = 0, // just to make it unique in this page
        timelineItems = [],
        groups = [];

    for( var sheetName in spreadsheet ) {

        const sheetNameLabel = document.createElement('span')
        sheetNameLabel.innerText = sheetName
        sheetNameLabel.className = 'mr3'

        const newEntry = document.createElement('button')
        newEntry.type = 'button'
        newEntry.innerText = '新增'
        newEntry.className = 'mt1 ba db f6 bg-transparent pa1 fw6 v-baseline pointer'
        newEntry.setAttribute('data-timeline', sheetName)

        curGroupId++;
        groups.push({
            id: curGroupId,
            content: sheetNameLabel.outerHTML + newEntry.outerHTML,
        });

        var sheet = spreadsheet[ sheetName ];
        sheet.shift();

        sheet.forEach( row => {
            curEventId++;

            var timelineItem = {
                id: curEventId,
                title: row[ sheetHeaders.title ],
                content: row[ sheetHeaders.content ],
                group: curGroupId,
            };

            if( row[ sheetHeaders.startDate ] ) {

                timelineItem.start = row[ sheetHeaders.startDate ] + ' ' + row[ sheetHeaders.startTime ];

                if( row[ sheetHeaders.endDate ] ) {
                    timelineItem.end = row[ sheetHeaders.endDate ] + ' ' + row[ sheetHeaders.endTime ];
                }

            } else if( row[ sheetHeaders.endDate ] ) {
                timelineItem.start = row[ sheetHeaders.endDate ] + ' ' + row[ sheetHeaders.endTime ];
            }

            if( timelineItem.start ) {
                timelineItems.push( timelineItem );
            }
        });
    }

    var opts = {
        template: function( item ) {
            if( item.title ) {
                return '<h4>' + item.title + '</h4>' + item.content;
            }
            return item.content;
        }
    }

    var tl = new vis.Timeline( container, timelineItems, groups, opts );
}

