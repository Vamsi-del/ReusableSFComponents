import { LightningElement, track } from 'lwc';
import getAccounts from '@salesforce/apex/CreateContentVersionDocument.getAccounts';

export default class DataSelectParent extends LightningElement {

    @track data = [];
    colums = [{ 'label': 'Name', 'fieldName': 'Name' }];
    loadMoreData() {
        if (this.hasMoreAccounts) {
            this.getAccounts(this.data.length, 5);
        }
    }

    hasMoreAccounts = false;
    getAccounts(offSet, limit) {
        this.hasMoreAccounts = false;
        let selectData = [...this.data];
        getAccounts({ pageOffSet: offSet, noOfRecord: limit }).then(result => {
            selectData = [...selectData, ...result];
            this.data = selectData;
            this.hasMoreAccounts = true;
        }).catch(error => {
            console.log(error);
        })
    }

    connectedCallback() {
        this.getAccounts(0, 5);
    }

    handleRowSelection(event){
        console.log(event.detail.selectedData);
    }
}