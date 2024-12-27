export type Fail = {
  success: false;
  message: string;
};

export type DeepReadonly<T> = {
  readonly [K in keyof T]: DeepReadonly<T[K]>;
};

