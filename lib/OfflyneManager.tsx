type OfflyneManagerConstructor = {
  store: any;
  initialValues: any;
};

export default class OfflyneManager {
  constructor({ store, initialValues }: OfflyneManagerConstructor) {
    console.log('OfflyneManager constructor', store, initialValues);
  }
}
