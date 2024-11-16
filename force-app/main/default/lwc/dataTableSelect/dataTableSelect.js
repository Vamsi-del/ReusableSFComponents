import { api, LightningElement, track } from 'lwc';

export default class DataTableSelect extends LightningElement {
    @track attributeError;
    _colums;

    @api
    set tableColumns(columns) {
        let myPromise = new Promise((resolve) => {
            const result = this.validateColumns(columns);
            resolve(result);
        });
        myPromise.then((isSuccess) => {
            if (isSuccess) {
                this._colums = columns;
                if ((typeof this.showButton === 'boolean' && this.showButton) || (typeof this.showButton === 'string' && this.showButton === 'true')) {
                    columns = JSON.parse(JSON.stringify(columns));
                    columns.push({
                        type: "button", initialWidth: 110, typeAttributes: {
                            label: this.tableButtonLabel,
                            name: this.tableButtonLabel,
                            title: this.tableButtonLabel,
                            variant: "brand-outline"
                        }
                    });
                }
                this.tableColumns1 = [...columns];
            }
        });
    }

    get tableColumns() {
        return this._colums;
    }

    _buttonLabelChange = 'UnSelect';
    @api
    set tableButtonLabel(labelChange) {
        this._buttonLabelChange = labelChange;
    }

    get tableButtonLabel() {
        return this._buttonLabelChange;
    }

    callRowAction(event) {
        const rowId = event.detail.row[this.keyField];
        let index = 0;
        for (const data of this.selectedData) {
            if (rowId === data[this.keyField]) {
                this.selectedData.splice(index, 1);
                this.selectedData = [...this.selectedData];
                this.selectedRows.splice(index, 1);
                this.selectedRows = [...this.selectedRows];
                break;
            }
            ++index;
        }
        if (this.selectedRows.length === 0) {
            this.selectedData = undefined;
        }
        let customEvent = new CustomEvent('rowselection',{detail:{selectedData:this.selectedData}});
        this.dispatchEvent(customEvent);
    }

    @track tableColumns1;

    _showTableButton
    @api
    set showButton(showBut) {
        if (typeof showBut === 'boolean' || (typeof showBut === 'string' && showBut.toLowerCase() === 'true' || showBut.toLowerCase() === 'false')) {
            this._showTableButton = showBut;
        } else {
            this.attributeError = {
                errorMessage: 'Expected values on showButton true/false',
                original: 'But Found ' + showBut
            }
        }
    }

    get showButton() {
        return this._showTableButton;
    }

    _keyField;
    @api
    set keyField(keyField) {
        if (typeof keyField === 'string') {
            this._keyField = keyField;
            if (this.notValidatedData) {
                this.validateData(this.notValidatedData);
            }
        } else {
            this.attributeError = {
                errorMessage: 'Expected String Found ' + (typeof keyField),
                original: keyField
            }
        }
    }

    get keyField() {
        return this._keyField;
    }

    @track _data;
    @api
    set tableData(data) {
        if (Array.isArray(data)) {
            this.notValidatedData = data;
            if (this._keyField) {
                let promise = new Promise((resolve) => {
                    const result = this.validateData(data);
                    resolve(result);
                });
                promise.then((isSuccess) => {
                    if (isSuccess) {
                        this._data = data;
                    }
                })
            }
        } else {
            this.attributeError = {
                errorMessage: 'Expected Array Found ' + (typeof data),
                original: typeof data + ' - ' + JSON.stringify(data)
            }
        }
    }

    get tableData() {
        return this._data;
    }

    validateColumns(columns) {
        let i = 0;
        if (!columns || !Array.isArray(columns)) {
            this.attributeError = {
                errorMessage: 'Expected Array Found ' + (typeof columns),
                original: JSON.stringify(columns)
            }
            return false;
        } else if (columns?.length === 0) {
            this.attributeError = {
                errorMessage: 'Columns attribute Can\'t be Empty',
                original: JSON.stringify(columns) + ' columns attribute is empty'
            }
            return false;
        } else {
            for (const column of columns) {
                if (typeof column === 'object' && (!column?.label || !column?.fieldName)) {
                    this.attributeError = {
                        errorMessage: '',
                        original: 'Column at index ' + i + ' - ' + JSON.stringify(column)
                    }
                    if (Object.hasOwn(column, 'label') === false && Object.hasOwn(column, 'fieldName') === false) {
                        this.attributeError.errorMessage = 'Couldn\'t able to find label and fieldName on Columns at index ' + i;
                    } else if (Object.hasOwn(column, 'label') === false || Object.hasOwn(column, 'fieldName') === false) {
                        this.attributeError.errorMessage = 'Couldn\'t able to find label or fieldName on Columns at index ' + i;
                    } else {
                        this.attributeError.errorMessage = 'Couldn\'t able to find values for label or fieldName on Columns at index ' + i;
                    }
                    return false;
                } else if (typeof column !== 'object') {
                    this.attributeError = {
                        errorMessage: 'Expected an Object at Columns found ' + (typeof column) + ' at index ' + i,
                        original: 'Column at index ' + i + ' - ' + JSON.stringify(column)
                    }
                    return false;
                }
                ++i;
            }
        }
        return true;
    }

    notValidatedData;
    validateData(data) {
        let i = 0;
        let key_Field = new Map();
        for (const indData of data) {
            if (typeof indData !== 'object') {
                this.attributeError = {
                    errorMessage: 'Expected Object Found ' + (typeof indData),
                    original: typeof data + ' - ' + JSON.stringify(data)
                }
            } else if (!Object.hasOwn(indData, this._keyField)) {
                this.attributeError = {
                    errorMessage: 'Required key-field ' + this._keyField + ' on all the data Array objects',
                    original: 'Object at index ' + i + ' missing key-field ' + this._keyField + ' - ' + JSON.stringify(indData)
                }
                return false;
            } else {
                if (key_Field.has(indData[this._keyField])) {
                    this.attributeError = {
                        errorMessage: 'Data Objects should have Unique key-field(' + this._keyField + ')',
                        original: JSON.stringify(data[key_Field.get(indData[this._keyField])]) + ' and ' + JSON.stringify(indData) + ' has same key-field(' + this._keyField + ') value ' + indData[this._keyField]
                    }
                }
            }
            key_Field.set(indData[this._keyField], i);
            ++i;
        }
        this._data = data;
        return true;
    }

    get isValid() {
        return !this.attributeError;
    }

    @api adjustHeight;

    renderedCallback() {
        if (this.isValid) {
            this.refs.tableHeight.style.height = this.adjustHeight;
        }
        if (this.refs.tableTwoHeight) {
            this.refs.tableTwoHeight.style.height = this.adjustHeight;
        }
    }

    _enabledInfiniteLoading;
    @api
    set enableInfiniteLoading(enableLazyLoading) {
        this._enabledInfiniteLoading = enableLazyLoading;
    }

    get enableInfiniteLoading() {
        return this._enabledInfiniteLoading;
    }

    _isLoading;
    @api
    set isLoading(loading) {
        this._isLoading = loading
    }

    get isLoading() {
        return this._isLoading;
    }

    loadMoreData(event) {
        let customEvent = new CustomEvent('loadmore');
        this.dispatchEvent(customEvent);
    }

    selectedData;
    handleRowAction(event) {
        this.selectedData = event.detail.selectedRows;
        this.selectedRows = [];
        for (const data of this.selectedData) {
            this.selectedRows.push(data[this.keyField]);
        }
        let customEvent = new CustomEvent('rowselection',{detail:{selectedData:this.selectedData}});
        this.dispatchEvent(customEvent);
    }

    @track selectedRows = [];

    @api tableOneHeading = 'Select Accounts';
    @api tableTwoHeading = 'Selected Accounts';

    @api iconName;
}