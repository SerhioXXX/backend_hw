const EventEmitter = require('events').EventEmitter;

class Bank extends EventEmitter {
    constructor() {
        super();
        this.accountsBank = [];
        this.operations   = {
            add:         Symbol('add'),
            get:         Symbol('get'),
            withdraw:    Symbol('withdraw'),
            send:        Symbol('send'),
            changeLimit: Symbol('change')
        };
        
        this.on('error', error => {
            console.error(error.name + ` --> ${error.message}`);
        });
        
        this.on('add', (...options) => { 
          //console.log('======>>> options',this._account(options[0])[this.operations.add]);
          return this._account(options[0])[this.operations.add](options[1])
        });
        this.on('get', (personId, getter) => {
            getter(this._account(personId)[this.operations.get]());
        });
        this.on('withdraw', (...options) => this._account(options[0])[this.operations.withdraw](options[1]));
        this.on('send', (personId, ...options) => {
            this._account(personId)[this.operations.send](...options)
        });
        this.on('changeLimit', (personId, condition) => {
            const account = this._account(personId);
            account[this.operations.changeLimit](personId, condition);
        });
    }
    
    register(account) {
        this._check(account);
        const _self = this;
        
        const key = (new Date()).getTime();
        this
            .accountsBank
            .push({
                ...account,
                personId:                      key,
                [this.operations.add]:         function (sum) {
                    if (_self._valid(_self.operations.add, sum)) {
                        this.balance += sum;
                        console.log(`${account.name} added to account ${sum}₴`);
                    }
                },
                [this.operations.get]:         function () {
                    return this.balance;
                },
                [this.operations.withdraw]:    function (sum) {
                    if (_self._valid(_self.operations.withdraw, sum, this.personId)) {
                        if (_self._conditionsChange(this, -sum)) {
                            console.log(`${account.name} took from account ${sum}₴`);
                            this.balance -= sum;
                        }
                    }
                },
                [this.operations.send]:        function (agentId, sum) {
                    if (_self._valid(_self.operations.send, sum, this.personId, agentId)) {
                        if (_self._conditionsChange(this, -sum)) {
                            console.log(`${account.name} transferred ${sum}₴ for #${agentId} account`);
                            
                            this.balance -= sum;
                            _self.accountsBank = _self.accountsBank.map(agent => {
                                if (agent.personId === agentId) {
                                    agent.balance += sum;
                                }
                                
                                return agent;
                            });
                        }
                    }
                },
                [this.operations.changeLimit]: function (agentId, cb) {
                    console.log(`Limit change conditions set for ${account.name}`);
                    this.limit = cb;
                },
            });
        console.log(`${account.name} registered at bank, my balance ${account.balance}₴`);
        
        return key;
    }
    
    _account(personalId) {
        return this.accountsBank.find(person => person.personId === personalId);
    }
    
    _check({ name, balance }) {
        const account = this.accountsBank.find(account => account.name === name);
        if (account) {
            this.emit('error', new TypeError(`Person already exist. Try another name`));
        }
        
        if (balance <= 0) {
            this.emit('error', new TypeError('Balance should not be less zero'));
        }
    }
    
    _valid(operation, ...options) {
        const [sum, personalId, agentId] = options;
        
        switch (operation) {
            case this.operations.add:
                if (sum <= 0) {
                    this.emit('error', new TypeError('Sum add should not be less zero'));
                    return false;
                }
                break;
            
            case this.operations.withdraw:
                if (sum < 0) {
                    this.emit('error', new TypeError('Sum withdraw should be more zero'));
                    
                    return false;
                }
                
                const account = this._account(personalId);
                if (account.balance - sum < 0) {
                    this.emit('error', new TypeError('Insufficient funds'));
                    
                    return false;
                }
                
                break;
            
            case this.operations.send:
                if (sum < 0) {
                    this.emit('error', new TypeError('Transfer amount can\'t be less zero'));
                    
                    return false;
                }
                const personal = this._account(personalId);
                
                if (!personal) {
                    this.emit('error', new TypeError('Invalid personal id'));
                    
                    return false;
                }
                
                const agent = this._account(agentId);
                if (!agent) {
                    this.emit('error', new TypeError('Invalid agent id'));
                    
                    return false;
                }
                
                if (personal.balance - sum < 0) {
                    this.emit('error', new TypeError('Insufficient funds for transfer'));
                    
                    return false;
                }
                break;
            
            default:
                break;
        }
        
        return true;
    }
    
    _conditionsChange(account, sum) {
        const condition      = account.limit || function (){};
        const amount         = Math.abs(sum);
        const currentBalance = account.balance;
        const updatedBalance = currentBalance + sum;
        
        if (!condition(amount, currentBalance, updatedBalance)) {
            this.emit('error', new TypeError('Limit conditions don\'t allow operation'));
            
            return false;
        }
        
        return true;
    }
}

module.exports = Bank;