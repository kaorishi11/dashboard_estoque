import { useEffect, useState } from "react";
import { supabase } from "../services/supabase";
import Navbar from "../components/Navbar";
import { Link } from "react-router-dom";
import { FaBoxes, FaExclamationTriangle, FaMoneyBillWave, FaChartLine} from "react-icons/fa";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';
import "../styles/Dashboard.css";

ChartJS.register( CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalProdutos: 0,
    produtosBaixoEstoque: 0,
    valorTotalEstoque: 0,
  });
  const [loading, setLoading] = useState(true);
  const [categoriasData, setCategoriasData] = useState({});
  const [categoriasPieData, setCategoriasPieData] = useState({});

  useEffect(() => {
    carregarDados();
  }, []);

  async function carregarDados() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: produtos, error } = await supabase
        .from("produtos")
        .select("*")
        .eq("id_usuario", user.id);

      if (error) throw error;

      const baixoEstoque = produtos.filter(p => p.quantidade <= p.quantidade_minima);
      const valorTotal = produtos.reduce((total, p) => total + (p.preco * p.quantidade), 0);

      setStats({
        totalProdutos: produtos.length,
        produtosBaixoEstoque: baixoEstoque.length,
        valorTotalEstoque: valorTotal,
      });

      prepararDadosGraficos(produtos);
      
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setLoading(false);
    }
  }

  function prepararDadosGraficos(produtos) {
    const categoriasQuantidade = {};
    produtos.forEach(p => {
      categoriasQuantidade[p.categoria] = (categoriasQuantidade[p.categoria] || 0) + p.quantidade;
    });

    const topCategorias = Object.entries(categoriasQuantidade)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    setCategoriasData({
      labels: topCategorias.map(([nome]) => nome),
      datasets: [
        {
          label: 'Quantidade em Estoque',
          data: topCategorias.map(([, qtd]) => qtd),
          backgroundColor: 'rgba(54, 162, 235, 0.6)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1,
          borderRadius: 8,
        },
      ],
    });

    const categoriasCount = {};
    produtos.forEach(p => {
      categoriasCount[p.categoria] = (categoriasCount[p.categoria] || 0) + 1;
    });

    setCategoriasPieData({
      labels: Object.keys(categoriasCount),
      datasets: [{
        data: Object.values(categoriasCount),
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(153, 102, 255, 0.6)',
          'rgba(255, 159, 64, 0.6)',
        ],
        borderWidth: 1,
      }]
    });
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Carregando dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <Navbar />
      
      <div className="dashboard-content">
        <div className="dashboard-header">
          <h1 className="dashboard-title">Dashboard</h1>
          <Link to="/novo" className="btn-primary">
            + Novo Produto
          </Link>
        </div>
        
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon blue">
              <FaBoxes />
            </div>
            <div className="stat-info">
              <h3>Total de Produtos</h3>
              <p className="stat-value">{stats.totalProdutos}</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon yellow">
              <FaExclamationTriangle />
            </div>
            <div className="stat-info">
              <h3>Baixo Estoque</h3>
              <p className="stat-value warning">{stats.produtosBaixoEstoque}</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon green">
              <FaMoneyBillWave />
            </div>
            <div className="stat-info">
              <h3>Valor do Estoque</h3>
              <p className="stat-value">
                R$ {stats.valorTotalEstoque.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </div>

        <div className="charts-grid">
          <div className="chart-card">
            <h3>
              <FaChartLine className="chart-icon" />
              Top Categorias por Quantidade
            </h3>
            {categoriasData.labels?.length > 0 ? (
              <div className="chart-wrapper">
                <Bar 
                  data={categoriasData} 
                  options={{
                    responsive: true,
                    maintainAspectRatio: true,
                    plugins: {
                      legend: {
                        position: 'top',
                        labels: { font: { size: 12 } }
                      },
                      tooltip: {
                        callbacks: {
                          label: function(context) {
                            return `Quantidade: ${context.parsed.y} unidades`;
                          }
                        }
                      }
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        title: {
                          display: true,
                          text: 'Quantidade',
                          font: { size: 12 }
                        }
                      },
                      x: {
                        title: {
                          display: true,
                          text: 'Categorias',
                          font: { size: 12 }
                        }
                      }
                    }
                  }}
                />
              </div>
            ) : (
              <p className="no-data">Nenhum produto cadastrado</p>
            )}
          </div>

          <div className="chart-card">
            <h3>Distribuição de Produtos por Categoria</h3>
            {categoriasPieData.labels?.length > 0 ? (
              <div className="chart-wrapper">
                <Pie 
                  data={categoriasPieData} 
                  options={{
                    responsive: true,
                    maintainAspectRatio: true,
                    plugins: {
                      legend: {
                        position: 'bottom',
                        labels: { font: { size: 11 } }
                      },
                      tooltip: {
                        callbacks: {
                          label: function(context) {
                            const label = context.label || '';
                            const value = context.parsed || 0;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((value / total) * 100).toFixed(1);
                            return `${label}: ${value} produtos (${percentage}%)`;
                          }
                        }
                      }
                    }
                  }}
                />
              </div>
            ) : (
              <p className="no-data">Nenhum produto cadastrado</p>
            )}
          </div>
        </div>

        {stats.produtosBaixoEstoque > 0 && (
          <div className="alert-summary">
            <FaExclamationTriangle className="alert-icon" />
            <span>
              <strong>Atenção!</strong> {stats.produtosBaixoEstoque} produto(s) com estoque baixo.
              <Link to="/home" className="alert-link"> Ver produtos →</Link>
            </span>
          </div>
        )}
      </div>
    </div>
  );
}