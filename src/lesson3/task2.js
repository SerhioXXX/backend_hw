const Bank = require('./module');
const bank = new Bank();

const personFirstId = bank.register({
    name:    'Pitter Black',
    balance: 100
});

const personSecondId = bank.register({
    name:    'Oliver White',
    balance: 700
});

bank.emit('send', personFirstId, personSecondId, 50);

bank.emit('get', personSecondId, (balance) => {
    console.log(`Oliver have ${balance}₴`); // I have 750₴
});

bank.emit('get', personFirstId, (balance) => {
    console.log(`Pitter have ${balance}₴`); // I have 50₴
});
