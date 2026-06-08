import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { FaTachometerAlt, FaBoxes, FaUser, FaSignOutAlt} from "react-icons/fa";
import { supabase } from "../services/supabase";
import "./Navbar.css";

export default function Navbar() {
  const [usuario, setUsuario] = useState(null);
  const location = useLocation();

  useEffect(() => {
    async function carregarUsuario() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data } = await supabase
        .from("usuarios")
        .select("*")
        .eq("id", user.id)
        .single();

      setUsuario(data);
    }

    carregarUsuario();
  }, []);

  async function logout() {
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  return (
    <nav className="navbar">
      <div className="navbar-user">
        <img
          src={usuario?.foto || "https://via.placeholder.com/80"}
          alt="Usuário"
          className="navbar-avatar"
        />
        <div>
          <p className="navbar-label">Bem-vindo</p>
          <h3>{usuario?.nome || "Carregando..."}</h3>
        </div>
      </div>

      <div className="navbar-links">
        <Link 
          to="/home" 
          className={location.pathname === "/home" ? "active" : ""}
        >
          <FaTachometerAlt />
          Dashboard
        </Link>

        <Link 
          to="/produtos"
          className={location.pathname === "/produtos" ? "active" : ""}
        >
          <FaBoxes />
          Produtos
        </Link>

        <Link 
          to="/perfil" 
          className={location.pathname === "/perfil" ? "active" : ""}
        >
          <FaUser />
          Perfil
        </Link>

        <button onClick={logout} className="logout-btn">
          <FaSignOutAlt />
          Sair
        </button>
      </div>
    </nav>
  );
}