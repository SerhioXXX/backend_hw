const {Ui, AccountManager, Guardian, Logger} = require('./stream');

const customers = [
    {
        name    : 'Pitter Black',
        email   : 'pblack@email.com',
        password: 'pblack_123'
    },
    {
        name    : 'Oliver White',
        email   : 'owhite@email.com',
        password: 'owhite_456'
    }
];
const ui = new Ui(customers, {objectMode: true});
const guardian = new Guardian({
    readableObjectMode: true,
    writableObjectMode: true,
    decodeStrings     : false
});
const logg = new Logger({objectMode: true});
const manager = new AccountManager({objectMode: true});
ui
    .pipe(guardian)
    .pipe(logg)
    .pipe(manager);