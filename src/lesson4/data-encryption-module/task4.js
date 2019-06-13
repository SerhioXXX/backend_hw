const {Ui, AccountManager, Decryptor, Logger} = require('./stream');

const customers = [
    {
        payload: {
            name: 'Pitter Black',
            email: '70626c61636b40656d61696c2e636f6d',
            password: '70626c61636b5f313233'
        },
        meta: {
            algorithm: 'hex'
        }
    },
    {
        payload: {
            name: 'Pitter White',
            email: '6f776869746540656d61696c2e636f6d',
            password: '6f77686974655f343536'
        },
        meta: {
            algorithm: 'base64'
        }
    }
];
const ui = new Ui(customers, {objectMode: true});
const decryptor = new Decryptor({objectMode: true});
const logg = new Logger({objectMode: true});
const manager = new AccountManager({objectMode: true});
ui
    .pipe(decryptor)
    .pipe(logg)
    .pipe(manager);

    logg._flush(console.log);