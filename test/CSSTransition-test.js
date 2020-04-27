import React from "react";
import { act, create, ReactTestRenderer } from "react-test-renderer";
import { CSSTransition } from "../dist";
const ClassNameReceiver = ({ className }) => className;

/** @type {ReactTestRenderer} */
let wrapper;

describe("CSSTransition", () => {
  it("should flush new props to the DOM before initiating a transition", (done) => {
    const props = {
      in: false,
      timeout: 0,
      classNames: "test",
      onEnter() {
        expect(wrapper.toJSON()).toBe("test-class");
        expect(wrapper.toJSON()).not.toBe("test-entering");
        done();
      },
    };
    act(() => {
      wrapper = create(
        <CSSTransition {...props}>
          <ClassNameReceiver />
        </CSSTransition>
      );
    });

    act(() => {
      wrapper.update(
        <CSSTransition {...props} in={true} className="test-class">
          <ClassNameReceiver />
        </CSSTransition>
      );
    });
  });

  describe("entering", () => {
    const props = {
      timeout: 10,
      in: false,
      classNames: "test",
    };

    beforeEach(() => {
      act(() => {
        wrapper = create(
          <CSSTransition {...props}>
            <ClassNameReceiver />
          </CSSTransition>
        );
      });
    });

    it("should apply classes at each transition state", (done) => {
      let count = 0;
      act(() => {
        wrapper.update(
          <CSSTransition
            {...props}
            in
            onEnter={() => {
              setTimeout(() => {
                count++;
                expect(wrapper.toJSON()).toEqual("test-enter");
              });
            }}
            onEntering={() => {
              count++;
              expect(wrapper.toJSON()).toEqual("test-enter test-enter-active");
            }}
            onEntered={() => {
              expect(wrapper.toJSON()).toEqual("test-enter-done");
              expect(count).toEqual(2);
              done();
            }}
          >
            <ClassNameReceiver />
          </CSSTransition>
        );
      });
    });

    it("should apply custom classNames names", (done) => {
      let count = 0;
      const props = {
        timeout: 10,
        classNames: {
          enter: "custom",
          enterActive: "custom-super-active",
          enterDone: "custom-super-done",
        },
      };
      act(() => {
        wrapper = create(
          <CSSTransition {...props}>
            <ClassNameReceiver />
          </CSSTransition>
        );
      });

      act(() => {
        wrapper.update(
          <CSSTransition
            {...props}
            in
            onEnter={() => {
              setTimeout(() => {
                count++;
                expect(wrapper.toJSON()).toBe("custom");
              });
            }}
            onEntering={() => {
              count++;
              expect(wrapper.toJSON()).toEqual("custom custom-super-active");
            }}
            onEntered={() => {
              expect(wrapper.toJSON()).toEqual("custom-super-done");
              expect(count).toEqual(2);
              done();
            }}
          >
            <ClassNameReceiver />
          </CSSTransition>
        );
      });
    });
  });

  describe("appearing", () => {
    it("should apply appear classes at each transition state", (done) => {
      let count = 0;
      wrapper = create(
        <CSSTransition
          timeout={10}
          classNames="appear-test"
          in={true}
          appear={true}
          onEnter={(isAppearing) => {
            setTimeout(() => {
              count++;
              expect(isAppearing).toEqual(true);
              expect(wrapper.toJSON()).toEqual("appear-test-appear");
            });
          }}
          onEntering={(isAppearing) => {
            count++;
            expect(isAppearing).toEqual(true);
            expect(wrapper.toJSON()).toEqual(
              "appear-test-appear appear-test-appear-active"
            );
          }}
          onEntered={(isAppearing) => {
            expect(isAppearing).toEqual(true);
            expect(wrapper.toJSON()).toEqual(
              "appear-test-appear-done appear-test-enter-done"
            );
            expect(count).toEqual(2);
            done();
          }}
        >
          <ClassNameReceiver />
        </CSSTransition>
      );
    });

    it('should lose the "*-appear-done" class after leaving and entering again', (done) => {
      const props = {
        timeout: 10,
        classNames: "appear-test",
        in: true,
      };
      act(() => {
        wrapper = create(
          <CSSTransition
            {...props}
            onEntered={() => {
              act(() => {
                wrapper.update(
                  <CSSTransition
                    {...props}
                    in={false}
                    onEntered={() => {}}
                    onExited={() => {
                      expect(wrapper.toJSON()).toBe("appear-test-exit-done");
                      done();
                    }}
                  >
                    <ClassNameReceiver />
                  </CSSTransition>
                );
              });
            }}
          >
            <ClassNameReceiver />
          </CSSTransition>
        );
      });
    });

    it("should not be appearing in normal enter mode", (done) => {
      let count = 0;
      const props = {
        timeout: 10,
        classNames: "not-appear-test",
        appear: true,
      };
      act(() => {
        wrapper = create(
          <CSSTransition {...props}>
            <ClassNameReceiver />
          </CSSTransition>
        );
      });

      act(() => {
        wrapper.update(
          <CSSTransition
            {...props}
            in
            onEnter={(isAppearing) => {
              setTimeout(() => {
                count++;
                expect(isAppearing).toBeFalsy();
                expect(wrapper.toJSON()).toBe("not-appear-test-enter");
              });
            }}
            onEntering={(isAppearing) => {
              count++;
              expect(isAppearing).toBeFalsy();
              expect(wrapper.toJSON()).toEqual(
                "not-appear-test-enter not-appear-test-enter-active"
              );
            }}
            onEntered={(isAppearing) => {
              expect(isAppearing).toBeFalsy();
              expect(wrapper.toJSON()).toBe("not-appear-test-enter-done");
              expect(count).toEqual(2);
              done();
            }}
          >
            <ClassNameReceiver />
          </CSSTransition>
        );
      });
    });

    it("should not enter the transition states when appear=false", () => {
      act(() => {
        wrapper = create(
          <CSSTransition
            timeout={10}
            classNames="appear-fail-test"
            in={false}
            onEnter={() => {
              throw Error("Enter called!");
            }}
            onEntering={() => {
              throw Error("Entring called!");
            }}
            onEntered={() => {
              throw Error("Entred called!");
            }}
          >
            <ClassNameReceiver />
          </CSSTransition>
        );
      });
    });
  });

  describe("exiting", () => {
    const props = {
      in: true,
      timeout: 10,
      classNames: "test",
    };
    beforeEach(() => {
      act(() => {
        wrapper = create(
          <CSSTransition {...props}>
            <ClassNameReceiver />
          </CSSTransition>
        );
      });
    });

    it("should apply classes at each transition state", (done) => {
      let count = 0;

      act(() => {
        wrapper.update(
          <CSSTransition
            {...props}
            in={false}
            onExit={() => {
              setTimeout(() => {
                count++;
                expect(wrapper.toJSON()).toEqual("test-exit");
              });
            }}
            onExiting={() => {
              count++;
              expect(wrapper.toJSON()).toEqual("test-exit test-exit-active");
            }}
            onExited={() => {
              expect(wrapper.toJSON()).toEqual("test-exit-done");
              expect(count).toEqual(2);
              done();
            }}
          >
            <ClassNameReceiver />
          </CSSTransition>
        );
      });
    });

    it("should apply custom classNames names", (done) => {
      let count = 0;
      const props = {
        in: true,
        timeout: 10,
        classNames: {
          exit: "custom",
          exitActive: "custom-super-active",
          exitDone: "custom-super-done",
        },
      };
      act(() => {
        wrapper = create(
          <CSSTransition {...props}>
            <ClassNameReceiver />
          </CSSTransition>
        );
      });

      act(() => {
        wrapper.update(
          <CSSTransition
            {...props}
            in={false}
            onExit={() => {
              setTimeout(() => {
                count++;
                expect(wrapper.toJSON()).toEqual("custom");
              });
            }}
            onExiting={() => {
              count++;
              expect(wrapper.toJSON()).toEqual("custom custom-super-active");
            }}
            onExited={() => {
              expect(wrapper.toJSON()).toEqual("custom-super-done");
              expect(count).toEqual(2);
              done();
            }}
          >
            <ClassNameReceiver />
          </CSSTransition>
        );
      });
    });

    it("should support empty prefix", (done) => {
      let count = 0;
      const props = {
        in: true,
        timeout: 10,
      };
      act(() => {
        wrapper = create(
          <CSSTransition {...props}>
            <ClassNameReceiver />
          </CSSTransition>
        );
      });

      act(() => {
        wrapper.update(
          <CSSTransition
            {...props}
            in={false}
            onExit={() => {
              setTimeout(() => {
                count++;
                expect(wrapper.toJSON()).toEqual("exit");
              });
            }}
            onExiting={() => {
              count++;
              expect(wrapper.toJSON()).toEqual("exit exit-active");
            }}
            onExited={() => {
              expect(wrapper.toJSON()).toEqual("exit-done");
              expect(count).toEqual(2);
              done();
            }}
          >
            <ClassNameReceiver />
          </CSSTransition>
        );
      });
    });
  });

  describe("reentering", () => {
    it("should remove dynamically applied classes", (done) => {
      // TODO: After `<TransitionGroup />` finished, complete this case
      done();
    });
  });
});
