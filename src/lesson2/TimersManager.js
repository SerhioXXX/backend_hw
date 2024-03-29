const t1 = {
  name: "t1",
  delay: 500,
  interval: false,
  job: () => console.log("t1")
};

const t2 = {
  name: "t2",
  delay: 3000,
  interval: false,
  job: (a, b) => a + b
};

const t3 = {
  name: "t3",
  delay: 2000,
  interval: false,
  job: () => {
    throw new Error("We have a problem");
  }
};

const t4 = {
  name: "t4",
  delay: 5000,
  interval: false,
  job: n => n
};

const tick = {
  name: "tick",
  delay: 1000,
  interval: true,
  job: (a, b) => console.log(a + b)
};

class TimersManager {
  constructor() {
    this.timers = [];
    this.methods = [];
    this.startedTimers = {};
    this.names = [];
    this.logs = {};
    this.delays = [];
    this.logData = {};
  }

  _log(data) {
    const { name, input, out, created, error } = data;

    this.logs[name] = { name, in: input, out, created, error };
    return this;
  }

  print() {
    const logs = Object.values(this.logs);

    return logs;
  }

  add(timer, ...args) {
    this.methods.push("add");

    try {
      if (!timer.name || typeof timer.name !== "string") {
        throw new Error("Error: поле name содержит неверный тип, отсутствует или пустая строка");
      } else if (
        !timer.delay ||
        typeof timer.delay !== "number" ||
        timer.delay < 0 ||
        timer.delay > 5000
      ) {
        throw new Error(
          "Error: delay содержит неверный тип или отсутствует меньше 0 или больше 5000."
        );
      } else if (timer.interval === undefined || typeof timer.interval !== "boolean") {
        throw new Error("Error: поле interval содержит неверный тип или отсутствует.");
      } else if (!timer.job || typeof timer.job !== "function") {
        throw new Error("Error: поле job содержит неверный тип или отсутствует.");
      } else if (this.methods.includes("start")) {
        throw new Error("Error: нельзя вызывать метод add после старта.");
      } else if (this.names.includes(timer.name)) {
        throw new Error("Error: нельзя добавить таймер с именем котрое уже было добавлено.");
      } else {
        this.names.push(timer.name);
        this.delays.push(timer.delay);
        console.log(`Этот timer '${timer.name}' выполняет ->`, timer.job);

        const data = {
          name: timer.name,
          input: args,
          out: timer.job.apply(timer.job, args),
          created: new Date(),
          error: null
        };

        this._log(data);
      }
      this.timers.push({ timer, args });

      return this;
    } catch (e) {
      if (e) {
        const data = {
          name: timer.name,
          input: args,
          out: timer.job,
          created: new Date(),
          error: e
        };
        this._log(data);
      }
    } finally {
      console.log(this.print());
      return this;
    }
  }

  resume(name) {
    const { delay, interval, job, args } = this.startedTimers[name];
    global[name] = interval ? setInterval(job, delay, ...args) : setTimeout(job, delay, ...args);
    // this.timers
    return this;
  }

  remove(name) {
    this.names.filter(name => name !== name);
    this.timers = this.timers.filter(({ timer }) => {
      if (timer.name === name) {
        timer.interval ? clearInterval(global[name]) : clearTimeout(global[name]);
      }

      return timer.name !== name;
    });

    this.methods.push("remove");

    return this;
  }

  start() {
    let maxDelay = 0;
    this.delays.map(item => (maxDelay < item ? (maxDelay = item) : maxDelay));

    this.methods.push("start");

    this.timers.map(({ timer, args }, key) => {
      timer.interval
        ? (global[timer.name] = setInterval(timer.job, timer.delay, ...args))
        : (global[timer.name] = setTimeout(timer.job, timer.delay, ...args));
      this.startedTimers[timer.name] = {
        timerId: timer.name,
        start: new Date(),
        delay: timer.delay,
        interval: timer.interval,
        job: timer.job,
        args
      };
    });

    setTimeout(() => {
      this.names.map(name => {
        if (name && this.startedTimers[name]) {
          const { interval } = this.startedTimers[name];
          interval ? clearInterval(global[name]) : clearTimeout(global[name]);
        }
      });
    }, maxDelay + 10000);

    return this;
  }

  stop(name) {
    this.startedTimers[name].interval ? clearInterval(global[name]) : clearTimeout(global[name]);
    this.methods.push("stop");
    return this;
  }

  pause(name) {
    this.methods.push("pause");
    const { start, delay, interval } = this.startedTimers[name];
    let remaining = delay;
    interval ? clearInterval(global[name]) : clearTimeout(global[name]);
    remaining -= new Date() - start;
    this.startedTimers[name].delay = remaining;

    return this;
  }
}

const manager = new TimersManager();

/*Task1*/
manager.add(t1);
manager.add(t2, 1, 2);
manager.start();
console.log(1);
manager.pause("t1");

/*Task2*/
// manager.add(t1, 1, 2);
// manager.start();
// manager.print();

/*Task3*/
// manager.add(t1, 1, 2); // 3
// manager.add(t2); // undefined
// manager.add(t3, 1); // 1
// manager.start();
// setTimeout(() => {
//   manager.print();
// }, 2000);

/*Task4*/
// manager.add(t2, 1, 2);
// manager.add(t3);
// manager.add(t4, 1);
// manager.add(tick, 1, 5);
// manager.start();
