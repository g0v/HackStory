const headers = ["Date", "Time", "Location", "Description"]
const sampleData = ["2016/12/15", "00:00", "Taiwan", "Cool description"]
const form = document.getElementById('spreadsheet')
const entryForm = document.getElementById('entry-form')
const container = document.getElementById('timeline-container')
let spreadsheetData = {}

entryForm.querySelector('#close-entry-form').addEventListener('click', e => entryForm.hidden = true)

form.addEventListener('submit', function loadSheets (e) {
  e.preventDefault()
  const spreadsheetId = form.querySelector('#spreadsheet-id').value.trim()
  const sheets = form.querySelector('#sheet-names').value.split(',').map(name => name.trim())

  spreadsheet.readSheets(spreadsheetId, sheets).then(renderData)
  updateEntryForm(spreadsheetId, sheets)

  form.hidden = true
})

entryForm.addEventListener('submit', (e) =>{
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

  // Timeline render code goes here
  container.innerHTML = ''

  Object.keys(spreadsheetData).forEach(timelineName => {
    const h1 = document.createElement('span')
    h1.className ='cf f4'
    h1.innerText = timelineName

    const newEntry = document.createElement('button')
    newEntry.type = 'button'
    newEntry.innerText = '新增事件'
    newEntry.className = 'fr f5 ba bg-transparent pa2 fw6'
    newEntry.setAttribute('data-timeline', timelineName)
    newEntry.addEventListener('click', openEntryForm)

    h1.appendChild(newEntry)
    container.appendChild(h1)

    spreadsheetData[timelineName].forEach((fields, i) => {
      if (i === 0) return
      const p = document.createElement('p')
      p.innerHTML = fields.map((v, i) => headers[i] + ': ' + v).join('<br>')
      container.appendChild(p)
    })
  })
}
