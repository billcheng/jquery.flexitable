# jquery.flexitable
<a href="https://jsfiddle.net/cccheng118/ypkkxgj0/">Demo</a>

# Bower
```code
bower install jquery.flexitable
```

# Include
```html
<link rel="stylesheet" href="dist/jquery.flexitable.min.css" />
...
<script type="javascript" src="dist/jquery.flexitable.min.js"></script>
```

# Script
```javascript
$("#table").FlexiTable({
    fields: [], // specify all the available fields for the table
    cols: [], // specify the fields in the col
    rows: [], // specify the fields in the row
    enableDragAndDrop: true, // turn on the drag and drop of fields
                             // in row/col, true by default
    onRequestData: function(singleRowData) {
        // optional
        // use this to flatten the data if there are internal structures
        return $.extend({}, { shiftName: singleRowData.shift.name }, singleRowData);
    },
    onSort: function(key, values) {
        // optional
        // you may specifiy how you want to sort the data based on the key
        // e.g.
        
        if (key=="field4")
            // sort field4 in ascending order
            return values.sort(function(a,b) {
                return a.value - b.value;
            });
            
        // otherwise, return the natural order of the values array
        return values;
    },
    onRenderCell: function($cell, multipleRowsData, remainingFields, $this) {
        // required
        // use this to render the content of the cell
        // $cell = jquery object of the cell
        // multipleRowsData = the group data (array) that are relevant to the cell
        // remainingFields = indicating how many fields are not in row and col
        // $this = jquery object of this flexitable
        // e.g.
        $cell.html(JSON.stringify(multipleRowsData));
    },
    onRenderHeader: function(key, value) {
        // optional
        // use this to render the content of the header
        // for instance, you may want to show the month name instead of month number
        if (key==="field1")
            return monthName[value-1]; // value holds the month number
        
        return value;
    },
    onRenderField: function(fieldName) {
        // optional
        // use this to change the field name to a display label
        if (fieldName==="field1")
            return "Month";
            
        return fieldName;
    }
}, data);
```
