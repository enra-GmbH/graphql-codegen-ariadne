from typing import Optional, TypedDict

class ProductInput(TypedDict, total=False):
    description: Optional[str]
    title: Optional[str]
