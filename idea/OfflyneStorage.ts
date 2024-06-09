class OfflyneStorage<T> {
  data: Map<string, T> = new Map();

  constructor() {
    console.log();
  }
}

export default OfflyneStorage;
