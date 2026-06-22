import React, { useState, useEffect } from 'react';
import { Upload } from 'lucide-react';

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

interface ReportsModuleProps {
  projects: Project[];
  currentRole: string;
  selectedCampus: string;
}

export default function ReportsModule({ projects, currentRole, selectedCampus }: ReportsModuleProps) {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedbackModal, setFeedbackModal] = useState<{ reportId: string; open: boolean } | null>(null);
  const [feedbackText, setFeedbackText] = useState('');

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/reports');
      if (res.ok) setReports(await res.json());
    } catch (err) {
      console.error('Erro ao buscar relatórios:', err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleEvaluate = async (reportId: string, approved: boolean) => {
    const res = await fetch(`/api/reports/${reportId}/evaluate`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ approved, feedback: feedbackText })
    });
    if (res.ok) {
      fetchReports();
      setFeedbackModal(null);
      setFeedbackText('');
    } else {
      alert('Erro ao registrar avaliação.');
    }
  };

  const statusColor: Record<string, string> = {
    PENDENTE: '#f59e0b',
    ENVIADO: '#3b82f6',
    APROVADO: '#16a34a',
    CORRECAO: '#ef4444'
  };

  const statusLabel: Record<string, string> = {
    PENDENTE: 'Pendente',
    ENVIADO: 'Enviado',
    APROVADO: 'Aprovado',
    CORRECAO: 'Em Correção'
  };

  const visibleReports = currentRole === 'COORDINATOR' || currentRole === 'PPGI'
    ? reports.filter(r => currentRole === 'PPGI' || (r.project && r.project.campus === selectedCampus))
    : reports;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    const projectId = formData.get('projectId') as string;
    const tipo = formData.get('tipo') as string;
    const periodo = formData.get('periodo') as string;
    const file = formData.get('file') as File;

    if (!projectId || !tipo || !periodo) {
      alert('Preencha todos os campos obrigatórios.');
      return;
    }

    const uploadData = new FormData();
    uploadData.append('projectId', projectId);
    uploadData.append('tipo', tipo);
    uploadData.append('periodo', periodo);
    if (file && file.size > 0) {
      uploadData.append('file', file);
    }

    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        body: uploadData
      });
      if (res.ok) {
        alert('Relatório enviado com sucesso!');
        form.reset();
        fetchReports();
      } else {
        const err = await res.json();
        alert(`Erro: ${err.error}`);
      }
    } catch (err) {
      alert('Erro de conexão.');
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>Relatórios Técnicos</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Submissão de relatórios parciais e finais em formato PDF</p>
          </div>
        </div>

        {/* Formulário de Submissão (Discente e Professor) */}
        {(currentRole === 'STUDENT' || currentRole === 'PROFESSOR') && (
          <div style={{ padding: '1.25rem', background: 'rgba(21,128,61,0.03)', borderRadius: '12px', border: '1px solid rgba(21,128,61,0.1)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>Novo Relatório</h4>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Projeto *</label>
                  <select name="projectId" required style={{ padding: '0.5rem', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '8px', fontSize: '0.85rem' }}>
                    <option value="">Selecione o projeto...</option>
                    {projects.filter(p => p.discente).map(p => (
                      <option key={p.id} value={p.id}>{p.codigo} — {p.titulo.slice(0, 50)}</option>
                    ))}
                  </select>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Tipo de Relatório *</label>
                  <select name="tipo" required style={{ padding: '0.5rem', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '8px', fontSize: '0.85rem' }}>
                    <option value="PARCIAL">Relatório Parcial (6 meses)</option>
                    <option value="FINAL">Relatório Final (encerramento)</option>
                  </select>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Período de Referência *</label>
                  <input name="periodo" required placeholder="Ex: Ago/2025–Jan/2026" style={{ padding: '0.5rem', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '8px', fontSize: '0.85rem' }} />
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Arquivo PDF do Relatório</label>
                <input name="file" type="file" accept=".pdf" style={{ padding: '0.5rem', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '8px', fontSize: '0.85rem', background: '#fff' }} />
                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Formato PDF, máximo 10MB. Assinado pelo orientador.</span>
              </div>
              <button type="submit" className="btn-primary" style={{ alignSelf: 'flex-start' }}>
                <Upload size={16} /> Enviar Relatório
              </button>
            </form>
          </div>
        )}

        {/* Lista de Relatórios */}
        <div>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Carregando relatórios...</div>
          ) : visibleReports.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Nenhum relatório encontrado.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)' }}>Relatórios Submetidos</h4>
              {visibleReports.map((r: any) => (
                <div key={r.id} style={{ padding: '1rem 1.25rem', background: '#fff', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', borderLeft: `4px solid ${statusColor[r.status] || '#ddd'}` }}>
                  <div style={{ flex: 1 }}>
                    <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>{r.tipo === 'PARCIAL' ? '📋 Relatório Parcial' : '📄 Relatório Final'}</strong>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginTop: '0.15rem' }}>
                      Período: {r.periodo} | Projeto: {r.project?.codigo} — {r.project?.titulo?.slice(0, 40)}
                    </span>
                    {r.feedback && <span style={{ fontSize: '0.7rem', color: '#ef4444', marginTop: '0.25rem', display: 'block' }}>Feedback: {r.feedback}</span>}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
                    <span style={{ fontSize: '0.7rem', fontWeight: 700, color: statusColor[r.status], background: `${statusColor[r.status]}15`, padding: '0.2rem 0.6rem', borderRadius: '8px' }}>
                      {statusLabel[r.status]}
                    </span>
                    {r.fileUrl && (
                      <a href={r.fileUrl} target="_blank" rel="noreferrer" style={{ fontSize: '0.75rem', color: 'var(--primary-color)', fontWeight: 700, border: '1px solid rgba(21,128,61,0.2)', padding: '0.3rem 0.7rem', borderRadius: '8px', textDecoration: 'none' }}>
                        Ver PDF
                      </a>
                    )}
                    {(currentRole === 'COORDINATOR' || currentRole === 'PPGI') && r.status === 'ENVIADO' && (
                      <>
                        <button className="btn-primary" style={{ fontSize: '0.75rem', padding: '0.3rem 0.7rem' }} onClick={() => handleEvaluate(r.id, true)}>✓ Aprovar</button>
                        <button className="btn-secondary" style={{ fontSize: '0.75rem', padding: '0.3rem 0.7rem' }} onClick={() => setFeedbackModal({ reportId: r.id, open: true })}>↩ Devolver</button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Feedback Modal */}
      {feedbackModal?.open && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '440px', display: 'flex', flexDirection: 'column', gap: '1rem', background: '#fff' }}>
            <h3 style={{ fontWeight: 800, color: 'var(--text-primary)' }}>Devolver para Correção</h3>
            <textarea
              value={feedbackText}
              onChange={e => setFeedbackText(e.target.value)}
              placeholder="Descreva as pendências e correções necessárias..."
              rows={4}
              style={{ padding: '0.75rem', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '10px', fontSize: '0.85rem', resize: 'vertical' }}
            />
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button className="btn-secondary" onClick={() => { setFeedbackModal(null); setFeedbackText(''); }}>Cancelar</button>
              <button className="btn-primary" onClick={() => handleEvaluate(feedbackModal.reportId, false)} disabled={!feedbackText.trim()}>Enviar Devolutiva</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
