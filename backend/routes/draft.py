from fastapi import APIRouter
from models import Draft
from database import CHAMPION_STATS, CHAMPION_TAGS, MATCHUPS

router = APIRouter(
    prefix="/draft",
    tags=["Análise de Draft"]
)

@router.post("/analyze")
def analisar_draft(draft: Draft):
    aliados = [c.nome for c in draft.aliados]
    inimigos = [c.nome for c in draft.inimigos]
    rota_atual = draft.rota

    alertas_aliados = []
    balanco_inimigos = []
    score_geral = 0
    confrontos_contados = 0

    # 1. ANÁLISE DE COMPOSIÇÃO DE DANO E APARÊNCIA DO TIME ALIADO
    tipos_dano = {"dano_fisico": 0, "dano_magico": 0, "dano_verdadeiro": 0}
    tem_tank = False

    for aliado in aliados:
        stats = CHAMPION_STATS.get(aliado, {})
        # Contagem de tipos de dano
        for d in stats.get("dano", []):
            if d in tipos_dano:
                tipos_dano[d] += 1
        
        # Verificação de Linha de Frente (Tank)
        tags = CHAMPION_TAGS.get(aliado, {}).get("tags", [])
        if any(t in ["tank_vida", "tank_armadura", "tank_resistencia_magica", "engaje"] for t in tags):
            tem_tank = True

    # Gerar alertas dinâmicos baseados no time aliado
    if tipos_dano["dano_fisico"] >= 4:
        alertas_aliados.append("⚠️ Composição predominantemente Física (Full AD). Fácil de counterar com Armadura.")
    if tipos_dano["dano_magico"] >= 4:
        alertas_aliados.append("⚠️ Composição predominantemente Mágica (Full AP). Fácil de counterar com Resistência Mágica.")
    if len(aliados) > 0 and not tem_tank:
        alertas_aliados.append("🛡️ Falta de Linha de Frente: O vosso time não possui nenhum Tank ou iniciador sólido.")

    # 2. CÁLCULO DE MATCHUPS CRUZEADOS (Aliados vs Inimigos)
    for al in aliados:
        for ini in inimigos:
            chave_direta = f"{al}|{ini}"
            chave_inversa = f"{ini}|{al}"
            
            if chave_direta in MATCHUPS:
                score_geral += MATCHUPS[chave_direta]
                confrontos_contados += 1
            elif chave_inversa in MATCHUPS:
                # Se a chave inversa existir, invertemos o peso matemático
                score_geral -= MATCHUPS[chave_inversa]
                confrontos_contados += 1

    # Definir o balanço final baseado nos confrontos
    if confrontos_contados > 0:
        media_score = score_geral / confrontos_contados
        if media_score > 15:
            balanco_inimigos.append(f"🟢 Excelente vantagem estatística contra a composição deles ({media_score:.1f} pts).")
        elif media_score < -15:
            balanco_inimigos.append(f"🔴 Desvantagem crítica detetada ({media_score:.1f} pts). Cuidado com os counters diretos.")
        else:
            balanco_inimigos.append(f"🟡 Draft equilibrado a nível de rota e confrontos gerais ({media_score:.1f} pts).")
    else:
        balanco_inimigos.append("⚪ Adicione campeões a ambos os lados para iniciar a análise estatística.")

    return {
        "alertas_aliados": alertas_aliados,
        "balanco_inimigos": balanco_inimigos,
        "score_geral": score_geral
    }