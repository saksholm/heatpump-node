export class Initialized {
  constructor(io) {
    this.io = io;
  }

  done (text) {
    console.log(`${this.io}, ${text}... DONE`);
  }
}
