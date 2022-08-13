export type ErrorResponse = {
  errorType: ErrorType;
  errorMessage: string;
  errorRaw: any;
  errors: ErrorArray | null;
  stack?: string;
};

export type ErrorType = 'General' | 'Raw' | 'Validation' | 'Unauthorized';

export class ErrorArray {
  private dict: { [key: string]: string[] };

  constructor() {
    this.dict = {};
  }

  put(key: string, value: string) {
    if (key in this.dict) {
      this.dict[key].push(value);
    } else {
      this.dict[key] = [value];
    }
  }

  get(key: string) {
    let value = this.dict[key];
    value = value ? value : [];
    return value;
  }

  get isEmpty() {
    return Object.keys(this.dict).length === 0;
  }

  extend(other: ErrorArray) {
    for (const key in other.dict) {
      for (let i = 0; i < other.get(key).length; i++) {
        this.put(key, other.get(key)[i]);
      }
    }
  }
}
