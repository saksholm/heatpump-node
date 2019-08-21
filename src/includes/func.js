const initialized = (io, text) => {
  console.log(`DO, ${text} initialized`);
};

export class Initialized {
  constructor(io) {
    this.io = io;
  }

  done (text) {
    console.log(`${this.io}, ${text}... DONE`);
  }
}

class Foo {
    constructor(x) {
        this.x = x;
    }

    point() {
        return 'Foo(' + this.x + ')';
    }
}



export {
  initialized,
  Foo,
};
