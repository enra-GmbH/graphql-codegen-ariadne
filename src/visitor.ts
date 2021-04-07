import autoBind from "auto-bind";
import { snakeCase, upperCaseFirst } from "change-case-all";
import { FieldDefinitionNode, InputObjectTypeDefinitionNode, InputValueDefinitionNode } from "graphql";
import { EnumTypeDefinitionNode, ListTypeNode, NamedTypeNode, NonNullTypeNode, ObjectTypeDefinitionNode, UnionTypeDefinitionNode } from "graphql";
import { ImportRegistry } from "./imports";

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



function toPythonType(field: NonNullTypeNode | NamedTypeNode | ListTypeNode,
  importReg?: ImportRegistry,
  nonNull: boolean = false): string {
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

function namedTypeToPythonType(
    namedType: NamedTypeNode
    ) {
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

type Enums = {[key: string]: string[]};

export class PythonVisitor {

  _import_registry = new ImportRegistry()

  constructor() {
    autoBind(this);
  }

  _enums: Enums = {}
  EnumTypeDefinition(node: EnumTypeDefinitionNode) {
    if (!node.values?.length) {
      return;
    }
    this._enums[node.name.value] = node.values.map(val => val.name.value);
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
    const enum_definitions = Object.entries(this._enums).map(([enumName, vals]) => {
      this._import_registry.registerImport("enum", "Enum");
      return (
        `class ${enumName}(Enum):\n` + 
         vals.map(val => `    ${val} = "${val}"`).join("\n")) + "\n";
    });

    
    if (enum_definitions.length == 0)
      return [];

    this._import_registry.registerImport("ariadne", "EnumType");
    this._import_registry.registerImport("typing", "List");
    const enum_types_list = (`enum_types: List[EnumType] = [\n` +
      Object.keys(this._enums).map(enumName => `    EnumType("${enumName}", ${enumName}),\n`).join("") + "]\n"
    )
    return [
      ...enum_definitions,
      enum_types_list
    ]
  }
  
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
      return `class ${dict.name}(TypedDict, total=False):\n` +
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
          return `    def set_field(self, name: Literal["${fields[0].fieldName}"], resolver: ${resolverName(objectName, fields[0].fieldName)}) -> ${resolverName(objectName, fields[0].fieldName)}:\n` +
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

  output(): string {
    const content = [
      ...this.enums,
      ...this.unions,
      ...this.typedDicts,
      ...this.resolvers
    ]
    return [
      ...this.imports,
      ...content
    ].join("\n");
  }
}