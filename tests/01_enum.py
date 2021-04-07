from ariadne import EnumType
from enum import Enum
from typing import List

class Episode(Enum):
    NEWHOPE = "NEWHOPE"
    EMPIRE = "EMPIRE"
    JEDI = "JEDI"

enum_types: List[EnumType] = [
    EnumType("Episode", Episode),
]
