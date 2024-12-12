class X {
  doSomething() {
    console.log('Method called!');
  }
}

// Extend the type of the class instance to include a `call` method
interface CallableX extends X {
  call: () => void;
}

const ins: CallableX = Object.assign(new X(), {
  call: function () {
    this.doSomething();
  },
});

// Example usage
ins.call(); // Outputs: "Method called!"
ins.doSomething(); // Still works, since `ins` is an instance of `X`
