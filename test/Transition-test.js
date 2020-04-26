import React from "react";
import TestRenderer, { act, create } from "react-test-renderer";
import { Transition, TransitionStatus } from "../dist/";

/** @type {TestRenderer.ReactTestRenderer} */
let wrapper;

describe("Transition", () => {
  it("should pass filtered props to children", () => {
    const Child2 = () => <div>child</div>;
    act(() => {
      wrapper = create(
        <Transition
          foo="foo"
          bar="bar"
          in
          mountOnEnter
          unmountOnExit
          appear
          enter
          exit
          timeout={0}
          onEnter={() => {}}
          onEntering={() => {}}
          onEntered={() => {}}
          onExit={() => {}}
          onExiting={() => {}}
          onExited={() => {}}
        >
          <Child2 />
        </Transition>
      );
    });

    expect(wrapper.root.findByType(Child2).props).toEqual({
      foo: "foo",
      bar: "bar",
    });
  });
});
