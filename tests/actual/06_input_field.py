from ariadne.objects import ObjectType
from enum import Enum
from graphql import GraphQLResolveInfo
from typing import Any, List, Literal, Optional, Protocol, TypedDict, overload

class Lang(Enum):
    DU = "DU"
    EN = "EN"

class StandType(Enum):
    ANALOG = "ANALOG"
    DIGITAL = "DIGITAL"
    HYBRID = "HYBRID"

class UserError(TypedDict):
    field: List[str]
    message: str

class Mutation(TypedDict):
    login: Optional[bool]
    stand_create: Optional['Stand']
    stand_add_translations: 'StandAddTranslationPayload'

class Query(TypedDict):
    authenticated: Optional[bool]
    hello: str
    stand: 'Stand'

class Stand(TypedDict):
    id: str
    slug: str
    translation: Optional['StandTranslation']
    type: 'StandType'

class StandTranslation(TypedDict):
    description: str
    id: str
    lang: 'Lang'
    title: str

class StandAddTranslationPayload(TypedDict):
    stand_translations: List['StandTranslation']
    user_errors: List['UserError']

class StandInput(TypedDict):
    type: Optional['StandType']

class StandTranslationInput(TypedDict):
    description: Optional[str]
    lang: 'Lang'
    title: Optional[str]

class UserErrorFieldResolver(Protocol):
    def __call__(self, parent: Any, info: GraphQLResolveInfo) -> List[str]: ...

class UserErrorMessageResolver(Protocol):
    def __call__(self, parent: Any, info: GraphQLResolveInfo) -> str: ...

class UserErrorObjectType(ObjectType):
    @overload
    def set_field(self, name: Literal["field"], resolver: UserErrorFieldResolver) -> UserErrorFieldResolver: ...

    @overload
    def set_field(self, name: Literal["message"], resolver: UserErrorMessageResolver) -> UserErrorMessageResolver: ...

    def set_field(self, name, resolver):
        return super().set_field(name, resolver)

class MutationLoginResolver(Protocol):
    def __call__(self, parent: Any, info: GraphQLResolveInfo, password: str, username: str) -> Optional[bool]: ...

class MutationStandCreateResolver(Protocol):
    def __call__(self, parent: Any, info: GraphQLResolveInfo, stand: 'StandInput', translation: 'StandTranslationInput') -> Optional['Stand']: ...

class MutationStandAddTranslationsResolver(Protocol):
    def __call__(self, parent: Any, info: GraphQLResolveInfo, id: str, translations: List['StandTranslationInput']) -> 'StandAddTranslationPayload': ...

class MutationObjectType(ObjectType):
    @overload
    def set_field(self, name: Literal["login"], resolver: MutationLoginResolver) -> MutationLoginResolver: ...

    @overload
    def set_field(self, name: Literal["standCreate"], resolver: MutationStandCreateResolver) -> MutationStandCreateResolver: ...

    @overload
    def set_field(self, name: Literal["standAddTranslations"], resolver: MutationStandAddTranslationsResolver) -> MutationStandAddTranslationsResolver: ...

    def set_field(self, name, resolver):
        return super().set_field(name, resolver)

class QueryAuthenticatedResolver(Protocol):
    def __call__(self, parent: Any, info: GraphQLResolveInfo) -> Optional[bool]: ...

class QueryHelloResolver(Protocol):
    def __call__(self, parent: Any, info: GraphQLResolveInfo) -> str: ...

class QueryStandResolver(Protocol):
    def __call__(self, parent: Any, info: GraphQLResolveInfo) -> 'Stand': ...

class QueryObjectType(ObjectType):
    @overload
    def set_field(self, name: Literal["authenticated"], resolver: QueryAuthenticatedResolver) -> QueryAuthenticatedResolver: ...

    @overload
    def set_field(self, name: Literal["hello"], resolver: QueryHelloResolver) -> QueryHelloResolver: ...

    @overload
    def set_field(self, name: Literal["stand"], resolver: QueryStandResolver) -> QueryStandResolver: ...

    def set_field(self, name, resolver):
        return super().set_field(name, resolver)

class StandIdResolver(Protocol):
    def __call__(self, parent: Any, info: GraphQLResolveInfo) -> str: ...

class StandSlugResolver(Protocol):
    def __call__(self, parent: Any, info: GraphQLResolveInfo) -> str: ...

class StandTranslationResolver(Protocol):
    def __call__(self, parent: Any, info: GraphQLResolveInfo, lang: Optional['Lang'], translate: Optional[bool]) -> Optional['StandTranslation']: ...

class StandTypeResolver(Protocol):
    def __call__(self, parent: Any, info: GraphQLResolveInfo) -> 'StandType': ...

class StandObjectType(ObjectType):
    @overload
    def set_field(self, name: Literal["id"], resolver: StandIdResolver) -> StandIdResolver: ...

    @overload
    def set_field(self, name: Literal["slug"], resolver: StandSlugResolver) -> StandSlugResolver: ...

    @overload
    def set_field(self, name: Literal["translation"], resolver: StandTranslationResolver) -> StandTranslationResolver: ...

    @overload
    def set_field(self, name: Literal["type"], resolver: StandTypeResolver) -> StandTypeResolver: ...

    def set_field(self, name, resolver):
        return super().set_field(name, resolver)

class StandTranslationDescriptionResolver(Protocol):
    def __call__(self, parent: Any, info: GraphQLResolveInfo) -> str: ...

class StandTranslationIdResolver(Protocol):
    def __call__(self, parent: Any, info: GraphQLResolveInfo) -> str: ...

class StandTranslationLangResolver(Protocol):
    def __call__(self, parent: Any, info: GraphQLResolveInfo) -> 'Lang': ...

class StandTranslationTitleResolver(Protocol):
    def __call__(self, parent: Any, info: GraphQLResolveInfo) -> str: ...

class StandTranslationObjectType(ObjectType):
    @overload
    def set_field(self, name: Literal["description"], resolver: StandTranslationDescriptionResolver) -> StandTranslationDescriptionResolver: ...

    @overload
    def set_field(self, name: Literal["id"], resolver: StandTranslationIdResolver) -> StandTranslationIdResolver: ...

    @overload
    def set_field(self, name: Literal["lang"], resolver: StandTranslationLangResolver) -> StandTranslationLangResolver: ...

    @overload
    def set_field(self, name: Literal["title"], resolver: StandTranslationTitleResolver) -> StandTranslationTitleResolver: ...

    def set_field(self, name, resolver):
        return super().set_field(name, resolver)

class StandAddTranslationPayloadStandTranslationsResolver(Protocol):
    def __call__(self, parent: Any, info: GraphQLResolveInfo) -> List['StandTranslation']: ...

class StandAddTranslationPayloadUserErrorsResolver(Protocol):
    def __call__(self, parent: Any, info: GraphQLResolveInfo) -> List['UserError']: ...

class StandAddTranslationPayloadObjectType(ObjectType):
    @overload
    def set_field(self, name: Literal["standTranslations"], resolver: StandAddTranslationPayloadStandTranslationsResolver) -> StandAddTranslationPayloadStandTranslationsResolver: ...

    @overload
    def set_field(self, name: Literal["userErrors"], resolver: StandAddTranslationPayloadUserErrorsResolver) -> StandAddTranslationPayloadUserErrorsResolver: ...

    def set_field(self, name, resolver):
        return super().set_field(name, resolver)
