const EventEmitter = require('events');

class Bank extends EventEmitter {
    constructor() {
        super();

        this.customers = new Map();
        this.init();
    }

    init() {
        this.on('add', (personId, amount) => this._enroll(personId, amount));

        this.on('get', (personId, cb) => {
            if (typeof cb !== 'function') {
                this.emit(
                    'error',
                    new TypeError('callback should be a function')
                );
            }
            const customer = this._getCustomerById(personId);

            cb(customer.balance);
        });

        this.on('changeLimit', (personId, limit) => {
            if (typeof limit !== 'function') {
                this.emit(
                    'error',
                    new TypeError('callback should be a function')
                );
            }

            const customer = this._getCustomerById(personId);

            this.customers.set(personId, { ...customer, limit });
        });

        this.on('withdraw', (personId, amount) =>
            this._withdraw(personId, amount)
        );

        this.on('send', (personFirstId, personSecondId, amount) =>
            this._send(personFirstId, personSecondId, amount)
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

        this.customers.set(id, customer);

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

        if (!customer.hasOwnProperty('limit')) {
            this.emit(
                'error',
                new Error('customer should have a limit property')
            );
        }

        if (typeof customer.limit !== 'function') {
            this.emit(
                'error',
                new Error('customer limit should be a function')
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
        for (const [, { name }] of this.customers) {
            if (customer.name === name) {
                this.emit(
                    'error',
                    new Error(
                        `duplicated customer for name: '${customer.name}'`
                    )
                );
                return;
            }
        }
    }

    _getCustomerById(personId) {
        const customer = this.customers.get(personId);

        if (!customer) {
            this.emit(
                'error',
                new Error(`customer with id ${personId} not found`)
            );
        }

        return customer;
    }

    _checkLimit({ customer, amount }) {
        const currentBalance = customer.balance;
        const futureBalance = customer.balance - amount;
        const checkLimit = customer.limit(
            amount,
            currentBalance,
            futureBalance
        );

        if (!checkLimit) {
            this.emit(
                'error',
                new Error(
                    `can not perform an action for '${
                        customer.name
                    }' due to account limitations`
                )
            );
        }
    }

    _updateBalance({ id, customer, balance, amount }) {
        this._checkLimit({ customer, amount });
        this.customers.set(id, { ...customer, balance });
    }

    _increaseBalance({ id, amount }) {
        const customer = this._getCustomerById(id);

        const balance = customer.balance + amount;
        this._updateBalance({ id, customer, balance, amount });
    }

    _decreaseBalance({ id, amount }) {
        const customer = this._getCustomerById(id);

        if (customer.balance - amount < 0) {
            this.emit(
                'error',
                new Error(
                    'customer does not have enough money for that transaction'
                )
            );
        }

        const balance = customer.balance - amount;
        this._updateBalance({ id, customer, balance, amount });
    }

    _enroll(id, amount) {
        if (amount <= 0) {
            this.emit('error', new Error('amount should be grater than 0'));
        }

        this._increaseBalance({ id, amount });
    }

    _withdraw(id, amount) {
        if (amount <= 0) {
            this.emit('error', new Error('amount should be grater than 0'));
        }

        this._decreaseBalance({ id, amount });
    }

    _send(senderId, receiverId, amount) {
        if (amount <= 0) {
            this.emit('error', new Error('amount should be grater than 0'));
        }

        this._decreaseBalance({
            id: senderId,
            amount
        });

        this._increaseBalance({
            id: receiverId,
            amount
        });
    }
}

const bank = new Bank();

const personId1 = bank.register({
    name: 'Pitter Black',
    balance: 100,
    limit: amount => amount < 10
});

const personId2 = bank.register({
    name: 'Oliver White',
    balance: 700,
    limit: amount => amount < 10
});

const personId3 = bank.register({
    name: 'Chuck Norris',
    balance: 900,
    limit: amount => amount < 10
});

bank.emit('withdraw', personId1, 5); // OK

bank.emit(
    'changeLimit',
    personId2,
    (amount, currentBalance, updatedBalance) => {
        return amount < 100 && updatedBalance > 700;
    }
);

// bank.emit('withdraw', personId2, 5); // ERROR

bank.emit(
    'changeLimit',
    personId3,
    (amount, currentBalance, updatedBalance) => {
        return amount < 100 && updatedBalance > 700 && currentBalance > 800;
    }
);

bank.emit('get', personId1, balance => {
    console.log(`I have ${balance}₴`); // I have 95₴
});

// bank.emit('withdraw', personId3, 200); // ERROR
// bank.emit('withdraw', personId3, 5); // OK

bank.emit('changeLimit', personId3, (amount, currentBalance) => {
    return currentBalance > 800;
});

// bank.emit('withdraw', personId3, 500); // OK

bank.emit(
    'changeLimit',
    personId3,
    (amount, currentBalance, updatedBalance) => {
        return updatedBalance > 900;
    }
);

// bank.emit('withdraw', personId3, 200); // ERROR
