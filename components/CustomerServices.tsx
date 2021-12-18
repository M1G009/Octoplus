
const dataDemo = {
    data: [
        {name: "Francesco Perone", surname: 'Perone', dob: "12/09/1992", sex: 'male', country: 'italy'},
        {name: "Francesco Perone1", surname: 'Perone', dob: "12/09/1992", sex: 'male', country: 'italy'},
        {name: "Francesco Perone2", surname: 'Perone', dob: "12/09/1992", sex: 'male', country: 'italy'},
        {name: "Francesco Perone3", surname: 'Perone', dob: "12/09/1992", sex: 'male', country: 'italy'},
        {name: "Francesco Perone4", surname: 'Perone', dob: "12/09/1992", sex: 'male', country: 'italy'},
        {name: "Francesco Perone5", surname: 'Perone', dob: "12/09/1992", sex: 'male', country: 'italy'},
        {name: "Francesco Perone6", surname: 'Perone', dob: "12/09/1992", sex: 'male', country: 'italy'},
        {name: "Francesco Perone7", surname: 'Perone', dob: "12/09/1992", sex: 'male', country: 'italy'},
        {name: "Francesco Perone8", surname: 'Perone', dob: "12/09/1992", sex: 'male', country: 'italy'},
        {name: "Francesco Perone9", surname: 'Perone', dob: "12/09/1992", sex: 'male', country: 'italy'},
        {name: "Francesco Perone10", surname: 'Perone', dob: "12/09/1992", sex: 'male', country: 'italy'},
        {name: "Francesco Perone11", surname: 'Perone', dob: "12/09/1992", sex: 'male', country: 'italy'},
        {name: "Francesco Perone12", surname: 'Perone', dob: "12/09/1992", sex: 'male', country: 'italy'},
        {name: "Francesco Perone13", surname: 'Perone', dob: "12/09/1992", sex: 'male', country: 'italy'},
        {name: "Francesco Perone14", surname: 'Perone', dob: "12/09/1992", sex: 'male', country: 'italy'},
        {name: "Francesco Perone15", surname: 'Perone', dob: "12/09/1992", sex: 'male', country: 'italy'},
        {name: "Francesco Perone16", surname: 'Perone', dob: "12/09/1992", sex: 'male', country: 'italy'},
        {name: "Francesco Perone17", surname: 'Perone', dob: "12/09/1992", sex: 'male', country: 'italy'},
        {name: "Francesco Perone18", surname: 'Perone', dob: "12/09/1992", sex: 'male', country: 'italy'},
        {name: "Francesco Perone19", surname: 'Perone', dob: "12/09/1992", sex: 'male', country: 'italy'}
    ]
}

export class CustomerService {

    getCustomersSmall() {
        return fetch('data/customers-small.json').then(res => dataDemo)
                .then(d => d.data);
    }

    getCustomersMedium() {
        return fetch('data/customers-medium.json').then(res => dataDemo)
                .then(d => d.data);
    }

    getCustomersLarge() {
        return fetch('data/customers-large.json').then(res => dataDemo)
                .then(d => d.data);
    }

    getCustomersXLarge() {
        return fetch('data/customers-xlarge.json').then(res => dataDemo)
                .then(d => d.data);
    }

    getCustomers(params: any) {
        const queryParams = Object.keys(params).map(k => encodeURIComponent(k) + '=' + encodeURIComponent(params[k])).join('&');
        return fetch('https://www.primefaces.org/data/customers?' + queryParams).then(res => dataDemo)
    }
}
    