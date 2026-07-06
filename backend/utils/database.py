import json
import os

BASE_DIR=os.path.dirname(os.path.dirname(__file__))

DATA=os.path.join(BASE_DIR,"data")


def carregar_json(nome):

    caminho=os.path.join(DATA,nome)

    if os.path.exists(caminho):

        with open(caminho,"r",encoding="utf-8") as f:

            return json.load(f)

    return {}