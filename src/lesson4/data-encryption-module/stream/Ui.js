const Readable = require('stream').Readable;

class Ui extends Readable {
    constructor(data, options = {}) {
        super(options); // for verify single object
        this.data = data;
        this.fields = { payload: ['name', 'email', 'password'], meta: ['algorithm'] };
        this.on('pipe', src => {
            console.log('pipe -->', src);
        })
    }
    
    _read() {
        try {
            let data = this._verify(this.data.shift());
            if (!data) {
                this.push(null);
            } else {
                this.push(data);
            }
        } catch (e) {
            this.push(null);
            console.error(`ERROR ==> ${e.name} ${e.message}`);
        }
    }
    
    _verify(customer) {
        if (!customer) {
            return customer;
        }
        
        const keys = Object.keys(customer);
        let data = { payload: customer };
        
        if (keys.indexOf('payload') !== -1 && keys.indexOf('meta') !== -1) {
            data = customer;
        }
        this._checkType('meta', data);
        this._checkType('payload', data);
        
        return customer;
    }
    
    _checkType(key, data) {
        if (data[key]){
            if (Object.keys(data[key]).length !== this.fields[key].length) {
                throw new Error('Number of parameters isn\'t correct');
            }
    
            this.fields[key].forEach(field => {
                if (!data[key][field] || typeof data[key][field] !== 'string') {
                    throw new Error('Problem with parameter. Maybe his type is not a string');
                }
            });
        }
    }
}

module.exports = Ui;