import { PluginFunction, Types } from '@graphql-codegen/plugin-helpers';
import { GraphQLSchema, printSchema, parse, visit, EnumTypeDefinitionNode, ObjectTypeDefinitionNode, FieldDefinitionNode, NamedTypeNode, NonNullTypeNode, ListTypeNode } from 'graphql';
import { PythonVisitor } from './visitor';

export type MyPluginConfig = {
  name?: string;
};

let imports: Set<string> = new Set();

export function convertToPython(sdl: string): string {
  const astNode = parse(sdl);
  const visitor = new PythonVisitor()

  visit(astNode, { leave: visitor });
  const content = [
    ...visitor.enums,
    ...visitor.unions,
    ...visitor.typedDicts,
    ...visitor.resolvers
  ]
  return [
    ...visitor.imports,
    ...content
  ].join("\n");
}

export const plugin: PluginFunction<Partial<MyPluginConfig>, string> = (
  schema: GraphQLSchema,
  documents: Types.DocumentFile[],
  config: MyPluginConfig
) => {
  const printed = printSchema(schema);
  return convertToPython(printed);
};