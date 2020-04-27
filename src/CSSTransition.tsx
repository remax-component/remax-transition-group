import React, {
  FC,
  useCallback,
  ReactElement,
  useReducer,
  useMemo,
} from "react";
import Transition, { TransitionProps } from "./Transition";
import clsx from "clsx";
import { ClassNames, ObjectClassNames } from "./types";

export interface CSSTransitionProps extends TransitionProps {
  classNames?: string | ClassNames;
  children: ReactElement<{ className: string }>;
  className?: string;
}

type ActionType = "ADD_CLASS" | "REMOVE_CLASS";
interface PhaseModifyClassPayload {
  base?: string;
  active?: string;
  done?: string;
}

type Action =
  | {
      type: "ADD_CLASS";
      payload?: string;
    }
  | {
      type: "REMOVE_CLASS";
      payload: PhaseModifyClassPayload;
    };

const phaseClassNameReducer = (prev: string, action: Action): string => {
  // After split, empty string will be `['']`
  const prevClassNameList = prev ? prev.split(/\s/) : [];
  if (!action.payload) return prev;

  if (action.type === "ADD_CLASS") {
    return clsx(prevClassNameList, action.payload);
  }

  if (action.type === "REMOVE_CLASS") {
    const { active, done, base } = action.payload;
    return clsx(
      prevClassNameList.filter(
        (cls) => cls !== active && cls !== base && cls !== done
      )
    );
  }

  return prev;
};

const CSSTransition: FC<CSSTransitionProps> = ({
  children,
  className,
  classNames = "",
  ...props
}) => {
  const [phaseClassName, dispatch] = useReducer(phaseClassNameReducer, "");

  const getClassNames = useCallback(
    (type: "appear" | "enter" | "exit") => {
      const isStringClassNames = typeof classNames === "string";
      const prefix = isStringClassNames && classNames ? `${classNames}-` : "";
      const classnamesObject = classNames as ObjectClassNames;

      const baseClassName = isStringClassNames
        ? `${prefix}${type}`
        : classnamesObject[type as keyof ObjectClassNames];

      const activeClassName = isStringClassNames
        ? `${baseClassName}-active`
        : classnamesObject[`${type}Active` as keyof ObjectClassNames];

      const doneClassName = isStringClassNames
        ? `${baseClassName}-done`
        : classnamesObject[`${type}Done` as keyof ObjectClassNames];

      return {
        base: baseClassName,
        active: activeClassName,
        done: doneClassName,
      };
    },
    [classNames]
  );

  const { enterClassNames, exitClassNames, appearClassNames } = useMemo(() => {
    const enterClassNames = getClassNames("enter");
    const exitClassNames = getClassNames("exit");
    const appearClassNames = getClassNames("appear");
    return {
      enterClassNames,
      exitClassNames,
      appearClassNames,
    };
  }, [classNames]);

  // const addClassName =

  const onEnter = useCallback(
    (appearing: boolean) => {
      const currentClassNames = appearing ? appearClassNames : enterClassNames;
      dispatch({ type: "REMOVE_CLASS", payload: exitClassNames });
      dispatch({ type: "ADD_CLASS", payload: currentClassNames.base });
      props.onEnter?.(appearing);
    },
    [props.onEnter, getClassNames, appearClassNames, exitClassNames]
  );

  const onEntering = useCallback(
    (appearing: boolean) => {
      const currentClassNames = appearing ? appearClassNames : enterClassNames;
      dispatch({ payload: currentClassNames.active, type: "ADD_CLASS" });
      props.onEntering?.(appearing);
    },
    [props.onEntering, getClassNames, appearClassNames, enterClassNames]
  );

  const onEntered = useCallback(
    (appearing: boolean) => {
      const currentClassNames = appearing ? appearClassNames : enterClassNames;
      dispatch({ type: "REMOVE_CLASS", payload: currentClassNames });
      if (appearing) {
        dispatch({
          type: "ADD_CLASS",
          payload: clsx(appearClassNames.done, enterClassNames.done),
        });
      } else {
        dispatch({ type: "ADD_CLASS", payload: currentClassNames.done });
      }
      props.onEntered?.(appearing);
    },
    [props.onEntered, getClassNames, appearClassNames, enterClassNames]
  );

  const onExit = useCallback(() => {
    dispatch({ type: "REMOVE_CLASS", payload: appearClassNames });
    dispatch({ type: "REMOVE_CLASS", payload: enterClassNames });
    dispatch({ type: "ADD_CLASS", payload: exitClassNames.base });

    props.onExit?.();
  }, [
    props.onExit,
    getClassNames,
    appearClassNames,
    enterClassNames,
    exitClassNames,
  ]);

  const onExiting = useCallback(() => {
    dispatch({ type: "ADD_CLASS", payload: exitClassNames.active });
    props.onExiting?.();
  }, [props.onExiting, getClassNames, exitClassNames]);

  const onExited = useCallback(() => {
    dispatch({ type: "REMOVE_CLASS", payload: exitClassNames });
    dispatch({ type: "ADD_CLASS", payload: exitClassNames.done });
    props.onExited?.();
  }, [props.onExited, getClassNames, exitClassNames]);

  const child = React.Children.only(children);

  return (
    <Transition
      {...props}
      onEnter={onEnter}
      onEntered={onEntered}
      onEntering={onEntering}
      onExit={onExit}
      onExiting={onExiting}
      onExited={onExited}
    >
      {React.cloneElement(child, {
        className: clsx(child.props?.className, className, phaseClassName),
      })}
    </Transition>
  );
};

export default CSSTransition;
