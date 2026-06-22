import React, { useState } from 'react';
import { Award, QrCode } from 'lucide-react';

interface Project {
  id: string;
  codigo: string;
  campus: string;
  titulo: string;
  orientador: string;
  discente: string | null;
}

interface Certificate {
  id: string;
  projectId: string;
  studentName: string;
  role: string;
  hash: string;
  cargaHoraria: number;
  emissao: string;
}

interface CertificatesModuleProps {
  projects: Project[];
  certificates: Certificate[];
  currentRole: string;
  selectedCampus: string;
  onRefresh: () => void;
}

export default function CertificatesModule({
  projects,
  certificates,
  currentRole,
  selectedCampus,
  onRefresh
}: CertificatesModuleProps) {
  const [certProjId, setCertProjId] = useState<string>('');
  const [certStudentName, setCertStudentName] = useState<string>('');
  const [certRole, setCertRole] = useState<string>('BOLSISTA');
  const [certHours, setCertHours] = useState<number>(400);
  const [certProjectSearch, setCertProjectSearch] = useState<string>('');
  const [activeCertForView, setActiveCertForView] = useState<Certificate | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleCreateCertificate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!certProjId || !certStudentName) {
      alert('Preencha os campos obrigatórios.');
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch('/api/certificates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: certProjId,
          studentName: certStudentName,
          role: certRole,
          cargaHoraria: certHours
        })
      });
      if (res.ok) {
        const cert = await res.json();
        alert(`Certificado gerado com sucesso! Hash: ${cert.hash}`);
        setCertStudentName('');
        onRefresh();
      } else {
        alert('Erro ao gerar certificado.');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '2rem' }}>
        
        {/* Emissão (Only Coordinator/PPGI) */}
        {(currentRole === 'COORDINATOR' || currentRole === 'PPGI') ? (
          <form onSubmit={handleCreateCertificate} className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Award size={20} style={{ color: 'var(--primary-color)' }} /> Emitir Certificado Digital Oficial
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Gere certificados digitais com assinatura criptográfica (Hash) para bolsistas e orientadores.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              
              {/* Select Project */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Selecione o Projeto</label>
                <input 
                  type="text"
                  placeholder="🔍 Digite código, título, orientador ou discente..."
                  value={certProjectSearch}
                  onChange={(e) => setCertProjectSearch(e.target.value)}
                  style={{ padding: '0.45rem 0.75rem', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '8px', fontSize: '0.8rem', marginBottom: '0.25rem', outline: 'none' }}
                />
                <select 
                  value={certProjId}
                  onChange={(e) => {
                    setCertProjId(e.target.value);
                    const proj = projects.find(p => p.id === e.target.value);
                    if (proj) {
                      setCertStudentName(proj.discente || '');
                    }
                  }}
                  style={{ padding: '0.5rem', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '8px', fontSize: '0.85rem' }}
                  required
                >
                  <option value="">Selecione um projeto...</option>
                  {projects
                    .filter(p => {
                      const matchesRole = currentRole === 'PPGI' || p.campus === selectedCampus;
                      
                      const query = certProjectSearch.toLowerCase().trim();
                      const matchesQuery = !query || 
                        p.codigo.toLowerCase().includes(query) ||
                        p.titulo.toLowerCase().includes(query) ||
                        p.orientador.toLowerCase().includes(query) ||
                        (p.discente && p.discente.toLowerCase().includes(query));
                        
                      return matchesRole && matchesQuery;
                    })
                    .map(p => (
                      <option key={p.id} value={p.id}>{p.codigo} - {p.titulo.slice(0, 60)}...</option>
                    ))}
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Nome do Beneficiário</label>
                <input 
                  type="text" 
                  required
                  value={certStudentName}
                  onChange={(e) => setCertStudentName(e.target.value)}
                  style={{ padding: '0.5rem', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '8px', fontSize: '0.85rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Função</label>
                  <select 
                    value={certRole}
                    onChange={(e) => setCertRole(e.target.value)}
                    style={{ padding: '0.5rem', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '8px', fontSize: '0.85rem' }}
                  >
                    <option value="BOLSISTA">Bolsista de Iniciação Científica</option>
                    <option value="VOLUNTÁRIO">Voluntário de Iniciação Científica</option>
                    <option value="ORIENTADOR">Orientador de Pesquisa</option>
                  </select>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Carga Horária (Horas)</label>
                  <input 
                    type="number" 
                    required
                    value={certHours}
                    onChange={(e) => setCertHours(parseInt(e.target.value) || 0)}
                    style={{ padding: '0.5rem', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '8px', fontSize: '0.85rem' }}
                  />
                </div>
              </div>
            </div>

            <button type="submit" className="btn-primary" style={{ alignSelf: 'flex-start' }} disabled={isLoading}>
              {isLoading ? 'Gerando...' : 'Gerar e Homologar Certificado'}
            </button>
          </form>
        ) : (
          <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>Solicitação de Certificados</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Bolsistas e orientadores podem solicitar seus certificados digitais ao término do ciclo científico anual.
            </p>
            <div style={{ padding: '1rem', background: 'rgba(21,128,61,0.04)', borderRadius: '10px', borderLeft: '4px solid var(--primary-color)' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: 600 }}>Carga Horária Acumulada: 400 horas</span>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                Seu orientador já validou o relatório final. O coordenador do campus poderá emitir o documento na aba de administração.
              </p>
            </div>
          </div>
        )}

        {/* Mockup do Certificado Visual & Lista */}
        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)' }}>Certificados Emitidos Recentes</h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '400px', overflowY: 'auto' }}>
            {certificates.map((cert) => {
              const proj = projects.find(p => p.id === cert.projectId);
              return (
                <div key={cert.id} style={{ padding: '0.85rem', border: '1px solid rgba(0,0,0,0.06)', borderRadius: '12px', background: '#ffffff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>{cert.studentName}</strong>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block' }}>
                      Função: {cert.role} ({cert.cargaHoraria}h) | Projeto: {proj?.codigo}
                    </span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--primary-color)', fontWeight: 600, display: 'block', marginTop: '0.25rem' }}>
                      Hash: {cert.hash}
                    </span>
                  </div>

                  <button 
                    onClick={() => { setActiveCertForView(cert); }}
                    className="btn-secondary" 
                    style={{ padding: '0.4rem 0.75rem', fontSize: '0.75rem', gap: '0.25rem' }}
                  >
                    <QrCode size={14} /> Visualizar
                  </button>
                </div>
              );
            })}
            {certificates.length === 0 && (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                Nenhum certificado digital emitido nesta edição.
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Certificado Visual Mockup (Overlay or Inline details) */}
      {activeCertForView && (
        <div style={{ border: '2px solid rgba(21,128,61,0.2)', padding: '2.5rem', borderRadius: '16px', background: 'radial-gradient(circle at top right, rgba(21,128,61,0.03), transparent), #ffffff', position: 'relative', marginTop: '1rem', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
          <button 
            onClick={() => setActiveCertForView(null)} 
            style={{ position: 'absolute', top: '15px', right: '15px', padding: '0.25rem 0.5rem', background: 'none', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '6px', cursor: 'pointer' }}
          >
            Fechar Visualização
          </button>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid var(--primary-color)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
            <div>
              <h4 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary-color)' }}>INSTITUTO FEDERAL DO AMAZONAS</h4>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Pró-Reitoria de Pesquisa, Pós-Graduação e Inovação (PPGI)</span>
            </div>
            <div style={{ width: '48px', height: '48px', background: 'var(--primary-color)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px', fontWeight: 'bold' }}>
              IF
            </div>
          </div>

          <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '1rem', margin: '2rem 0' }}>
            <h3 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '0.1em' }}>CERTIFICADO DE PARTICIPAÇÃO</h3>
            <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: 1.6, maxWidth: '700px', margin: '0 auto' }}>
              Certificamos para os devidos fins que o discente <strong>{activeCertForView.studentName}</strong> participou do projeto de pesquisa científica sob o código <strong>{projects.find(p => p.id === activeCertForView.projectId)?.codigo}</strong> na qualidade de <strong>{activeCertForView.role}</strong> no período letivo de 2026/2027, totalizando a carga horária de <strong>{activeCertForView.cargaHoraria}</strong> horas de atividades científicas e tecnológicas.
            </p>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '3rem', borderTop: '1px solid rgba(0,0,0,0.06)', paddingTop: '1.5rem' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              Manaus - AM, {new Date(activeCertForView.emissao).toLocaleDateString()} <br />
              **Assinatura Eletrônica Registrada**
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Autenticidade via QR Code</span> <br />
                <strong style={{ fontSize: '0.75rem', color: 'var(--primary-color)' }}>Chave: {activeCertForView.hash}</strong>
              </div>
              <div style={{ background: '#f1f5f9', padding: '0.5rem', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <QrCode size={40} style={{ color: 'var(--text-primary)' }} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
