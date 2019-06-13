const Writable = require('stream').Writable;

class AccountManager extends Writable {
    constructor(options = {}) {
        super(options);
    }
    
    _write(chunk, encoding, done) {
        console.log('write from source -->', chunk.payload || chunk);
        done();
    }
}

module.exports = AccountManager;