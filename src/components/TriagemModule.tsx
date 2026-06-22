import React, { useState, useEffect } from 'react';
import { FileCheck, ShieldAlert, Landmark, CheckCircle2, AlertCircle, XCircle, Users, Search, ExternalLink } from 'lucide-react';


interface Project {
  id: string;
  codigo: string;
  campus: string;
  titulo: string;
  orientador: string;
  fomento: string;
  discente: string | null;
  status: string;
  matriculaRegular?: boolean;
  lattesUrl?: string | null;
  rgUploaded?: boolean;
  cpfUploaded?: boolean;
  residenciaUploaded?: boolean;
  declaracaoPeriodo?: string | null;
  termoFapeam?: string | null;
  contaBancoValida?: boolean;
  researchGroupId?: string | null;
  orientadorGrupoNome?: string | null;
  orientadorGrupoLink?: string | null;
  orientadorPapel?: string | null;
  discenteParticipaGrupo?: boolean | null;
  discenteGrupoNome?: string | null;
  discenteGrupoLink?: string | null;
  discentePapel?: string | null;
  triagemStatus?: string | null;
  triagemFeedback?: string | null;
  rgFeedback?: string | null;
  cpfFeedback?: string | null;
  residenciaFeedback?: string | null;
  matriculaFeedback?: string | null;
  lattesFeedback?: string | null;
  termoFapeamFeedback?: string | null;
  editalId?: string | null;
}

interface TriagemModuleProps {
  projects: Project[];
  editais: any[];
  researchGroups: any[];
  currentRole: string;
  selectedCampus: string;
  onRefresh: () => void;
  studentBank: string;
  setStudentBank: (v: string) => void;
  studentAgencia: string;
  setStudentAgencia: (v: string) => void;
  studentConta: string;
  setStudentConta: (v: string) => void;
}

export default function TriagemModule({ 
  projects, editais, researchGroups, currentRole, selectedCampus, onRefresh,
  studentBank, setStudentBank, studentAgencia, setStudentAgencia, studentConta, setStudentConta
}: TriagemModuleProps) {
  const [loading, setLoading] = useState(false);
  const [triagemMatricula, setTriagemMatricula] = useState(false);
  const [triagemLattes, setTriagemLattes] = useState('');
  const [triagemRg, setTriagemRg] = useState(false);
  const [triagemCpf, setTriagemCpf] = useState(false);
  const [triagemResidencia, setTriagemResidencia] = useState(false);
  const [triagemPeriodo, setTriagemPeriodo] = useState('2º período');
  const [triagemTermoFapeam, setTriagemTermoFapeam] = useState('PENDENTE');
  const [discenteParticipaGrupo, setDiscenteParticipaGrupo] = useState(false);
  const [discenteGrupoNome, setDiscenteGrupoNome] = useState('');
  const [discenteGrupoLink, setDiscenteGrupoLink] = useState('');
  const [discentePapel, setDiscentePapel] = useState('ESTUDANTE_BOLSISTA');

  // Professor onboarding state
  const [orientadorGrupoNome, setOrientadorGrupoNome] = useState('');
  const [orientadorGrupoLink, setOrientadorGrupoLink] = useState('');
  const [orientadorPapel, setOrientadorPapel] = useState('PESQUISADOR');

  // Coordinator triagem state
  const [selectedProjectForTriagem, setSelectedProjectForTriagem] = useState<Project | null>(null);
  const [generalTriagemFeedback, setGeneralTriagemFeedback] = useState('');
  const [individualFeedbacks, setIndividualFeedbacks] = useState({
    rg: '', cpf: '', residencia: '', matricula: '', lattes: '', termoFapeam: ''
  });

  const [bankError, setBankError] = useState<string | null>(null);

  // Find target project for student
  const targetStudentProject = projects.find(p => p.discente);

  // Find target project for professor
  const targetProfessorProject = projects[0]; 

  useEffect(() => {
    if (targetStudentProject) {
      setTriagemMatricula(targetStudentProject.matriculaRegular || false);
      setTriagemLattes(targetStudentProject.lattesUrl || '');
      setTriagemRg(targetStudentProject.rgUploaded || false);
      setTriagemCpf(targetStudentProject.cpfUploaded || false);
      setTriagemResidencia(targetStudentProject.residenciaUploaded || false);
      setTriagemPeriodo(targetStudentProject.declaracaoPeriodo || '2º período');
      setTriagemTermoFapeam(targetStudentProject.termoFapeam || 'PENDENTE');
      setDiscenteParticipaGrupo(targetStudentProject.discenteParticipaGrupo || false);
      setDiscenteGrupoNome(targetStudentProject.discenteGrupoNome || '');
      setDiscenteGrupoLink(targetStudentProject.discenteGrupoLink || '');
      setDiscentePapel(targetStudentProject.discentePapel || 'ESTUDANTE_BOLSISTA');
    }
  }, [targetStudentProject]);

  useEffect(() => {
    if (targetProfessorProject) {
      setOrientadorGrupoNome(targetProfessorProject.orientadorGrupoNome || '');
      setOrientadorGrupoLink(targetProfessorProject.orientadorGrupoLink || '');
      setOrientadorPapel(targetProfessorProject.orientadorPapel || 'PESQUISADOR');
    }
  }, [targetProfessorProject]);

  const handleBankChange = (val: string) => {
    setStudentBank(val);
    if (targetStudentProject?.fomento === 'FAPEAM') {
      const lower = val.toLowerCase();
      if (!lower.includes('bradesco') && !lower.includes('next')) {
        setBankError('Bolsistas FAPEAM devem obrigatoriamente informar conta corrente do Bradesco ou Next.');
      } else {
        setBankError(null);
      }
    } else {
      setBankError(null);
    }
  };

  const handleOnboardingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (currentRole === 'STUDENT') {
        if (!targetStudentProject) return;
        
        let isBankOk = true;
        if (targetStudentProject.fomento === 'FAPEAM') {
          isBankOk = ['Bradesco', 'Next'].some(b => studentBank.toLowerCase().includes(b.toLowerCase()));
        }

        const resTriagem = await fetch(`/api/projects/${targetStudentProject.id}/triagem`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            matriculaRegular: triagemMatricula,
            lattesUrl: triagemLattes,
            rgUploaded: triagemRg,
            cpfUploaded: triagemCpf,
            residenciaUploaded: triagemResidencia,
            declaracaoPeriodo: triagemPeriodo,
            termoFapeam: triagemTermoFapeam,
            contaBancoValida: isBankOk,
            triagemStatus: 'PENDENTE'
          })
        });

        const resPerfil = await fetch(`/api/projects/${targetStudentProject.id}/perfil`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            discenteParticipaGrupo,
            discenteGrupoNome,
            discenteGrupoLink,
            discentePapel
          })
        });

        if (resTriagem.ok && resPerfil.ok) {
          alert('Dados de Triagem e Onboarding do Discente atualizados com sucesso!');
          onRefresh();
        } else {
          alert('Erro ao atualizar dados de onboarding.');
        }

      } else if (currentRole === 'PROFESSOR') {
        if (!targetProfessorProject) {
          alert('Nenhum projeto encontrado para este orientador.');
          return;
        }

        const res = await fetch(`/api/projects/${targetProfessorProject.id}/perfil`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orientadorGrupoNome,
            orientadorGrupoLink,
            orientadorPapel
          })
        });

        if (res.ok) {
          alert('Perfil do pesquisador atualizado com sucesso!');
          onRefresh();
        } else {
          alert('Erro ao atualizar perfil.');
        }
      }
    } catch (err) {
      console.error(err);
      alert('Erro de conexão.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyTriagem = async (projectId: string, approved: boolean) => {
    setLoading(true);
    try {
      const payload = {
        triagemStatus: approved ? 'APROVADO' : 'CORRECAO',
        triagemFeedback: approved ? '' : generalTriagemFeedback,
        rgFeedback: approved ? '' : individualFeedbacks.rg,
        cpfFeedback: approved ? '' : individualFeedbacks.cpf,
        residenciaFeedback: approved ? '' : individualFeedbacks.residencia,
        matriculaFeedback: approved ? '' : individualFeedbacks.matricula,
        lattesFeedback: approved ? '' : individualFeedbacks.lattes,
        termoFapeamFeedback: approved ? '' : individualFeedbacks.termoFapeam,
        termoFapeam: approved ? 'APROVADO' : 'PENDENTE',
        contaBancoValida: approved ? true : undefined
      };
      
      const res = await fetch(`/api/projects/${projectId}/triagem`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        alert(approved ? 'Documentação homologada com sucesso!' : 'Documentação devolvida para correção com as pendências apontadas.');
        setSelectedProjectForTriagem(null);
        setGeneralTriagemFeedback('');
        setIndividualFeedbacks({ rg: '', cpf: '', residencia: '', matricula: '', lattes: '', termoFapeam: '' });
        onRefresh();
      } else {
        alert('Erro ao atualizar triagem.');
      }
    } catch (err) {
      console.error(err);
      alert('Erro de conexão.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* 1. STUDENT VIEW */}
      {currentRole === 'STUDENT' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '2rem' }}>
          <form onSubmit={handleOnboardingSubmit} className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FileCheck size={20} style={{ color: 'var(--primary-color)' }} /> Checklist do Bolsista (Onboarding)
            </h3>
            
            {targetStudentProject ? (
              <>
                {targetStudentProject.triagemStatus === 'CORRECAO' && (
                  <div style={{ padding: '1rem', background: 'rgba(217, 119, 6, 0.08)', color: 'var(--accent-color)', border: '1px solid rgba(217, 119, 6, 0.2)', borderRadius: '12px', fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <span style={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.25rem' }}><ShieldAlert size={16} /> Pendências Apontadas pela Coordenação:</span>
                    <p>{targetStudentProject.triagemFeedback || 'Por favor, revise os documentos com erros indicados abaixo e reenvie.'}</p>
                  </div>
                )}
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <input 
                      type="checkbox" 
                      id="matricula" 
                      checked={triagemMatricula} 
                      onChange={(e) => setTriagemMatricula(e.target.checked)} 
                    />
                    <label htmlFor="matricula" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Declaração de Matrícula Regularizada e Assinada</label>
                  </div>
                  {targetStudentProject.matriculaFeedback && <span style={{ fontSize: '0.7rem', color: '#ef4444', marginLeft: '1.25rem' }}>Erro: {targetStudentProject.matriculaFeedback}</span>}

                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <input 
                      type="checkbox" 
                      id="rg" 
                      checked={triagemRg} 
                      onChange={(e) => setTriagemRg(e.target.checked)} 
                    />
                    <label htmlFor="rg" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Cópia digitalizada legível do RG (Frente e Verso)</label>
                  </div>
                  {targetStudentProject.rgFeedback && <span style={{ fontSize: '0.7rem', color: '#ef4444', marginLeft: '1.25rem' }}>Erro: {targetStudentProject.rgFeedback}</span>}

                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <input 
                      type="checkbox" 
                      id="cpf" 
                      checked={triagemCpf} 
                      onChange={(e) => setTriagemCpf(e.target.checked)} 
                    />
                    <label htmlFor="cpf" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Comprovante de Inscrição CPF Regular</label>
                  </div>
                  {targetStudentProject.cpfFeedback && <span style={{ fontSize: '0.7rem', color: '#ef4444', marginLeft: '1.25rem' }}>Erro: {targetStudentProject.cpfFeedback}</span>}

                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <input 
                      type="checkbox" 
                      id="residencia" 
                      checked={triagemResidencia} 
                      onChange={(e) => setTriagemResidencia(e.target.checked)} 
                    />
                    <label htmlFor="residencia" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Comprovante de Residência Atualizado (últimos 3 meses)</label>
                  </div>
                  {targetStudentProject.residenciaFeedback && <span style={{ fontSize: '0.7rem', color: '#ef4444', marginLeft: '1.25rem' }}>Erro: {targetStudentProject.residenciaFeedback}</span>}

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', marginTop: '0.5rem' }}>
                    <label htmlFor="lattes" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Link do Currículo Lattes Atualizado</label>
                    <input 
                      type="url" 
                      id="lattes"
                      value={triagemLattes} 
                      onChange={(e) => setTriagemLattes(e.target.value)} 
                      placeholder="http://lattes.cnpq.br/..."
                      style={{ padding: '0.5rem', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '8px', fontSize: '0.85rem' }}
                    />
                  </div>
                  {targetStudentProject.lattesFeedback && <span style={{ fontSize: '0.7rem', color: '#ef4444' }}>Erro: {targetStudentProject.lattesFeedback}</span>}

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '0.5rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Período do Discente</label>
                      <select 
                        value={triagemPeriodo} 
                        onChange={(e) => setTriagemPeriodo(e.target.value)}
                        style={{ padding: '0.5rem', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '8px', fontSize: '0.85rem' }}
                      >
                        <option value="1º período">1º período</option>
                        <option value="2º período">2º período</option>
                        <option value="3º período">3º período</option>
                        <option value="4º período">4º período</option>
                        <option value="5º período">5º período</option>
                        <option value="Último período">Último período</option>
                      </select>
                    </div>

                    {targetStudentProject.fomento === 'FAPEAM' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Termo FAPEAM</label>
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', height: '100%' }}>
                          <input 
                            type="checkbox" 
                            id="termo" 
                            checked={triagemTermoFapeam === 'ENVIADO' || triagemTermoFapeam === 'APROVADO'} 
                            onChange={(e) => setTriagemTermoFapeam(e.target.checked ? 'ENVIADO' : 'PENDENTE')} 
                          />
                          <label htmlFor="termo" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Anexou Termo Assinado</label>
                        </div>
                      </div>
                    )}
                  </div>
                  {targetStudentProject.termoFapeamFeedback && <span style={{ fontSize: '0.7rem', color: '#ef4444' }}>Erro: {targetStudentProject.termoFapeamFeedback}</span>}

                  {targetStudentProject.fomento !== 'VOLUNTÁRIO' && (
                    <div style={{ padding: '1rem', border: '1px solid rgba(0,0,0,0.06)', borderRadius: '12px', background: '#f8fafc', marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-primary)' }}>Dados Bancários para Recebimento</span>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Instituição Bancária</label>
                        <input 
                          type="text" 
                          placeholder={targetStudentProject.fomento === 'FAPEAM' ? 'Bradesco ou Next (Obrigatório)' : 'Qualquer banco'}
                          value={studentBank} 
                          onChange={(e) => handleBankChange(e.target.value)} 
                          style={{ padding: '0.4rem', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '8px', fontSize: '0.8rem' }}
                        />
                        {bankError && <span style={{ fontSize: '0.7rem', color: '#ef4444', marginTop: '0.15rem' }}>{bankError}</span>}
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '0.5rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                          <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Agência</label>
                          <input type="text" placeholder="Ex: 3122-4" value={studentAgencia} onChange={(e) => setStudentAgencia(e.target.value)} style={{ padding: '0.4rem', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '8px', fontSize: '0.8rem' }} />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                          <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Conta Corrente</label>
                          <input type="text" placeholder="Ex: 104231-9" value={studentConta} onChange={(e) => setStudentConta(e.target.value)} style={{ padding: '0.4rem', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '8px', fontSize: '0.8rem' }} />
                        </div>
                      </div>
                    </div>
                  )}

                  <div style={{ padding: '1rem', border: '1px solid rgba(0,0,0,0.06)', borderRadius: '12px', background: '#f8fafc', marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-primary)' }}>Vínculo com Grupo de Pesquisa (CONSUP)</span>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <input 
                        type="checkbox" 
                        id="part_grupo" 
                        checked={discenteParticipaGrupo} 
                        onChange={(e) => setDiscenteParticipaGrupo(e.target.checked)} 
                      />
                      <label htmlFor="part_grupo" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Estudante participa do grupo de pesquisa do orientador</label>
                    </div>

                    {discenteParticipaGrupo && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.25rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                          <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Nome do Grupo de Pesquisa</label>
                          <input type="text" placeholder="Ex: Grupo de Inovação e Robótica do IFAM" value={discenteGrupoNome} onChange={(e) => setDiscenteGrupoNome(e.target.value)} style={{ padding: '0.4rem', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '8px', fontSize: '0.8rem' }} />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                          <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Link do DGP (CNPq)</label>
                          <input type="url" placeholder="http://dgp.cnpq.br/..." value={discenteGrupoLink} onChange={(e) => setDiscenteGrupoLink(e.target.value)} style={{ padding: '0.4rem', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '8px', fontSize: '0.8rem' }} />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                          <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Papel no Grupo</label>
                          <select value={discentePapel} onChange={(e) => setDiscentePapel(e.target.value)} style={{ padding: '0.4rem', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '8px', fontSize: '0.8rem' }}>
                            <option value="ESTUDANTE_BOLSISTA">Estudante Bolsista</option>
                            <option value="ESTUDANTE_VOLUNTARIO">Estudante Colaborador/Voluntário</option>
                          </select>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <button 
                  type="submit" 
                  className="btn-primary" 
                  style={{ alignSelf: 'flex-start', marginTop: '1rem' }} 
                  disabled={targetStudentProject.triagemStatus === 'APROVADO' || !!bankError || loading}
                >
                  Enviar Documentação para Triagem
                </button>
              </>
            ) : (
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Nenhum projeto associado a este aluno para onboarding.</p>
            )}
          </form>

          {/* Instruções de Homologação */}
          <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', background: 'rgba(21,128,61,0.02)', borderLeft: '4px solid var(--primary-color)' }}>
            <h4 style={{ fontWeight: 700, color: 'var(--primary-color)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}><Landmark size={18} /> Instruções de Homologação</h4>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <p>Conforme as diretrizes institucionais do IFAM:</p>
              <ul>
                <li><strong>Matrícula:</strong> Deve comprovar matrícula ativa no ciclo de execução do edital.</li>
                <li><strong>Lattes:</strong> O link do currículo Lattes deve estar cadastrado na plataforma CNPq e atualizado nos últimos 30 dias.</li>
                <li><strong>FAPEAM:</strong> Se o fomento for FAPEAM, o termo de compromisso deve ser digitalizado em formato legível e a conta deve ser do Bradesco ou Next.</li>
                <li><strong>Voluntários:</strong> Não necessitam preencher dados bancários.</li>
              </ul>
              <div style={{ marginTop: '0.5rem', padding: '0.75rem', background: '#fff', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.05)' }}>
                <strong>Status Atual: </strong> 
                <span className="badge" style={{ 
                  background: targetStudentProject?.triagemStatus === 'APROVADO' ? 'rgba(22,163,74,0.1)' : targetStudentProject?.triagemStatus === 'CORRECAO' ? 'rgba(239,68,68,0.1)' : 'rgba(245,158,11,0.1)', 
                  color: targetStudentProject?.triagemStatus === 'APROVADO' ? '#16a34a' : targetStudentProject?.triagemStatus === 'CORRECAO' ? '#ef4444' : '#d97706',
                  marginLeft: '0.25rem'
                }}>
                  {targetStudentProject?.triagemStatus === 'APROVADO' ? 'Homologado' : targetStudentProject?.triagemStatus === 'CORRECAO' ? 'Pendente Correção' : 'Aguardando Análise'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. PROFESSOR VIEW */}
      {currentRole === 'PROFESSOR' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '2rem' }}>
          <form onSubmit={handleOnboardingSubmit} className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Users size={20} style={{ color: 'var(--primary-color)' }} /> Vínculo Institucional do Orientador
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Atualize as informações sobre o seu credenciamento e atuação no Grupo de Pesquisa CNPq.
            </p>

            {targetProfessorProject ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Grupo de Pesquisa CNPq (Homologado no IFAM)</label>
                  <input 
                    type="text" 
                    placeholder="Ex: Grupo de Estudo em Ciências Sociais Aplicadas"
                    value={orientadorGrupoNome} 
                    onChange={(e) => setOrientadorGrupoNome(e.target.value)} 
                    style={{ padding: '0.5rem', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '8px', fontSize: '0.85rem' }}
                    required
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Espelho DGP (Link CNPq)</label>
                  <input 
                    type="url" 
                    placeholder="http://dgp.cnpq.br/dgp/espelhogrupo/..."
                    value={orientadorGrupoLink} 
                    onChange={(e) => setOrientadorGrupoLink(e.target.value)} 
                    style={{ padding: '0.5rem', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '8px', fontSize: '0.85rem' }}
                    required
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Papel no Grupo de Pesquisa</label>
                  <select 
                    value={orientadorPapel} 
                    onChange={(e) => setOrientadorPapel(e.target.value)}
                    style={{ padding: '0.5rem', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '8px', fontSize: '0.85rem' }}
                  >
                    <option value="LIDER">Líder do Grupo</option>
                    <option value="VICE_LIDER">Vice-Líder</option>
                    <option value="PESQUISADOR">Pesquisador Integrante</option>
                    <option value="TECNICO">Técnico Colaborador</option>
                  </select>
                </div>

                <button type="submit" className="btn-primary" style={{ alignSelf: 'flex-start', marginTop: '1rem' }} disabled={loading}>
                  Salvar Dados do Perfil
                </button>
              </div>
            ) : (
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Nenhum projeto sob sua orientação para cadastrar perfil.</p>
            )}
          </form>

          {/* Resolução nº 026/2014 - CONSUP */}
          <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', background: 'rgba(21,128,61,0.02)', borderLeft: '4px solid var(--primary-color)' }}>
            <h4 style={{ fontWeight: 700, color: 'var(--primary-color)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}><Landmark size={18} /> Resolução nº 026/2014 - CONSUP</h4>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <p>Conforme a Resolução normatizadora de fomento e credenciamento à pesquisa científica:</p>
              <ul>
                <li><strong>Obrigatoriedade:</strong> Todo orientador de projetos com bolsas institucionais (FAPEAM, CNPq ou IFAM) deve estar formalmente vinculado e ativo em um Grupo de Pesquisa cadastrado no Diretório do CNPq e certificado pelo IFAM.</li>
                <li><strong>Liderança:</strong> O líder ou vice-líder deve manter os cadastros atualizados anualmente junto à Diretoria de Pesquisa da PPGI.</li>
                <li><strong>Auditoria DGP:</strong> Os grupos entram em inatividade automática na vitrine se o espelho do CNPq não for atualizado por mais de 12 meses.</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* 3. COORDINATOR OR PPGI VIEW */}
      {(currentRole === 'COORDINATOR' || currentRole === 'PPGI') && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FileCheck size={22} style={{ color: 'var(--primary-color)' }} /> Fila de Triagem de Documentos
              </h3>
              <span className="badge badge-fapeam">
                {projects.filter(p => p.discente && (currentRole === 'PPGI' || p.campus === selectedCampus)).length} Projetos
              </span>
            </div>
            
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              {currentRole === 'PPGI' 
                ? 'Visualizando projetos de todos os campi em triagem documental.'
                : `Visualizando projetos do Campus ${selectedCampus} aguardando validação de onboarding.`}
            </p>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid rgba(0,0,0,0.06)', color: 'var(--text-secondary)', textAlign: 'left' }}>
                    <th style={{ padding: '0.5rem' }}>Código</th>
                    {currentRole === 'PPGI' && <th style={{ padding: '0.5rem' }}>Campus</th>}
                    <th style={{ padding: '0.5rem' }}>Bolsista / Discente</th>
                    <th style={{ padding: '0.5rem' }}>Orientador</th>
                    <th style={{ padding: '0.5rem' }}>Fomento</th>
                    <th style={{ padding: '0.5rem' }}>Status Triagem</th>
                    <th style={{ padding: '0.5rem', textAlign: 'center' }}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {projects
                    .filter(p => {
                      if (!p.discente) return false;
                      if (currentRole === 'COORDINATOR' && p.campus !== selectedCampus) return false;
                      return true;
                    })
                    .map(p => {
                      const status = p.triagemStatus || 'PENDENTE';
                      let color = '#d97706';
                      let label = 'Pendente';
                      if (status === 'APROVADO') {
                        color = '#16a34a'; label = 'Homologado';
                      } else if (status === 'CORRECAO') {
                        color = '#ef4444'; label = 'Ajustes Solicitados';
                      }

                      return (
                        <tr key={p.id} style={{ borderBottom: '1px solid rgba(0,0,0,0.04)', background: selectedProjectForTriagem?.id === p.id ? 'rgba(37,99,235,0.03)' : 'transparent' }}>
                          <td style={{ padding: '0.75rem 0.5rem', fontWeight: 700 }}>{p.codigo}</td>
                          {currentRole === 'PPGI' && <td style={{ padding: '0.75rem 0.5rem', fontWeight: 600 }}>{p.campus}</td>}
                          <td style={{ padding: '0.75rem 0.5rem' }}>{p.discente}</td>
                          <td style={{ padding: '0.75rem 0.5rem', color: 'var(--text-secondary)' }}>{p.orientador}</td>
                          <td style={{ padding: '0.75rem 0.5rem' }}>
                            <span className={`badge badge-${p.fomento.toLowerCase()}`} style={{ fontSize: '0.65rem' }}>{p.fomento}</span>
                          </td>
                          <td style={{ padding: '0.75rem 0.5rem' }}>
                            <span style={{ fontSize: '0.75rem', fontWeight: 700, color }}>{label}</span>
                          </td>
                          <td style={{ padding: '0.75rem 0.5rem', textAlign: 'center' }}>
                            <button 
                              onClick={() => {
                                setSelectedProjectForTriagem(p);
                                setGeneralTriagemFeedback(p.triagemFeedback || '');
                                setIndividualFeedbacks({
                                  rg: p.rgFeedback || '',
                                  cpf: p.cpfFeedback || '',
                                  residencia: p.residenciaFeedback || '',
                                  matricula: p.matriculaFeedback || '',
                                  lattes: p.lattesFeedback || '',
                                  termoFapeam: p.termoFapeamFeedback || ''
                                });
                              }}
                              className="btn-secondary" 
                              style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', borderRadius: '8px' }}
                            >
                              Analisar Documentos
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  {projects.filter(p => p.discente && (currentRole === 'PPGI' || p.campus === selectedCampus)).length === 0 && (
                    <tr>
                      <td colSpan={currentRole === 'PPGI' ? 7 : 6} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                        Nenhum projeto com discente pendente de triagem.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Validation Details Modal / Side panel */}
          {selectedProjectForTriagem && (
            <div className="glass-panel animate-fade-in" style={{ border: '1px solid rgba(37,99,235,0.2)', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(0,0,0,0.06)', paddingBottom: '0.5rem' }}>
                <h4 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  Apreciação de Documentação — Projeto: {selectedProjectForTriagem.codigo}
                </h4>
                <button onClick={() => setSelectedProjectForTriagem(null)} className="btn-secondary" style={{ padding: '0.2rem 0.5rem', borderRadius: '6px' }}>Fechar</button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1.5rem' }}>
                
                {/* Document checklist with feedback inputs */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-secondary)' }}>Checklist de Homologação</span>
                  
                  {[
                    { nome: 'Declaração de Matrícula Regular', field: 'matricula', value: selectedProjectForTriagem.matriculaRegular },
                    { nome: 'Cópia CPF e RG (Frente e Verso)', field: 'rg', value: selectedProjectForTriagem.rgUploaded },
                    { nome: 'Comprovante de Inscrição CPF', field: 'cpf', value: selectedProjectForTriagem.cpfUploaded },
                    { nome: 'Comprovante de Residência Atualizado', field: 'residencia', value: selectedProjectForTriagem.residenciaUploaded },
                    { nome: `Currículo Lattes (DGP CNPq): ${selectedProjectForTriagem.lattesUrl || 'Não informado'}`, field: 'lattes', value: !!selectedProjectForTriagem.lattesUrl, isLink: true, linkUrl: selectedProjectForTriagem.lattesUrl },
                    ...(selectedProjectForTriagem.fomento === 'FAPEAM' ? [{ nome: 'Termo de Compromisso FAPEAM', field: 'termoFapeam', value: selectedProjectForTriagem.termoFapeam === 'ENVIADO' || selectedProjectForTriagem.termoFapeam === 'APROVADO' }] : [])
                  ].map(doc => {
                    const fieldKey = doc.field as keyof typeof individualFeedbacks;
                    return (
                      <div key={doc.field} style={{ borderBottom: '1px solid rgba(0,0,0,0.04)', paddingBottom: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: 600 }}>{doc.nome}</span>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', fontWeight: 700, color: doc.value ? 'var(--primary-color)' : 'var(--danger-color)' }}>
                            {doc.value ? <CheckCircle2 size={15} /> : <XCircle size={15} />}
                            {doc.value ? 'Anexado' : 'Pendente'}
                          </span>
                        </div>
                        {doc.isLink && doc.linkUrl && (
                          <a href={doc.linkUrl} target="_blank" rel="noreferrer" style={{ fontSize: '0.75rem', color: 'var(--primary-color)', textDecoration: 'underline', marginBottom: '0.25rem' }}>
                            Abrir Espelho CNPq <ExternalLink size={12} style={{ display: 'inline' }} />
                          </a>
                        )}
                        <input 
                          type="text" 
                          placeholder="Indique inconformidades neste documento (deixe em branco se aprovado)..."
                          value={individualFeedbacks[fieldKey]}
                          onChange={(e) => setIndividualFeedbacks({ ...individualFeedbacks, [doc.field]: e.target.value })}
                          style={{ padding: '0.35rem', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '6px', fontSize: '0.8rem', width: '100%' }}
                        />
                      </div>
                    );
                  })}
                </div>

                {/* Validation outcome controls */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', background: '#f8fafc', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.05)' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-primary)' }}>Parecer Geral do Coordenador</span>
                  
                  {selectedProjectForTriagem.fomento === 'FAPEAM' && (selectedProjectForTriagem.declaracaoPeriodo === '1º período' || selectedProjectForTriagem.declaracaoPeriodo === 'Último período') && (
                    <div style={{ padding: '0.75rem', background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.75rem', color: '#dc2626' }}>
                      <strong>⚠️ Alerta de Inelegibilidade FAPEAM:</strong>
                      O aluno declarou estar no {selectedProjectForTriagem.declaracaoPeriodo}. Conforme edital, o onboarding de alunos de 1º e último períodos é impeditivo.
                    </div>
                  )}

                  {selectedProjectForTriagem.fomento === 'FAPEAM' && !selectedProjectForTriagem.contaBancoValida && (
                    <div style={{ padding: '0.75rem', background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.75rem', color: '#dc2626' }}>
                      <strong>⚠️ Alerta Bancário:</strong>
                      A conta informada pelo bolsista FAPEAM não pertence ao Bradesco ou Next.
                    </div>
                  )}

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Justificativa / Comentários Adicionais</label>
                    <textarea 
                      rows={3} 
                      placeholder="Descreva observações globais ou pendências gerais..."
                      value={generalTriagemFeedback}
                      onChange={(e) => setGeneralTriagemFeedback(e.target.value)}
                      style={{ padding: '0.5rem', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '8px', fontSize: '0.8rem', resize: 'vertical' }}
                    />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
                    <button 
                      onClick={() => handleVerifyTriagem(selectedProjectForTriagem.id, true)} 
                      className="btn-primary" 
                      style={{ width: '100%', padding: '0.6rem' }}
                      disabled={loading}
                    >
                      ✓ Homologar e Ativar Bolsista
                    </button>
                    
                    <button 
                      onClick={() => handleVerifyTriagem(selectedProjectForTriagem.id, false)} 
                      className="btn-secondary" 
                      style={{ width: '100%', padding: '0.6rem', border: '1px solid rgba(239,68,68,0.2)', color: '#dc2626' }}
                      disabled={!generalTriagemFeedback.trim() && Object.values(individualFeedbacks).every(v => !v.trim()) || loading}
                    >
                      ↩ Devolver com Pendências
                    </button>
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                      Ao devolver, informe ao menos uma pendência acima.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
