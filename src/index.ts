import { PluginFunction, Types } from '@graphql-codegen/plugin-helpers';
import { GraphQLSchema, printSchema, parse, visit, EnumTypeDefinitionNode, ObjectTypeDefinitionNode, FieldDefinitionNode, NamedTypeNode, NonNullTypeNode, ListTypeNode } from 'graphql';
import { PythonVisitor } from './visitor';

export type MyPluginConfig = {
  useStrForEnums?: boolean;
};

export function convertToPython(sdl: string): string {
  const astNode = parse(sdl);
  const visitor = new PythonVisitor();
  visit(astNode, { leave: visitor });

  return visitor.output();
}

export const plugin: PluginFunction<Partial<MyPluginConfig>, string> = (
  schema: GraphQLSchema,
  documents: Types.DocumentFile[],
  config: MyPluginConfig
) => {
  const sdl = printSchema(schema);
  return convertToPython(sdl);
};