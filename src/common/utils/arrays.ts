export class Arrays {
  static replaceNth<T>(arr: T[], index: number, value: T) {
    return arr.slice(0, index).concat(value, ...arr.slice(index + 1));
  }

  static removeNth<T>(arr: T[], index: number) {
    return arr.slice(0, index).concat(...arr.slice(index + 1));
  }

  static moveUp<T>(arr: T[], index: number) {
    if (index <= 0) {
      return arr;
    } else {
      return [...arr.slice(0, index - 1), arr[index], arr[index - 1], ...arr.slice(index + 1)];
    }
  }

  static moveDown<T>(arr: T[], index: number) {
    if (index >= arr.length - 1) {
      return arr;
    } else {
      return [...arr.slice(0, index), arr[index + 1], arr[index], ...arr.slice(index + 2)];
    }
  }
}
