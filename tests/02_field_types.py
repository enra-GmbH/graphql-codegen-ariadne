from ariadne.objects import ObjectType
from graphql import GraphQLResolveInfo
from typing import Any, Literal, Optional, Protocol, TypedDict, overload

class MyType(TypedDict, total=False):
    value: Optional[int]
    required_val: int
    float_value: Optional[float]
    string_value: str
    boolean_value: Optional[bool]
    id_value: str

class MyTypeValueResolver(Protocol):
    def __call__(self, parent: Any, info: GraphQLResolveInfo) -> Optional[int]: ...

class MyTypeRequiredValResolver(Protocol):
    def __call__(self, parent: Any, info: GraphQLResolveInfo) -> int: ...

class MyTypeFloatValueResolver(Protocol):
    def __call__(self, parent: Any, info: GraphQLResolveInfo) -> Optional[float]: ...

class MyTypeStringValueResolver(Protocol):
    def __call__(self, parent: Any, info: GraphQLResolveInfo) -> str: ...

class MyTypeBooleanValueResolver(Protocol):
    def __call__(self, parent: Any, info: GraphQLResolveInfo) -> Optional[bool]: ...

class MyTypeIdValueResolver(Protocol):
    def __call__(self, parent: Any, info: GraphQLResolveInfo) -> str: ...

class MyTypeObjectType(ObjectType):
    @overload
    def set_field(self, name: Literal["value"], resolver: MyTypeValueResolver) -> MyTypeValueResolver: ...

    @overload
    def set_field(self, name: Literal["requiredVal"], resolver: MyTypeRequiredValResolver) -> MyTypeRequiredValResolver: ...

    @overload
    def set_field(self, name: Literal["floatValue"], resolver: MyTypeFloatValueResolver) -> MyTypeFloatValueResolver: ...

    @overload
    def set_field(self, name: Literal["stringValue"], resolver: MyTypeStringValueResolver) -> MyTypeStringValueResolver: ...

    @overload
    def set_field(self, name: Literal["booleanValue"], resolver: MyTypeBooleanValueResolver) -> MyTypeBooleanValueResolver: ...

    @overload
    def set_field(self, name: Literal["idValue"], resolver: MyTypeIdValueResolver) -> MyTypeIdValueResolver: ...

    def set_field(self, name, resolver):
        return super().set_field(name, resolver)
