import { renderHook, act } from "@testing-library/react-hooks";
import { useTransition, TransitionStatus, UseTransitionParams } from "../dist/";

const { ENTERED, ENTERING, EXITED, EXITING, UNMOUNTED } = TransitionStatus;

describe("Transition", () => {
  it("appearing timeout", () => {
    const { result } = renderHook(() =>
      useTransition({
        in: true,
        timeout: 0,
        onEnter: () => {
          throw new Error("should not Enter");
        },
      })
    );

    expect(result.current).toBe(ENTERED);
  });

  it("should transition on mount with `appear`", (done) => {
    renderHook(() =>
      useTransition({
        in: true,
        timeout: 0,
        appear: false,
        onEnter: () => {
          throw Error("Animated");
        },
      })
    );

    renderHook(() =>
      useTransition({
        in: true,
        appear: true,
        timeout: 0,
        onEnter: () => {
          done();
        },
      })
    );
  });

  it("should mount/unmount immediately if not have enter/exit timeout", () => {
    const { result, rerender } = renderHook((params) => useTransition(params), {
      initialProps: {
        in: true,
        timeout: {},
      },
    });

    expect(result.current).toBe(ENTERED);

    let calledAfterTimeout = false;
    setTimeout(() => {
      calledAfterTimeout = true;
    }, 10);

    rerender({
      in: false,
      onExited: () => {
        expect(result.current).toBe(EXITED);
        if (!calledAfterTimeout) {
          done();
        } else {
          throw new Error("Wrong timeout");
        }
      },
    });
  });

  describe("entering", () => {
    it("should fire callbacks", (done) => {
      let callOrder = [];
      let onEnter = jest.fn(() => callOrder.push("onEnter"));
      let onEntering = jest.fn(() => callOrder.push("onEntering"));

      const { result, rerender } = renderHook(
        (params) => useTransition(params),
        {
          initialProps: {
            timeout: 10,
          },
        }
      );

      expect(result.current).toBe(EXITED);

      rerender({
        in: true,
        onEnter,
        onEntering,

        onEntered() {
          expect(onEnter).toHaveBeenCalledTimes(1);
          expect(onEntering).toHaveBeenCalledTimes(1);
          expect(callOrder).toEqual(["onEnter", "onEntering"]);
          done();
        },
      });
    });

    it("should move to each transition state", (done) => {
      let count = 0;
      const { result, rerender } = renderHook(
        (params) => useTransition(params),
        {
          initialProps: {
            in: false,
            timeout: 10,
          },
        }
      );

      expect(result.current).toBe(EXITED);
      rerender({
        in: true,
        onEnter() {
          count++;
          expect(result.current).toBe(EXITED);
        },
        onEntering() {
          count++;
          expect(result.current).toBe(ENTERING);
        },
        onEntered() {
          expect(result.current).toEqual(ENTERED);
          expect(count).toBe(2);
          done();
        },
      });
    });
  });

  describe("exiting", () => {
    it("should fire callbacks", (done) => {
      let callOrder = [];
      let onExit = jest.fn(() => callOrder.push("onExit"));
      let onExiting = jest.fn(() => callOrder.push("onExiting"));

      const { result, rerender } = renderHook(
        (params) => useTransition(params),
        {
          initialProps: {
            in: true,
            timeout: 10,
          },
        }
      );
      expect(result.current).toBe(ENTERED);

      rerender({
        in: false,
        onExit,
        onExiting,

        onExited() {
          expect(onExit).toHaveBeenCalledTimes(1);
          expect(onExiting).toHaveBeenCalledTimes(1);
          expect(callOrder).toEqual(["onExit", "onExiting"]);
          done();
        },
      });
    });

    it("should move to each transition state", (done) => {
      let count = 0;
      const { result, rerender } = renderHook(
        (params) => useTransition(params),
        {
          initialProps: {
            in: true,
            timeout: 10,
          },
        }
      );

      expect(result.current).toBe(ENTERED);
      rerender({
        in: false,
        onExit() {
          count++;
          expect(result.current).toBe(ENTERED);
        },
        onExiting() {
          count++;
          expect(result.current).toBe(EXITING);
        },
        onExited() {
          expect(result.current).toEqual(EXITED);
          expect(count).toBe(2);
          done();
        },
      });
    });
  });

  describe("mountOnEnter", () => {
    it("should mount when entering", (done) => {
      const initialProps = {
        in: false,
        mountOnEnter: true,
        onEnter() {
          expect(result.current).toBe(EXITED);
          done();
        },
      };

      const { result, rerender } = renderHook(
        (params) => useTransition(params),
        {
          initialProps,
        }
      );

      expect(result.current).toBe(UNMOUNTED);

      rerender({
        ...initialProps,
        in: true,
      });
    });

    it("should stay mounted after exiting", (done) => {
      let initialProps;

      const { result, rerender } = renderHook(
        (params) => useTransition(params),
        {
          initialProps: (initialProps = {
            in: false,
            mountOnEnter: true,
            onEntered() {
              expect(result.current).toBe(ENTERED);
              rerender({ ...initialProps, in: false });
            },

            onExited() {
              expect(result.current).toBe(EXITED);
              done();
            },
          }),
        }
      );

      rerender({ ...initialProps, in: true });
    });
  });

  describe("should unmount after exiting", () => {
    it("should mount when entering", (done) => {
      const initialProps = {
        in: false,
        unmountOnExit: true,
        onEnter() {
          expect(result.current).toBe(EXITED);
          done();
        },
      };

      const { result, rerender } = renderHook(
        (params) => useTransition(params),
        {
          initialProps,
        }
      );

      expect(result.current).toBe(UNMOUNTED);

      rerender({
        ...initialProps,
        in: true,
      });
    });

    it("should unmount after exiting", (done) => {
      let initialProps;

      const { result, rerender } = renderHook(
        (params) => useTransition(params),
        {
          initialProps: (initialProps = {
            in: true,
            unmountOnExit: true,
            onExited() {
              setTimeout(() => {
                expect(result.current).toBe(UNMOUNTED);
                done();
              }, 0);
            },
          }),
        }
      );

      rerender({ ...initialProps, in: false });
    });
  });
});
