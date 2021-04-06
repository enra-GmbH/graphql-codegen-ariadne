from ariadne.objects import ObjectType
from enum import Enum
from graphql import GraphQLResolveInfo
from typing import Any, List, Literal, Optional, Protocol, TypedDict, Union, overload

class Role(Enum):
    USER = "USER"
    ADMIN = "ADMIN"

SearchResult = Union['User', 'Chat', 'ChatMessage']

class Query(TypedDict):
    me: 'User'
    user: Optional['User']
    all_users: List[Optional['User']]
    search: List['SearchResult']
    my_chats: List['Chat']

class User(TypedDict):
    id: str
    username: str
    email: str
    role: 'Role'

class Chat(TypedDict):
    id: str
    users: List['User']
    messages: List['ChatMessage']

class ChatMessage(TypedDict):
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

class QueryObjectType(Protocol):
    @overload
    def set_field(self, name: Literal["me"], resolver: QueryMeResolver) -> None: ...

    @overload
    def set_field(self, name: Literal["user"], resolver: QueryUserResolver) -> None: ...

    @overload
    def set_field(self, name: Literal["allUsers"], resolver: QueryAllUsersResolver) -> None: ...

    @overload
    def set_field(self, name: Literal["search"], resolver: QuerySearchResolver) -> None: ...

    @overload
    def set_field(self, name: Literal["myChats"], resolver: QueryMyChatsResolver) -> None: ...

class UserIdResolver(Protocol):
    def __call__(self, parent: Any, info: GraphQLResolveInfo) -> str: ...

class UserUsernameResolver(Protocol):
    def __call__(self, parent: Any, info: GraphQLResolveInfo) -> str: ...

class UserEmailResolver(Protocol):
    def __call__(self, parent: Any, info: GraphQLResolveInfo) -> str: ...

class UserRoleResolver(Protocol):
    def __call__(self, parent: Any, info: GraphQLResolveInfo) -> 'Role': ...

class UserObjectType(Protocol):
    @overload
    def set_field(self, name: Literal["id"], resolver: UserIdResolver) -> None: ...

    @overload
    def set_field(self, name: Literal["username"], resolver: UserUsernameResolver) -> None: ...

    @overload
    def set_field(self, name: Literal["email"], resolver: UserEmailResolver) -> None: ...

    @overload
    def set_field(self, name: Literal["role"], resolver: UserRoleResolver) -> None: ...

class ChatIdResolver(Protocol):
    def __call__(self, parent: Any, info: GraphQLResolveInfo) -> str: ...

class ChatUsersResolver(Protocol):
    def __call__(self, parent: Any, info: GraphQLResolveInfo) -> List['User']: ...

class ChatMessagesResolver(Protocol):
    def __call__(self, parent: Any, info: GraphQLResolveInfo) -> List['ChatMessage']: ...

class ChatObjectType(Protocol):
    @overload
    def set_field(self, name: Literal["id"], resolver: ChatIdResolver) -> None: ...

    @overload
    def set_field(self, name: Literal["users"], resolver: ChatUsersResolver) -> None: ...

    @overload
    def set_field(self, name: Literal["messages"], resolver: ChatMessagesResolver) -> None: ...

class ChatMessageIdResolver(Protocol):
    def __call__(self, parent: Any, info: GraphQLResolveInfo) -> str: ...

class ChatMessageContentResolver(Protocol):
    def __call__(self, parent: Any, info: GraphQLResolveInfo) -> str: ...

class ChatMessageUserResolver(Protocol):
    def __call__(self, parent: Any, info: GraphQLResolveInfo) -> 'User': ...

class ChatMessageObjectType(Protocol):
    @overload
    def set_field(self, name: Literal["id"], resolver: ChatMessageIdResolver) -> None: ...

    @overload
    def set_field(self, name: Literal["content"], resolver: ChatMessageContentResolver) -> None: ...

    @overload
    def set_field(self, name: Literal["user"], resolver: ChatMessageUserResolver) -> None: ...
