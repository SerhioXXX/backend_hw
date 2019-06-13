const EventEmitter = require('events').EventEmitter;

class DB extends EventEmitter {
    constructor(opt) {
        super(opt);
        this.store = [];
        this.on('insert', data => {
            this.store.push({
                source : '?',
                payload: data,
                created: new Date()
            })
        })
    }
    
    insert(data) {
        this.emit('insert', data);
    }
    
    findAll() {
        return this.store;
    }
}

module.exports = DB;