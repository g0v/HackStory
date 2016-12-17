var container = document.getElementById( 'timeline' );

const headers = {
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
function renderTimeline( spreadsheet ) {

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
                title: row[ headers.title ],
                content: row[ headers.content ],
                group: curGroupId,
            };

            if( row[ headers.startDate ] ) {

                timelineItem.start = row[ headers.startDate ] + ' ' + row[ headers.startTime ];
            
                if( row[ headers.endDate ] ) {
                    timelineItem.end = row[ headers.endDate ] + ' ' + row[ headers.endTime ];
                }

            } else if( row[ headers.endDate ] ) {
                timelineItem.start = row[ headers.endDate ] + ' ' + row[ headers.endTime ];
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


var spreadsheetId = '11hHSbluBcNfMYppvSMTfB9Pg4fHmJMvmduoaHFCXREE';
var sheets = ['同婚立法','平權運動'];

spreadsheet.readSheets( spreadsheetId, sheets ).then( resp => renderTimeline( resp ) );
