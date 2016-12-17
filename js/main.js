const headers = ["Date", "Time", "Location", "Description"]
const sampleData = ["2016/12/15", "00:00", "Taiwan", "Cool description"]
const form = document.getElementById('spreadsheet')
const entryForm = document.getElementById('entry-form')
const container = document.getElementById('timeline-container')
const loadBtn = document.getElementById('load-spreadsheet')
let spreadsheetData = {}

entryForm.querySelector('#close-entry-form').addEventListener('click', e => entryForm.hidden = true)

form.addEventListener('submit', (e) => {
  e.preventDefault()
  const spreadsheetId = form.querySelector('#spreadsheet-id').value.trim()
  const sheets = form.querySelector('#sheet-names').value.split(',').map(name => name.trim())

  spreadsheet.readSheets(spreadsheetId, sheets).then(renderData)
  updateEntryForm(spreadsheetId, sheets)
  loadBtn.innerText = 'Loaded: ' + spreadsheetId

  form.hidden = true
  container.hidden = false
})

entryForm.addEventListener('submit', (e) => {
  e.preventDefault()

  const sheetName = entryForm.querySelector('#Timeline-select').value
  const rowData = headers.map(header => entryForm.querySelector('#' + header).value)
  const result = spreadsheet.appendRow(entryForm.getAttribute('data-id'), sheetName, rowData)
  result.then(r => {
    alert('Success!')
    spreadsheetData[sheetName].push(rowData)
    entryForm.hidden = true

    renderData()
  }).catch(obj => {
    alert(obj.result.error.message)
  })
})

loadBtn.addEventListener('click', (e) => {
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

function openEntryForm (e) {
  entryForm.hidden = false
  entryForm.querySelector('#Timeline-select').value = e.target.getAttribute('data-timeline')
}

function renderData (data) {
  if (data) spreadsheetData = data

  // Timeline render code goes here, @ddio feel free to nuke this part
  container.innerHTML = ''

  Object.keys(spreadsheetData).forEach(timelineName => {
    const timelineAction = document.createElement('div')
    timelineAction.className = 'mb3 nowrap overflow-auto'

    const h1 = document.createElement('h1')
    h1.className ='cf f4 dib mt0'
    h1.innerText = timelineName

    const newEntry = document.createElement('button')
    newEntry.type = 'button'
    newEntry.innerText = '新增事件'
    newEntry.className = 'ml3 f5 ba bg-transparent pa2 fw6 v-baseline pointer'
    newEntry.setAttribute('data-timeline', timelineName)
    newEntry.addEventListener('click', openEntryForm)

    h1.appendChild(newEntry)
    container.appendChild(h1)

    container.appendChild(timelineAction)
  })

  const timeline = document.createElement('div')
  container.appendChild(timeline)
  renderTimeline(spreadsheetData, timeline)
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

        curGroupId++;
        groups.push({
            id: curGroupId,
            content: sheetName,
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
                console.log( timelineItem );
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

