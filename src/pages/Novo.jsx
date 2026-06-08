// Página para adicionar um novo produto
import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../services/supabase'
import { FaArrowLeft, FaSave, FaTimes, FaBoxOpen } from 'react-icons/fa'
import '../styles/Novo.css'

export default function NovoProduto() {
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)
    const [errors, setErrors] = useState({})

    const [formData, setFormData] = useState({
        nome: '',
        categoria: '',
        quantidade: '',
        preco: '',
        quantidade_minima: ''
    })

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
        // Limpar erro do campo ao digitar
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
        } else if (formData.quantidade < 0) {
            novosErrors.quantidade = 'Quantidade não pode ser negativa'
        }

        if (!formData.preco) {
            novosErrors.preco = 'Preço é obrigatório'
        } else if (formData.preco <= 0) {
            novosErrors.preco = 'Preço deve ser maior que zero'
        }

        if (formData.quantidade_minima && formData.quantidade_minima < 0) {
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

        setLoading(true)

        try {
            // Pegar usuário logado
            const { data: { user }, error: userError } = await supabase.auth.getUser()
            
            if (userError) throw userError
            if (!user) {
                alert('Usuário não autenticado')
                navigate('/login')
                return
            }

            // Preparar dados para inserção
            const novoProduto = {
                nome: formData.nome.trim(),
                categoria: formData.categoria.trim(),
                quantidade: parseInt(formData.quantidade),
                preco: parseFloat(formData.preco),
                quantidade_minima: formData.quantidade_minima ? parseInt(formData.quantidade_minima) : 0,
                id_usuario: user.id
            }

            const { data, error } = await supabase
                .from('produtos')
                .insert([novoProduto])
                .select()

            if (error) {
                if (error.code === '23505') {
                    alert('Já existe um produto com este nome')
                } else {
                    throw error
                }
            } else {
                alert('Produto adicionado com sucesso!')
                navigate('/home')
            }
        } catch (error) {
            console.error('Erro ao adicionar produto:', error)
            alert('Erro ao adicionar produto. Tente novamente.')
        } finally {
            setLoading(false)
        }
    }

    function handleCancelar() {
        if (window.confirm('Tem certeza que deseja cancelar? As informações não serão salvas.')) {
            navigate('/home')
        }
    }

    return (
        <div className="novo-container">
            <div className="novo-card">
                <div className="novo-header">
                    <Link to="/home" className="btn-back">
                        <FaArrowLeft /> Voltar
                    </Link>
                    <h1>
                        <FaBoxOpen className="header-icon" />
                        Adicionar Novo Produto
                    </h1>
                    <div className="header-placeholder"></div>
                </div>

                <form onSubmit={handleSubmit} className="novo-form">
                    <div className="form-grid">
                        {/* Nome do Produto */}
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
                                disabled={loading}
                            />
                        </div>

                        {/* Categoria */}
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
                                disabled={loading}
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

                        {/* Quantidade */}
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
                                disabled={loading}
                            />
                        </div>

                        {/* Preço */}
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
                                disabled={loading}
                            />
                        </div>

                        {/* Quantidade Mínima */}
                        <div className="form-group">
                            <label htmlFor="quantidade_minima">
                                Quantidade Mínima
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
                                disabled={loading}
                            />
                            <small className="field-help">
                                Quando o estoque atingir este valor, um alerta será mostrado
                            </small>
                        </div>
                    </div>

                    {/* Resumo */}
                    {formData.nome && formData.preco && (
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
                                    <strong>Quantidade:</strong> {formData.quantidade || 0} unidades
                                </div>
                                <div className="resumo-item">
                                    <strong>Preço:</strong> R$ {parseFloat(formData.preco || 0).toFixed(2)}
                                </div>
                                {formData.quantidade_minima > 0 && (
                                    <div className="resumo-item">
                                        <strong>Alerta em:</strong> {formData.quantidade_minima} unidades
                                    </div>
                                )}
                                {formData.quantidade && formData.preco && (
                                    <div className="resumo-item total">
                                        <strong>Valor Total:</strong> R$ {(parseInt(formData.quantidade || 0) * parseFloat(formData.preco || 0)).toFixed(2)}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Botões */}
                    <div className="form-actions">
                        <button
                            type="button"
                            onClick={handleCancelar}
                            className="btn-cancel"
                            disabled={loading}
                        >
                            <FaTimes /> Cancelar
                        </button>
                        <button
                            type="submit"
                            className="btn-submit"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <div className="spinner-small"></div>
                                    Salvando...
                                </>
                            ) : (
                                <>
                                    <FaSave /> Salvar Produto
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}