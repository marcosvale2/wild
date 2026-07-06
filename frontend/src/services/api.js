import axios from "axios";

// Verifica se o site está rodando localmente no seu computador
const isLocalhost = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";

export default axios.create({
  // Se for local, aponta para o seu FastAPI (porta 8000). Se for online, aponta para o Render.
  baseURL: isLocalhost 
    ? "http://127.0.0.1:8000" 
    : "https://wild-uwzf.onrender.com"
});