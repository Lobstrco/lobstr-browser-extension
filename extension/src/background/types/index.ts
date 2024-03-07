export interface MessageResponder {
  [key: string]: () => void;
}
