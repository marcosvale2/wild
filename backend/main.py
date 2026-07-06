from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict
import json
import os

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==========================================
# CARREGANDO OS BANCOS DE DADOS
# ==========================================
BASE_DIR = os.path.dirname(os.path.abspath(__file__))


def carregar_json(nome_arquivo):
    caminho = os.path.join(BASE_DIR, "data", nome_arquivo)
    if os.path.exists(caminho):
        with open(caminho, 'r', encoding='utf-8') as arquivo:
            return json.load(arquivo)
    print(f"⚠️ AVISO: Banco de dados não encontrado em -> {caminho}")
    return {}


CHAMPION_STATS = carregar_json("campeoes.json")
MATCHUPS_CONFORTO = carregar_json("matchups.json")
SINERGIAS = carregar_json("sinergias.json")
TODOS_CAMPEOES = sorted(
    [k for k in CHAMPION_STATS.keys() if k.lower() != "fraquezas"])

# ===========================================================================
# MOTOR DE REGRAS DINÂMICAS DO DRAFT (Passo C Centralizado)
# ===========================================================================
REGRAS_COMPOSICAO = [
    {
        "nome": "Penalização Anti-Assassino/Burst",
        "condicao_champ": lambda t: "assassino" in t or "dano_explosivo" in t,
        "condicao_contexto": lambda al, inimi: "desengaje" in inimi or "shild" in inimi or "cura" in inimi,
        "pontuacao": -40,
        "requer_inimigos": False
    },
    {
        "nome": "Penalização Derretimento de Tank",
        "condicao_champ": lambda t: "tank_armadura" in t or "tank_vida" in t,
        "condicao_contexto": lambda al, inimi: "dano_verdadeiro" in inimi or "reduz_armadura" in inimi,
        "pontuacao": -40,
        "requer_inimigos": False
    },
    {
        "nome": "Bónus Proteção para Campeão Frágil",
        "condicao_champ": lambda t: "fragil" in t,
        "condicao_contexto": lambda al, inimi: "desengaje" in al or "shild" in al or "cura" in al,
        "pontuacao": 25,
        "requer_inimigos": False
    },
    {
        "nome": "Bónus Poke Estratégico (Sem Engaje Inimigo)",
        "condicao_champ": lambda t: "poke" in t,
        "condicao_contexto": lambda al, inimi: "engaje" not in inimi,
        "pontuacao": 20,
        "requer_inimigos": True
    }
]

# ==========================================
# MODELOS DE DADOS
# ==========================================


class CampeaoDraft(BaseModel):
    nome: str
    rota: str


class StatsCampeao(BaseModel):
    partidas: int
    winrate: float
    mvp: int
    s: int
    a: int


class RequestDraft(BaseModel):
    aliados: List[CampeaoDraft]
    inimigos: List[CampeaoDraft]
    rota: Optional[str] = "TODAS"
    rotas_foco: Optional[List[str]] = []
    estatisticas_jogadores: Optional[Dict[str, Dict[str, StatsCampeao]]] = {}

# ==========================================
# LÓGICA CORE (Matchup + Sinergia)
# ==========================================


def obter_score_matchup(campA, campB):
    chave_direta = f"{campA}|{campB}"
    if chave_direta in MATCHUPS_CONFORTO:
        return MATCHUPS_CONFORTO[chave_direta]
    chave_inversa = f"{campB}|{campA}"
    if chave_inversa in MATCHUPS_CONFORTO:
        return -MATCHUPS_CONFORTO[chave_inversa]
    return 0


def obter_score_sinergia(campA, campB):
    par_ordenado = sorted([campA, campB])
    chave = f"{par_ordenado[0]}|{par_ordenado[1]}"
    return SINERGIAS.get(chave, 0)


def extrair_info_campeao(nome):
    stats = CHAMPION_STATS.get(nome, {})
    traits = stats.get("traits", [])
    dano = stats.get("dano", [])
    alcance = stats.get("range", "")

    if isinstance(dano, str):
        dano = [dano]
    if isinstance(alcance, str):
        alcance = [alcance]
    if isinstance(traits, str):
        traits = [traits]

    tudo_junto = traits + dano + alcance
    return [str(t).lower().strip() for t in tudo_junto]


def calcular_score_conforto(time_aliado, time_inimigo):
    if not time_aliado and not time_inimigo:
        return 0

    score_matchups = 0
    total_peso_matchup = 0

    if time_aliado and time_inimigo:
        for aliado in time_aliado:
            for inimigo in time_inimigo:
                coeficiente = 1.0 if aliado.rota.upper() == inimigo.rota.upper() else 0.2
                score_matchups += (obter_score_matchup(aliado.nome,
                                   inimigo.nome) * coeficiente)
                total_peso_matchup += coeficiente

    media_matchups = score_matchups / \
        total_peso_matchup if total_peso_matchup > 0 else 0

    soma_sinergia_aliada = 0
    for i in range(len(time_aliado)):
        for j in range(i + 1, len(time_aliado)):
            soma_sinergia_aliada += obter_score_sinergia(
                time_aliado[i].nome, time_aliado[j].nome)

    soma_sinergia_inimiga = 0
    for i in range(len(time_inimigo)):
        for j in range(i + 1, len(time_inimigo)):
            soma_sinergia_inimiga += obter_score_sinergia(
                time_inimigo[i].nome, time_inimigo[j].nome)

    return media_matchups + soma_sinergia_aliada - soma_sinergia_inimiga


def obter_dano_principal(nome):
    stats = CHAMPION_STATS.get(nome, {})
    dano = stats.get("dano", [])
    if isinstance(dano, str):
        dano = [dano]
    info = extrair_info_campeao(nome)

    for d in [str(x).lower().strip() for x in dano]:
        if any(w in d for w in ["fisico", "físico", "ad", "dano_ataque"]):
            return "AD"
        if any(w in d for w in ["magico", "mágico", "ap", "dano_magico"]):
            return "AP"

    for t in info:
        if any(w in t for w in ["fisico", "físico", "atirador", "dano_ataque", "ad", "adc"]):
            return "AD"
        if any(w in t for w in ["magico", "mágico", "mago", "ap"]):
            return "AP"
    return None

# ==========================================
# ROTAS DA API
# ==========================================


@app.get("/champions")
def get_champions():
    return [{"nome": c, "rotas": [r.upper() for r in CHAMPION_STATS.get(c, {}).get("rotas", [])]} for c in TODOS_CAMPEOES]


@app.post("/draft/analyze")
def analyze_draft(req: RequestDraft):
    nomes_aliados = [c.nome for c in req.aliados]
    nomes_inimigos = [c.nome for c in req.inimigos]

    tags_aliadas = set(
        t for a in req.aliados for t in extrair_info_campeao(a.nome))
    tags_inimigas = set(
        t for i in req.inimigos for t in extrair_info_campeao(i.nome))

    # 1. ANÁLISE INIMIGA

    balanco_inimigos = []
    ad_in, ap_in, tank_in, cura_in, shild_in = 0, 0, 0, 0, 0
    if req.inimigos:

        for c in req.inimigos:
            dano_principal = obter_dano_principal(c.nome)
            is_tank = any(w in t for t in extrair_info_campeao(c.nome)
                          for w in ["tank", "tanque", "frontline"])
            is_cura = any(w in t for t in extrair_info_campeao(c.nome)
                          for w in ["cura", "heal", "curar"])
            is_shild = any(w in t for t in extrair_info_campeao(c.nome)
                           for w in ["shild"])

            if is_tank:
                tank_in += 1
            if is_shild:
                shild_in += 1
            if is_cura:
                cura_in += 1
            if dano_principal == "AD":
                ad_in += 1
            if dano_principal == "AP":
                ap_in += 1

        balanco_inimigos.append(
            f"⚔️ Inimigos: {ad_in} AD | {ap_in} AP | {tank_in} Tanks | {cura_in} Curas")

    # 2. ANÁLISE ALIADA
    alertas_aliados = []
    if req.aliados:
        qtd_tank, qtd_ad, qtd_ap = 0, 0, 0
        for c in req.aliados:
            dano_principal = obter_dano_principal(c.nome)
            is_tank = any(w in t for t in extrair_info_campeao(c.nome)
                          for w in ["tank", "tanque", "frontline"])

            if is_tank:
                qtd_tank += 1
            if dano_principal == "AD":
                qtd_ad += 1
            if dano_principal == "AP":
                qtd_ap += 1

        if qtd_tank == 0:
            alertas_aliados.append("⚠️ O time NÃO TEM Tanque/Frontline.")
        if qtd_ad == 0:
            alertas_aliados.append("⚠️ O time NÃO TEM dano físico (AD).")
        if qtd_ap == 0:
            alertas_aliados.append("⚠️ O time NÃO TEM dano mágico (AP).")
        if qtd_ad >= 4:
            alertas_aliados.append(
                f"⚠️ Muito Dano Físico ({qtd_ad} AD) concentrado!")
        if qtd_ap >= 4:
            alertas_aliados.append(
                f"⚠️ Muito Dano Mágico ({qtd_ap} AP) concentrado!")

    vantagem = calcular_score_conforto(req.aliados, req.inimigos)

    # 3. SUGESTÃO INTELIGENTE E ITENS
    itens_ad, itens_ap, itens_tank, runas_recomendadas, dicas_fraquezas = [], [], [], [], []
    scores_counters = {champ: 0 for champ in TODOS_CAMPEOES}

    if ap_in >= 3:
        itens_tank.append("Força da Natureza (vs Muito Dano Mágico)")
    if ad_in >= 3:
        itens_tank.append(
            "Armadura de Espinhos / Coracao Congelado / Randuin (vs Muito Dano Físico)")
    for c in req.inimigos:
        inimigo = c.nome
        dados_inimigo = CHAMPION_STATS.get(inimigo, {})
        dados_fraquezas = CHAMPION_STATS.get("fraquezas", {}).get(inimigo, {})
        dano_inimigo = dados_inimigo.get("dano", [])
        traits_inimigo = dados_inimigo.get("traits", [])

        if "dano_magico" in dano_inimigo and "dano_explosivo" in traits_inimigo and ap_in >= 2:
            itens_tank.append(f"Lamurico (vs {inimigo})")

        elif "shild" in [str(t).lower() for t in traits_inimigo]:

            if "shild" in [str(t).lower() for t in traits_inimigo] and shild_in == 1:
                itens_ad.append(f"Presa da Serpente (vs {inimigo})")
                itens_ap.append(f"Tridente da Oceania (vs {inimigo})")
        if "shild" in [str(t).lower() for t in traits_inimigo] and shild_in == 2:
                itens_ad.append(f"Presa da Serpente (vs {inimigo})")
                itens_ap.append(f"Tridente da Oceania (vs {inimigo})")
        if "shild" in [str(t).lower() for t in traits_inimigo] and shild_in >= 3:
                itens_ad.append(f"Presa da Serpente (vs Time Inimigo)")
                itens_ap.append(f"Tridente da Oceania (vs Time Inimigo)")

        if "cura" in [str(t).lower() for t in traits_inimigo]:
            if "cura" in [str(t).lower() for t in traits_inimigo] and cura_in == 1:
             itens_tank.append(f"Colete Espinhoso (vs {inimigo})")
             itens_ad.append(f"Chamado do Carrasco (vs {inimigo})")
             itens_ap.append(f"Orbe do Oblivio (vs {inimigo})")
        if "cura" in [str(t).lower() for t in traits_inimigo] and cura_in == 2:
             itens_tank.append(f"Colete Espinhoso (vs {inimigo})")
             itens_ad.append(f"Chamado do Carrasco (vs {inimigo})")
             itens_ap.append(f"Orbe do Oblivio (vs {inimigo})")
        if "cura" in [str(t).lower() for t in traits_inimigo] and cura_in >= 3:
             itens_tank.append(f"Colete Espinhoso (vs Time Inimigo)")
             itens_ad.append(f"Chamado do Carrasco (vs Time Inimigo)")
             itens_ap.append(f"Orbe do Oblivio (vs Time Inimigo)")


        for item, mot in dados_inimigo.get("itens_ad", dados_fraquezas.get("itens_ad", {})).items():
            itens_ad.append(f"{item}: {mot}")
        for item, mot in dados_inimigo.get("itens_ap", dados_fraquezas.get("itens_ap", {})).items():
            itens_ap.append(f"{item}: {mot}")
        for runa, mot in dados_inimigo.get("runas", dados_fraquezas.get("runas", {})).items():
            runas_recomendadas.append(f"{runa}: {mot}")

    # ===========================================================================
    # A INTELIGÊNCIA ARTIFICIAL DA RECOMENDAÇÃO (Mitigação, Sinergia e Vantagem)
    # ===========================================================================
    for champ in TODOS_CAMPEOES:
        if champ in nomes_aliados or champ in nomes_inimigos:
            continue

        tags_champ = extrair_info_campeao(champ)
        score_champ = 0

        # A) SOMA VANTAGEM DE MATCHUP CONTRA INIMIGOS
        for inimigo in req.inimigos:
            if req.rotas_foco and inimigo.rota.upper() not in [r.upper() for r in req.rotas_foco]:
                continue
            score_champ += obter_score_matchup(champ, inimigo.nome)

        # B) SOMA SINERGIA COM TODOS ALIADOS
        for aliado in req.aliados:
            score_champ += obter_score_sinergia(champ, aliado.nome)

        # C) APLICA MITIGAÇÃO E CONTEXTO DE CAMPO DINÂMICO (Refatorado)
        for regra in REGRAS_COMPOSICAO:
            if regra["condicao_champ"](tags_champ) and regra["condicao_contexto"](tags_aliadas, tags_inimigas):
                if regra["requer_inimigos"] and len(req.inimigos) == 0:
                    continue
                score_champ += regra["pontuacao"]

        # ===========================================================================
        # D) APLICAÇÃO DE ESTATÍSTICAS PESSOAIS
        # ===========================================================================
        if req.estatisticas_jogadores:
            rotas_do_campeao = [r.upper() for r in CHAMPION_STATS.get(
                champ, {}).get("rotas", [])]
            campeao_jogado = False

            for r_camp in rotas_do_campeao:
                if r_camp in req.estatisticas_jogadores:
                    stats_rota = req.estatisticas_jogadores[r_camp]

                    if champ in stats_rota:
                        st = stats_rota[champ]

                        # 1. Normaliza o Winrate
                        wr = st.winrate if st.winrate <= 1.0 else (
                            st.winrate / 100.0)

                        # 2. Fator de Confiança
                        fator_confianca = min(st.partidas / 30.0, 1.0)

                        # 3. Bônus de Desempenho
                        media_desempenho = (
                            st.mvp + (st.s / 2.0) + (st.a / 4.0)) / max(st.partidas, 1)
                        bonus_desempenho = min(media_desempenho * 20, 20)

                        # 4. Cálculo da Eficiência Base
                        eficiencia = (wr * 50 * fator_confianca) + \
                            bonus_desempenho

                        # 5. Trava de Hard Counter
                        if score_champ < -15:
                            eficiencia = eficiencia * 0.2
                        elif score_champ < 0:
                            eficiencia = eficiencia * 0.5

                        score_champ += int(eficiencia)
                        campeao_jogado = True

            if not campeao_jogado:
                scores_counters[champ] = -9999
                continue

        scores_counters[champ] = score_champ

    # Filtra e Ordena os melhores
    rotas_ocupadas = set(c.rota.upper() for c in req.aliados)

    lista_resultados = []
    for champ, score in scores_counters.items():
        if champ in nomes_aliados or champ in nomes_inimigos:
            continue

        rotas_do_campeao = [r.upper()
                            for r in CHAMPION_STATS.get(champ, {}).get("rotas", [])]
        tem_rota_livre = any(r not in rotas_ocupadas for r in rotas_do_campeao)

        if not tem_rota_livre:
            continue

        rota_valida = (req.rota == "TODAS" or req.rota in rotas_do_campeao)
        if rota_valida:
            lista_resultados.append((champ, score))

    lista_resultados.sort(key=lambda x: (-x[1], x[0]))
    sugestoes_campeoes = [p[0] for p in lista_resultados if p[1] > 0][:5]

    return {
        "balanco_inimigos": balanco_inimigos,
        "alertas_aliados": alertas_aliados,
        "vantagem": round(vantagem, 1),
        "sugestoes_campeoes": sugestoes_campeoes,
        "itens_ad": list(dict.fromkeys(itens_ad)),
        "itens_ap": list(dict.fromkeys(itens_ap)),
        "itens_tank": list(dict.fromkeys(itens_tank)),
        "runas": list(dict.fromkeys(runas_recomendadas)),
        "dicas": list(dict.fromkeys(dicas_fraquezas))
    }
