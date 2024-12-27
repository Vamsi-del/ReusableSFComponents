import { api, LightningElement, track } from 'lwc';

export default class DisableValuesOnPicklist extends LightningElement {
    @track primaryData = [];
    @track secondaryData = [];

    @api primaryLabel = 'Primary Account';
    @api secondaryLabel = 'Secondary Account';

    _data = [];
    @api
    set originalData(data) {
        let index = this._data.length
        if (data && Array.isArray(data)) {
            for (let i = this._data.length; i < data.length; i++) {
                const name = data[i];
                this._data.push({ 'name': name, 'disabled': false, 'index':index });
                ++index;
            }
            if (this.refs?.primarySearch?.value?.length >= 0 && !this.searchString) {
                this.primaryData = [...this._data];
            } if (this.refs?.secondarySearch?.value?.length >= 0 && !this.searchString) {
                this.secondaryData = [...this._data];
            }
        }
    }

    get originalData() {
        return this._data;
    }
    previousDisabledIndex;

    searchString;
    handleChange(event) {
        const searchValue = event.currentTarget.value;
        this.searchString = searchValue;
        const inputClassName = event.currentTarget.className;
        let filteredData = [];
        for (const data of this.originalData) {
            if (data.name.includes(searchValue)) {
                filteredData.push(data);
                data.disabled = false;
            }
        }
        if (inputClassName.includes('Primary')) {
            this.primaryData = [...filteredData];
        } else if (inputClassName.includes('Secondary')) {
            this.secondaryData = [...filteredData];
        }
    }

    connectedCallback() {
        window.addEventListener('click', (event) => {
            let visibleElement = this.template.querySelector('.slds-visible');
            if (visibleElement) {
                visibleElement.className = visibleElement.className.replace('slds-visible', 'slds-hidden');
            }
        })

        window.addEventListener('resize', () => {
            let element = this.template.querySelector('.slds-visible');
            if (element) {
                element.style.width = this.template.querySelector('.firstDiv').clientWidth + 'px';
            }
        })
    }

    handleDropDown(event) {
        event.stopImmediatePropagation();
        let element = event.currentTarget;
        let visibleElement = this.template.querySelector('.slds-visible');
        this.originalData = this._data;
        this.template.querySelectorAll('.disabled').forEach(element => {
            if (this.refs.primarySearch.value !== element.textContent) {
                this.secondaryData[element.dataset.index].disabled = false;
            }
            if (this.refs.secondarySearch.value === element.textContent) {
                this.secondaryData[element.dataset.index].disabled = true;
            }
        })
        if (visibleElement) {
            visibleElement.className = visibleElement.className.replace('slds-visible', 'slds-hidden');
        }
        if (element.className.includes('Primary')) {
            element.nextSibling.style.width = element.clientWidth + 'px';
            element.nextSibling.className = element.nextSibling.className.replace('slds-hidden', 'slds-visible');
        } else if (element.className.includes('Secondary')) {
            element.nextSibling.style.width = element.clientWidth + 'px';
            element.nextSibling.className = element.nextSibling.className.replace('slds-hidden', 'slds-visible');
        }
    }

    handleValueSelection(event) {
        if (event.currentTarget.className === 'disabled') {
            event.stopImmediatePropagation();
            return;
        }
        const index = parseInt(event.currentTarget.dataset.index);
        const className = event.currentTarget.className;
        this.secondaryData = [...this._data];
        if (className.includes('primary')) {
            this.refs.primarySearch.value = event.currentTarget.textContent;
            if (event.currentTarget.textContent === this.refs.secondarySearch.value) {
                this.refs.secondarySearch.value = '';
            }
        } else if (className.includes('secondary')) {
            this.refs.secondarySearch.value = event.currentTarget.textContent;
        }
        this.secondaryData[index].disabled = true;
        this.searchString = undefined;
    }

    scrollTopHeight;
    handleLoadMore(event) {
        const clientHeight = event.currentTarget.clientHeight;
        const recentScrollTop = Math.ceil(event.currentTarget.scrollTop + clientHeight);
        const scrollHeight = Math.ceil(event.currentTarget.scrollHeight);
        if ((recentScrollTop === scrollHeight || recentScrollTop + 1 === scrollHeight) && this.scrollTopHeight + 1 !== recentScrollTop && !this.searchString) {
            this.scrollTopHeight = recentScrollTop;
            const loadMore = new CustomEvent('loadmore');
            this.dispatchEvent(loadMore);
        }
    }
}