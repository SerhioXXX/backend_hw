class TimersManager {
    constructor() {
        this.timers = [];
        this.started = false;
    }

    add(timer, ...params) {
        this._validateQueue();

        if (this.started) {
            throw new Error('please stop all timers before');
        }
        this._checkExistence(timer.name);
        this._validateTimer(timer, 5000);

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

    _createTimer(timer) {
        let timerId = null;
        const { interval, job, delay, in: args } = timer;

        if (interval) {
            timerId = setInterval(job, delay, ...args);
        } else {
            timerId = setTimeout(job, delay, ...args);
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

    _validateTimer({ name, delay, interval, job }, maxTimeout) {
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

        if (delay < 0 && delay > maxTimeout) {
            throw new TypeError(
                `delay can not be less than 0 and grater than ${maxTimeout} ms`
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
}

const manager = new TimersManager();

const t0 = {
    name: '',
    delay: 1000,
    interval: true,
    job: () => {
        console.log('t0');
    }
};

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
    job: (a, b) => console.log(a + b)
};

const t3 = {
    name: 't3',
    delay: 2000,
    interval: true,
    job: (a, b) => console.log(a * b)
};

manager.add(t0);
// .add(t1)
// .add(t2, 1, 2);
// manager.add(t2, 1, 2);
manager.start();
// manager.add(t3);

setTimeout(() => {
    manager.stop('t1');
}, 3000);
