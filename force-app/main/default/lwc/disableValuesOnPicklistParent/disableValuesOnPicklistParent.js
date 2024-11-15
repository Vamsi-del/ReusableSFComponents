import { LightningElement, track } from 'lwc';
import getAccounts from '@salesforce/apex/CreateContentVersionDocument.getAccounts';

export default class DisableValuesOnPicklistParent extends LightningElement {
    @track data = [];

    connectedCallback() {
        this.getAccounts();
    }

    getAccounts(){
        getAccounts({pageOffSet:this.data.length,noOfRecord:5}).then(result => {
            let onloadAccounts = [...this.data];
            for(const account of result){
                onloadAccounts.push(account.Name);
            }
            this.data = onloadAccounts;       
        }).catch(error => {
            console.log(error);
        })
    }

    handleLoadMore(){
        this.getAccounts();
    }

}