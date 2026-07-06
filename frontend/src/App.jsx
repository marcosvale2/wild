import React, { useState, useEffect } from "react";
import api from "./services/api";




// 1. Adicione esta função no topo do seu App.jsx (fora da função App)
const obterNomesDosItens = (texto) => {
  if (!texto) return [];
  // Pega apenas a parte antes do ":" ou do "(vs"
  let parteItens = texto.split(/\(vs|:/)[0];

  // Divide a string onde tiver barra "/"
  let itensBrutos = parteItens.split("/");

  // Limpa e formata o nome de cada item do array
  return itensBrutos.map(item =>
    item.trim().toLowerCase().replace(/\s+/g, '_').normalize("NFD").replace(/[\u0300-\u036f]/g, "")
  );
};
// ==========================================
// COMPONENTE DE IMAGEM INTELIGENTE (Suporta jpg, png, webp)
// ==========================================
const ImagemInteligente = ({ pasta, nome, className }) => {
  const extensoes = ['jpg', 'webp', 'png', 'jpeg'];
  const [tentativa, setTentativa] = useState(0);

  useEffect(() => {
    setTentativa(0);
  }, [nome]);

  if (!nome) return null;

  if (tentativa >= extensoes.length) {
    return (
      <div className={`bg-slate-800 flex items-center justify-center text-[10px] text-slate-500 text-center ${className}`}>
        {nome}
      </div>
    );
  }

  return (
    <img
      src={`/${pasta}/${nome}.${extensoes[tentativa]}`}
      alt={nome}
      className={className}
      onError={() => setTentativa(tentativa + 1)}
    />
  );
};

const rotasIniciais = ["TOP", "JG", "MID", "ADC", "SUP"];

export default function App() {
  const [campeoes, setCampeoes] = useState([]);
  const [busca, setBusca] = useState("");
  const [campeaoFocado, setCampeaoFocado] = useState(null);
  const [rotaFocada, setRotaFocada] = useState("TOP");
  const [filtrarPorRota, setFiltrarPorRota] = useState(true);

  // O estado que guarda o filtro das Sugestões de Pick
  const [filtroRotaSugestao, setFiltroRotaSugestao] = useState("TODAS");

  // ADICIONADO: Estado que guarda quais rotas o usuário marcou nas caixinhas de foco
  const [rotasFoco, setRotasFoco] = useState([]);

  // ==============================================================
  // ADICIONADO: Estados para as Estatísticas Pessoais (Checkboxes)
  // ==============================================================
  const [usarMinhasStats, setUsarMinhasStats] = useState(false);
  const [minhaRotaStats, setMinhaRotaStats] = useState("JG");
  const [usarJulioStats, setUsarJulioStats] = useState(false);
  const [julioRotaStats, setJulioRotaStats] = useState("MID");

  const [usarMariaStats, setUsarMariaStats] = useState(false);
  const [mariaRotaStats, setMariaRotaStats] = useState("SUP");

  const [usarMatheusStats, setUsarMatheusStats] = useState(false);
  const [matheusRotaStats, setMatheusRotaStats] = useState("MID");

  // Mock simulando as estatísticas extraídas. Altere os dados reais aqui!
  const dbEstatisticasMarcosMock = {
    "TOP": {
      "urgot": { partidas: 19, winrate: 57.9, mvp: 0, s: 1, a: 2 },
    },
    "JG": {

      "amumu": { partidas: 369, winrate: 59.9, mvp: 34, s: 82, a: 75 },
      "dr.mundo": { partidas: 461, winrate: 52.5, mvp: 78, s: 77, a: 41 },
      "fiddlesticks": { partidas: 570, winrate: 52.2, mvp: 39, s: 26, a: 49 },
      "hecarim": { partidas: 188, winrate: 45.7, mvp: 9, s: 16, a: 18 },
      "maokai": { partidas: 276, winrate: 51.1, mvp: 42, s: 39, a: 37 },
      "nocturne": { partidas: 252, winrate: 54.8, mvp: 35, s: 33, a: 38 },
      "rammus": { partidas: 183, winrate: 56.8, mvp: 25, s: 31, a: 21 },
      "rengar": { partidas: 123, winrate: 44.7, mvp: 10, s: 4, a: 14 },
      "shen": { partidas: 170, winrate: 48.2, mvp: 23, s: 31, a: 27 },
      "shyvana": { partidas: 226, winrate: 48.2, mvp: 36, s: 31, a: 17 },
      "vi": { partidas: 166, winrate: 50.6, mvp: 23, s: 40, a: 22 },
      "volibear": { partidas: 953, winrate: 49.4, mvp: 108, s: 118, a: 106 },
      "warwick": { partidas: 642, winrate: 50.5, mvp: 45, s: 42, a: 48 },
      "wukong": { partidas: 250, winrate: 48.4, mvp: 22, s: 20, a: 28 },
    },
    "MID": {
      "aurelion_sol": { partidas: 17, winrate: 23.5, mvp: 0, s: 0, a: 3 },
      "syndra": { partidas: 10, winrate: 40, mvp: 0, s: 0, a: 1 },
    },
    "ADC": {
      "caitlyn": { partidas: 110, winrate: 47.3, mvp: 17, s: 20, a: 11 },
    },
    "SUP": {
      "braum": { partidas: 62, winrate: 41.9, mvp: 1, s: 14, a: 6 },

    }
  };
  const dbEstatisticasJulioMock = {
    "TOP": {
      "aatrox": { partidas: 0, winrate: 0, mvp: 0, s: 0, a: 0 },
      "akali": { partidas: 0, winrate: 0, mvp: 0, s: 0, a: 0 },
      "ambessa": { partidas: 0, winrate: 0, mvp: 0, s: 0, a: 0 },
      "camille": { partidas: 0, winrate: 0, mvp: 0, s: 0, a: 0 },
      "cho'gath": { partidas: 0, winrate: 0, mvp: 0, s: 0, a: 0 },
      "darius": { partidas: 0, winrate: 0, mvp: 0, s: 0, a: 0 },
      "dr.mundo": { partidas: 0, winrate: 0, mvp: 0, s: 0, a: 0 },
      "fiora": { partidas: 0, winrate: 0, mvp: 0, s: 0, a: 0 },
      "garen": { partidas: 0, winrate: 0, mvp: 0, s: 0, a: 0 },
      "gnar": { partidas: 0, winrate: 0, mvp: 0, s: 0, a: 0 },
      "gragas": { partidas: 0, winrate: 0, mvp: 0, s: 0, a: 0 },
      "gwen": { partidas: 0, winrate: 0, mvp: 0, s: 0, a: 0 },
      "irelia": { partidas: 0, winrate: 0, mvp: 0, s: 0, a: 0 },
      "jarvan_iv": { partidas: 0, winrate: 0, mvp: 0, s: 0, a: 0 },
      "jax": { partidas: 0, winrate: 0, mvp: 0, s: 0, a: 0 },
      "jayce": { partidas: 0, winrate: 0, mvp: 0, s: 0, a: 0 },
      "kayle": { partidas: 0, winrate: 0, mvp: 0, s: 0, a: 0 },
      "kennen": { partidas: 0, winrate: 0, mvp: 0, s: 0, a: 0 },
      "ksant": { partidas: 0, winrate: 0, mvp: 0, s: 0, a: 0 },
      "lillia": { partidas: 0, winrate: 0, mvp: 0, s: 0, a: 0 },
      "malphite": { partidas: 0, winrate: 0, mvp: 0, s: 0, a: 0 },
      "maokai": { partidas: 0, winrate: 0, mvp: 0, s: 0, a: 0 },
      "mordekaiser": { partidas: 0, winrate: 0, mvp: 0, s: 0, a: 0 },
      "nasus": { partidas: 0, winrate: 0, mvp: 0, s: 0, a: 0 },
      "olaf": { partidas: 0, winrate: 0, mvp: 0, s: 0, a: 0 },
      "ornn": { partidas: 0, winrate: 0, mvp: 0, s: 0, a: 0 },
      "pantheon": { partidas: 0, winrate: 0, mvp: 0, s: 0, a: 0 },
      "poppy": { partidas: 0, winrate: 0, mvp: 0, s: 0, a: 0 },
      "renekton": { partidas: 0, winrate: 0, mvp: 0, s: 0, a: 0 },
      "rengar": { partidas: 0, winrate: 0, mvp: 0, s: 0, a: 0 },
      "riven": { partidas: 0, winrate: 0, mvp: 0, s: 0, a: 0 },
      "rumble": { partidas: 0, winrate: 0, mvp: 0, s: 0, a: 0 },
      "ryze": { partidas: 0, winrate: 0, mvp: 0, s: 0, a: 0 },
      "sett": { partidas: 0, winrate: 0, mvp: 0, s: 0, a: 0 },
      "shen": { partidas: 0, winrate: 0, mvp: 0, s: 0, a: 0 },
      "singed": { partidas: 0, winrate: 0, mvp: 0, s: 0, a: 0 },
      "sion": { partidas: 0, winrate: 0, mvp: 0, s: 0, a: 0 },
      "skarner": { partidas: 0, winrate: 0, mvp: 0, s: 0, a: 0 },
      "swain": { partidas: 0, winrate: 0, mvp: 0, s: 0, a: 0 },
      "teemo": { partidas: 0, winrate: 0, mvp: 0, s: 0, a: 0 },
      "tryndamere": { partidas: 0, winrate: 0, mvp: 0, s: 0, a: 0 },
      "urgot": { partidas: 0, winrate: 0, mvp: 0, s: 0, a: 0 },
      "vayne": { partidas: 0, winrate: 0, mvp: 0, s: 0, a: 0 },
      "vladimir": { partidas: 0, winrate: 0, mvp: 0, s: 0, a: 0 },
      "volibear": { partidas: 0, winrate: 0, mvp: 0, s: 0, a: 0 },
      "warwick": { partidas: 0, winrate: 0, mvp: 0, s: 0, a: 0 },
      "wukong": { partidas: 0, winrate: 0, mvp: 0, s: 0, a: 0 },
      "yasuo": { partidas: 0, winrate: 0, mvp: 0, s: 0, a: 0 },
      "yone": { partidas: 0, winrate: 0, mvp: 0, s: 0, a: 0 }
    },
    "JG": {
      "aatrox": { partidas: 0, winrate: 0, mvp: 0, s: 0, a: 0 },
      "ambessa": { partidas: 0, winrate: 0, mvp: 0, s: 0, a: 0 },
      "amumu": { partidas: 0, winrate: 0, mvp: 0, s: 0, a: 0 },
      "camille": { partidas: 0, winrate: 0, mvp: 0, s: 0, a: 0 },
      "cho'gath": { partidas: 0, winrate: 0, mvp: 0, s: 0, a: 0 },
      "diana": { partidas: 0, winrate: 0, mvp: 0, s: 0, a: 0 },
      "dr.mundo": { partidas: 0, winrate: 0, mvp: 0, s: 0, a: 0 },
      "ekko": { partidas: 0, winrate: 0, mvp: 0, s: 0, a: 0 },
      "evelynn": { partidas: 0, winrate: 0, mvp: 0, s: 0, a: 0 },
      "fiddlesticks": { partidas: 0, winrate: 0, mvp: 0, s: 0, a: 0 },
      "fizz": { partidas: 0, winrate: 0, mvp: 0, s: 0, a: 0 },
      "gragas": { partidas: 0, winrate: 0, mvp: 0, s: 0, a: 0 },
      "graves": { partidas: 0, winrate: 0, mvp: 0, s: 0, a: 0 },
      "gwen": { partidas: 0, winrate: 0, mvp: 0, s: 0, a: 0 },
      "hecarim": { partidas: 0, winrate: 0, mvp: 0, s: 0, a: 0 },
      "jarvan_iv": { partidas: 0, winrate: 0, mvp: 0, s: 0, a: 0 },
      "jax": { partidas: 0, winrate: 0, mvp: 0, s: 0, a: 0 },
      "kayn": { partidas: 0, winrate: 0, mvp: 0, s: 0, a: 0 },
      "kha'zix": { partidas: 0, winrate: 0, mvp: 0, s: 0, a: 0 },
      "kindred": { partidas: 0, winrate: 0, mvp: 0, s: 0, a: 0 },
      "lee_sin": { partidas: 0, winrate: 0, mvp: 0, s: 0, a: 0 },
      "lillia": { partidas: 0, winrate: 0, mvp: 0, s: 0, a: 0 },
      "maokai": { partidas: 0, winrate: 0, mvp: 0, s: 0, a: 0 },
      "master_yi": { partidas: 0, winrate: 0, mvp: 0, s: 0, a: 0 },
      "mordekaiser": { partidas: 0, winrate: 0, mvp: 0, s: 0, a: 0 },
      "morgana": { partidas: 0, winrate: 0, mvp: 0, s: 0, a: 0 },
      "nautilus": { partidas: 0, winrate: 0, mvp: 0, s: 0, a: 0 },
      "nidalee": { partidas: 0, winrate: 0, mvp: 0, s: 0, a: 0 },
      "nilah": { partidas: 0, winrate: 0, mvp: 0, s: 0, a: 0 },
      "nocturne": { partidas: 0, winrate: 0, mvp: 0, s: 0, a: 0 },
      "nunu_&_willump": { partidas: 0, winrate: 0, mvp: 0, s: 0, a: 0 },
      "olaf": { partidas: 0, winrate: 0, mvp: 0, s: 0, a: 0 },
      "pantheon": { partidas: 0, winrate: 0, mvp: 0, s: 0, a: 0 },
      "poppy": { partidas: 0, winrate: 0, mvp: 0, s: 0, a: 0 },
      "rammus": { partidas: 0, winrate: 0, mvp: 0, s: 0, a: 0 },
      "rengar": { partidas: 0, winrate: 0, mvp: 0, s: 0, a: 0 },
      "riven": { partidas: 0, winrate: 0, mvp: 0, s: 0, a: 0 },
      "shen": { partidas: 0, winrate: 0, mvp: 0, s: 0, a: 0 },
      "shyvana": { partidas: 0, winrate: 0, mvp: 0, s: 0, a: 0 },
      "skarner": { partidas: 0, winrate: 0, mvp: 0, s: 0, a: 0 },
      "taliyah": { partidas: 0, winrate: 0, mvp: 0, s: 0, a: 0 },
      "talon": { partidas: 0, winrate: 0, mvp: 0, s: 0, a: 0 },
      "tryndamere": { partidas: 0, winrate: 0, mvp: 0, s: 0, a: 0 },
      "twitch": { partidas: 0, winrate: 0, mvp: 0, s: 0, a: 0 },
      "vi": { partidas: 0, winrate: 0, mvp: 0, s: 0, a: 0 },
      "viego": { partidas: 0, winrate: 0, mvp: 0, s: 0, a: 0 },
      "volibear": { partidas: 0, winrate: 0, mvp: 0, s: 0, a: 0 },
      "warwick": { partidas: 0, winrate: 0, mvp: 0, s: 0, a: 0 },
      "wukong": { partidas: 0, winrate: 0, mvp: 0, s: 0, a: 0 },
      "xin_zhao": { partidas: 0, winrate: 0, mvp: 0, s: 0, a: 0 }
    },
    "MID": {
      "ahri": { partidas: 0, winrate: 0, mvp: 0, s: 0, a: 0 },
      "akali": { partidas: 0, winrate: 0, mvp: 0, s: 0, a: 0 },
      "akshan": { partidas: 0, winrate: 0, mvp: 0, s: 0, a: 0 },
      "annie": { partidas: 0, winrate: 0, mvp: 0, s: 0, a: 0 },
      "aurelion_sol": { partidas: 0, winrate: 0, mvp: 0, s: 0, a: 0 },
      "aurora": { partidas: 0, winrate: 0, mvp: 0, s: 0, a: 0 },
      "brand": { partidas: 0, winrate: 0, mvp: 0, s: 0, a: 0 },
      "corki": { partidas: 0, winrate: 0, mvp: 0, s: 0, a: 0 },
      "diana": { partidas: 0, winrate: 0, mvp: 0, s: 0, a: 0 },
      "ekko": { partidas: 0, winrate: 0, mvp: 0, s: 0, a: 0 },
      "fizz": { partidas: 0, winrate: 0, mvp: 0, s: 0, a: 0 },
      "galio": { partidas: 0, winrate: 0, mvp: 0, s: 0, a: 0 },
      "gragas": { partidas: 0, winrate: 0, mvp: 0, s: 0, a: 0 },
      "heimerdinger": { partidas: 0, winrate: 0, mvp: 0, s: 0, a: 0 },
      "irelia": { partidas: 0, winrate: 0, mvp: 0, s: 0, a: 0 },
      "jayce": { partidas: 0, winrate: 0, mvp: 0, s: 0, a: 0 },
      "karma": { partidas: 0, winrate: 0, mvp: 0, s: 0, a: 0 },
      "kassadin": { partidas: 0, winrate: 0, mvp: 0, s: 0, a: 0 },
      "katarina": { partidas: 0, winrate: 0, mvp: 0, s: 0, a: 0 },
      "kayle": { partidas: 0, winrate: 0, mvp: 0, s: 0, a: 0 },
      "kennen": { partidas: 0, winrate: 0, mvp: 0, s: 0, a: 0 },
      "lissandra": { partidas: 0, winrate: 0, mvp: 0, s: 0, a: 0 },
      "lucian": { partidas: 0, winrate: 0, mvp: 0, s: 0, a: 0 },
      "lux": { partidas: 0, winrate: 0, mvp: 0, s: 0, a: 0 },
      "malphite": { partidas: 0, winrate: 0, mvp: 0, s: 0, a: 0 },
      "mel": { partidas: 0, winrate: 0, mvp: 0, s: 0, a: 0 },
      "morgana": { partidas: 0, winrate: 0, mvp: 0, s: 0, a: 0 },
      "norra": { partidas: 0, winrate: 0, mvp: 0, s: 0, a: 0 },
      "orianna": { partidas: 0, winrate: 0, mvp: 0, s: 0, a: 0 },
      "pantheon": { partidas: 0, winrate: 0, mvp: 0, s: 0, a: 0 },
      "pyke": { partidas: 0, winrate: 0, mvp: 0, s: 0, a: 0 },
      "rumble": { partidas: 0, winrate: 0, mvp: 0, s: 0, a: 0 },
      "ryze": { partidas: 0, winrate: 0, mvp: 0, s: 0, a: 0 },
      "seraphine": { partidas: 0, winrate: 0, mvp: 0, s: 0, a: 0 },
      "swain": { partidas: 0, winrate: 0, mvp: 0, s: 0, a: 0 },
      "syndra": { partidas: 0, winrate: 0, mvp: 0, s: 0, a: 0 },
      "taliyah": { partidas: 0, winrate: 0, mvp: 0, s: 0, a: 0 },
      "talon": { partidas: 0, winrate: 0, mvp: 0, s: 0, a: 0 },
      "teemo": { partidas: 0, winrate: 0, mvp: 0, s: 0, a: 0 },
      "twisted_fate": { partidas: 0, winrate: 0, mvp: 0, s: 0, a: 0 },
      "varus": { partidas: 0, winrate: 0, mvp: 0, s: 0, a: 0 },
      "veigar": { partidas: 0, winrate: 0, mvp: 0, s: 0, a: 0 },
      "velkoz": { partidas: 0, winrate: 0, mvp: 0, s: 0, a: 0 },
      "vex": { partidas: 0, winrate: 0, mvp: 0, s: 0, a: 0 },
      "viktor": { partidas: 0, winrate: 0, mvp: 0, s: 0, a: 0 },
      "vladimir": { partidas: 0, winrate: 0, mvp: 0, s: 0, a: 0 },
      "yasuo": { partidas: 0, winrate: 0, mvp: 0, s: 0, a: 0 },
      "yone": { partidas: 0, winrate: 0, mvp: 0, s: 0, a: 0 },
      "yunara": { partidas: 0, winrate: 0, mvp: 0, s: 0, a: 0 },
      "zed": { partidas: 0, winrate: 0, mvp: 0, s: 0, a: 0 },
      "ziggs": { partidas: 0, winrate: 0, mvp: 0, s: 0, a: 0 },
      "zilean": { partidas: 0, winrate: 0, mvp: 0, s: 0, a: 0 },
      "zoe": { partidas: 0, winrate: 0, mvp: 0, s: 0, a: 0 },
      "zyra": { partidas: 0, winrate: 0, mvp: 0, s: 0, a: 0 }
    },
    "ADC": {
      "akshan": { partidas: 0, winrate: 0, mvp: 0, s: 0, a: 0 },
      "ashe": { partidas: 0, winrate: 0, mvp: 0, s: 0, a: 0 },
      "caitlyn": { partidas: 0, winrate: 0, mvp: 0, s: 0, a: 0 },
      "corki": { partidas: 0, winrate: 0, mvp: 0, s: 0, a: 0 },
      "draven": { partidas: 0, winrate: 0, mvp: 0, s: 0, a: 0 },
      "ezreal": { partidas: 0, winrate: 0, mvp: 0, s: 0, a: 0 },
      "jhin": { partidas: 0, winrate: 0, mvp: 0, s: 0, a: 0 },
      "jinx": { partidas: 0, winrate: 0, mvp: 0, s: 0, a: 0 },
      "kai'sa": { partidas: 0, winrate: 0, mvp: 0, s: 0, a: 0 },
      "kalista": { partidas: 0, winrate: 0, mvp: 0, s: 0, a: 0 },
      "kogmaw": { partidas: 0, winrate: 0, mvp: 0, s: 0, a: 0 },
      "lucian": { partidas: 0, winrate: 0, mvp: 0, s: 0, a: 0 },
      "miss_fortune": { partidas: 0, winrate: 0, mvp: 0, s: 0, a: 0 },
      "nilah": { partidas: 0, winrate: 0, mvp: 0, s: 0, a: 0 },
      "samira": { partidas: 0, winrate: 0, mvp: 0, s: 0, a: 0 },
      "seraphine": { partidas: 0, winrate: 0, mvp: 0, s: 0, a: 0 },
      "sivir": { partidas: 0, winrate: 0, mvp: 0, s: 0, a: 0 },
      "smolder": { partidas: 0, winrate: 0, mvp: 0, s: 0, a: 0 },
      "tristana": { partidas: 0, winrate: 0, mvp: 0, s: 0, a: 0 },
      "twitch": { partidas: 0, winrate: 0, mvp: 0, s: 0, a: 0 },
      "varus": { partidas: 0, winrate: 0, mvp: 0, s: 0, a: 0 },
      "vayne": { partidas: 0, winrate: 0, mvp: 0, s: 0, a: 0 },
      "xayah": { partidas: 0, winrate: 0, mvp: 0, s: 0, a: 0 },
      "yunara": { partidas: 0, winrate: 0, mvp: 0, s: 0, a: 0 },
      "zeri": { partidas: 0, winrate: 0, mvp: 0, s: 0, a: 0 },
      "ziggs": { partidas: 0, winrate: 0, mvp: 0, s: 0, a: 0 }
    },
    "SUP": {
      "alistar": { partidas: 0, winrate: 0, mvp: 0, s: 0, a: 0 },
      "amumu": { partidas: 0, winrate: 0, mvp: 0, s: 0, a: 0 },
      "ashe": { partidas: 0, winrate: 0, mvp: 0, s: 0, a: 0 },
      "bardo": { partidas: 0, winrate: 0, mvp: 0, s: 0, a: 0 },
      "blitzcrank": { partidas: 0, winrate: 0, mvp: 0, s: 0, a: 0 },
      "brand": { partidas: 0, winrate: 0, mvp: 0, s: 0, a: 0 },
      "braum": { partidas: 0, winrate: 0, mvp: 0, s: 0, a: 0 },
      "galio": { partidas: 0, winrate: 0, mvp: 0, s: 0, a: 0 },
      "gragas": { partidas: 0, winrate: 0, mvp: 0, s: 0, a: 0 },
      "janna": { partidas: 0, winrate: 0, mvp: 0, s: 0, a: 0 },
      "karma": { partidas: 0, winrate: 0, mvp: 0, s: 0, a: 0 },
      "leona": { partidas: 0, winrate: 0, mvp: 0, s: 0, a: 0 },
      "lulu": { partidas: 0, winrate: 0, mvp: 0, s: 0, a: 0 },
      "lux": { partidas: 0, winrate: 0, mvp: 0, s: 0, a: 0 },
      "malphite": { partidas: 0, winrate: 0, mvp: 0, s: 0, a: 0 },
      "maokai": { partidas: 0, winrate: 0, mvp: 0, s: 0, a: 0 },
      "mel": { partidas: 0, winrate: 0, mvp: 0, s: 0, a: 0 },
      "milio": { partidas: 0, winrate: 0, mvp: 0, s: 0, a: 0 },
      "morgana": { partidas: 0, winrate: 0, mvp: 0, s: 0, a: 0 },
      "nami": { partidas: 0, winrate: 0, mvp: 0, s: 0, a: 0 },
      "nautilus": { partidas: 0, winrate: 0, mvp: 0, s: 0, a: 0 },
      "norra": { partidas: 0, winrate: 0, mvp: 0, s: 0, a: 0 },
      "poppy": { partidas: 0, winrate: 0, mvp: 0, s: 0, a: 0 },
      "pyke": { partidas: 0, winrate: 0, mvp: 0, s: 0, a: 0 },
      "rakan": { partidas: 0, winrate: 0, mvp: 0, s: 0, a: 0 },
      "rell": { partidas: 0, winrate: 0, mvp: 0, s: 0, a: 0 },
      "seraphine": { partidas: 0, winrate: 0, mvp: 0, s: 0, a: 0 },
      "shen": { partidas: 0, winrate: 0, mvp: 0, s: 0, a: 0 },
      "sona": { partidas: 0, winrate: 0, mvp: 0, s: 0, a: 0 },
      "soraka": { partidas: 0, winrate: 0, mvp: 0, s: 0, a: 0 },
      "swain": { partidas: 0, winrate: 0, mvp: 0, s: 0, a: 0 },
      "thresh": { partidas: 0, winrate: 0, mvp: 0, s: 0, a: 0 },
      "veigar": { partidas: 0, winrate: 0, mvp: 0, s: 0, a: 0 },
      "velkoz": { partidas: 0, winrate: 0, mvp: 0, s: 0, a: 0 },
      "yuumi": { partidas: 0, winrate: 0, mvp: 0, s: 0, a: 0 },
      "zilean": { partidas: 0, winrate: 0, mvp: 0, s: 0, a: 0 },
      "zyra": { partidas: 0, winrate: 0, mvp: 0, s: 0, a: 0 }
    }
  };
  const dbEstatisticasMatheusMock = {
    "TOP": {
      "garen": { partidas: 117, winrate: 53.8, mvp: 11, s: 20, a: 29 },
      "nasus": { partidas: 46, winrate: 54.3, mvp: 5, s: 9, a: 7 },
      "poppy": { partidas: 21, winrate: 42.9, mvp: 2, s: 2, a: 5 },
      "sett": { partidas: 69, winrate: 56.5, mvp: 15, s: 23, a: 12 },
    },
    "JG": {
      "rammus": { partidas: 11, winrate: 54.5, mvp: 1, s: 3, a: 0 },
      "vi": { partidas: 11, winrate: 54.5, mvp: 4, s: 5, a: 0 },
    },
    "MID": {
      "annie": { partidas: 16, winrate: 31.2, mvp: 0, s: 0, a: 0 },
      "aurora": { partidas: 18, winrate: 38.9, mvp: 0, s: 3, a: 2 },
      "fizz": { partidas: 710, winrate: 56.2, mvp: 124, s: 120, a: 118 },
      "heimerdinger": { partidas: 12, winrate: 58.3, mvp: 0, s: 0, a: 0 },
      "irelia": { partidas: 33, winrate: 39.4, mvp: 1, s: 4, a: 3 },
      "malphite": { partidas: 223, winrate: 47.5, mvp: 17, s: 35, a: 20 },
      "pantheon": { partidas: 35, winrate: 28.6, mvp: 1, s: 2, a: 0 },
      "swain": { partidas: 76, winrate: 46.1, mvp: 7, s: 17, a: 9 },
      "syndra": { partidas: 13, winrate: 38.5, mvp: 0, s: 1, a: 1 },
      "teemo": { partidas: 191, winrate: 50.8, mvp: 18, s: 37, a: 28 },
      "veigar": { partidas: 34, winrate: 61.8, mvp: 2, s: 1, a: 5 },
      "zoe": { partidas: 102, winrate: 35.3, mvp: 5, s: 12, a: 7 },
    },
    "ADC": {
      "ashe": { partidas: 44, winrate: 47.7, mvp: 5, s: 5, a: 5 },
      "caitlyn": { partidas: 24, winrate: 62.5, mvp: 1, s: 0, a: 1 },
      "jhin": { partidas: 24, winrate: 41.7, mvp: 2, s: 2, a: 2 },
      "miss_fortune": { partidas: 24, winrate: 50, mvp: 9, s: 6, a: 7 },
      "samira": { partidas: 40, winrate: 50, mvp: 11, s: 11, a: 3 },
    },
    "SUP": {
      "amumu": { partidas: 45, winrate: 57.8, mvp: 4, s: 7, a: 11 },
      "blitzcrank": { partidas: 182, winrate: 54.4, mvp: 14, s: 45, a: 35 },
      "lulu": { partidas: 67, winrate: 43.3, mvp: 0, s: 16, a: 7 },
      "lux": { partidas: 60, winrate: 38.3, mvp: 8, s: 9, a: 6 },
      "milio": { partidas: 30, winrate: 66.7, mvp: 0, s: 8, a: 6 },
      "nautilus": { partidas: 83, winrate: 51.8, mvp: 10, s: 11, a: 12 },
      "seraphine": { partidas: 33, winrate: 60.6, mvp: 2, s: 1, a: 5 },
    }
  };
  const dbEstatisticasMariaMock = {
    "TOP": {
      "kennen": { partidas: 28, winrate: 46.4, mvp: 0, s: 0, a: 1 },
      "poppy": { partidas: 14, winrate: 42.9, mvp: 0, s: 1, a: 2 },
    },
    "JG": {
      "diana": { partidas: 57, winrate: 52.6, mvp: 5, s: 3, a: 0 },
      "evelynn": { partidas: 92, winrate: 51.1, mvp: 1, s: 0, a: 3 },
      "lillia": { partidas: 13, winrate: 61.5, mvp: 0, s: 1, a: 1 },
      "nunu_&_willump": { partidas: 38, winrate: 42.1, mvp: 0, s: 0, a: 0 },
    },
    "MID": {
      "ahri": { partidas: 55, winrate: 63.6, mvp: 0, s: 0, a: 0 },
      "fizz": { partidas: 12, winrate: 58.3, mvp: 1, s: 1, a: 0 },
      "irelia": { partidas: 56, winrate: 39.3, mvp: 0, s: 0, a: 0 },
      "katarina": { partidas: 12, winrate: 0, mvp: 0, s: 0, a: 0 },
      "orianna": { partidas: 78, winrate: 59, mvp: 1, s: 3, a: 3 },
      "syndra": { partidas: 11, winrate: 54.5, mvp: 1, s: 2, a: 1 },
      "veigar": { partidas: 15, winrate: 53.3, mvp: 0, s: 0, a: 0 },
      "vex": { partidas: 14, winrate: 50, mvp: 3, s: 2, a: 1 },
      "ziggs": { partidas: 48, winrate: 62.5, mvp: 0, s: 1, a: 1 },
    },
    "ADC": {
      "ashe": { partidas: 36, winrate: 44.4, mvp: 1, s: 2, a: 0 },
      "caitlyn": { partidas: 459, winrate: 51.4, mvp: 14, s: 17, a: 22 },
      "ezreal": { partidas: 265, winrate: 43.8, mvp: 9, s: 9, a: 4 },
      "jhin": { partidas: 56, winrate: 62.5, mvp: 7, s: 5, a: 6 },
      "jinx": { partidas: 105, winrate: 51.4, mvp: 4, s: 3, a: 5 },
      "kai'sa": { partidas: 225, winrate: 48.9, mvp: 14, s: 11, a: 7 },
      "miss_fortune": { partidas: 113, winrate: 47.8, mvp: 8, s: 7, a: 9 },
      "nilah": { partidas: 18, winrate: 38.9, mvp: 0, s: 0, a: 2 },
      "samira": { partidas: 23, winrate: 34.8, mvp: 4, s: 3, a: 1 },
      "sivir": { partidas: 19, winrate: 52.6, mvp: 3, s: 5, a: 3 },
      "tristana": { partidas: 103, winrate: 56.3, mvp: 5, s: 2, a: 4 },
      "vayne": { partidas: 53, winrate: 64.2, mvp: 3, s: 3, a: 3 },
      "xayah": { partidas: 19, winrate: 42.1, mvp: 1, s: 1, a: 1 },
      "zeri": { partidas: 29, winrate: 31, mvp: 2, s: 1, a: 0 },
    },
    "SUP": {
      "janna": { partidas: 110, winrate: 46.4, mvp: 6, s: 23, a: 6 },
      "karma": { partidas: 301, winrate: 50.5, mvp: 24, s: 48, a: 31 },
      "leona": { partidas: 99, winrate: 47.5, mvp: 5, s: 24, a: 14 },
      "lulu": { partidas: 289, winrate: 48.8, mvp: 2, s: 27, a: 18 },
      "lux": { partidas: 381, winrate: 48.3, mvp: 30, s: 34, a: 23 },
      "milio": { partidas: 37, winrate: 56.8, mvp: 2, s: 6, a: 4 },
      "morgana": { partidas: 242, winrate: 51.7, mvp: 9, s: 35, a: 21 },
      "nami": { partidas: 293, winrate: 58, mvp: 17, s: 36, a: 39 },
      "nautilus": { partidas: 78, winrate: 43.6, mvp: 7, s: 16, a: 13 },
      "rakan": { partidas: 199, winrate: 45.2, mvp: 2, s: 6, a: 5 },
      "rell": { partidas: 48, winrate: 52.1, mvp: 1, s: 10, a: 6 },
      "senna": { partidas: 109, winrate: 48.6, mvp: 13, s: 11, a: 8 },
      "seraphine": { partidas: 825, winrate: 58.1, mvp: 78, s: 156, a: 80 },
      "sona": { partidas: 67, winrate: 50.7, mvp: 6, s: 7, a: 5 },
      "soraka": { partidas: 164, winrate: 52.4, mvp: 11, s: 14, a: 6 },
      "thresh": { partidas: 87, winrate: 49.4, mvp: 3, s: 14, a: 7 },
      "yuumi": { partidas: 119, winrate: 45.4, mvp: 3, s: 5, a: 4 },
      "zyra": { partidas: 80, winrate: 61.2, mvp: 13, s: 11, a: 0 }
    }
  };

  const [aliados, setAliados] = useState([]);
  const [inimigos, setInimigos] = useState([]);

  const [analise, setAnalise] = useState({
    alertas_aliados: [], balanco_inimigos: [], vantagem: 0,
    sugestoes_campeoes: [], itens_ad: [], itens_ap: [], itens_tank: [], runas: [], dicas: []
  });

  useEffect(() => {
    api.get("/champions").then((response) => {
      setCampeoes(response.data);
    }).catch(err => console.error("Erro ao carregar campeões:", err));
  }, []);

  // Função para alternar as rotas nas caixinhas de foco
  const toggleRotaFoco = (rota) => {
    if (rotasFoco.includes(rota)) {
      setRotasFoco(rotasFoco.filter(r => r !== rota));
    } else {
      setRotasFoco([...rotasFoco, rota]);
    }
  };

  // ADICIONADO: Injeção das Estatísticas no Payload e na array de dependências
  useEffect(() => {
    const fetchAnalise = async () => {
      try {
        const estatisticas_jogadores = {};
        if (usarMinhasStats) estatisticas_jogadores[minhaRotaStats] = dbEstatisticasMarcosMock[minhaRotaStats] || {};
        if (usarJulioStats) estatisticas_jogadores[julioRotaStats] = dbEstatisticasJulioMock[julioRotaStats] || {};
        if (usarMatheusStats) estatisticas_jogadores[matheusRotaStats] = dbEstatisticasMatheusMock[matheusRotaStats] || {};
        if (usarMariaStats) estatisticas_jogadores[mariaRotaStats] = dbEstatisticasMariaMock[mariaRotaStats] || {};

        const response = await api.post("/draft/analyze", {
          aliados,
          inimigos,
          rota: filtroRotaSugestao,
          rotas_foco: rotasFoco,
          estatisticas_jogadores
        });
        setAnalise(response.data);
      } catch (error) {
        console.error("Erro ao analisar draft:", error);
      }
    };

    if (aliados.length > 0 || inimigos.length > 0) fetchAnalise();
    else setAnalise({ alertas_aliados: [], balanco_inimigos: [], vantagem: 0, sugestoes_campeoes: [], itens_ad: [], itens_ap: [], itens_tank: [], runas: [], dicas: [] });
  }, [aliados, inimigos, filtroRotaSugestao, rotasFoco, usarMinhasStats, minhaRotaStats, usarJulioStats, julioRotaStats, usarMatheusStats, matheusRotaStats, usarMariaStats, mariaRotaStats]);

  const adicionarMembro = (timeStr) => {
    if (!campeaoFocado) return alert("Selecione um campeão na grade!");
    const timeAtual = timeStr === "aliados" ? aliados : inimigos;

    if (timeAtual.length >= 5) return alert("Time cheio!");
    if (aliados.some(c => c.nome === campeaoFocado) || inimigos.some(c => c.nome === campeaoFocado)) {
      return alert("Campeão já foi escolhido!");
    }
    if (timeAtual.some(c => c.rota === rotaFocada)) {
      return alert(`A rota ${rotaFocada} já está ocupada!`);
    }

    const novoMembro = { nome: campeaoFocado, rota: rotaFocada };
    timeStr === "aliados" ? setAliados([...aliados, novoMembro]) : setInimigos([...inimigos, novoMembro]);
    setCampeaoFocado(null);
  };

  const removerMembro = (timeStr, nome) => {
    timeStr === "aliados" ? setAliados(aliados.filter(c => c.nome !== nome)) : setInimigos(inimigos.filter(c => c.nome !== nome));
  };

  const campeoesFiltrados = campeoes.filter(c => {
    const bateBusca = c.nome.toLowerCase().includes(busca.toLowerCase());
    if (filtrarPorRota) {
      return bateBusca && c.rotas.includes(rotaFocada);
    }
    return bateBusca;
  });

  const DraftSlot = ({ time, index, isAliado }) => {
    const membro = time[index];
    const borderCor = isAliado ? "border-blue-500/50" : "border-red-500/50";
    const bgCor = isAliado ? "bg-blue-900/20" : "bg-red-900/20";

    return (
      <div className={`relative h-20 w-full rounded-lg border-2 ${membro ? borderCor : "border-slate-800 border-dashed"} ${bgCor} flex items-center p-2 overflow-hidden transition-all group`}>
        {membro ? (
          <>
            <ImagemInteligente pasta="campeoes" nome={membro.nome} className="h-16 w-16 rounded-full object-cover border border-slate-700 shadow-lg" />
            <div className="ml-4 flex-1">
              <h3 className="font-bold text-white text-lg">{membro.nome}</h3>
              <span className="text-xs font-bold text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded">{membro.rota}</span>
            </div>
            <button onClick={() => removerMembro(isAliado ? "aliados" : "inimigos", membro.nome)} className="absolute right-2 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900/80 p-2 rounded-full hover:bg-red-500 hover:text-white">✕</button>
          </>
        ) : (
          <div className="w-full text-center text-slate-600 font-bold text-xs uppercase tracking-widest">Aguardando Pick</div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#09090C] text-slate-200 font-sans p-4">
      <header className="text-center mb-6">
        <h1 className="text-3xl font-black bg-gradient-to-r from-blue-400 via-cyan-400 to-emerald-400 text-transparent bg-clip-text tracking-widest uppercase">Wild Rift Draft Pro</h1>
      </header>

      <main className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* TIME AZUL */}
        <div className="space-y-3 flex flex-col justify-center">
          <div className="text-center bg-blue-900/30 border border-blue-500/30 p-2 rounded-lg mb-2">
            <h2 className="text-blue-400 font-black uppercase tracking-wider text-sm">🔵 Seu Time</h2>
          </div>
          {[0, 1, 2, 3, 4].map(i => <DraftSlot key={`aliado-${i}`} time={aliados} index={i} isAliado={true} />)}
        </div>

        {/* SELEÇÃO CENTRAL */}
        <div className="lg:col-span-2 bg-[#12121A] border border-slate-800 rounded-2xl p-6 shadow-2xl flex flex-col h-[65vh]">
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <input type="text" placeholder="Buscar campeão..." value={busca} onChange={(e) => setBusca(e.target.value)} className="flex-1 bg-slate-900 border border-slate-700 p-3 rounded-lg text-white focus:outline-none focus:border-cyan-400" />

            <div className="flex gap-2">
              <select value={rotaFocada} onChange={(e) => setRotaFocada(e.target.value)} className="bg-slate-900 border border-slate-700 p-3 rounded-lg text-white font-bold focus:outline-none">
                {rotasIniciais.map(r => <option key={r} value={r}>{r}</option>)}
              </select>

              <button
                onClick={() => setFiltrarPorRota(!filtrarPorRota)}
                className={`px-4 rounded-lg font-bold text-xs uppercase tracking-wider border transition-all ${filtrarPorRota ? "bg-cyan-500/10 border-cyan-400 text-cyan-400" : "bg-slate-800 border-slate-700 text-slate-400"}`}
              >
                {filtrarPorRota ? "Filtro: Ativado" : "Filtro: Desativado"}
              </button>
            </div>
          </div>

          {/* GRID DE CAMPEÕES */}
          <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 mb-4 grid grid-cols-5 sm:grid-cols-6 md:grid-cols-8 gap-3 content-start">
            {campeoesFiltrados.map(c => {
              const selecionado = campeaoFocado === c.nome;
              const jaEscolhido = aliados.some(a => a.nome === c.nome) || inimigos.some(i => i.nome === c.nome);

              return (
                <div key={c.nome} onClick={() => !jaEscolhido && setCampeaoFocado(c.nome)} className={`relative cursor-pointer transition-transform hover:scale-110 ${jaEscolhido ? "opacity-20 cursor-not-allowed grayscale" : ""}`}>
                  <ImagemInteligente
                    pasta="campeoes"
                    nome={c.nome}
                    className={`w-full aspect-square object-cover rounded-lg border-2 ${selecionado ? "border-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.6)]" : "border-slate-800"}`}
                  />
                  {selecionado && <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-cyan-500 text-slate-900 text-[10px] font-bold px-2 py-0.5 rounded-full z-10 whitespace-nowrap">{c.nome}</div>}
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button onClick={() => adicionarMembro("aliados")} disabled={!campeaoFocado} className="bg-gradient-to-r from-blue-600 to-blue-800 disabled:opacity-50 font-black uppercase py-4 rounded-xl shadow-lg">Lock Aliado</button>
            <button onClick={() => adicionarMembro("inimigos")} disabled={!campeaoFocado} className="bg-gradient-to-r from-red-600 to-red-800 disabled:opacity-50 font-black uppercase py-4 rounded-xl shadow-lg">Lock Inimigo</button>
          </div>

          <button onClick={() => { setAliados([]); setInimigos([]); }} className="w-full mt-4 text-xs font-bold text-slate-500 hover:text-red-400 transition-colors uppercase tracking-widest">
            Zerar Todo o Draft
          </button>
        </div>

        {/* TIME VERMELHO */}
        <div className="space-y-3 flex flex-col justify-center">
          <div className="text-center bg-red-900/30 border border-red-500/30 p-2 rounded-lg mb-2">
            <h2 className="text-red-400 font-black uppercase tracking-wider text-sm">🔴 Time Inimigo</h2>
          </div>
          {[0, 1, 2, 3, 4].map(i => <DraftSlot key={`inimigo-${i}`} time={inimigos} index={i} isAliado={false} />)}
        </div>
      </main>

      {/* PAINÉIS DE RESULTADOS */}
      {(aliados.length > 0 || inimigos.length > 0) && (
        <section className="max-w-[1400px] mx-auto mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">

          <div className="bg-[#12121A] border border-slate-800 p-6 rounded-2xl flex flex-col">
            <h3 className="text-lg font-black text-white uppercase border-b border-slate-700 pb-3 mb-4 flex items-center justify-between">
              Visão Geral
              {analise.vantagem !== 0 && <span className={`px-3 py-1 text-sm rounded-full ${analise.vantagem > 0 ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"}`}>{analise.vantagem > 0 ? "Vantagem +" : "Desvantagem "}{analise.vantagem}</span>}
            </h3>
            <div className="space-y-4 flex-1">
              <div>
                <span className="text-xs text-slate-500 font-bold uppercase block mb-1">Nosso Time:</span>
                {analise.alertas_aliados.length > 0 ? analise.alertas_aliados.map((a, i) => <div key={i} className="text-sm text-amber-400 bg-amber-400/10 p-2 rounded mb-1 border-l-2 border-amber-400">{a}</div>) : <span className="text-slate-600">-</span>}
              </div>
              <div>
                <span className="text-xs text-slate-500 font-bold uppercase block mb-1">Inimigos:</span>
                {analise.balanco_inimigos.length > 0 ? analise.balanco_inimigos.map((b, i) => <div key={i} className="text-sm text-cyan-400 bg-cyan-400/10 p-2 rounded mb-1 border-l-2 border-cyan-400">{b}</div>) : <span className="text-slate-600">-</span>}
              </div>
            </div>
          </div>

          <div className="bg-[#12121A] border border-purple-500/30 p-6 rounded-2xl">
            <div className="flex justify-between items-center border-b border-slate-700 pb-3 mb-2">
              <h3 className="text-lg font-black text-purple-400 uppercase">Sugestões de Pick</h3>
              <select value={filtroRotaSugestao} onChange={(e) => setFiltroRotaSugestao(e.target.value)} className="bg-slate-900 border border-slate-700 text-slate-300 text-xs font-bold p-1 rounded outline-none focus:border-purple-500">
                <option value="TODAS">Qualquer Rota</option>
                {rotasIniciais.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>

            <div className="flex flex-wrap items-center gap-3 mb-2 bg-purple-900/10 p-2 rounded-lg border border-purple-500/20">
              <span className="text-[10px] text-purple-300 uppercase font-black tracking-wider">Focar Counter em:</span>
              {rotasIniciais.map(r => (
                <label key={`foco-${r}`} className="flex items-center space-x-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rotasFoco.includes(r)}
                    onChange={() => toggleRotaFoco(r)}
                    className="accent-purple-500 w-3 h-3 cursor-pointer"
                  />
                  <span className={`text-xs transition-colors ${rotasFoco.includes(r) ? "text-purple-400 font-bold" : "text-slate-500"}`}>{r}</span>
                </label>
              ))}
              {rotasFoco.length > 0 && (
                <button onClick={() => setRotasFoco([])} className="text-[10px] text-red-400 hover:text-red-300 uppercase font-bold ml-auto transition-colors">
                  Limpar
                </button>
              )}
            </div>

            {/* ADICIONADO: BLOCO DISCRETO DOS BOTÕES DE PERFIL */}
            <div className="flex flex-wrap items-center justify-between gap-2 mb-4 p-2 rounded-lg border border-slate-700/50 bg-slate-800/30">
              <span className="text-[10px] text-cyan-400 uppercase font-black tracking-wider w-full sm:w-auto">📊 Usar Stats:</span>

              <div className="flex items-center gap-1">
                <input type="checkbox" checked={usarMinhasStats} onChange={(e) => setUsarMinhasStats(e.target.checked)} className="accent-cyan-500 w-3 h-3 cursor-pointer" />
                <span className="text-xs text-slate-300 font-bold select-none cursor-pointer" onClick={() => setUsarMinhasStats(!usarMinhasStats)}>Marcos</span>
                <select disabled={!usarMinhasStats} value={minhaRotaStats} onChange={e => setMinhaRotaStats(e.target.value)} className="bg-slate-900 text-[10px] font-bold text-slate-300 ml-1 p-0.5 rounded border border-slate-700 outline-none">
                  {rotasIniciais.map(r => <option key={`minha-${r}`} value={r}>{r}</option>)}
                </select>
              </div>
              <div className="flex items-center gap-1">
                <input type="checkbox" checked={usarJulioStats} onChange={(e) => setUsarJulioStats(e.target.checked)} className="accent-cyan-500 w-3 h-3 cursor-pointer" />
                <span className="text-xs text-slate-300 font-bold select-none cursor-pointer" onClick={() => setUsarJulioStats(!usarJulioStats)}>Julio</span>
                <select disabled={!usarJulioStats} value={julioRotaStats} onChange={e => setJulioRotaStats(e.target.value)} className="bg-slate-900 text-[10px] font-bold text-slate-300 ml-1 p-0.5 rounded border border-slate-700 outline-none">
                  {rotasIniciais.map(r => <option key={`julio-${r}`} value={r}>{r}</option>)}
                </select>
              </div>
              <div className="flex items-center gap-1">
                <input type="checkbox" checked={usarMatheusStats} onChange={(e) => setUsarMatheusStats(e.target.checked)} className="accent-cyan-500 w-3 h-3 cursor-pointer" />
                <span className="text-xs text-slate-300 font-bold select-none cursor-pointer" onClick={() => setUsarMatheusStats(!usarMatheusStats)}>Matheus</span>
                <select disabled={!usarMatheusStats} value={matheusRotaStats} onChange={e => setMatheusRotaStats(e.target.value)} className="bg-slate-900 text-[10px] font-bold text-slate-300 ml-1 p-0.5 rounded border border-slate-700 outline-none">
                  {rotasIniciais.map(r => <option key={`matheus-${r}`} value={r}>{r}</option>)}
                </select>
              </div>

              <div className="flex items-center gap-1">
                <input type="checkbox" checked={usarMariaStats} onChange={(e) => setUsarMariaStats(e.target.checked)} className="accent-blue-500 w-3 h-3 cursor-pointer" />
                <span className="text-xs text-slate-300 font-bold select-none cursor-pointer" onClick={() => setUsarMariaStats(!usarMariaStats)}>Maria</span>
                <select disabled={!usarMariaStats} value={mariaRotaStats} onChange={e => setMariaRotaStats(e.target.value)} className="bg-slate-900 text-[10px] font-bold text-slate-300 ml-1 p-0.5 rounded border border-slate-700 outline-none">
                  {rotasIniciais.map(r => <option key={`maria-${r}`} value={r}>{r}</option>)}
                </select>
              </div>
            </div>

            {/* FOTOS DOS CAMPEÕES RECOMENDADOS */}

            <div className="flex gap-3 mb-6">
              {analise.sugestoes_campeoes.length > 0 ? analise.sugestoes_campeoes.map((champ) => (
                <div key={champ} className="text-center">
                  <ImagemInteligente pasta="campeoes" nome={champ} className="w-12 h-12 rounded-full border-2 border-purple-500/50 object-cover shadow-lg" />
                  <span className="text-[10px] text-slate-400 font-bold mt-1 block">{champ}</span>
                </div>
              )) : <span className="text-slate-500 text-sm">Adicione inimigos para ver counters.</span>}
            </div>

            <div className="space-y-2">
              {analise.dicas.map((d, i) => <p key={i} className="text-sm text-slate-300"><span className="text-purple-500 mr-2">✦</span>{d}</p>)}
            </div>
          </div>

          <div className="bg-[#12121A] border border-slate-800 p-6 rounded-2xl flex flex-col">
            <h3 className="text-lg font-black text-emerald-400 uppercase border-b border-slate-700 pb-3 mb-4">Build Recomendada</h3>
            <div className="overflow-y-auto custom-scrollbar flex-1 pr-2 space-y-4">
              {analise.itens_ad && analise.itens_ad.length > 0 && (
                <div>
                  <h4 className="text-xs font-black text-slate-400 bg-slate-950/30 p-1 px-2 rounded inline-block mb-2">AD / Atiradores</h4>
                  <ul className="text-xs text-slate-300 space-y-2">
                    {analise.itens_ad.map((it, i) => {
                      const imagens = obterNomesDosItens(it);
                      return (
                        <li key={i} className="flex items-center gap-2">
                          <div className="flex gap-1">
                            {imagens.map((img, idx) => (
                              <ImagemInteligente key={idx} pasta="itens" nome={img} className="w-8 h-8 rounded" />
                            ))}
                          </div>
                          <span>{it}</span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}

              {analise.itens_ap && analise.itens_ap.length > 0 && (
                <div>
                  <h4 className="text-xs font-black text-cyan-400 bg-cyan-950/30 p-1 px-2 rounded inline-block mb-2">AP / Magos</h4>
                  <ul className="text-xs text-slate-300 space-y-2">
                    {analise.itens_ap.map((it, i) => {
                      const imagens = obterNomesDosItens(it);
                      return (
                        <li key={i} className="flex items-center gap-2">
                          <div className="flex gap-1">
                            {imagens.map((img, idx) => (
                              <ImagemInteligente key={idx} pasta="itens" nome={img} className="w-8 h-8 rounded" />
                            ))}
                          </div>
                          <span>{it}</span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}

              {analise.itens_tank && analise.itens_tank.length > 0 && (
                <div>
                  <h4 className="text-xs font-black text-green-400 bg-green-950/30 p-1 px-2 rounded inline-block mb-2">Tank / Frontline</h4>
                  <ul className="text-xs text-slate-300 space-y-2">
                    {analise.itens_tank.map((it, i) => {
                      const imagens = obterNomesDosItens(it);
                      return (
                        <li key={i} className="flex items-center gap-2">
                          <div className="flex gap-1">
                            {imagens.map((img, idx) => (
                              <ImagemInteligente key={idx} pasta="itens" nome={img} className="w-8 h-8 rounded" />
                            ))}
                          </div>
                          <span>{it}</span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}