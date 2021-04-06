import autoBind from "auto-bind";
import { snakeCase, upperCaseFirst } from "change-case-all";
import { FieldDefinitionNode, InputObjectTypeDefinitionNode, InputValueDefinitionNode } from "graphql";
import { EnumTypeDefinitionNode, ListTypeNode, NamedTypeNode, NonNullTypeNode, ObjectTypeDefinitionNode, UnionTypeDefinitionNode } from "graphql";

type PyEnum = {
  name: string
  values: Array<[string, string]>
}

type PyTypedDict = {
  name: string
  keys: Array<[string, string]>
}

type Kwarg =  {
  name: string,
  type: string
}

type PyResolvableField = {
  fieldName: string
  kwargs: Kwarg[]
  retval: string
}

class ImportRegistry {
  imports: {[k: string]: Set<string>} = {}

  registerImport(pkg: string, thing: string) {
    if (!this.imports[pkg])
      this.imports[pkg] = new Set();
    this.imports[pkg].add(thing);
  }
}

function toPythonType(field: NonNullTypeNode | NamedTypeNode | ListTypeNode, importReg?: ImportRegistry, nonNull: boolean = false): string {
  if (field.kind === "NamedType") {
    if (!nonNull) {
      importReg?.registerImport("typing", "Optional");
      return `Optional[${namedTypeToPythonType(field)}]`
    }
    return namedTypeToPythonType(field)
  }
  if (field.kind === "NonNullType") {
    return toPythonType(field.type, importReg, true);
  }
  // field.kind must be "ListType"
  importReg?.registerImport("typing", "List");
  return `List[${toPythonType(field.type, importReg)}]`
}

function namedTypeToPythonType(namedType: NamedTypeNode) {
  switch (namedType.name.value) {
    case "Int":
      return "int";
    case "Float":
      return "float";
    case "String":
      return "str";
    case "Boolean":
      return "bool";
    case "ID":
      return "str";
  }
  return `'${namedType.name.value}'`;
}

function toResolvableField(field: FieldDefinitionNode): PyResolvableField {
  let kwargs: Kwarg[] = []
  if (field.arguments) {
    field.arguments.forEach(argument => {
      kwargs.push({
        name: argument.name.value,
        type: toPythonType(argument.type)
      })
    })
  }
  return {
    fieldName: field.name.value,
    kwargs,
    retval: toPythonType(field.type)
  };
}

export class PythonVisitor {

  _import_registry = new ImportRegistry()

  constructor() {
    autoBind(this);
  }

  EnumTypeDefinition(node: EnumTypeDefinitionNode) {
    if (!node.values?.length) {
      return;
    }
    this._enums.push({
      name: node.name.value,
      values: node.values.map(val => [val.name.value, val.name.value])
    })
  }

  _addTypedDict(node: ObjectTypeDefinitionNode | InputObjectTypeDefinitionNode) {
    if (!node.fields || !node.fields.length) {
      return
    }
    this._typed_dicts.push({
      name: node.name.value,  // TODO: read case preference from settings
      keys: node.fields.map((field: InputValueDefinitionNode | FieldDefinitionNode): [string, string] =>
        [snakeCase(field.name.value), toPythonType(field.type, this._import_registry)])
    })
  }

  ObjectTypeDefinition(node: ObjectTypeDefinitionNode) {
    if (!node.fields?.length) {
      return;
    }
    this._addTypedDict(node);
    
    node.fields.forEach(field => {
      if (!this._resolvers[node.name.value]) {
        this._resolvers[node.name.value] = []
      }
      this._resolvers[node.name.value].push(toResolvableField(field));
    });
  }

  InputObjectTypeDefinition(node: InputObjectTypeDefinitionNode) {
    this._addTypedDict(node);
  }

  _unions: {[unionName: string]: string[] } = {}
  UnionTypeDefinition(node: UnionTypeDefinitionNode) {
    if (!node.types) {
      return
    }
    const unionTypes: string[] = [];
    node.types.forEach(type => {
      unionTypes.push(namedTypeToPythonType(type));
    });
    this._unions[node.name.value] = unionTypes;
  }

  public get enums(): string[] {
    const importRegistry = this._import_registry
    function toPython(pyEnum: PyEnum) {
      importRegistry.registerImport("enum", "Enum");
      return (
        `class ${pyEnum.name}(Enum):\n` + 
         pyEnum.values.map(val => `    ${val[0]} = "${val[1]}"`).join("\n")) + "\n";
      }
    return this._enums.map(toPython);
  }
  
  _enums: PyEnum[] = []
  _typed_dicts: PyTypedDict[] = []
  public get imports(): string[] {
    const packages = Object.keys(this._import_registry.imports).sort();
    const importStatements = packages.map(pkg => {
      const thingsToImport = [...this._import_registry.imports[pkg]].sort();
      return `from ${pkg} import ${thingsToImport.join(", ")}`
    });
    return [
      ...importStatements,
      ""
    ]
  }

  public get typedDicts(): string[] {
    const importRegistry = this._import_registry
    const toPython = (dict: PyTypedDict) => {
      importRegistry.registerImport("typing", "TypedDict");
      return `class ${dict.name}(TypedDict):\n` +
        dict.keys.map(([key, type]): string => {
          return `    ${key}: ${type}`
        }).join("\n") + "\n";
    }
    return this._typed_dicts.map(toPython);
  }

  public get unions(): string[] {
    return Object.entries(this._unions).map(([enumName, typeNames]) => {
      this._import_registry.registerImport("typing", "Union");
      return `${enumName} = Union[${typeNames.join(', ')}]\n`;
    });
  }

  _resolvers: {[objectName: string]: PyResolvableField[]} = {}
  public get resolvers(): string[] {
    const resolverName = (objectName: string, fieldName: string) => `${objectName}${upperCaseFirst(fieldName)}Resolver`

    return Object.entries(this._resolvers).map(([objectName, fields]) => {
      this._import_registry.registerImport("typing", "Protocol");
      this._import_registry.registerImport("graphql", "GraphQLResolveInfo");
      this._import_registry.registerImport("typing", "Any");
      this._import_registry.registerImport("typing", "overload");
      this._import_registry.registerImport("typing", "Literal");
      this._import_registry.registerImport("ariadne.objects", "ObjectType");

      let protocols = fields.map(field => {
        const kwargsStr = field.kwargs.map(kwarg => `, ${snakeCase(kwarg.name)}: ${kwarg.type}`).join('');
        return `class ${resolverName(objectName, field.fieldName)}(Protocol):\n` +
        `    def __call__(self, parent: Any, info: GraphQLResolveInfo${kwargsStr}) -> ${field.retval}: ...\n`
      });
      
      const methods = (fields: PyResolvableField[]): string => {
        // having only one field is a special case, in this case we cannot use @overload and the method override needs to be typed 
        if (fields.length == 1) {
          return `    def set_field(self, name: Literal["${fields[0].fieldName}"], resolver: ${resolverName(objectName, fields[0].fieldName)}) -> ${resolverName(objectName, fields[0].fieldName)}\n` +
                 `        return super().set_field(name, resolver)\n`
        }
        return [...fields.map(field => {
          const resolverNameStr = resolverName(objectName, field.fieldName);
          return `    @overload\n` +
                 `    def set_field(self, name: Literal["${field.fieldName}"], resolver: ${resolverNameStr}) -> ${resolverNameStr}: ...\n`
        }),
        `    def set_field(self, name, resolver):\n` +
        `        return super().set_field(name, resolver)\n`
      ].join('\n')
      }

      let classStr = `class ${objectName}ObjectType(ObjectType):\n` + methods(fields);
      return [
        ...protocols,
        classStr
      ];
    }).flat()
  }
}