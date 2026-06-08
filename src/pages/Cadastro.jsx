import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "../services/supabase";

export default function Cadastro() {
  const navigate = useNavigate();

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [foto, setFoto] = useState("");
  const [senha, setSenha] = useState("");

  const [loading, setLoading] = useState(false);

  async function cadastrar(e) {
    e.preventDefault();

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password: senha,
      });

      if (error) throw error;

      const { error: erroUsuario } = await supabase
        .from("usuarios")
        .insert({
          id: data.user.id,
          nome,
          email,
          foto,
        });

      if (erroUsuario) throw erroUsuario;

      alert("Cadastro realizado com sucesso!");

      navigate("/");
    } catch (error) {
      alert(error.message);
    }

    setLoading(false);
  }

  return (
    <div className="cadastro-container">
      <form onSubmit={cadastrar}>
        <h1>Cadastrar Usuário</h1>

        <input
          type="text"
          placeholder="Nome"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          required
        />

        <input
          type="email"
          placeholder="E-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="text"
          placeholder="URL da foto"
          value={foto}
          onChange={(e) => setFoto(e.target.value)}
        />

        <input
          type="password"
          placeholder="Senha"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? "Cadastrando..." : "Cadastrar"}
        </button>

        <p>
          Já possui conta? <Link to="/">Entrar</Link>
        </p>
      </form>
    </div>
  );
}