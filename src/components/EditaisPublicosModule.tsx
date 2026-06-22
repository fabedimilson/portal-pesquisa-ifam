import React, { useState, useEffect } from 'react';
import { FileText, Building2, Award, Calendar, ChevronDown, CheckCircle2 } from 'lucide-react';

export default function EditaisPublicosModule({ currentRole, selectedCampus }: { currentRole: string, selectedCampus: string }) {
  const [editais, setEditais] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterLevel, setFilterLevel] = useState('ALL');

  // Modal State
  const [selectedEdital, setSelectedEdital] = useState<any | null>(null);
  const [showModal, setShowModal] = useState(false);

  const openEditalModal = (edital: any) => {
    setSelectedEdital(edital);
    setShowModal(true);
  };

  useEffect(() => {
    fetchEditais();
  }, []);

  const fetchEditais = async () => {
    try {
      const res = await fetch('/api/editais');
      const data = await res.json();
      setEditais(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const getStatus = (edital: any) => {
    if (!edital.inscricaoInicio || !edital.inscricaoFim) return 'INDEFINIDO';
    const now = new Date();
    // Reset time for current day to allow applying today
    now.setHours(0, 0, 0, 0);
    const start = new Date(edital.inscricaoInicio);
    const end = new Date(edital.inscricaoFim);
    end.setHours(23, 59, 59, 999);
    
    if (now > end) return 'CONCLUÍDO';
    if (now < start) return 'EM BREVE';
    return 'VIGENTE';
  };

  // Visibility logic
  const visibleEditais = editais.filter(edital => {
    if (currentRole === 'PPGI') return true;
    if (selectedCampus === 'ALL') return true;
    
    // Check if edital has quotas for selectedCampus
    if (!edital.quotas || edital.quotas.length === 0) return true; // If no quotas defined, assume it applies globally
    return edital.quotas.some((q: any) => q.campus === selectedCampus);
  });

  const filteredEditais = visibleEditais.filter(edital => {
    // Status Filter
    if (filterStatus !== 'ALL') {
      if (getStatus(edital) !== filterStatus) return false;
    }
    // Level Filter
    if (filterLevel !== 'ALL') {
      const levels = edital.niveis ? edital.niveis.split(',') : [];
      if (levels.length > 0 && !levels.includes(filterLevel)) return false;
    }
    return true;
  });

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Award size={28} style={{ color: 'var(--primary-color)' }} />
          Mural de Editais
        </h2>
      </div>

      <div className="glass-panel" style={{ display: 'flex', gap: '1rem', padding: '1rem' }}>
        <div style={{ flex: 1 }}>
          <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Status</label>
          <select 
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.1)' }}
          >
            <option value="ALL">Todos os Status</option>
            <option value="VIGENTE">Inscrições Abertas (Vigente)</option>
            <option value="EM BREVE">Em Breve</option>
            <option value="CONCLUÍDO">Concluído</option>
            <option value="INDEFINIDO">Sem data definida</option>
          </select>
        </div>
        <div style={{ flex: 1 }}>
          <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Nível de Ensino Permitido</label>
          <select 
            value={filterLevel}
            onChange={e => setFilterLevel(e.target.value)}
            style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.1)' }}
          >
            <option value="ALL">Todos os Níveis</option>
            <option value="Integrado">Integrado</option>
            <option value="Subsequente">Subsequente</option>
            <option value="Proeja">Proeja</option>
            <option value="Graduação">Graduação</option>
            <option value="Pós-graduação">Pós-graduação</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>Carregando editais...</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {filteredEditais.map(edital => {
            const status = getStatus(edital);
            const statusColor = status === 'VIGENTE' ? '#10b981' : status === 'EM BREVE' ? '#f59e0b' : status === 'CONCLUÍDO' ? '#ef4444' : '#6b7280';
            const niveis = edital.niveis ? edital.niveis.split(',') : [];

            return (
              <div key={edital.id} className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', backgroundColor: statusColor }} />
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <span style={{ fontSize: '0.7rem', fontWeight: 800, padding: '0.2rem 0.6rem', borderRadius: '20px', backgroundColor: `${statusColor}20`, color: statusColor }}>
                    {status}
                  </span>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>{edital.ano}</span>
                </div>

                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem', lineHeight: 1.3 }}>{edital.titulo}</h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {edital.descricao || 'Sem descrição.'}
                  </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: 'auto' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    <Calendar size={14} style={{ color: 'var(--primary-color)' }} />
                    <span style={{ fontWeight: 600 }}>Inscrições:</span>
                    <span>
                      {edital.inscricaoInicio ? `${new Date(edital.inscricaoInicio).toLocaleDateString('pt-BR', {timeZone: 'UTC'})} até ${new Date(edital.inscricaoFim).toLocaleDateString('pt-BR', {timeZone: 'UTC'})}` : 'Não definidas'}
                    </span>
                  </div>
                  
                  {niveis.length > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--text-secondary)', flexWrap: 'wrap' }}>
                      <Building2 size={14} style={{ color: 'var(--primary-color)' }} />
                      <span style={{ fontWeight: 600 }}>Níveis Aceitos:</span>
                      <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
                        {niveis.map((n: string) => <span key={n} style={{ background: 'rgba(0,0,0,0.05)', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>{n}</span>)}
                      </div>
                    </div>
                  )}

                  {selectedCampus !== 'ALL' && edital.quotas && edital.quotas.some((q: any) => q.campus === selectedCampus) && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      <Award size={14} style={{ color: 'var(--primary-color)' }} />
                      <span style={{ fontWeight: 600 }}>Bolsas para {selectedCampus}:</span>
                      <span>{edital.quotas.find((q: any) => q.campus === selectedCampus)?.quantidade} vagas</span>
                    </div>
                  )}
                </div>

                <div style={{ marginTop: '0.5rem', paddingTop: '1rem', borderTop: '1px solid rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'flex-end' }}>
                  <button 
                    onClick={() => openEditalModal(edital)}
                    className="btn-primary" 
                    style={{ width: '100%', justifyContent: 'center' }}
                  >
                    Ver Detalhes
                  </button>
                </div>
              </div>
            );
          })}
          
          {filteredEditais.length === 0 && (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
              Nenhum edital encontrado para os filtros selecionados.
            </div>
          )}
        </div>
      )}

      {/* Edital Modal */}
      {showModal && selectedEdital && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '700px', maxHeight: '90vh', overflowY: 'auto', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', position: 'relative' }}>
            <button onClick={() => setShowModal(false)} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>X</button>
            
            <div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>{selectedEdital.titulo}</h2>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, padding: '0.2rem 0.6rem', borderRadius: '20px', backgroundColor: getStatus(selectedEdital) === 'VIGENTE' ? '#10b98120' : getStatus(selectedEdital) === 'EM BREVE' ? '#f59e0b20' : '#6b728020', color: getStatus(selectedEdital) === 'VIGENTE' ? '#10b981' : getStatus(selectedEdital) === 'EM BREVE' ? '#f59e0b' : '#6b7280' }}>
                  {getStatus(selectedEdital)}
                </span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>{selectedEdital.ano}</span>
              </div>
            </div>

            <div>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Descrição</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{selectedEdital.descricao || 'Sem descrição.'}</p>
            </div>

            <div>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Cronograma Completo</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', background: 'rgba(0,0,0,0.02)', padding: '1rem', borderRadius: '12px' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}><strong style={{ color: 'var(--text-primary)' }}>Inscrições:</strong><br/>{selectedEdital.inscricaoInicio ? `${new Date(selectedEdital.inscricaoInicio).toLocaleDateString('pt-BR', {timeZone: 'UTC'})} a ${new Date(selectedEdital.inscricaoFim).toLocaleDateString('pt-BR', {timeZone: 'UTC'})}` : 'A definir'}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}><strong style={{ color: 'var(--text-primary)' }}>Avaliação Comitê:</strong><br/>{selectedEdital.avaliacaoInicio ? `${new Date(selectedEdital.avaliacaoInicio).toLocaleDateString('pt-BR', {timeZone: 'UTC'})} a ${new Date(selectedEdital.avaliacaoFim).toLocaleDateString('pt-BR', {timeZone: 'UTC'})}` : 'A definir'}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}><strong style={{ color: 'var(--text-primary)' }}>Resultado Parcial:</strong><br/>{selectedEdital.resultadoParcial ? new Date(selectedEdital.resultadoParcial).toLocaleDateString('pt-BR', {timeZone: 'UTC'}) : 'A definir'}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}><strong style={{ color: 'var(--text-primary)' }}>Resultado Final:</strong><br/>{selectedEdital.resultadoFinal ? new Date(selectedEdital.resultadoFinal).toLocaleDateString('pt-BR', {timeZone: 'UTC'}) : 'A definir'}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', gridColumn: 'span 2' }}><strong style={{ color: 'var(--text-primary)' }}>Onboarding e Docs:</strong><br/>{selectedEdital.onboardingInicio ? `${new Date(selectedEdital.onboardingInicio).toLocaleDateString('pt-BR', {timeZone: 'UTC'})} a ${new Date(selectedEdital.onboardingFim).toLocaleDateString('pt-BR', {timeZone: 'UTC'})}` : 'A definir'}</div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
              <button onClick={() => setShowModal(false)} className="btn-secondary">Voltar</button>
              <button 
                className="btn-primary" 
                disabled={getStatus(selectedEdital) !== 'VIGENTE'} 
                style={{ opacity: getStatus(selectedEdital) !== 'VIGENTE' ? 0.5 : 1 }}
                onClick={() => alert('Módulo de inscrição online do aluno em desenvolvimento...')}
              >
                Realizar Inscrição
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
