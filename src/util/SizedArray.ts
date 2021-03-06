export class SizedArray<value> {

  readonly values: value[];

  constructor(public limit: number) {
    this.values = [];
  }

  add(value: value): value {
    if (this.values.length > this.limit) this.values.pop();
    this.values.unshift(value);

    return value;
  }

}