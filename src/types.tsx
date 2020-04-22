export enum TransitionStatus {
  ENTERING = "entering",
  ENTERED = "entered",
  EXITING = "exiting",
  EXITED = "exited",
  UNMOUNTED = "unmounted",
}

export type Timeout =
  | {
      enter?: number;
      exit?: number;
      appear?: number;
    }
  | number;

export interface TransitionGroupContext {
  isMounting: boolean;
}
