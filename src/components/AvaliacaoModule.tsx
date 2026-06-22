import React, { useState, useEffect } from 'react';
import { CheckCircle2, AlertCircle, FileText, User, Award, ArrowRight, X, Star, FileCheck, Info } from 'lucide-react';

export default function AvaliacaoModule() {
  const [projects, setProjects] = useState<any[]>([]);
  const [editais, setEditais] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<any | null>(null);
  const [activeEdital, setActiveEdital] = useState<any | null>(null);

  // Evaluation Form State
  const [scores, setScores] = useState<Record<string, number>>({});
  const [parecer, setParecer] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      // Fetch editais to resolve criteria
      const editalRes = await fetch('/api/editais');
      const editalData = await editalRes.json();
      setEditais(editalData);

      // Fetch projects
      const projRes = await fetch('/api/projects');
      const projData = await projRes.json();
      // Filter projects that belong to an edital and are awaiting evaluation or in progress
      setProjects(projData.filter((p: any) => p.editalId != null));
    } catch (error) {
      console.error('Erro ao carregar dados de avaliação:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenEvaluation = (project: any) => {
    setSelectedProject(project);
    const edital = editais.find(e => e.id === project.editalId);
    setActiveEdital(edital || null);

    // Initial empty scores
    const initialScores: Record<string, number> = {};
    if (edital && edital.criteria) {
      edital.criteria.forEach((c: any) => {
        initialScores[c.id] = 0;
      });
    } else {
      // Default criteria if none found
      initialScores['default_crit1'] = 0;
      initialScores['default_crit2'] = 0;
    }
    setScores(initialScores);
    setParecer('');
  };

  const handleScoreChange = (criterionId: string, value: number, max: number) => {
    const val = Math.min(max, Math.max(0, value));
    setScores({
      ...scores,
      [criterionId]: val
    });
  };

  const calculateTotal = () => {
    return Object.values(scores).reduce((acc, curr) => acc + curr, 0);
  };

  const handleEvaluate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject) return;
    setSubmitting(true);
    
    try {
      const formattedScores = Object.entries(scores).map(([criterionId, score]) => ({
        criterionId,
        score
      }));

      const response = await fetch(`/api/projects/${selectedProject.id}/evaluate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          evaluatorEmail: 'avaliador.comite@ifam.edu.br',
          scores: formattedScores,
          parecer
        })
      });

      if (response.ok) {
        alert('Avaliação registrada com sucesso!');
        setSelectedProject(null);
        fetchInitialData();
      } else {
        const err = await response.json();
        alert('Erro ao submeter avaliação: ' + err.error);
      }
    } catch (error) {
      console.error(error);
      alert('Erro de conexão ao submeter avaliação.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="glass-panel" style={{ textAlign: 'center', padding: '3rem' }}>
        Carregando painel do comitê de avaliação...
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* HEADER */}
      <div className="glass-panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 850, color: 'var(--text-primary)' }}>Módulo do Comitê de Avaliação</h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Avalie os projetos inscritos na Fase 1. Insira as notas para cada critério configurado pela Reitoria.
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: selectedProject ? '1.1fr 1.9fr' : '1fr', gap: '1.5rem', transition: 'all 0.3s' }}>
        
        {/* LISTA DE PROJETOS PARA AVALIAR */}
        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1.5rem' }}>
          <h4 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)', borderBottom: '1px solid rgba(0,0,0,0.08)', paddingBottom: '0.5rem' }}>
            Fila de Avaliação de Projetos
          </h4>
          
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.8rem' }}>
              <thead>
                <tr style={{ background: 'rgba(0,0,0,0.02)', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Código / Título</th>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Orientador</th>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Campus</th>
                  <th style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>Ação</th>
                </tr>
              </thead>
              <tbody>
                {projects.length === 0 ? (
                  <tr>
                    <td colSpan={4} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                      Nenhum projeto pendente de avaliação.
                    </td>
                  </tr>
                ) : (
                  projects.map((proj) => {
                    const hasEvaluated = proj.evaluations && proj.evaluations.length > 0;
                    return (
                      <tr key={proj.id} style={{ borderBottom: '1px solid rgba(0,0,0,0.04)', background: selectedProject?.id === proj.id ? 'rgba(21,128,61,0.03)' : 'transparent' }}>
                        <td style={{ padding: '0.75rem 0.5rem' }}>
                          <div style={{ fontWeight: 800, color: 'var(--text-primary)' }}>{proj.codigo}</div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden', maxWidth: '220px' }} title={proj.titulo}>
                            {proj.titulo}
                          </div>
                        </td>
                        <td style={{ padding: '0.75rem 0.5rem', color: 'var(--text-secondary)' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><User size={12} /> {proj.orientador}</span>
                        </td>
                        <td style={{ padding: '0.75rem 0.5rem', fontWeight: 600 }}>{proj.campus}</td>
                        <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>
                          {hasEvaluated ? (
                            <button 
                              onClick={() => handleOpenEvaluation(proj)}
                              className="btn-secondary" 
                              style={{ padding: '0.35rem 0.7rem', fontSize: '0.7rem', borderColor: 'rgba(21,128,61,0.3)', color: 'var(--primary-color)' }}
                            >
                              Reavaliar
                            </button>
                          ) : (
                            <button 
                              onClick={() => handleOpenEvaluation(proj)}
                              className="btn-primary" 
                              style={{ padding: '0.35rem 0.7rem', fontSize: '0.7rem' }}
                            >
                              Avaliar <ArrowRight size={12} />
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* WORKSPACE DE AVALIAÇÃO DO PROJETO */}
        {selectedProject && (
          <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', border: '1px solid rgba(37,99,235,0.15)' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid rgba(0,0,0,0.08)', paddingBottom: '1rem' }}>
              <div>
                <span className="badge" style={{ backgroundColor: 'rgba(37,99,235,0.08)', color: 'var(--secondary-color)', fontSize: '0.65rem' }}>Workspace de Avaliação</span>
                <h4 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.25rem' }}>
                  {selectedProject.codigo} - {selectedProject.titulo}
                </h4>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                  Proponente: <strong>{selectedProject.orientador}</strong> | Campus: <strong>{selectedProject.campus}</strong> | Fomento: <strong>{selectedProject.fomento}</strong>
                </p>
              </div>
              <button onClick={() => setSelectedProject(null)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.1fr', gap: '1.5rem' }}>
              
              {/* Documentação Anexada */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <h5 style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <FileText size={16} style={{ color: 'var(--secondary-color)' }} />
                  Arquivos da Inscrição (Fase 1)
                </h5>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div style={{ padding: '0.85rem', background: 'rgba(0,0,0,0.02)', borderRadius: '10px', border: '1px solid rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: '0.8rem', fontWeight: 700 }}>Projeto de Pesquisa Detalhado</div>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>Formato PDF - Plano de Trabalho</div>
                    </div>
                    <a href="#" onClick={(e) => { e.preventDefault(); alert('Download do arquivo de projeto simulado concluído.'); }} style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--secondary-color)', textDecoration: 'none' }}>Visualizar PDF</a>
                  </div>

                  <div style={{ padding: '0.85rem', background: 'rgba(0,0,0,0.02)', borderRadius: '10px', border: '1px solid rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: '0.8rem', fontWeight: 700 }}>Currículo Lattes do Orientador</div>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>Espelho CNPq consolidado</div>
                    </div>
                    <a href="#" onClick={(e) => { e.preventDefault(); alert('Download do arquivo Lattes simulado concluído.'); }} style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--secondary-color)', textDecoration: 'none' }}>Visualizar PDF</a>
                  </div>
                </div>

                <div style={{ background: 'rgba(21,128,61,0.04)', border: '1px solid rgba(21,128,61,0.1)', padding: '0.75rem', borderRadius: '10px', display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                  <Info size={16} style={{ color: 'var(--primary-color)', flexShrink: 0, marginTop: '2px' }} />
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                    <strong>Instrução da Banca:</strong> Confirme a aderência dos documentos e atribua notas abaixo baseando-se no barema de pontuação do edital.
                  </div>
                </div>
              </div>

              {/* Barema de Notas */}
              <form onSubmit={handleEvaluate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', background: 'rgba(0,0,0,0.01)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.04)' }}>
                <h5 style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <Award size={16} style={{ color: 'var(--primary-color)' }} />
                  Barema de Notas do Edital
                </h5>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '240px', overflowY: 'auto' }}>
                  {activeEdital?.criteria && activeEdital.criteria.length > 0 ? (
                    activeEdital.criteria.map((c: any) => (
                      <div key={c.id} style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                          <span style={{ fontWeight: 700 }}>{c.nome}</span>
                          <span style={{ color: 'var(--text-muted)' }}>Máx {c.pontosMax} pts</span>
                        </div>
                        <input 
                          type="number" 
                          min={0}
                          max={c.pontosMax}
                          step="0.5"
                          value={scores[c.id] || 0}
                          onChange={e => handleScoreChange(c.id, parseFloat(e.target.value) || 0, c.pontosMax)}
                          style={{ padding: '0.4rem', borderRadius: '6px', border: '1px solid rgba(0,0,0,0.15)', fontSize: '0.8rem' }}
                          required
                        />
                      </div>
                    ))
                  ) : (
                    // Default fallback criteria if none configured
                    <>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                          <span style={{ fontWeight: 700 }}>Qualidade Científica do Projeto</span>
                          <span style={{ color: 'var(--text-muted)' }}>Máx 60 pts</span>
                        </div>
                        <input 
                          type="number" 
                          min={0}
                          max={60}
                          value={scores['default_crit1'] || 0}
                          onChange={e => handleScoreChange('default_crit1', parseFloat(e.target.value) || 0, 60)}
                          style={{ padding: '0.4rem', borderRadius: '6px', border: '1px solid rgba(0,0,0,0.15)', fontSize: '0.8rem' }}
                          required
                        />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                          <span style={{ fontWeight: 700 }}>Currículo Lattes do Orientador</span>
                          <span style={{ color: 'var(--text-muted)' }}>Máx 40 pts</span>
                        </div>
                        <input 
                          type="number" 
                          min={0}
                          max={40}
                          value={scores['default_crit2'] || 0}
                          onChange={e => handleScoreChange('default_crit2', parseFloat(e.target.value) || 0, 40)}
                          style={{ padding: '0.4rem', borderRadius: '6px', border: '1px solid rgba(0,0,0,0.15)', fontSize: '0.8rem' }}
                          required
                        />
                      </div>
                    </>
                  )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700 }}>Parecer / Justificativa (Banca)</label>
                  <textarea 
                    value={parecer}
                    onChange={e => setParecer(e.target.value)}
                    placeholder="Descreva a fundamentação da nota..."
                    rows={2}
                    style={{ padding: '0.4rem', borderRadius: '6px', border: '1px solid rgba(0,0,0,0.15)', fontSize: '0.75rem', resize: 'vertical' }}
                    required
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(0,0,0,0.08)', paddingTop: '0.75rem', marginTop: '0.5rem' }}>
                  <div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>Nota Final Projeto</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 900, color: 'var(--primary-color)' }}>{calculateTotal()} / 100</div>
                  </div>
                  <button type="submit" disabled={submitting} className="btn-primary" style={{ padding: '0.5rem 1rem' }}>
                    {submitting ? 'Gravando...' : 'Gravar Nota e Parecer'}
                  </button>
                </div>
              </form>

            </div>
          </div>
        )}

      </div>

    </div>
  );
}
