import React, { ReactNode, ReactElement, FC } from "react";
import omit from "lodash.omit";
import { UseTransitionParams, TransitionStatus } from "./types";
import useTransition from "./useTransition";
import TransitionGroupContext from "./TransitionGroupContext";

export interface TransitionProps extends UseTransitionParams {
  children: ((state: TransitionStatus) => ReactNode) | ReactElement;
}

const Transition: FC<TransitionProps> = (props) => {
  const status = useTransition(props);
  if (status === TransitionStatus.UNMOUNTED) {
    return null;
  }

  const { children } = props;

  if (typeof children === "function") {
    return (
      <TransitionGroupContext.Provider value={null}>
        {children(status)}
      </TransitionGroupContext.Provider>
    );
  }

  const childProps = omit(props, [
    "children",
    "in",
    "mountOnEnter",
    "unmountOnExit",
    "appear",
    "enter",
    "exit",
    "timeout",
    "onEnter",
    "onEntering",
    "onEntered",
    "onExit",
    "onExiting",
    "onExited",
  ]);

  const child = React.Children.only(children) as ReactElement;
  return (
    <TransitionGroupContext.Provider value={null}>
      {React.cloneElement(child, childProps)}
    </TransitionGroupContext.Provider>
  );
};

export default Transition;
