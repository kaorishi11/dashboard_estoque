import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../services/supabase'
import { FaEdit, FaTrash, FaPlus, FaSearch, FaArrowLeft } from 'react-icons/fa'
import Navbar from '../components/Navbar'
import '../styles/Home.css'

export default function Home() {
    const [produtos, setProdutos] = useState([])
    const [produtosFiltrados, setProdutosFiltrados] = useState([])
    const [loading, setLoading] = useState(true)
    const [busca, setBusca] = useState('')
    const [categoriaFiltro, setCategoriaFiltro] = useState('')
    const [categorias, setCategorias] = useState([])
    const navigate = useNavigate()

    useEffect(() => {
        getProdutos()
    }, [])

    async function getProdutos() {
        setLoading(true)
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const { data: produtos, error } = await supabase
                .from('produtos')
                .select('*')
                .eq('id_usuario', user.id)
                .order('created_at', { ascending: false })

            if (error) throw error
            
            if (produtos) {
                setProdutos(produtos)
                setProdutosFiltrados(produtos)
                
                const uniqueCategorias = [...new Set(produtos.map(p => p.categoria))]
                setCategorias(uniqueCategorias)
            }
        } catch (error) {
            console.error('Erro ao carregar produtos:', error)
            alert('Erro ao carregar produtos')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        let resultados = produtos
        
        if (busca) {
            resultados = resultados.filter(produto =>
                produto.nome.toLowerCase().includes(busca.toLowerCase()) ||
                produto.categoria.toLowerCase().includes(busca.toLowerCase())
            )
        }
        
        if (categoriaFiltro) {
            resultados = resultados.filter(produto =>
                produto.categoria === categoriaFiltro
            )
        }
        
        setProdutosFiltrados(resultados)
    }, [busca, categoriaFiltro, produtos])

    async function excluirProduto(id, nome) {
        if (window.confirm(`Tem certeza que deseja excluir o produto "${nome}"?`)) {
            try {
                const { error } = await supabase
                    .from('produtos')
                    .delete()
                    .eq('id', id)

                if (error) throw error
                
                alert('Produto excluído com sucesso!')
                getProdutos()
            } catch (error) {
                console.error('Erro ao excluir produto:', error)
                alert('Erro ao excluir produto')
            }
        }
    }

    function editarProduto(id) {
        navigate(`/editar?id=${id}`)
    }

    function getStatusColor(quantidade, quantidade_minima) {
        if (quantidade === 0) return 'status-zero'
        if (quantidade <= quantidade_minima) return 'status-low'
        return 'status-ok'
    }

    function getStatusTexto(quantidade, quantidade_minima) {
        if (quantidade === 0) return 'Sem estoque'
        if (quantidade <= quantidade_minima) return 'Estoque baixo'
        return 'Estoque normal'
    }

    function limparFiltros() {
        setBusca('')
        setCategoriaFiltro('')
    }

    return (
        <div className="home-container">
            <Navbar />
            
            <div className="home-content">
                <div className="home-header">
                    <h1>Lista de Produtos</h1>
                </div>

                <div className="filtros-container">
                    <div className="search-box">
                        <FaSearch className="search-icon" />
                        <input
                            type="text"
                            placeholder="Buscar por nome ou categoria..."
                            value={busca}
                            onChange={(e) => setBusca(e.target.value)}
                            className="search-input"
                        />
                    </div>

                    <div className="filtro-categoria">
                        <select
                            value={categoriaFiltro}
                            onChange={(e) => setCategoriaFiltro(e.target.value)}
                            className="categoria-select"
                        >
                            <option value="">Todas as categorias</option>
                            {categorias.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>

                    {(busca || categoriaFiltro) && (
                        <button onClick={limparFiltros} className="btn-clear-filters">
                            Limpar filtros
                        </button>
                    )}
                </div>
                
                <div className="resumo">
                    <p>Total de produtos: <strong>{produtosFiltrados.length}</strong></p>
                    {busca && <p>Resultados encontrados: <strong>{produtosFiltrados.length}</strong></p>}
                </div>

                {loading ? (
                    <div className="loading-container">
                        <div className="loading-spinner"></div>
                        <p>Carregando produtos...</p>
                    </div>
                ) : (
                    <>
                        {produtosFiltrados.length === 0 ? (
                            <div className="empty-state">
                                <p>Nenhum produto encontrado.</p>
                                {busca || categoriaFiltro ? (
                                    <button onClick={limparFiltros} className="btn-clear">
                                        Limpar filtros
                                    </button>
                                ) : (
                                    <Link to="/novo" className="btn-add-empty">
                                        Adicionar primeiro produto
                                    </Link>
                                )}
                            </div>
                        ) : (
                            <div className="table-responsive">
                                <table className="produtos-table">
                                    <thead>
                                        <tr>
                                            <th>Produto</th>
                                            <th>Categoria</th>
                                            <th>Quantidade</th>
                                            <th>Preço Unitário</th>
                                            <th>Valor Total</th>
                                            <th>Status</th>
                                            <th>Ações</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {produtosFiltrados.map((produto) => (
                                            <tr key={produto.id}>
                                                <td className="produto-nome">
                                                    <strong>{produto.nome}</strong>
                                                </td>
                                                <td>
                                                    <span className="categoria-badge">
                                                        {produto.categoria}
                                                    </span>
                                                </td>
                                                <td className={`quantidade-cell ${getStatusColor(produto.quantidade, produto.quantidade_minima)}`}>
                                                    <strong>{produto.quantidade}</strong>
                                                    {produto.quantidade_minima > 0 && (
                                                        <small> (min: {produto.quantidade_minima})</small>
                                                    )}
                                                </td>
                                                <td>
                                                    R$ {produto.preco.toFixed(2)}
                                                </td>
                                                <td>
                                                    <strong>
                                                        R$ {(produto.preco * produto.quantidade).toFixed(2)}
                                                    </strong>
                                                </td>
                                                <td>
                                                    <span className={`status-badge ${getStatusColor(produto.quantidade, produto.quantidade_minima)}`}>
                                                        {getStatusTexto(produto.quantidade, produto.quantidade_minima)}
                                                    </span>
                                                </td>
                                                <td className="acoes">
                                                    <button
                                                        onClick={() => editarProduto(produto.id)}
                                                        className="btn-edit"
                                                        title="Editar"
                                                    >
                                                        <FaEdit />
                                                    </button>
                                                    <button
                                                        onClick={() => excluirProduto(produto.id, produto.nome)}
                                                        className="btn-delete"
                                                        title="Excluir"
                                                    >
                                                        <FaTrash />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    )
}