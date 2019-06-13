const {Ui, AccountManager, Guardian} = require('./stream');

const customers = [
    {
        name    : 'Pitter Black',
        email   : 'pblack@email.com',
        password: 'pblack_123',
        // manyFiled: 'someForErrorFire'
    },
    {
        name    : 'Oliver White',
        email   : 'owhite@email.com',
        password: 'owhite_456',
        // secondError: 1
    }
];

const ui = new Ui(customers, {objectMode: true, highWaterMark: 1});
const guardian = new Guardian({
    readableObjectMode: true,
    writableObjectMode: true,
    decodeStrings     : false
});
const manager = new AccountManager({objectMode: true});
ui.pipe(guardian).pipe(manager);