const Transform = require('stream').Transform;

class Decryptor extends Transform {
    constructor(props = {}) {
        super(props);
    }
    
    _transform(chunk, encoding, done) {
        const { meta, payload } = chunk;
        let customer = {
            name:     payload.name,
            email:    payload.email,
            password: payload.password
        };
        
        try {
            customer.email = this._run(payload.email, meta.algorithm);
            customer.password = this._run(payload.password, meta.algorithm);
        } catch (e) {
            console.error(`ERROR ==> ${e.name} ${e.message}`);
        }
        
        this.push(customer);
        done();
    }
    
    _run(field, algorithm) {
        if (algorithm !== 'hex' && algorithm !== 'base64') {
            throw new Error('Algorithm not implemented');
        }
        
        return Buffer.from(field, algorithm).toString('utf8')
    }
}

module.exports = Decryptor;