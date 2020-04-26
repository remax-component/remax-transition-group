import { useContext, useState, useRef, useEffect } from "react";
import { usePrevious, useMount, useUpdateEffect } from "react-use";
import TransitionGroupContext from "./TransitionGroupContext";
import { TransitionStatus, Timeout, UseTransitionParams } from "./types";

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
    appear = timeout.appear ?? enter;
  } else {
    appear = exit = enter = exit = timeout;
  }

  return {
    exit,
    enter,
    appear,
  };
}

interface CancelableCallback {
  timeout?: number;
  handler?: () => unknown;
}

export default function useTransition(
  props: UseTransitionParams
): TransitionStatus {
  const {
    appear: propsAppear = false,
    enter = true,
    exit = true,
    timeout = 0,
    onEnter,
    onEntering,
    onEntered,
    onExit,
    onExited,
    onExiting,
    in: inStatus = false,
    unmountOnExit = false,
    mountOnEnter = false,
  } = props;

  const parentGroup = useContext(TransitionGroupContext);
  const transitionEndCallbacksRef = useRef({
    onEnter,
    onEntering,
    onEntered,
    onExit,
    onExiting,
    onExited,
  });
  const appearStatusRef = useRef<TransitionStatus | null>(null);
  const [nextCallback, setNextCallback] = useState<CancelableCallback | null>(
    null
  );

  useEffect(() => {
    if (nextCallback === null) return;
    const { timeout, handler } = nextCallback;
    if (!handler) return;

    const timerId = setTimeout(handler, timeout);
    return (): void => {
      clearTimeout(timerId);
    };
  }, [nextCallback]);

  transitionEndCallbacksRef.current = {
    onEnter,
    onEntering,
    onEntered,
    onExit,
    onExiting,
    onExited,
  };

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

  const prevPropsRef = useRef<UseTransitionParams | null>(null);
  const prevProps = prevPropsRef.current;
  const prevStatus = usePrevious(status);

  if (prevProps !== props) {
    prevPropsRef.current = props;
    if (inStatus && prevStatus === TransitionStatus.UNMOUNTED) {
      setStatus(TransitionStatus.EXITED);
    }
  }

  const onTransitionEnd = (timeout = 0, callback: () => unknown): void => {
    setNextCallback({
      timeout,
      handler: callback,
    });
  };

  const performEnter = (mounting: boolean): void => {
    const appearing = parentGroup ? parentGroup.isMounting : mounting;
    const timeouts = getTimeouts(timeout);
    const enterTimeout = appearing ? timeouts.appear : timeouts.enter;
    if (!mounting && !enter) {
      setStatus(TransitionStatus.ENTERED);
      setNextCallback({
        handler: () => {
          transitionEndCallbacksRef.current.onEntered?.(false);
        },
      });
      return;
    }

    transitionEndCallbacksRef.current.onEnter?.(appearing);

    setStatus(TransitionStatus.ENTERING);

    setNextCallback({
      handler: () => {
        transitionEndCallbacksRef.current.onEntering?.(appearing);
        onTransitionEnd(enterTimeout, () => {
          setStatus(TransitionStatus.ENTERED);
          setNextCallback({
            handler: () => {
              transitionEndCallbacksRef.current.onEntered?.(appearing);
            },
          });
        });
      },
    });
  };

  const performExit = (): void => {
    const timeouts = getTimeouts(timeout);

    if (!exit) {
      setStatus(TransitionStatus.EXITED);
      setNextCallback({
        handler: () => {
          transitionEndCallbacksRef.current.onExited?.();
        },
      });
      return;
    }

    transitionEndCallbacksRef.current.onExit?.();
    setStatus(TransitionStatus.EXITING);
    setNextCallback({
      handler: () => {
        transitionEndCallbacksRef.current.onExiting?.();
        onTransitionEnd(timeouts.exit, () => {
          setStatus(TransitionStatus.EXITED);
          transitionEndCallbacksRef.current.onExited?.();
        });
      },
    });
  };

  const updateStatus = (
    mounting: boolean,
    nextStatus: TransitionStatus | null
  ): void => {
    if (nextStatus !== null) {
      if (nextStatus === TransitionStatus.ENTERING) {
        performEnter(mounting);
      } else {
        performExit();
      }
    } else if (unmountOnExit && status === TransitionStatus.EXITED) {
      setStatus(TransitionStatus.UNMOUNTED);
    }
  };

  useMount(() => {
    updateStatus(true, appearStatusRef.current);
  });

  useUpdateEffect(() => {
    if (prevProps === props && status === prevStatus) return;
    let nextStatus: TransitionStatus | null = null;

    if (
      props.in &&
      status !== TransitionStatus.ENTERING &&
      status !== TransitionStatus.ENTERED
    ) {
      nextStatus = TransitionStatus.ENTERING;
    }

    if (
      !props.in &&
      (status === TransitionStatus.ENTERING ||
        status === TransitionStatus.ENTERED)
    ) {
      nextStatus = TransitionStatus.EXITING;
    }

    updateStatus(false, nextStatus);
  }, [props, prevProps, status, updateStatus, status, prevStatus]);

  return status;
}
