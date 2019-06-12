class TimersManager {
    constructor() {
        this.timers = [];
        this.started = false;
        this.logs = [];
    }

    add(timer, ...params) {
        this._validateQueue();

        if (this.started) {
            throw new Error('please stop all timers before');
        }
        this._checkExistence(timer.name);
        this._validateTimer(timer);

        this.timers.push({ ...timer, in: params });

        return this;
    }

    remove(timerName) {
        this._validateQueue();

        this.pause(timerName);
        this.timers = this.timers.filter(({ name }) => name !== timerName);
    }

    start() {
        this._validateQueue();

        this.timers = this.timers.map(timer => {
            const timerId = this._createTimer(timer);

            return { ...timer, timerId };
        });

        this.started = true;
    }

    stop() {
        this._validateQueue();

        this.timers = this.timers.map(timer => {
            const { interval, timerId } = timer;

            if (interval) {
                clearInterval(timerId);
            } else {
                clearTimeout(timerId);
            }

            return { ...timer, timerId: null };
        });

        this.started = false;
    }

    pause(timerName) {
        this._validateQueue();

        const currentTimer = this._getTimer(timerName);
        const { timerId, interval } = currentTimer;

        if (interval) {
            clearInterval(timerId);
        } else {
            clearTimeout(timerId);
        }

        currentTimer.timerId = null;

        this.timers.map(timer =>
            timer.name === timerName ? currentTimer : timer
        );
    }

    resume(timerName) {
        this._validateQueue();

        const currentTimer = this._getTimer(timerName);
        const timerId = this._createTimer(currentTimer);

        currentTimer.timerId = timerId;

        this.timers.map(timer =>
            timer.name === timerName ? currentTimer : timer
        );
    }

    print() {
        return this.logs;
    }

    _createTimer(timer) {
        let timerId = null;
        const { name, interval, job, delay, in: args } = timer;
        const callback = () => {
            try {
                const result = job(...args);
                this._log({ name, result, args });
            } catch (error) {
                this._log({ name, result: void 0, args, error });
            }
        };

        if (interval) {
            timerId = setInterval(callback, delay, ...args);
        } else {
            timerId = setTimeout(callback, delay, ...args);
        }

        return timerId;
    }

    _getTimer(timerName) {
        const timer = this.timers.find(({ name }) => name === timerName);

        if (!timer) {
            throw new Error(`Timer not found. Timer name: ${timerName}`);
        }

        if (!timer.timerId) {
            throw new TypeError(`Timer not started. Timer name: ${timerName}`);
        }

        return timer;
    }

    _checkExistence(timerName) {
        const timer = this.timers.find(({ name }) => name === timerName);

        if (timer) {
            throw new TypeError(
                `Timer already exist. Timer name: ${timerName}`
            );
        }
    }

    _validateTimer({ name, delay, interval, job }) {
        if (!name || typeof name !== 'string') {
            throw new TypeError(
                'name does not exist or contains not a valid data type'
            );
        }

        if (typeof delay !== 'number') {
            throw new TypeError(
                'delay does not exist or contains not a valid data type'
            );
        }

        if (delay < 0 && delay > 5000) {
            throw new TypeError(
                'delay can not be less than 0 and grater than 5000 ms'
            );
        }

        if (typeof interval !== 'boolean') {
            throw new TypeError(
                'interval does not exist or contains not a valid data type'
            );
        }

        if (typeof job !== 'function') {
            throw new TypeError(
                'job does not exist or contains not a valid data type'
            );
        }
    }

    _validateQueue() {
        if (!Array.isArray(this.timers)) {
            throw new TypeError('timer should be an array');
        }
    }

    _validateError(error) {
        if (error && typeof error === 'object') {
            if (!('name' in error)) {
                throw new Error('error object should contain name property');
            }

            if (!('message' in error)) {
                throw new Error('error object should contain message property');
            }

            if (!('stack' in error)) {
                throw new Error('error object should contain stack property');
            }
        }
    }

    _log({ name, result, args, error }) {
        if (!Array.isArray(this.logs)) {
            throw new TypeError('logs should be an array');
        }

        this._validateError(error);

        const log = {
            name,
            in: args,
            out: result,
            created: new Date()
        };

        if (error) {
            this.logs.push({ ...log, error });
        } else {
            this.logs.push(log);
        }
    }
}

const manager = new TimersManager();

const t1 = {
    name: 't1',
    delay: 1000,
    interval: true,
    job: () => {
        console.log('t1');
    }
};

const t2 = {
    name: 't2',
    delay: 1000,
    interval: true,
    job: (a, b) => a + b
};

const t3 = {
    name: 't3',
    delay: 1000,
    interval: false,
    job: (a, b) => a * b
};

const t4 = {
    name: 't4',
    delay: 1000,
    interval: false,
    job: () => {
        throw new Error('We have a problem!');
    }
};

manager
    .add(t1)
    .add(t2, 1, 2)
    .add(t3, 4, 2)
    .add(t4);
manager.start();

setTimeout(() => {
    manager.stop('t1');
    manager.print();
}, 3000);
