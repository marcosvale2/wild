from utils.database import carregar_json

CHAMPION_STATS=carregar_json("campeoes.json")

CHAMPION_TAGS=carregar_json("campeoes_tag.json")

MATCHUPS=carregar_json("matchups.json")

TODOS_CAMPEOES=sorted([
    c
    for c in CHAMPION_STATS.keys()
    if c.lower()!="fraquezas"
])