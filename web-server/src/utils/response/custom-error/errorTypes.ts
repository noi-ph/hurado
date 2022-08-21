//For future error handling: Add specific error types for every page

export type RegisterError = {
  email?: string;
  username?: string;
  password?: string;
  misc?: string;
  success?: string;
}


//------------------------------------------------- (don't touch this code yet since a lot of the other files still depend on CustomError and ErrorArray)
// //old code:
export type ErrorResponse = {
  //httpsStatusCode: number;
  errorType: ErrorTypes;
  errorRaw: any;
  errorMessage: string;
  errors: ErrorArray;
  stack?: string;
};

export type ErrorTypes = 'General' | 'Raw' | 'Validation' | 'Unauthorized' | RegisterError;

export class ErrorList {
  private list: {};

  constructor() {
    this.list = {};
  }

}

export class ErrorArray {
  private dict: { [key: string]: string[] };

  constructor() {
    this.dict = {};
  }

  put(key: string, value: string) { //adds new error to ErrorArray
    if (key in this.dict) {
      this.dict[key].push(value);
    } else {
      this.dict[key] = [value];
    }
  }

  get(key: string) { // finds error in ErrorArray
    let value = this.dict[key];
    value = value ? value : [];
    return value;
  }

  get isEmpty() { // finds error keys that are empty
    return Object.keys(this.dict).length === 0;
  }

  extend(other: ErrorArray) { // appends the ErrorArray to another ErrorArray
    for (const key in other.dict) {
      for (let i = 0; i < other.get(key).length; i++) {
        this.put(key, other.get(key)[i]);
      }
    }
  }
}
