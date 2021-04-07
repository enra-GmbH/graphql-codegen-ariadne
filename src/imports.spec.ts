import { ImportRegistry } from "./imports";

describe("ImportRegistry", () => {
  test("add package to import registry", () => {
    const importRegistry = new ImportRegistry();
    importRegistry.registerImport("typing", "Union");
    importRegistry.registerImport("typing", "Tuple");
    expect(importRegistry.imports["typing"]).toEqual(new Set(["Union", "Tuple"]));
  })
});
