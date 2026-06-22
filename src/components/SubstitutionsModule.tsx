import React, { useState } from 'react';
import { RefreshCw } from 'lucide-react';

interface Project {
  id: string;
  codigo: string;
  campus: string;
  titulo: string;
  orientador: string;
  fomento: string;
  discente: string | null;
  status: string;
}

interface Substitution {
  id: string;
  projectId: string;
  estudanteSainte: string;
  estudanteEntrante: string;
  data: string;
  relatorioParcialUrl?: string | null;
  justificativa?: string | null;
  project?: Project;
}

interface SubstitutionsModuleProps {
  projects: Project[];
  substitutions: Substitution[];
  currentRole: string;
  selectedCampus: string;
  onRefresh: () => void;
}

export default function SubstitutionsModule({
  projects,
  substitutions,
  currentRole,
  selectedCampus,
  onRefresh
}: SubstitutionsModuleProps) {
  const [selectedSubProjId, setSelectedSubProjId] = useState<string>('');
  const [subJustificativa, setSubJustificativa] = useState<string>('');
  const [subSainteName, setSubSainteName] = useState<string>('');
  const [subEntranteName, setSubEntranteName] = useState<string>('');
  const [subRelatorioParcial, setSubRelatorioParcial] = useState<boolean>(false);
  const [subProjectSearch, setSubProjectSearch] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleCreateSubstitution = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubProjId) {
      alert('Selecione um projeto.');
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch('/api/substitutions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: selectedSubProjId,
          estudanteSainte: subSainteName,
          estudanteEntrante: subEntranteName,
          justificativa: subJustificativa,
          relatorioParcialUrl: subRelatorioParcial ? 'relatorio_parcial_simulado.pdf' : null
        })
      });
      if (res.ok) {
        alert('Substituição homologada e novo discente alocado!');
        setSelectedSubProjId('');
        setSubJustificativa('');
        setSubSainteName('');
        setSubEntranteName('');
        setSubRelatorioParcial(false);
        onRefresh();
      } else {
        alert('Erro ao registrar substituição.');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '2rem' }}>
        
        {/* Form de Substituição */}
        <form onSubmit={handleCreateSubstitution} className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <RefreshCw size={20} style={{ color: 'var(--accent-color)' }} /> Solicitar Substituição de Aluno
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            A substituição congela os pagamentos do aluno sainte e exige o envio do Relatório Parcial do projeto.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            
            {/* Select Project */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Selecione o Projeto</label>
              <input 
                type="text"
                placeholder="🔍 Digite código, título, orientador ou discente..."
                value={subProjectSearch}
                onChange={(e) => setSubProjectSearch(e.target.value)}
                style={{ padding: '0.45rem 0.75rem', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '8px', fontSize: '0.8rem', marginBottom: '0.25rem', outline: 'none' }}
              />
              <select 
                value={selectedSubProjId}
                onChange={(e) => {
                  setSelectedSubProjId(e.target.value);
                  const proj = projects.find(p => p.id === e.target.value);
                  if (proj) {
                    setSubSainteName(proj.discente || '');
                  }
                }}
                style={{ padding: '0.5rem', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '8px', fontSize: '0.85rem' }}
                required
              >
                <option value="">Selecione um projeto...</option>
                {projects
                  .filter(p => {
                    const matchesRole = currentRole === 'PPGI' || currentRole === 'PROFESSOR' || p.campus === selectedCampus;
                    const matchesDiscente = !!p.discente;
                    
                    const query = subProjectSearch.toLowerCase().trim();
                    const matchesQuery = !query || 
                      p.codigo.toLowerCase().includes(query) ||
                      p.titulo.toLowerCase().includes(query) ||
                      p.orientador.toLowerCase().includes(query) ||
                      (p.discente && p.discente.toLowerCase().includes(query));
                      
                    return matchesDiscente && matchesRole && matchesQuery;
                  })
                  .map(p => (
                    <option key={p.id} value={p.id}>{p.codigo} - {p.titulo.slice(0, 60)}...</option>
                  ))}
              </select>
            </div>

            {/* Sainte Name */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Estudante Sainte (Atual)</label>
              <input 
                type="text" 
                value={subSainteName}
                disabled
                style={{ padding: '0.5rem', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '8px', background: '#f1f5f9', fontSize: '0.85rem' }}
              />
            </div>

            {/* Entrante Name */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Nome Completo do Estudante Entrante</label>
              <input 
                type="text" 
                value={subEntranteName}
                onChange={(e) => setSubEntranteName(e.target.value)}
                style={{ padding: '0.5rem', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '8px', fontSize: '0.85rem' }}
                required
                placeholder="Nome do novo estudante"
              />
            </div>

            {/* Partial Report Check */}
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', cursor: 'pointer', marginTop: '0.25rem' }}>
              <input 
                type="checkbox" 
                checked={subRelatorioParcial} 
                onChange={(e) => setSubRelatorioParcial(e.target.checked)}
              />
              Carregar Relatório Técnico Parcial (Obrigatório do Sainte)
            </label>

            {/* Justification */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Justificativa do Desligamento</label>
              <textarea 
                rows={3}
                value={subJustificativa}
                onChange={(e) => setSubJustificativa(e.target.value)}
                style={{ padding: '0.5rem', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '8px', fontSize: '0.85rem' }}
                required
                placeholder="Ex: Aluno conseguiu estágio extracurricular / Rendimento insuficiente..."
              />
            </div>

          </div>

          <button type="submit" className="btn-primary" style={{ alignSelf: 'flex-start' }} disabled={!subRelatorioParcial || isLoading}>
            {isLoading ? 'Homologando...' : 'Homologar Substituição'}
          </button>
        </form>

        {/* Timeline / Histórico */}
        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)' }}>Histórico Recente de Substituições</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '400px', overflowY: 'auto' }}>
            {substitutions.map((sub, idx) => (
              <div key={idx} style={{ padding: '0.75rem', border: '1px solid rgba(0,0,0,0.05)', borderRadius: '10px', background: 'rgba(0,0,0,0.01)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                  Data: {new Date(sub.data).toLocaleDateString()}
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                  <strong>Substituição efetuada:</strong> <br />
                  Sainte: <span style={{ color: 'var(--danger-color)' }}>{sub.estudanteSainte}</span> <br />
                  Entrante: <span style={{ color: 'var(--primary-color)' }}>{sub.estudanteEntrante}</span>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem', padding: '0.4rem', background: '#f1f5f9', borderRadius: '6px' }}>
                  Motivo: {sub.justificativa}
                </div>
              </div>
            ))}
            {substitutions.length === 0 && (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                Nenhuma substituição registrada nesta edição.
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
