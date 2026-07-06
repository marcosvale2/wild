import json
import itertools
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# 1. DEFINIÇÃO DE DADOS
# Dicionário de Combos OP.GG (O código abaixo normaliza as chaves automaticamente)
COMBOS_OPGG = {
    "braum|ashe": 55, "caitlyn|milio": 60, "jinx|lulu": 60, "miss_fortune|seraphine": 40,
    "twitch|lulu": 50, "kogmaw|lulu": 50, "lucian|nami": 50, "yasuo|malphite": 40,
    "yasuo|nautilus": 45, "yasuo|rakan": 45, "yasuo|gragas": 30, "xayah|rakan": 55,
    "samira|nautilus": 45,
}

# Normaliza chaves do OP.GG para ordem alfabética (evita erro de ordem)
COMBOS_NORMALIZADOS = {
    "|".join(sorted(k.split("|"))): v for k, v in COMBOS_OPGG.items()
}

# MATRIZ DE SINERGIA
MATRIZ_SINERGIAS = {
    "fragil": {"shild": 20, "cura": 15, "desengaje": 20, "tank_vida": 10},
    "dano_ataque": {"velocidade_ataque": 10, "reduz_armadura": 15},
    "velocidade_ataque": {"shild": 25, "cura": 15},
    "engaje": {"engaje": 25, "dano_explosivo": 20, "controle_zona": 15, "global_semiglobal": 15},
    "poke": {"poke": 20, "desengaje": 25, "controle_zona": 15},
    "assassino": {"engaje": 15, "invisibilidade_verdadeira": 10},
    "imortalidade": {"cura": 15},
    "tank_vida": {"cura": 15, "shild": 10},
    "tank_armadura": {"cura": 15, "shild": 10},
    "tank_resistencia_magica": {"cura": 15, "shild": 10}
}

def carregar_campeoes():
    caminho = os.path.join(BASE_DIR, "data", "campeoes.json")
    if os.path.exists(caminho):
        with open(caminho, 'r', encoding='utf-8') as f:
            return json.load(f)
    return {}

def extrair_todas_tags(stats):
    # Pega apenas traits, dano e range, sem precisar de arquivos externos
    lista = []
    lista.extend(stats.get("traits", []))
    lista.extend(stats.get("dano", []))
    range_val = stats.get("range")
    if range_val:
        lista.append(range_val)
    return [str(t).lower().strip() for t in lista]

def main():
    CHAMPION_STATS = carregar_campeoes()
    if not CHAMPION_STATS:
        print("Erro: campeoes.json não encontrado ou vazio.")
        return

    campeoes = [c for c in CHAMPION_STATS.keys() if c.lower() != "fraquezas"]
    sinergias_finais = {}

    for campA, campB in itertools.combinations(campeoes, 2):
        # Chave normalizada alfabeticamente
        par_ordenado = sorted([campA, campB])
        chave_final = f"{par_ordenado[0]}|{par_ordenado[1]}"
        
        # 1. Verifica combo manual (OP.GG)
        if chave_final in COMBOS_NORMALIZADOS:
            sinergias_finais[chave_final] = COMBOS_NORMALIZADOS[chave_final]
            continue

        # 2. Se não, calcula por Tags
        tags_A = extrair_todas_tags(CHAMPION_STATS[campA])
        tags_B = extrair_todas_tags(CHAMPION_STATS[campB])
        
        pontos_sinergia = 0
        
        # O quanto A ajuda B (Verificação otimizada se tA existe na matriz)
        for tA in tags_A:
            if tA in MATRIZ_SINERGIAS:
                for tB in tags_B:
                    if tB in MATRIZ_SINERGIAS[tA]:
                        pontos_sinergia += MATRIZ_SINERGIAS[tA][tB]
        
        # O quanto B ajuda A (Verificação otimizada se tB existe na matriz)
        for tB in tags_B:
            if tB in MATRIZ_SINERGIAS:
                for tA in tags_A:
                    if tA in MATRIZ_SINERGIAS[tB]:
                        pontos_sinergia += MATRIZ_SINERGIAS[tB][tA]

        if pontos_sinergia > 0:
            sinergias_finais[chave_final] = pontos_sinergia

    # Salva o arquivo
    caminho_saida = os.path.join(BASE_DIR, "data", "sinergias.json")
    with open(caminho_saida, "w", encoding="utf-8") as f:
        json.dump(sinergias_finais, f, indent=4, ensure_ascii=False)
    
    print(f"Sinergias geradas com sucesso em: {caminho_saida}")

if __name__ == "__main__":
    main()