const Bank = require('./module');

const bank     = new Bank();
const personId = bank.register({
    name:    'Oliver White',
    balance: 700,
    limit:   amount => amount < 10
});
const secondId = bank.register({
    name:    'Peter Pen',
    balance: 2
});

bank.emit('withdraw', personId, 5);

bank.emit('get', personId, (amount) => console.log(`I have ${amount}₴`)); // I have 695₴
bank.emit('withdraw', personId, 15); // Error 15 > 10

console.log("\n======= variant 1", );
// Вариант 1
bank.emit('changeLimit', personId, (amount, currentBalance, updatedBalance) => amount > 100 && updatedBalance > 10);
bank.emit('send', personId, secondId, 150); // Error 700-699 < 10
// bank.emit('send', personId, secondId, 699); // Error 700-699 < 10
// bank.emit('send', secondId, personId, 699); // Error 2 < 100
bank.emit('get', personId, (amount) => console.log(`I have ${amount}₴`)); // I have 545₴

console.log("\n======= variant 2", );
// Вариант 2
bank.emit('changeLimit', personId, (amount, currentBalance, updatedBalance) => {
    return amount < 100 && updatedBalance > 450 && currentBalance > 555;
});
// bank.emit('send', personId, secondId, 65); // Error 545 < 555
// bank.emit('send', personId, secondId, 99); // Error 545 - 99 < 450
// bank.emit('send', personId, secondId, 150); // Error 150 > 100
bank.emit('get', personId, (amount) => console.log(`I have ${amount}₴`)); // I have 695₴

console.log("\n======= variant 3", );
// Вариант 3
bank.emit('changeLimit', personId, (amount, currentBalance) => currentBalance > 800);


console.log("\n======= variant 4", );
// Вариант 4
bank.emit('changeLimit', personId, (amount, currentBalance, updatedBalance) => updatedBalance > 900);