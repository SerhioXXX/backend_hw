const Transform = require('stream').Transform;
const DB = require('../db');

class Logger extends Transform {
    constructor(props = {}) {
        super(props);
        this.db = new DB();
    }
    
    _transform(chunk, encoding, done) {
        this.push(chunk);
        this.db.insert(chunk);
        done();
    }
    
    _flush(done) {
        console.log('\nlogger push -->', this.db.findAll());
        
        done();
    }
}

module.exports = Logger;