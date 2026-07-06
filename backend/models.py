from pydantic import BaseModel


class Champion(BaseModel):

    nome:str

    rota:str


class Draft(BaseModel):

    aliados:list[Champion]

    inimigos:list[Champion]

    rota:str="TODAS"