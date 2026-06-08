import { useState, useEffect } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { supabase } from '../services/supabase'
import { FaArrowLeft, FaSave, FaTimes, FaEdit, FaTrash } from 'react-icons/fa'
import Navbar from '../components/Navbar'
import "../styles/Editar.css";

export default function EditarProduto() {
    const navigate = useNavigate()
    const location = useLocation()
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [errors, setErrors] = useState({})
    const [produtoId, setProdutoId] = useState(null)
    
    const [formData, setFormData] = useState({
        nome: '',
        categoria: '',
        quantidade: '',
        preco: '',
        quantidade_minima: ''
    })

    useEffect(() => {
        const params = new URLSearchParams(location.search)
        const id = params.get('id')
        console.log('ID do produto:', id)
        if (id) {
            setProdutoId(id)
            carregarProduto(id)
        } else {
            alert('ID do produto não encontrado')
            navigate('/produtos')
        }
    }, [location.search])

    async function carregarProduto(id) {
        setLoading(true)
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                navigate('/login')
                return
            }

            console.log('Buscando produto com ID:', id)

            const { data: produto, error } = await supabase
                .from('produtos')
                .select('*')
                .eq('id', id)
                .eq('id_usuario', user.id)
                .single()

            if (error) {
                console.error('Erro do Supabase:', error)
                throw error
            }

            if (produto) {
                console.log('Produto encontrado:', produto)
                setFormData({
                    nome: produto.nome,
                    categoria: produto.categoria,
                    quantidade: produto.quantidade.toString(),
                    preco: produto.preco.toString(),
                    quantidade_minima: produto.quantidade_minima?.toString() || ''
                })
            } else {
                alert('Produto não encontrado')
                navigate('/produtos')
            }
        } catch (error) {
            console.error('Erro ao carregar produto:', error)
            alert('Erro ao carregar dados do produto: ' + error.message)
            navigate('/produtos')
        } finally {
            setLoading(false)
        }
    }

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }))
        }
    }

    const validarFormulario = () => {
        const novosErrors = {}

        if (!formData.nome.trim()) {
            novosErrors.nome = 'Nome do produto é obrigatório'
        } else if (formData.nome.length < 3) {
            novosErrors.nome = 'Nome deve ter pelo menos 3 caracteres'
        }

        if (!formData.categoria.trim()) {
            novosErrors.categoria = 'Categoria é obrigatória'
        }

        if (!formData.quantidade) {
            novosErrors.quantidade = 'Quantidade é obrigatória'
        } else if (parseInt(formData.quantidade) < 0) {
            novosErrors.quantidade = 'Quantidade não pode ser negativa'
        }

        if (!formData.preco) {
            novosErrors.preco = 'Preço é obrigatório'
        } else if (parseFloat(formData.preco) <= 0) {
            novosErrors.preco = 'Preço deve ser maior que zero'
        }

        if (formData.quantidade_minima && parseInt(formData.quantidade_minima) < 0) {
            novosErrors.quantidade_minima = 'Quantidade mínima não pode ser negativa'
        }

        setErrors(novosErrors)
        return Object.keys(novosErrors).length === 0
    }

    async function handleSubmit(e) {
    e.preventDefault()
    
    if (!validarFormulario()) {
        return
    }

    setSaving(true)

    try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            navigate('/login')
            return
        }

        const produtoAtualizado = {
            nome: formData.nome.trim(),
            categoria: formData.categoria.trim(),
            quantidade: parseInt(formData.quantidade),
            preco: parseFloat(formData.preco),
            quantidade_minima: formData.quantidade_minima ? parseInt(formData.quantidade_minima) : 0
        }

        console.log('Atualizando produto:', produtoId, produtoAtualizado)

        const { error } = await supabase
            .from('produtos')
            .update(produtoAtualizado)
            .eq('id', produtoId)
            .eq('id_usuario', user.id)

        if (error) throw error

        alert('Produto atualizado com sucesso!')
        navigate('/produtos')
    } catch (error) {
        console.error('Erro ao atualizar produto:', error)
        alert('Erro ao atualizar produto: ' + error.message)
    } finally {
        setSaving(false)
    }
}

    async function handleDelete() {
        if (!window.confirm('Tem certeza que deseja excluir este produto?')) {
            return
        }

        setSaving(true)

        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const { error } = await supabase
                .from('produtos')
                .delete()
                .eq('id', produtoId)
                .eq('id_usuario', user.id)

            if (error) throw error

            alert('Produto excluído com sucesso!')
            navigate('/produtos')
        } catch (error) {
            console.error('Erro ao excluir produto:', error)
            alert('Erro ao excluir produto: ' + error.message)
        } finally {
            setSaving(false)
        }
    }

    function handleCancelar() {
        if (window.confirm('Tem certeza que deseja cancelar?')) {
            navigate('/produtos')
        }
    }

    function getStatusInfo() {
        const qtd = parseInt(formData.quantidade) || 0
        const qtdMin = parseInt(formData.quantidade_minima) || 0
        
        if (qtd === 0) {
            return { text: 'Sem estoque', color: 'danger', icon: '🔴' }
        } else if (qtd <= qtdMin && qtdMin > 0) {
            return { text: 'Abaixo do mínimo', color: 'warning', icon: '⚠️' }
        } else if (qtd <= 5) {
            return { text: 'Estoque baixo', color: 'warning', icon: '🟡' }
        } else {
            return { text: 'Estoque normal', color: 'success', icon: '🟢' }
        }
    }

    if (loading) {
        return (
            <div className="editar-container">
                <Navbar />
                <div className="editar-content">
                    <div className="loading-container">
                        <div className="loading-spinner"></div>
                        <p>Carregando dados do produto...</p>
                    </div>
                </div>
            </div>
        )
    }

    const statusInfo = getStatusInfo()

    return (
        <div className="editar-container">
            <Navbar />
            
            <div className="editar-content">
                <div className="editar-card">
                    <div className="editar-header">
                        <Link to="/produtos" className="btn-back">
                            <FaArrowLeft /> Voltar
                        </Link>
                        <h1>
                            <FaEdit className="header-icon" />
                            Editar Produto
                        </h1>
                        <button onClick={handleDelete} className="btn-delete-header" disabled={saving}>
                            <FaTrash /> Excluir
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="editar-form">
                        <div className="form-grid">
                            <div className="form-group full-width">
                                <label htmlFor="nome">
                                    Nome do Produto *
                                    {errors.nome && <span className="error-message">{errors.nome}</span>}
                                </label>
                                <input
                                    type="text"
                                    id="nome"
                                    name="nome"
                                    placeholder="Digite o nome do produto"
                                    value={formData.nome}
                                    onChange={handleChange}
                                    className={errors.nome ? 'error' : ''}
                                    disabled={saving}
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="categoria">
                                    Categoria *
                                    {errors.categoria && <span className="error-message">{errors.categoria}</span>}
                                </label>
                                <input
                                    type="text"
                                    id="categoria"
                                    name="categoria"
                                    placeholder="Ex: Eletrônicos, Roupas, Alimentos..."
                                    value={formData.categoria}
                                    onChange={handleChange}
                                    className={errors.categoria ? 'error' : ''}
                                    disabled={saving}
                                    list="categorias-sugeridas"
                                />
                                <datalist id="categorias-sugeridas">
                                    <option value="Eletrônicos" />
                                    <option value="Roupas" />
                                    <option value="Alimentos" />
                                    <option value="Bebidas" />
                                    <option value="Móveis" />
                                    <option value="Livros" />
                                    <option value="Ferramentas" />
                                    <option value="Limpeza" />
                                    <option value="Higiene" />
                                    <option value="Brinquedos" />
                                </datalist>
                            </div>

                            <div className="form-group">
                                <label htmlFor="quantidade">
                                    Quantidade *
                                    {errors.quantidade && <span className="error-message">{errors.quantidade}</span>}
                                </label>
                                <input
                                    type="number"
                                    id="quantidade"
                                    name="quantidade"
                                    placeholder="0"
                                    min="0"
                                    step="1"
                                    value={formData.quantidade}
                                    onChange={handleChange}
                                    className={errors.quantidade ? 'error' : ''}
                                    disabled={saving}
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="preco">
                                    Preço (R$) *
                                    {errors.preco && <span className="error-message">{errors.preco}</span>}
                                </label>
                                <input
                                    type="number"
                                    id="preco"
                                    name="preco"
                                    placeholder="0,00"
                                    min="0"
                                    step="0.01"
                                    value={formData.preco}
                                    onChange={handleChange}
                                    className={errors.preco ? 'error' : ''}
                                    disabled={saving}
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="quantidade_minima">
                                    Quantidade Mínima (Alerta)
                                    {errors.quantidade_minima && <span className="error-message">{errors.quantidade_minima}</span>}
                                </label>
                                <input
                                    type="number"
                                    id="quantidade_minima"
                                    name="quantidade_minima"
                                    placeholder="0"
                                    min="0"
                                    step="1"
                                    value={formData.quantidade_minima}
                                    onChange={handleChange}
                                    className={errors.quantidade_minima ? 'error' : ''}
                                    disabled={saving}
                                />
                                <small className="field-help">
                                    Quando o estoque atingir este valor, um alerta será mostrado
                                </small>
                            </div>
                        </div>

                        <div className={`status-produto status-${statusInfo.color}`}>
                            <div className="status-icon">{statusInfo.icon}</div>
                            <div className="status-content">
                                <h4>Status do Estoque</h4>
                                <p>{statusInfo.text}</p>
                            </div>
                        </div>

                        <div className="resumo-produto">
                            <h3>Resumo do Produto</h3>
                            <div className="resumo-info">
                                <div className="resumo-item">
                                    <strong>Produto:</strong> {formData.nome}
                                </div>
                                <div className="resumo-item">
                                    <strong>Categoria:</strong> {formData.categoria || '—'}
                                </div>
                                <div className="resumo-item">
                                    <strong>Quantidade:</strong> {parseInt(formData.quantidade || 0)} unidades
                                </div>
                                <div className="resumo-item">
                                    <strong>Preço Unitário:</strong> R$ {parseFloat(formData.preco || 0).toFixed(2)}
                                </div>
                                <div className="resumo-item total">
                                    <strong>Valor Total:</strong> R$ {(parseInt(formData.quantidade || 0) * parseFloat(formData.preco || 0)).toFixed(2)}
                                </div>
                            </div>
                        </div>

                        <div className="form-actions">
                            <button type="button" onClick={handleCancelar} className="btn-cancel" disabled={saving}>
                                <FaTimes /> Cancelar
                            </button>
                            <button type="submit" className="btn-submit" disabled={saving}>
                                {saving ? (
                                    <>
                                        <div className="spinner-small"></div>
                                        Salvando...
                                    </>
                                ) : (
                                    <>
                                        <FaSave /> Salvar Alterações
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}