import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../services/supabase'
import { FaUser, FaEnvelope, FaCamera, FaSave, FaArrowLeft, FaSignOutAlt } from 'react-icons/fa'
import Navbar from '../components/Navbar'
import '../styles/Perfil.css'

export default function Perfil() {
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)
    const [userData, setUserData] = useState({
        id: '',
        nome: '',
        email: '',
        foto: ''
    })
    const [editando, setEditando] = useState(false)
    const [avatarPreview, setAvatarPreview] = useState('')
    const [mensagem, setMensagem] = useState({ tipo: '', texto: '' })

    useEffect(() => {
        carregarPerfil()
    }, [])

    async function carregarPerfil() {
        setLoading(true)
        try {
            const { data: { user }, error: userError } = await supabase.auth.getUser()
            
            if (userError) throw userError
            if (!user) {
                navigate('/login')
                return
            }

            const { data: usuario, error: dbError } = await supabase
                .from('usuarios')
                .select('*')
                .eq('id', user.id)
                .single()

            if (dbError && dbError.code !== 'PGRST116') throw dbError

            if (usuario) {
                setUserData({
                    id: user.id,
                    nome: usuario.nome || '',
                    email: user.email || '',
                    foto: usuario.foto || ''
                })
                setAvatarPreview(usuario.foto || '')
            } else {
                setUserData({
                    id: user.id,
                    nome: '',
                    email: user.email || '',
                    foto: ''
                })
            }
        } catch (error) {
            console.error('Erro ao carregar perfil:', error)
            mostrarMensagem('erro', 'Erro ao carregar dados do perfil')
        } finally {
            setLoading(false)
        }
    }

    async function atualizarPerfil(e) {
        e.preventDefault()
        setLoading(true)

        try {
            const { error } = await supabase
                .from('usuarios')
                .upsert({
                    id: userData.id,
                    nome: userData.nome,
                    email: userData.email,
                    foto: userData.foto
                })

            if (error) throw error

            mostrarMensagem('sucesso', 'Perfil atualizado com sucesso!')
            setEditando(false)
            
            if (userData.nome) {
                await supabase.auth.updateUser({
                    data: { nome: userData.nome }
                })
            }
        } catch (error) {
            console.error('Erro ao atualizar perfil:', error)
            mostrarMensagem('erro', 'Erro ao atualizar perfil: ' + error.message)
        } finally {
            setLoading(false)
        }
    }

    async function fazerLogout() {
        if (window.confirm('Tem certeza que deseja sair?')) {
            try {
                await supabase.auth.signOut()
                navigate('/')
            } catch (error) {
                console.error('Erro ao fazer logout:', error)
                mostrarMensagem('erro', 'Erro ao sair')
            }
        }
    }

    function mostrarMensagem(tipo, texto) {
        setMensagem({ tipo, texto })
        setTimeout(() => {
            setMensagem({ tipo: '', texto: '' })
        }, 3000)
    }

    function handleAvatarChange(e) {
        const url = e.target.value
        setUserData({ ...userData, foto: url })
        setAvatarPreview(url)
    }

    function cancelarEdicao() {
        setEditando(false)
        setAvatarPreview(userData.foto)
        carregarPerfil()
    }

    if (loading && !userData.nome) {
        return (
            <div className="perfil-container">
                <Navbar />
                <div className="perfil-content">
                    <div className="loading-container">
                        <div className="loading-spinner"></div>
                        <p>Carregando perfil...</p>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="perfil-container">
            <Navbar />
            
            <div className="perfil-content">
                <div className="perfil-header">
                    <h1>Meu Perfil</h1>
                    {!editando ? (
                        <button onClick={() => setEditando(true)} className="btn-edit-profile">
                            <FaSave /> Editar
                        </button>
                    ) : (
                        <div className="header-actions">
                            <button onClick={cancelarEdicao} className="btn-cancel" disabled={loading}>
                                Cancelar
                            </button>
                            <button onClick={atualizarPerfil} className="btn-save" disabled={loading}>
                                {loading ? 'Salvando...' : 'Salvar Alterações'}
                            </button>
                        </div>
                    )}
                </div>

                {mensagem.texto && (
                    <div className={`mensagem ${mensagem.tipo}`}>
                        {mensagem.texto}
                    </div>
                )}

                <div className="perfil-card">
                    <div className="perfil-avatar-section">
                        <div className="avatar-container">
                            {avatarPreview ? (
                                <img src={avatarPreview} alt="Avatar" className="avatar-image" />
                            ) : (
                                <div className="avatar-placeholder">
                                    <FaUser />
                                </div>
                            )}
                            {editando && (
                                <div className="avatar-edit-icon">
                                    <FaCamera />
                                </div>
                            )}
                        </div>
                        {editando && (
                            <div className="avatar-input">
                                <label>URL da foto:</label>
                                <input
                                    type="text"
                                    placeholder="https://exemplo.com/foto.jpg"
                                    value={userData.foto}
                                    onChange={handleAvatarChange}
                                    className="avatar-url-input"
                                />
                                <small>Insira uma URL válida para sua foto de perfil</small>
                            </div>
                        )}
                    </div>

                    <form onSubmit={atualizarPerfil} className="perfil-form">
                        <div className="form-group">
                            <label>
                                <FaUser className="input-icon" />
                                Nome completo
                            </label>
                            {editando ? (
                                <input
                                    type="text"
                                    value={userData.nome}
                                    onChange={(e) => setUserData({ ...userData, nome: e.target.value })}
                                    placeholder="Digite seu nome"
                                    required
                                    disabled={loading}
                                />
                            ) : (
                                <div className="info-display">
                                    <p>{userData.nome || 'Não informado'}</p>
                                </div>
                            )}
                        </div>

                        <div className="form-group">
                            <label>
                                <FaEnvelope className="input-icon" />
                                E-mail
                            </label>
                            <div className="info-display">
                                <p>{userData.email}</p>
                                <small className="email-info">O e-mail não pode ser alterado</small>
                            </div>
                        </div>

                        {!editando && (
                            <div className="perfil-stats">
                                <h3>Estatísticas da Conta</h3>
                                <div className="stats-grid">
                                    <div className="stat-item">
                                        <span className="stat-label">Conta criada em:</span>
                                        <span className="stat-value">
                                            {new Date().toLocaleDateString('pt-BR')}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </form>

                    <div className="perfil-actions">
                        <button onClick={fazerLogout} className="btn-logout">
                            <FaSignOutAlt /> Sair da Conta
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}