# GraphQL Code Generator Plugin for Ariadne

This repository is a plugin for [GraphQL Code Generator](https://www.graphql-code-generator.com/) that can be used to generate Python type hints when implementing GraphQL servers with [Ariadne](https://ariadnegraphql.org/).

## Features

See the `tests` directory for examples of what it can do currently.

  - [x] Create `typing.Enum`s from SDL `enum`.
  - [x] Create `typing.TypedDict`s from GraphQL `type` and `input`.
  - [x] Create special `ariadne.ObjectType` with an overloaded `set_field` method for type safe resolver registration.
  - [ ] Allow field access through attributes instead of through string dictionary keys like Ariadne (implement with `typing.protocol` and `@property`, [mypy docs](https://mypy.readthedocs.io/en/stable/protocols.html#recursive-protocols)).
  - [ ] Allow `Callable` for field resolvers.
  - [ ] Allow type-safe usage of Ariadne's decorator for resolver registration.
  - [ ] Type with the custom `Enum`s that you [pass to Ariadne](https://ariadnegraphql.org/docs/enums).

## Usage

**Note: this plugin is more of a proof of concept in its current stage.**

Set up Graphql Code Generator following the [documentation](https://www.graphql-code-generator.com/docs/getting-started/installation).


Install `graphql-codegen-ariadne`. Then add it to `codegen.yml`. (Again, see [documentation](https://www.graphql-code-generator.com/docs/getting-started/codegen-config) of Graphql Code Generator).

```
overwrite: true
schema: "/schema.graphql"
documents: "**/*.graphql"
generates:
  graphql_types.py:
    plugins:
      - "graphql-codegen-ariadne"
```

This plugin currently has no configuration.
