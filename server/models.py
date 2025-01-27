from pydantic import BaseModel, Field


class POSTVocabulary(BaseModel):
    cantonese: str = Field(min_length=1)
    jyutping: str = Field(min_length=1)
    english: str = Field(min_length=1)
    tags: list[str] = []


class POSTTag(BaseModel):
    tag_name: str = Field(min_length=1)
