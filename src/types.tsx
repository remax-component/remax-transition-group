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

export interface UseTransitionParams {
  in?: boolean;
  appear?: boolean;
  enter?: boolean;
  exit?: boolean;
  timeout?: Timeout;
  onEnter?: (isAppearing: boolean) => unknown;
  onEntering?: (isAppearing: boolean) => unknown;
  onEntered?: (isAppearing: boolean) => unknown;

  onExit?: () => unknown;
  onExiting?: () => unknown;
  onExited?: () => unknown;

  unmountOnExit?: boolean;
  mountOnEnter?: boolean;
}
