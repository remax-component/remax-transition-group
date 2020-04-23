import React from "react";
import TestRenderer, { act, create } from "react-test-renderer";
import { Transition, TransitionStatus } from "../dist/";

/** @type {TestRenderer.ReactTestRenderer} */
let wrapper;

describe("Transition", () => {
  describe("appearing timeout", () => {
    it("should use enter timeout if appear not set", (done) => {
      act(() => {
        let calledBeforeEntered = false;
        setTimeout(() => {
          calledBeforeEntered = true;
        }, 10);

        wrapper = create(
          <Transition in={true} timeout={{ enter: 20, exit: 10 }} appear>
            <div />
          </Transition>
        );

        wrapper.update(
          <Transition
            in={true}
            timeout={{ enter: 20, exit: 10 }}
            appear
            onEntered={() => {
              if (calledBeforeEntered) {
                done();
              } else {
                throw new Error("wrong timeout");
              }
            }}
          >
            <div />
          </Transition>
        );
      });
    });

    it("should use appear timeout if appear is set", (done) => {
      act(() => {
        wrapper = create(
          <Transition
            in={true}
            timeout={{ enter: 80, exit: 40, appear: 20 }}
            appear
          >
            <div />
          </Transition>
        );

        let isCausedLate = false;
        setTimeout(() => {
          isCausedLate = true;
        }, 100);
        wrapper.update(
          <Transition
            in={true}
            timeout={{ enter: 200, exit: 200, appear: 10 }}
            onEntered={() => {
              if (isCausedLate) {
                throw new Error("wrong timeout");
              } else {
                done();
              }
            }}
            appear
          >
            <div />
          </Transition>
        );
      });
    });
  });

  describe("entering", () => {
    /** @type {TestRenderer.ReactTestRenderer} */
    let wrapper;

    beforeEach(() => {
      act(() => {
        wrapper = create(
          <Transition timeout={10}>{(status) => status}</Transition>
        );
      });
    });
    it("should fire callbacks", (done) => {
      let callOrder = [];
      let onEnter = jest.fn(() => callOrder.push("onEnter"));
      let onEntering = jest.fn(() => callOrder.push("onEntering"));
      expect(wrapper.toJSON()).toBe(TransitionStatus.EXITED);

      const onEntered = () => {
        expect(onEnter).toHaveBeenCalledTimes(1);
        expect(onEntering).toHaveBeenCalledTimes(1);
        expect(callOrder).toEqual(["onEnter", "onEntering"]);
        done();
      };

      act(() => {
        wrapper.update(
          <Transition
            timeout={10}
            in={true}
            onEnter={onEnter}
            onEntering={onEntering}
            onEntered={onEntered}
          >
            {(status) => status}
          </Transition>
        );
      });
    });

    it("should move to each transition state", (done) => {
      let count = 0;
      expect(wrapper.toJSON()).toEqual(TransitionStatus.EXITED);

      act(() => {
        wrapper.update(
          <Transition
            in={true}
            timeout={10}
            onEnter={() => {
              count++;
              expect(wrapper.toJSON()).toEqual(TransitionStatus.EXITED);
            }}
            onEntering={() => {
              count++;
              expect(wrapper.toJSON()).toEqual(TransitionStatus.ENTERING);
            }}
            onEntered={() => {
              expect(wrapper.toJSON()).toEqual(TransitionStatus.ENTERED);
              expect(count).toEqual(2);
              done();
            }}
          >
            {(status) => status}
          </Transition>
        );
      });
    });
  });

  describe("exiting", () => {
    /** @type {TestRenderer.ReactTestRenderer} */
    let wrapper;

    beforeEach(() => {
      act(() => {
        wrapper = create(
          <Transition in timeout={10}>
            {(status) => status}
          </Transition>
        );
      });
    });
    it("should fire callbacks", (done) => {
      let callOrder = [];
      let onExit = jest.fn(() => callOrder.push("onEnter"));
      let onExiting = jest.fn(() => callOrder.push("onEntering"));
      expect(wrapper.toJSON()).toBe(TransitionStatus.ENTERED);

      const onEntered = () => {
        expect(onExit).toHaveBeenCalledTimes(1);
        expect(onExiting).toHaveBeenCalledTimes(1);
        expect(callOrder).toEqual(["onEnter", "onEntering"]);
        done();
      };

      act(() => {
        wrapper.update(
          <Transition
            timeout={10}
            in={false}
            onExit={onExit}
            onExiting={onExiting}
            onExited={onEntered}
          >
            {(status) => status}
          </Transition>
        );
      });
    });

    it("should move to each transition state", (done) => {
      let count = 0;
      expect(wrapper.toJSON()).toEqual(TransitionStatus.ENTERED);

      act(() => {
        wrapper.update(
          <Transition
            in={false}
            timeout={10}
            onExit={() => {
              count++;
              expect(wrapper.toJSON()).toEqual(TransitionStatus.ENTERED);
            }}
            onExiting={() => {
              count++;
              expect(wrapper.toJSON()).toEqual(TransitionStatus.EXITING);
            }}
            onExited={() => {
              expect(wrapper.toJSON()).toEqual(TransitionStatus.EXITED);
              expect(count).toEqual(2);
              done();
            }}
          >
            {(status) => status}
          </Transition>
        );
      });
    });
  });

  it("should not transition on mount", () => {
    act(() => {
      wrapper = create(
        <Transition
          in
          timeout={0}
          onEnter={() => {
            throw new Error("should not Enter");
          }}
        >
          {(state) => state}
        </Transition>
      );
    });

    expect(wrapper.toJSON()).toEqual(TransitionStatus.ENTERED);
  });

  it("should transition on mount with `appear`", (done) => {
    act(() => {
      wrapper = create(
        <Transition
          in
          timeout={0}
          onEnter={() => {
            throw Error("Animated!");
          }}
        >
          <div />
        </Transition>
      );
    });

    act(() => {
      wrapper = create(
        <Transition in appear timeout={0} onEnter={() => done()}>
          <div />
        </Transition>
      );
    });
  });

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

  it("should mount/unmount immediately if not have enter/exit timeout", () => {
    act(() => {
      wrapper = create(
        <Transition in timeout={{}}>
          {(state) => state}
        </Transition>
      );
    });

    expect(wrapper.toJSON()).toEqual(TransitionStatus.ENTERED);

    let calledAfterTimeout = false;
    setTimeout(() => {
      calledAfterTimeout = true;
    }, 10);

    act(() => {
      wrapper.update(
        <Transition
          in={false}
          timeout={{}}
          onEntered={() => {
            expect(wrapper.toJSON()).toEqual(TransitionStatus.EXITED);
            if (!calledAfterTimeout) {
              return done();
            }
            throw new Error("wrong timeout");
          }}
        >
          {(state) => state}
        </Transition>
      );
    });
  });
});
