from ariadne import EnumType
from ariadne.objects import ObjectType
from enum import Enum
from graphql import GraphQLResolveInfo
from typing import Any, List, Literal, Optional, Protocol, TypedDict, Union, overload

class Role(Enum):
    USER = "USER"
    ADMIN = "ADMIN"

enum_types: List[EnumType] = [
    EnumType("Role", Role),
]

SearchResult = Union['User', 'Chat', 'ChatMessage']

class Query(TypedDict, total=False):
    me: 'User'
    user: Optional['User']
    all_users: List[Optional['User']]
    search: List['SearchResult']
    my_chats: List['Chat']

class Node(TypedDict):
    id: str

class User(TypedDict, total=False):
    id: str
    username: str
    email: str
    role: 'Role'

class Chat(TypedDict, total=False):
    id: str
    users: List['User']
    messages: List['ChatMessage']

class ChatMessage(TypedDict, total=False):
    id: str
    content: str
    user: 'User'

class QueryMeResolver(Protocol):
    def __call__(self, parent: Any, info: GraphQLResolveInfo) -> 'User': ...

class QueryUserResolver(Protocol):
    def __call__(self, parent: Any, info: GraphQLResolveInfo, id: str) -> Optional['User']: ...

class QueryAllUsersResolver(Protocol):
    def __call__(self, parent: Any, info: GraphQLResolveInfo) -> List[Optional['User']]: ...

class QuerySearchResolver(Protocol):
    def __call__(self, parent: Any, info: GraphQLResolveInfo, term: str) -> List['SearchResult']: ...

class QueryMyChatsResolver(Protocol):
    def __call__(self, parent: Any, info: GraphQLResolveInfo) -> List['Chat']: ...

class QueryObjectType(ObjectType):
    @overload
    def set_field(self, name: Literal["me"], resolver: QueryMeResolver) -> QueryMeResolver: ...

    @overload
    def set_field(self, name: Literal["user"], resolver: QueryUserResolver) -> QueryUserResolver: ...

    @overload
    def set_field(self, name: Literal["allUsers"], resolver: QueryAllUsersResolver) -> QueryAllUsersResolver: ...

    @overload
    def set_field(self, name: Literal["search"], resolver: QuerySearchResolver) -> QuerySearchResolver: ...

    @overload
    def set_field(self, name: Literal["myChats"], resolver: QueryMyChatsResolver) -> QueryMyChatsResolver: ...

    def set_field(self, name, resolver):
        return super().set_field(name, resolver)

class UserIdResolver(Protocol):
    def __call__(self, parent: Any, info: GraphQLResolveInfo) -> str: ...

class UserUsernameResolver(Protocol):
    def __call__(self, parent: Any, info: GraphQLResolveInfo) -> str: ...

class UserEmailResolver(Protocol):
    def __call__(self, parent: Any, info: GraphQLResolveInfo) -> str: ...

class UserRoleResolver(Protocol):
    def __call__(self, parent: Any, info: GraphQLResolveInfo) -> 'Role': ...

class UserObjectType(ObjectType):
    @overload
    def set_field(self, name: Literal["id"], resolver: UserIdResolver) -> UserIdResolver: ...

    @overload
    def set_field(self, name: Literal["username"], resolver: UserUsernameResolver) -> UserUsernameResolver: ...

    @overload
    def set_field(self, name: Literal["email"], resolver: UserEmailResolver) -> UserEmailResolver: ...

    @overload
    def set_field(self, name: Literal["role"], resolver: UserRoleResolver) -> UserRoleResolver: ...

    def set_field(self, name, resolver):
        return super().set_field(name, resolver)

class ChatIdResolver(Protocol):
    def __call__(self, parent: Any, info: GraphQLResolveInfo) -> str: ...

class ChatUsersResolver(Protocol):
    def __call__(self, parent: Any, info: GraphQLResolveInfo) -> List['User']: ...

class ChatMessagesResolver(Protocol):
    def __call__(self, parent: Any, info: GraphQLResolveInfo) -> List['ChatMessage']: ...

class ChatObjectType(ObjectType):
    @overload
    def set_field(self, name: Literal["id"], resolver: ChatIdResolver) -> ChatIdResolver: ...

    @overload
    def set_field(self, name: Literal["users"], resolver: ChatUsersResolver) -> ChatUsersResolver: ...

    @overload
    def set_field(self, name: Literal["messages"], resolver: ChatMessagesResolver) -> ChatMessagesResolver: ...

    def set_field(self, name, resolver):
        return super().set_field(name, resolver)

class ChatMessageIdResolver(Protocol):
    def __call__(self, parent: Any, info: GraphQLResolveInfo) -> str: ...

class ChatMessageContentResolver(Protocol):
    def __call__(self, parent: Any, info: GraphQLResolveInfo) -> str: ...

class ChatMessageUserResolver(Protocol):
    def __call__(self, parent: Any, info: GraphQLResolveInfo) -> 'User': ...

class ChatMessageObjectType(ObjectType):
    @overload
    def set_field(self, name: Literal["id"], resolver: ChatMessageIdResolver) -> ChatMessageIdResolver: ...

    @overload
    def set_field(self, name: Literal["content"], resolver: ChatMessageContentResolver) -> ChatMessageContentResolver: ...

    @overload
    def set_field(self, name: Literal["user"], resolver: ChatMessageUserResolver) -> ChatMessageUserResolver: ...

    def set_field(self, name, resolver):
        return super().set_field(name, resolver)
