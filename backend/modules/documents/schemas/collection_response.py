from pydantic import BaseModel, ConfigDict
from uuid import UUID


class CollectionResponse(BaseModel):
    id: int
    uuid: UUID
    name: str
    description: str | None
    color: str | None
    icon: str | None
    is_default: bool

    model_config = ConfigDict(from_attributes=True)