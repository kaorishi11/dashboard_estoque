import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "./services/supabase";

import Produtos from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Cadastro from "./pages/Cadastro";
import Editar from "./pages/Editar";
import Novo from "./pages/Novo";
import Perfil from "./pages/Perfil";

export default function App() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      setUser(user);
      setLoading(false);
    };

    getUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          flexDirection: "column",
          gap: "20px",
        }}
      >
        <p>Carregando...</p>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={user ? <Dashboard /> : <Login />}
        />

        <Route path="/cadastro" element={<Cadastro />} />

        <Route path="/produtos" element={<Produtos />} />

        <Route
          path="/home"
          element={user ? <Dashboard /> : <Login />}
        />

        <Route
          path="/editar"
          element={user ? <Editar /> : <Login />}
        />

        <Route
          path="/perfil"
          element={<Perfil/>}
        />

        <Route
          path="/novo"
          element={user ? <Novo /> : <Login />}
        />
      </Routes>
    </BrowserRouter>
  );
}