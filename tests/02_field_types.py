from typing import Optional, TypedDict

class MyType(TypedDict):
    value: Optional[int]
    required_val: int
    float_value: Optional[float]
    string_value: str
    boolean_value: Optional[bool]
    id_value: str
