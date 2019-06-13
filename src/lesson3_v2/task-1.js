const EventEmitter = require('events');

class Bank extends EventEmitter {
    constructor() {
        super();

        this.customers = [];
        this._init();
    }

    _init() {
        this.on('add', (personId, amount) => this._enroll(personId, amount));

        this.on('get', (personId, cb) => {
            if (typeof cb !== 'function') {
                this.emit(
                    'error',
                    new TypeError('callback should be a function')
                );
            }
            const { customer } = this._getCustomerById(personId);

            cb(customer.balance);
        });

        this.on('withdraw', (personId, amount) =>
            this._withdraw(personId, amount)
        );

        this.on('error', error => {
            console.error(`We have a problem: ${error.message}`);
            process.exit(1);
        });
    }

    register(customer) {
        this._validateCustomer(customer);
        this._checkForDuplicates(customer);

        const id = Date.now() + Math.floor(Math.random() * 10);
        customer.id = id;

        this.customers.push(customer);

        return id;
    }

    _validateCustomer(customer) {
        if (customer && typeof customer !== 'object') {
            this.emit('error', new Error('customer should be an object'));
        }

        if (!customer.hasOwnProperty('name')) {
            this.emit(
                'error',
                new Error('customer should have a name property')
            );
        }

        if (!customer.hasOwnProperty('balance')) {
            this.emit(
                'error',
                new Error('customer should have a balance property')
            );
        }

        if (typeof customer.balance !== 'number') {
            this.emit('error', new Error('balance should a number'));
        }

        if (customer.balance < 0) {
            this.emit('error', new Error('balance should be grater than 0'));
        }
    }

    _checkForDuplicates(customer) {
        const isCustomerExists = this.customers.some(
            ({ name }) => customer.name === name
        );

        if (isCustomerExists) {
            this.emit(
                'error',
                new Error(`duplicated customer for name: '${customer.name}'`)
            );
        }
    }

    _getCustomerById(personId) {
        const index = this.customers.findIndex(({ id }) => id === personId);
        const customer = this.customers[index];

        if (!customer) {
            this.emit(
                'error',
                new Error(`customer with id ${personId} not found`)
            );
        }

        return { customer, index };
    }

    _updateBalance({ customer, index, balance }) {
        this.customers[index] = { ...customer, balance };
    }

    _enroll(personId, amount) {
        if (amount <= 0) {
            this.emit('error', new Error('amount should be grater than 0'));
        }

        const { customer, index } = this._getCustomerById(personId);
        const balance = customer.balance + amount;

        this._updateBalance({ customer, index, balance });
    }

    _withdraw(personId, amount) {
        if (amount <= 0) {
            this.emit('error', new Error('amount should be grater than 0'));
        }

        const { customer, index } = this._getCustomerById(personId);

        if (customer.balance - amount < 0) {
            this.emit(
                'error',
                new Error(
                    'customer does not have enough money for that transaction'
                )
            );
        }

        const balance = customer.balance - amount;

        this._updateBalance({ customer, index, balance });
    }
}

const bank = new Bank();

const personId = bank.register({
    name: 'Pitter Black',
    balance: 100
});

// add
bank.emit('add', personId, 20);
bank.emit('get', personId, balance => {
    console.log(`I have ${balance}₴`); // I have 120₴
});

// withdraw
bank.emit('withdraw', personId, 50);
bank.emit('get', personId, balance => {
    console.log(`I have ${balance}₴`); // I have 70₴
});
