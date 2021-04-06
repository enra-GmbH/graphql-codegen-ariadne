import { callable } from "./python-strings";

describe("callable", () => {
  test("no arguments", () => {
    expect(callable({argumentTypes: [], retVal: "None"})).toEqual("Callable[[], None]");
  });

  test("two arguments", () => {
    expect(callable({argumentTypes: ["int", "int"], retVal: "None"})).toEqual("Callable[[int, int], None]")
  })
});

