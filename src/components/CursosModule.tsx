import React, { useState, useEffect } from 'react';
import { PlusCircle, Building2, Trash2, Plus, X, BookOpen, MapPin, AlertCircle } from 'lucide-react';

export default function CursosModule() {
  const [campusesList, setCampusesList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCampusId, setSelectedCampusId] = useState<string>('');
  const [showCampusModal, setShowCampusModal] = useState(false);

  // Campus Form State
  const [newCampusNome, setNewCampusNome] = useState('');
  const [newCampusSigla, setNewCampusSigla] = useState('');
  const [newCourseNome, setNewCourseNome] = useState<Record<string, string>>({});
  const [newCourseNivel, setNewCourseNivel] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchCampuses();
  }, []);

  const fetchCampuses = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/campuses');
      const data = await response.json();
      setCampusesList(data);
      if (data.length > 0) {
        setSelectedCampusId(prev => {
          if (data.some((c: any) => c.id === prev)) return prev;
          return data[0].id;
        });
      }
    } catch (error) {
      console.error('Erro ao buscar campi:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCampus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCampusNome.trim() || !newCampusSigla.trim()) return;
    try {
      const response = await fetch('/api/campuses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome: newCampusNome, sigla: newCampusSigla })
      });
      if (response.ok) {
        const saved = await response.json();
        setNewCampusNome('');
        setNewCampusSigla('');
        setShowCampusModal(false);
        await fetchCampuses();
        setSelectedCampusId(saved.id);
      } else {
        alert('Erro ao cadastrar campus.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteCampus = async (id: string) => {
    if (!confirm('Deseja realmente excluir este campus e todos os seus cursos vinculados?')) return;
    try {
      const response = await fetch(`/api/campuses/${id}`, { method: 'DELETE' });
      if (response.ok) {
        await fetchCampuses();
      } else {
        alert('Erro ao excluir campus.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddCourse = async (campusId: string) => {
    const nome = newCourseNome[campusId];
    const nivel = newCourseNivel[campusId] || 'Graduação';
    if (!nome || !nome.trim()) return;
    try {
      const response = await fetch('/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, nivel, campusId })
      });
      if (response.ok) {
        setNewCourseNome({ ...newCourseNome, [campusId]: '' });
        await fetchCampuses();
      } else {
        alert('Erro ao cadastrar curso.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteCourse = async (courseId: string) => {
    if (!confirm('Deseja realmente remover este curso?')) return;
    try {
      const response = await fetch(`/api/courses/${courseId}`, { method: 'DELETE' });
      if (response.ok) {
        await fetchCampuses();
      } else {
        alert('Erro ao remover curso.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="glass-panel" style={{ textAlign: 'center', padding: '3rem' }}>
        Carregando Módulo de Gestão de Cursos...
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* HEADER SECTION */}
      <div className="glass-panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 850, color: 'var(--text-primary)' }}>Módulo de Gestão de Cursos</h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Cadastre novos campi do IFAM e vincule cursos parametrizados por seus níveis de ensino.</p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        
        {/* Top selection bar */}
        <div className="glass-panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-primary)' }}>Selecionar Campus:</label>
            <select
              value={selectedCampusId}
              onChange={e => setSelectedCampusId(e.target.value)}
              style={{ padding: '0.5rem', borderRadius: '10px', border: '1px solid rgba(0,0,0,0.12)', fontSize: '0.85rem', background: '#fff', minWidth: '240px', fontWeight: 700, cursor: 'pointer' }}
            >
              <option value="">Selecione um campus...</option>
              {campusesList.map(c => (
                <option key={c.id} value={c.id}>{c.sigla} - {c.nome}</option>
              ))}
            </select>
          </div>
          <button onClick={() => setShowCampusModal(true)} className="btn-primary">
            <Plus size={16} /> Cadastrar Novo Campus
          </button>
        </div>

        {/* Selected Campus Glass Panel details */}
        {(() => {
          const campus = campusesList.find(c => c.id === selectedCampusId);
          if (!campus) {
            return (
              <div className="glass-panel" style={{ textAlign: 'center', padding: '3.5rem', color: 'var(--text-muted)' }}>
                <AlertCircle size={36} style={{ marginBottom: '0.75rem', color: 'var(--text-muted)' }} />
                <h5 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>Nenhum Campus Selecionado</h5>
                <p style={{ fontSize: '0.8rem' }}>Por favor, selecione um campus na barra acima ou cadastre um novo para gerenciar seus cursos.</p>
              </div>
            );
          }
          return (
            <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', borderLeft: '5px solid var(--primary-color)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(0,0,0,0.06)', paddingBottom: '0.75rem' }}>
                <div>
                  <span className="badge" style={{ backgroundColor: 'var(--primary-glow)', color: 'var(--primary-color)', fontSize: '0.85rem', padding: '0.3rem 0.6rem' }}>{campus.sigla}</span>
                  <strong style={{ fontSize: '1.15rem', color: 'var(--text-primary)', marginLeft: '0.5rem' }}>{campus.nome}</strong>
                </div>
                <button 
                  onClick={() => handleDeleteCampus(campus.id)} 
                  className="btn-secondary"
                  style={{ padding: '0.4rem 0.8rem', color: 'var(--danger-color)', borderColor: 'rgba(220,38,38,0.2)', fontSize: '0.75rem', gap: '0.25rem' }}
                  title="Excluir Campus"
                >
                  <Trash2 size={14} /> Excluir Campus
                </button>
              </div>

              {/* List of Courses */}
              <div>
                <h5 style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>Cursos Ofertados ({campus.cursos?.length || 0})</h5>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', maxHeight: '350px', overflowY: 'auto', paddingRight: '0.25rem' }}>
                  {campus.cursos?.length === 0 ? (
                    <div style={{ gridColumn: 'span 2', fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic', textAlign: 'center', padding: '2.5rem 0', background: 'rgba(0,0,0,0.01)', borderRadius: '8px' }}>
                      Nenhum curso cadastrado neste campus ainda.
                    </div>
                  ) : (
                    campus.cursos.map((c: any) => (
                      <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0.85rem', background: '#ffffff', border: '1px solid rgba(0,0,0,0.05)', borderRadius: '8px', fontSize: '0.8rem', transition: 'all 0.2s' }}>
                        <span style={{ color: 'var(--text-primary)', display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '0.35rem' }}>
                          <BookOpen size={14} style={{ color: 'var(--primary-color)' }} />
                          <strong>{c.nome}</strong>
                          <span className="badge" style={{ fontSize: '0.55rem', padding: '0.15rem 0.4rem', backgroundColor: 'var(--primary-glow)', color: 'var(--primary-color)' }}>{c.nivel || 'Graduação'}</span>
                        </span>
                        <button
                          onClick={() => handleDeleteCourse(c.id)}
                          style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--danger-color)', display: 'flex', alignItems: 'center' }}
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Add Course Form */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', borderTop: '1px solid rgba(0,0,0,0.06)', paddingTop: '1.25rem', marginTop: '0.5rem' }}>
                <h5 style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-primary)' }}>Cadastrar Novo Curso neste Campus</h5>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input 
                    type="text" 
                    value={newCourseNome[campus.id] || ''}
                    onChange={e => setNewCourseNome({ ...newCourseNome, [campus.id]: e.target.value })}
                    placeholder="Ex: Engenharia Mecatrônica" 
                    style={{ padding: '0.5rem', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.15)', fontSize: '0.8rem', flex: 2.5 }} 
                  />
                  <select
                    value={newCourseNivel[campus.id] || 'Graduação'}
                    onChange={e => setNewCourseNivel({ ...newCourseNivel, [campus.id]: e.target.value })}
                    style={{ padding: '0.5rem', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.15)', fontSize: '0.8rem', flex: 1, background: '#fff', cursor: 'pointer' }}
                  >
                    <option value="Integrado">Integrado</option>
                    <option value="Subsequente">Subsequente</option>
                    <option value="Proeja">Proeja</option>
                    <option value="Graduação">Graduação</option>
                    <option value="Pós-Graduação">Pós-Graduação</option>
                  </select>
                  <button 
                    onClick={() => handleAddCourse(campus.id)} 
                    className="btn-primary" 
                    style={{ padding: '0.5rem 1.5rem', fontSize: '0.8rem' }}
                  >
                    <Plus size={14} /> Cadastrar Curso
                  </button>
                </div>
              </div>

            </div>
          );
        })()}
      </div>

      {/* CREATE CAMPUS MODAL */}
      {showCampusModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div className="glass-panel" style={{ width: '90%', maxWidth: '500px', background: '#ffffff', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(0,0,0,0.08)', paddingBottom: '0.75rem' }}>
              <h4 style={{ fontSize: '1.15rem', fontWeight: 850, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <MapPin size={18} style={{ color: 'var(--primary-color)' }} />
                Cadastrar Novo Campus
              </h4>
              <button onClick={() => setShowCampusModal(false)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateCampus} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 700 }}>Sigla do Campus</label>
                <input 
                  type="text" 
                  value={newCampusSigla} 
                  onChange={e => setNewCampusSigla(e.target.value)} 
                  placeholder="Ex: CMC, COARI, CMZL" 
                  style={{ padding: '0.5rem', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.15)', fontSize: '0.8rem' }} 
                  required 
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 700 }}>Nome Completo do Campus</label>
                <input 
                  type="text" 
                  value={newCampusNome} 
                  onChange={e => setNewCampusNome(e.target.value)} 
                  placeholder="Ex: Campus Manaus Centro" 
                  style={{ padding: '0.5rem', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.15)', fontSize: '0.8rem' }} 
                  required 
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', borderTop: '1px solid rgba(0,0,0,0.08)', paddingTop: '1rem', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setShowCampusModal(false)} className="btn-secondary">Cancelar</button>
                <button type="submit" className="btn-primary">Salvar Campus</button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
