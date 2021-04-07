from ariadne.objects import ObjectType
from graphql import GraphQLResolveInfo
from typing import Any, Literal, Optional, Protocol, TypedDict, overload

class Query(TypedDict, total=False):
    some_field: Optional[int]

class QuerySomeFieldResolver(Protocol):
    def __call__(self, parent: Any, info: GraphQLResolveInfo, val: Optional[int], another_val: str) -> Optional[int]: ...

class QueryObjectType(ObjectType):
    def set_field(self, name: Literal["someField"], resolver: QuerySomeFieldResolver) -> QuerySomeFieldResolver:
        return super().set_field(name, resolver)
