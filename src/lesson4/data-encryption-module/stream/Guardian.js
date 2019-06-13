const Transform = require('stream').Transform;

class Guardian extends Transform {
    constructor(props = {}) {
        super(props);
    }
    
    _transform(chunk, encoding, done) {
        const { name, email, password } = chunk;
        this.push({
            meta:    {
                source: 'ui'
            },
            payload: {
                name,
                email:    this._hex(email),
                password: this._hex(password)
            }
        });
        
        done();
    }
    
    _hex(string) {
        return Buffer.from(string, 'utf8').toString('hex')
    }
}

module.exports = Guardian;