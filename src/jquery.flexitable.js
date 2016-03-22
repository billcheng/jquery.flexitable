/// <reference path="../ts-references/jquery.d.ts"/>
/// <reference path="jquery.flexitable.tree.ts"/>
/// <reference path="jquery.flexitable.storage.ts"/>
// Copyright (c) Bill Cheng
(function ($) {
    var methods = {
        "init": function (options, data) {
            var newOptions = $.extend({}, defaultOptions, options);
            var storage = $.fn.FlexiTable.setData.apply(this, [newOptions, data]);
            $(this).data("options", newOptions);
            $.fn.FlexiTable.redraw.apply(this, [newOptions, storage]);
        },
        "setData": function (data) {
            $.fn.FlexiTable.setData.apply(this, [$(this).data("options"), data]);
        },
        "getClassName": function (key, value, storage) {
            if (!storage)
                storage = $(this).data("storage");
            return storage.getClass(key, value, false);
        },
        "getStorage": function () {
            return $(this).data("storage");
        },
        "redraw": function (options) {
            $.fn.FlexiTable.redraw.apply(this, [options]);
        }
    };
    var defaultOptions = {
        fields: [],
        cols: [],
        rows: [],
        enableDragAndDrop: true,
        onRequestData: null,
        onSort: null,
        onChange: null,
        onRenderCell: null,
        onRenderHeader: null,
        onRenderField: null,
        onAfterRender: null // function onAfterRender($(this, storage))
    };
    $.fn.FlexiTable = function (method) {
        if (methods[method])
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        if (typeof method == "object" || !method)
            return methods.init.apply(this, arguments);
    };
    $.fn.FlexiTable.setData = function (options, data) {
        var $this = $(this);
        var theData = data ? Array.prototype.slice.call(data, 0) : [];
        var storage = new FlexiTableStorage(theData);
        if (options.fields.length == 0) {
            theData.forEach(function (rowData) {
                var realData = options.onRequestData ? options.onRequestData(rowData) : rowData;
                for (var key in realData) {
                    storage.addKey(key);
                }
            });
        }
        else {
            options.fields.forEach(function (key) {
                storage.addKey(key);
            });
        }
        $this.data("storage", storage);
        return storage;
    };
    $.fn.FlexiTable.prepareData = function (options, storage) {
        if (!storage)
            storage = $(this).data("storage");
        var rowTree = $.fn.FlexiTable.prepareTree(options, options.rows, storage);
        var colTree = $.fn.FlexiTable.prepareTree(options, options.cols, storage);
        if (options.onSort) {
            $.fn.FlexiTable.sortTree(rowTree, options.rows, options.onSort);
            $.fn.FlexiTable.sortTree(colTree, options.cols, options.onSort);
        }
        return {
            rowTree: rowTree,
            colTree: colTree
        };
    };
    $.fn.FlexiTable.prepareTree = function (options, keys, storage) {
        var tree = new TreeNode(null, null);
        storage.data.forEach(function (rowData) {
            var nextNode = tree;
            var realData = options.onRequestData ? options.onRequestData(rowData) : rowData;
            keys.forEach(function (key) {
                nextNode = nextNode.addChild(realData[key]);
            });
        });
        tree.updateCount();
        return tree;
    };
    $.fn.FlexiTable.sortTree = function (node, keys, onSort) {
        if (node.children.length > 0)
            node.children = onSort(keys[node.level], node.children);
        node.children.forEach(function (child) {
            $.fn.FlexiTable.sortTree(child, keys, onSort);
        });
    };
    $.fn.FlexiTable.getClassesFromNode = function (node, options, storage) {
        var colClasses = [];
        var current = node;
        while (current && current.level > 0) {
            colClasses.unshift(storage.getClass(options.cols[current.level - 1], current.value, true));
            current = current.parent;
        }
        return colClasses;
    };
    $.fn.FlexiTable.renderFlexiTable = function (options, storage) {
        var trees = $.fn.FlexiTable.prepareData(options, storage);
        var numberOfCols = options.cols.length >= 1 ? options.cols.length : 0;
        var numberOfRows = options.rows.length >= 1 ? options.rows.length : 0;
        var flexiTableHtml = '<table class="flexitable">';
        if (numberOfCols > 0 && numberOfRows > 0)
            flexiTableHtml += '<tr><td class="island" rowspan= "' + numberOfCols + '" colspan= "' + numberOfRows + '" > </td>';
        var colLevels = trees.colTree.getLevels();
        var colClassIndexLookUp = [];
        var lastLevelNumber = colLevels.length - 1;
        for (var levelNumber in colLevels) {
            var _levelNumber = +levelNumber;
            var levelNodes = colLevels[_levelNumber];
            levelNodes.forEach(function (node, index) {
                var level = node.level - 1;
                var key = options.cols[level];
                var colClasses = $.fn.FlexiTable.getClassesFromNode(node, options, storage);
                var classNames = colClasses.join(" ");
                if (_levelNumber == lastLevelNumber)
                    colClassIndexLookUp[index] = classNames;
                flexiTableHtml += '<td colspan="' + node.count + '" class="colHeader ' + classNames + '">' + (options.onRenderHeader ? options.onRenderHeader(key, node.value) : node.value) + '</td>';
            });
            flexiTableHtml += '</tr><tr>';
        }
        var rowLevels = trees.rowTree.getDeepFirst();
        var rowClasses = [];
        if (numberOfRows > 0) {
            for (var levelNumber in rowLevels) {
                var levelNodes = rowLevels[levelNumber];
                if (levelNodes.length == 0)
                    continue;
                var firstNodeLevel = levelNodes[0].level;
                rowClasses.splice(firstNodeLevel - 1);
                levelNodes.forEach(function (node) {
                    var key = options.rows[node.level - 1];
                    var className = storage.getClass(key, node.value);
                    rowClasses.push(className);
                    flexiTableHtml += '<td rowspan="' + node.count + '" class="rowHeader ' + rowClasses.join(" ") + '">' + (options.onRenderHeader ? options.onRenderHeader(key, node.value) : node.value) + '</td>';
                });
                if (lastLevelNumber >= 0) {
                    colLevels[lastLevelNumber].forEach(function (colNode, colIdx) {
                        flexiTableHtml += '<td class="cell ' + rowClasses.join(" ") + ' ' + colClassIndexLookUp[colIdx] + '"></td>';
                    });
                }
                else
                    flexiTableHtml += '<td class="cell ' + rowClasses.join(" ") + '"></td>';
                flexiTableHtml += '</tr><tr>';
            }
        }
        else {
            if (lastLevelNumber >= 0) {
                colLevels[lastLevelNumber].forEach(function (colNode, colIdx) {
                    flexiTableHtml += '<td class="cell ' + colClassIndexLookUp[colIdx] + '"></td>';
                });
            }
            flexiTableHtml += '</tr><tr>';
        }
        flexiTableHtml = flexiTableHtml.substring(0, flexiTableHtml.length - 5);
        flexiTableHtml += '</table>';
        return flexiTableHtml;
    };
    $.fn.FlexiTable.renderFrame = function (options, storage) {
        var flexiTableHtml = $.fn.FlexiTable.renderFlexiTable(options, storage);
        if (options.enableDragAndDrop == true) {
            var availableKeys = storage.keys.slice(0);
            var colHtml = '';
            var rowHtml = '';
            options.cols.forEach(function (col) {
                colHtml += '<li class="field" data-field="' + col + '">' + (options.onRenderField ? options.onRenderField(col) : col) + '</li>';
                var idx = availableKeys.indexOf(col);
                if (idx >= 0)
                    delete availableKeys[idx];
            });
            options.rows.forEach(function (row) {
                rowHtml += '<li class="field" data-field="' + row + '">' + (options.onRenderField ? options.onRenderField(row) : row) + '</li>';
                var idx = availableKeys.indexOf(row);
                if (idx >= 0)
                    delete availableKeys[idx];
            });
            var html = '<table class="dragFlexitable"><tr><td rowspan="2" class="island"></td><td class="fields"><ul class="sortableField">';
            availableKeys.forEach(function (key) {
                html += '<li class="field" data-field="' + key + '">' + (options.onRenderField ? options.onRenderField(key) : key) + '</li>';
            });
            html += '</ul></td></tr><tr><td class="columns"><ul class="sortableField">' + colHtml + '</ul></td></tr><tr><td class="rows"><ul class="sortableField">' + rowHtml + '</ul></td><td>' + flexiTableHtml + '</td></tr></table>';
        }
        else
            html = flexiTableHtml;
        return html;
    };
    var handle;
    $.fn.FlexiTable.detectChange = function (event, ui) {
        if (handle)
            clearTimeout(handle);
        var $thisFlexiTable = $(this);
        handle = setTimeout(function () {
            var options = $thisFlexiTable.data("options");
            var storage = $thisFlexiTable.data("storage");
            options.cols = [];
            $thisFlexiTable.find(".columns > ul > li.field").each(function (idx, col) {
                options.cols.push($(col).data("field"));
            });
            options.rows = [];
            $thisFlexiTable.find(".rows > ul > li.field").each(function (idx, row) {
                options.rows.push($(row).data("field"));
            });
            var html = $.fn.FlexiTable.renderFlexiTable(options, storage);
            $thisFlexiTable.find("table.flexitable").replaceWith(html);
            $thisFlexiTable.data("options", options);
            if (options.onChange) {
                options.onChange(options.rows, options.cols);
            }
            $.fn.FlexiTable.renderCells($thisFlexiTable, options, storage);
            handle = null;
        }, 100);
    };
    $.fn.FlexiTable.renderCells = function ($thisFlexiTable, options, storage) {
        if (options.onRenderCell) {
            var availableKeys = storage.keys.slice(0);
            options.cols.forEach(function (key) {
                var idx = availableKeys.indexOf(key);
                availableKeys.splice(idx, 1);
            });
            options.rows.forEach(function (key) {
                var idx = availableKeys.indexOf(key);
                availableKeys.splice(idx, 1);
            });
            var dataCollection = [];
            storage.data.forEach(function (d) {
                var realData = options.onRequestData ? options.onRequestData(d) : d;
                var colClasses = [];
                options.cols.forEach(function (col) {
                    var className = storage.getClass(col, realData[col], true);
                    colClasses.push("." + className);
                });
                var rowClasses = [];
                options.rows.forEach(function (row) {
                    var className = storage.getClass(row, realData[row], true);
                    rowClasses.push("." + className);
                });
                var colClassNames = colClasses.join("");
                var rowClassNames = rowClasses.join("");
                if (!dataCollection[rowClassNames])
                    dataCollection[rowClassNames] = [];
                if (!dataCollection[rowClassNames][colClassNames])
                    dataCollection[rowClassNames][colClassNames] = [d];
                else
                    dataCollection[rowClassNames][colClassNames].push(d);
                //var $cell = $(classes.join(""));
                //options.onRenderCell($cell, d);
            });
            for (var rowClassNames in dataCollection) {
                var rowData = dataCollection[rowClassNames];
                for (var colClassNames in rowData) {
                    var $cell = $thisFlexiTable.find(".cell" + rowClassNames + colClassNames);
                    options.onRenderCell($cell, rowData[colClassNames], availableKeys, $thisFlexiTable);
                }
            }
        }
        if (options.onAfterRender)
            options.onAfterRender($thisFlexiTable, storage);
    };
    $.fn.FlexiTable.redraw = function (options, storage) {
        if (!options)
            options = $(this).data("options");
        if (!storage)
            storage = $(this).data("storage");
        var html = $.fn.FlexiTable.renderFrame.apply(this, [options, storage]);
        var $this = $(this);
        $this.html(html);
        if (options.enableDragAndDrop) {
            var thisFlexiTable = this;
            $this.find(".columns .sortableField, .rows .sortableField").sortable({
                connectWith: "ul.sortableField",
                stop: function (event, ui) { $.fn.FlexiTable.detectChange.apply(thisFlexiTable, [event, ui]); },
                receive: function (event, ui) { $.fn.FlexiTable.detectChange.apply(thisFlexiTable, [event, ui]); },
                remove: function (event, ui) { $.fn.FlexiTable.detectChange.apply(thisFlexiTable, [event, ui]); }
            }).disableSelection();
            $this.find(".fields .sortableField").sortable({
                connectWith: "ul.sortableField"
            }).disableSelection();
        }
        $.fn.FlexiTable.renderCells($this, options, storage);
    };
}(jQuery));
