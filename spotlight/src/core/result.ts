export interface Ok<T> {
  key: "ok"
  value: T
}

export interface Err {
  key: "err"
  error: any
}

export type Result<T> = Ok<T> | Err
