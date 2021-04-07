let importToPackage = {
  "Union": "typing",
  "Optional": "typing",
  "List": "typing",
};

export class ImportRegistry {
  imports: {[k: string]: Set<string>} = {}

  registerImport(pkg: string, thing: string) {
    if (!this.imports[pkg])
      this.imports[pkg] = new Set();
    this.imports[pkg].add(thing);
  }

  // returns a shorthand to register imports, usage:
  // const i = reg.importFunc();
  // i("Union")
  importFunc() {
    const inner = (thing: keyof typeof importToPackage) => {
      this.registerImport(importToPackage[thing], thing);
      return thing;
    }
    return inner;
  }
}
