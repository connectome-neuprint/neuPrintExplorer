/*
 * Wrapper for custom results returned by neuPrintHTTP.
 *
 * Result format:
 *  {
 *      "columns": [ "col1", "col2" ... ],
 *      "data": [ [cell1, cell2, ...], [cell1, cell2, ...] ] 
 *  }
*/

""


class neuPrintRecord {
    constructor(name2index, row) {
        this.name2index = name2index;
        this.data = row;
    }

    get = (name) => {
        return this.data[this.name2index[name]];
    }

    toArr = () => {
        return this.data;
    }
}

class neuPrintRecords {
    constructor(names, columndata) {
        this.name2index = {};
        for (let idx in names) {
            this.name2index[names[idx]] = parseInt(idx);
        }
        this.data = columndata;
    }
   
    forEach = (func) => {
        for (let row in this.data) {
            func(new neuPrintRecord(this.name2index, this.data[row]));
        }
    }

    pos = (loc) => {
        return new neuPrintRecord(this.name2index, this.data[loc]);
    }

    toArr = () => {
        return this.data;
    }
}


export default class NeuPrintResult {
    constructor(neuprintRes) {
        this.columns = neuprintRes.columns;
        this.records = new neuPrintRecords(this.columns, neuprintRes.data);
    }
}
