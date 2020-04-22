import { useContext, useState, useRef } from "react";
import { useNativeEffect } from "remax";
import { usePrevious } from "react-use";
import TransitionGroupContext from "./TransitionGroupContext";
import { TransitionStatus, Timeout } from "./types";

function getTimeouts(
  timeout: Timeout
): {
  exit: number | undefined;
  enter: number | undefined;
  appear: number | undefined;
} {
  let exit: number | undefined,
    enter: number | undefined,
    appear: number | undefined;
  if (timeout !== null && typeof timeout !== "number") {
    exit = timeout.exit;
    enter = timeout.enter;
    exit = timeout.exit;
  } else {
    exit = enter = exit = timeout;
  }

  return {
    exit,
    enter,
    appear,
  };
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

export default function useTransition({
  appear: propsAppear,
  enter,
  exit,
  timeout = 0,
  onEnter,
  onEntering,
  onEntered,
  onExit,
  onExited,
  onExiting,
  in: inStatus,
  unmountOnExit,
  mountOnEnter,
}: UseTransitionParams): TransitionStatus {
  const parentGroup = useContext(TransitionGroupContext);
  const appearStatusRef = useRef<TransitionStatus | null>(null);
  const nextCallbackRef = useRef<(() => unknown) | null>(null);

  const [status, setStatus] = useState<TransitionStatus>(() => {
    let initialStatus: TransitionStatus;
    if (inStatus) {
      const appear = parentGroup?.isMounting ? enter : propsAppear;
      if (appear) {
        initialStatus = TransitionStatus.EXITED;
        appearStatusRef.current = TransitionStatus.ENTERING;
      } else {
        initialStatus = TransitionStatus.ENTERED;
      }
    } else {
      if (unmountOnExit || mountOnEnter) {
        initialStatus = TransitionStatus.UNMOUNTED;
      } else {
        initialStatus = TransitionStatus.EXITED;
      }
    }

    return initialStatus;
  });

  const prevStatus = usePrevious(status);

  if (inStatus && prevStatus === TransitionStatus.UNMOUNTED) {
    setStatus(TransitionStatus.EXITED);
  }

  const safeSetStatus = (
    status: TransitionStatus,
    callback: () => unknown
  ): void => {
    setStatus(status);
    nextCallbackRef.current = callback;
  };
  // 用于执行`safeSetStatus`的回调
  useNativeEffect(() => {
    if (prevStatus === undefined) return;

    nextCallbackRef.current?.();
  }, [status, prevStatus]);

  const onTransitionEnd = (timeout = 0, callback: () => unknown): void => {
    nextCallbackRef.current = callback;
    setTimeout(nextCallbackRef.current, timeout);
  };

  const performEnter = (mounting: boolean): void => {
    const timeouts = getTimeouts(timeout);
    const appearing = parentGroup?.isMounting
      ? parentGroup.isMounting
      : mounting;
    const enterTimeout = appearing ? timeouts.appear : timeouts.enter;

    if (!mounting && !enter) {
      safeSetStatus(TransitionStatus.ENTERED, () => {
        onEntered?.(false);
      });
      return;
    }

    onEnter?.(appearing);

    safeSetStatus(TransitionStatus.ENTERING, () => {
      onEntering?.(appearing);
      onTransitionEnd(enterTimeout, () => {
        onEntered?.(appearing);
      });
    });
  };

  const performExit = (): void => {
    const timeouts = getTimeouts(timeout);
    if (!exit) {
      safeSetStatus(TransitionStatus.EXITED, () => {
        onExit?.();
      });
      return;
    }

    safeSetStatus(TransitionStatus.EXITING, () => {
      onExiting?.();

      onTransitionEnd(timeouts.exit, () => {
        safeSetStatus(TransitionStatus.EXITED, () => {
          onExited?.();
        });
      });
    });
  };

  const updateStatus = (
    mounting: boolean,
    nextStatus: TransitionStatus | null
  ): void => {
    if (nextStatus !== null) {
      nextCallbackRef.current = null;
      if (nextStatus === TransitionStatus.ENTERING) {
        performEnter(mounting);
      } else {
        performExit();
      }
    } else if (unmountOnExit && status === TransitionStatus.EXITED) {
      setStatus(TransitionStatus.UNMOUNTED);
    }
  };

  useNativeEffect(() => {
    updateStatus(true, appearStatusRef.current);
  }, []);

  useNativeEffect(() => {
    let nextStatus: TransitionStatus | null = null;

    if (inStatus) {
      if (inStatus) {
        if (
          status !== TransitionStatus.ENTERING &&
          status !== TransitionStatus.ENTERED
        ) {
          nextStatus = TransitionStatus.ENTERING;
        }
      } else {
        if (
          status === TransitionStatus.ENTERING ||
          status === TransitionStatus.ENTERED
        ) {
          nextStatus = TransitionStatus.EXITED;
        }
      }
    }

    updateStatus(false, nextStatus);
  }, [inStatus, status]);

  return status;
}
