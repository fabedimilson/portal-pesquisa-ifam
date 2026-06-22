import React, { useState, useEffect } from 'react';
import { PlusCircle, FileText, CheckCircle2, AlertCircle, Building2, Trash2, Edit, Check, Settings, Award, Users, FileSpreadsheet, ArrowRight, Download, BarChart2, Plus, X } from 'lucide-react';

export default function EditaisModule() {
  const [editais, setEditais] = useState<any[]>([]);
  const [campusesList, setCampusesList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedEdital, setSelectedEdital] = useState<any | null>(null);
  const [consolidatedProjects, setConsolidatedProjects] = useState<any[]>([]);
  const [isConsolidating, setIsConsolidating] = useState(false);

  // Edit State
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State (Edital)
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [ano, setAno] = useState('2026/2027');
  const [quotas, setQuotas] = useState<{ campus: string; quantidade: number }[]>([]);
  const [criteria, setCriteria] = useState<{ nome: string; pontosMax: number }[]>([]);
  const [inscriptionReqs, setInscriptionReqs] = useState<{ nome: string; obrigatorio: boolean }[]>([]);
  const [requirements, setRequirements] = useState<{ nome: string; obrigatorio: boolean }[]>([]);

  // Timeline State
  const [inscricaoInicio, setInscricaoInicio] = useState('');
  const [inscricaoFim, setInscricaoFim] = useState('');
  const [avaliacaoInicio, setAvaliacaoInicio] = useState('');
  const [avaliacaoFim, setAvaliacaoFim] = useState('');
  const [resultadoParcial, setResultadoParcial] = useState('');
  const [resultadoFinal, setResultadoFinal] = useState('');
  const [onboardingInicio, setOnboardingInicio] = useState('');
  const [onboardingFim, setOnboardingFim] = useState('');

  // Niveis
  const [niveis, setNiveis] = useState<string[]>([]);

  // Investment Fields (NEW)
  const [valorBolsaFAPEAM, setValorBolsaFAPEAM] = useState<number>(600);
  const [valorBolsaCNPq, setValorBolsaCNPq] = useState<number>(700);
  const [valorBolsaIFAM, setValorBolsaIFAM] = useState<number>(400);
  const [duracaoMeses, setDuracaoMeses] = useState<number>(12);
  const [modalidade, setModalidade] = useState<string>('PIBIC');
  const [documentoEditalUrl, setDocumentoEditalUrl] = useState<string>('');

  // Temp form fields (Edital)
  const [tempCampus, setTempCampus] = useState('');
  const [tempQuota, setTempQuota] = useState('5');
  const [tempCriterionName, setTempCriterionName] = useState('');
  const [tempCriterionPoints, setTempCriterionPoints] = useState('50');
  const [tempInsReqName, setTempInsReqName] = useState('');
  const [tempReqName, setTempReqName] = useState('');

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    await Promise.all([fetchEditais(), fetchCampuses()]);
    setLoading(false);
  };

  const fetchEditais = async () => {
    try {
      const response = await fetch('/api/editais');
      const data = await response.json();
      setEditais(data);
    } catch (error) {
      console.error('Erro ao buscar editais:', error);
    }
  };

  const fetchCampuses = async () => {
    try {
      const response = await fetch('/api/campuses');
      const data = await response.json();
      setCampusesList(data);
      if (data.length > 0 && !tempCampus) {
        setTempCampus(data[0].sigla);
      }
    } catch (error) {
      console.error('Erro ao buscar campi:', error);
    }
  };

  const handlePrepopulateForm = () => {
    setTitulo('Edital PIPIC-AC/IFAM nº 01/2026');
    setDescricao('Edital de Iniciação Científica e Tecnológica para todos os campi do IFAM.');
    setAno('2026/2027');
    
    const campusOptions = campusesList.map(c => c.sigla);
    const initialQuotas = [];
    if (campusOptions.includes('CMC')) initialQuotas.push({ campus: 'CMC', quantidade: 12 });
    if (campusOptions.includes('COARI')) initialQuotas.push({ campus: 'COARI', quantidade: 8 });
    if (campusOptions.includes('CMZL')) initialQuotas.push({ campus: 'CMZL', quantidade: 6 });
    if (initialQuotas.length === 0 && campusOptions.length > 0) {
      initialQuotas.push({ campus: campusOptions[0], quantidade: 5 });
    }

    setQuotas(initialQuotas);
    setCriteria([
      { nome: 'Qualidade do Projeto de Pesquisa', pontosMax: 50 },
      { nome: 'Produção Científica do Orientador', pontosMax: 30 },
      { nome: 'Plano de Trabalho e Viabilidade', pontosMax: 20 }
    ]);
    setInscriptionReqs([
      { nome: 'Projeto Detalhado (PDF)', obrigatorio: true },
      { nome: 'Link do Lattes (PDF de comprovante)', obrigatorio: true }
    ]);
    setRequirements([
      { nome: 'Termo de Outorga / Aceite', obrigatorio: true },
      { nome: 'Comprovante de Matrícula Regular', obrigatorio: true },
      { nome: 'Dados Bancários do Bolsista', obrigatorio: true }
    ]);
  };

  const handleAddQuota = () => {
    if (!tempCampus) {
      alert('Selecione ou cadastre um Campus primeiro.');
      return;
    }
    if (quotas.some(q => q.campus === tempCampus)) {
      alert('Cota para este campus já configurada!');
      return;
    }
    setQuotas([...quotas, { campus: tempCampus, quantidade: parseInt(tempQuota) || 1 }]);
  };

  const handleAddCriterion = () => {
    if (!tempCriterionName.trim()) return;
    setCriteria([...criteria, { nome: tempCriterionName, pontosMax: parseFloat(tempCriterionPoints) || 10 }]);
    setTempCriterionName('');
  };

  const handleAddInsReq = () => {
    if (!tempInsReqName.trim()) return;
    setInscriptionReqs([...inscriptionReqs, { nome: tempInsReqName, obrigatorio: true }]);
    setTempInsReqName('');
  };

  const handleAddReq = () => {
    if (!tempReqName.trim()) return;
    setRequirements([...requirements, { nome: tempReqName, obrigatorio: true }]);
    setTempReqName('');
  };

  const handleEditClick = () => {
    if (!selectedEdital) return;
    setIsEditing(true);
    setEditingId(selectedEdital.id);
    setTitulo(selectedEdital.titulo);
    setDescricao(selectedEdital.descricao || '');
    setAno(selectedEdital.ano);
    setQuotas(selectedEdital.quotas?.map((q: any) => ({ campus: q.campus, quantidade: q.quantidade })) || []);
    setCriteria(selectedEdital.criteria?.map((c: any) => ({ nome: c.nome, pontosMax: c.pontosMax })) || []);
    setInscriptionReqs(selectedEdital.inscriptionReqs?.map((r: any) => ({ nome: r.nome, obrigatorio: r.obrigatorio })) || []);
    setRequirements(selectedEdital.requirements?.map((r: any) => ({ nome: r.nome, obrigatorio: r.obrigatorio })) || []);
    setInscricaoInicio(selectedEdital.inscricaoInicio || '');
    setInscricaoFim(selectedEdital.inscricaoFim || '');
    setAvaliacaoInicio(selectedEdital.avaliacaoInicio || '');
    setAvaliacaoFim(selectedEdital.avaliacaoFim || '');
    setResultadoParcial(selectedEdital.resultadoParcial || '');
    setResultadoFinal(selectedEdital.resultadoFinal || '');
    setOnboardingInicio(selectedEdital.onboardingInicio || '');
    setOnboardingFim(selectedEdital.onboardingFim || '');
    setNiveis(selectedEdital.niveis ? selectedEdital.niveis.split(',') : []);
    setValorBolsaFAPEAM(selectedEdital.valorBolsaFAPEAM ?? 600);
    setValorBolsaCNPq(selectedEdital.valorBolsaCNPq ?? 700);
    setValorBolsaIFAM(selectedEdital.valorBolsaIFAM ?? 400);
    setDuracaoMeses(selectedEdital.duracaoMeses ?? 12);
    setModalidade(selectedEdital.modalidade || 'PIBIC');
    setDocumentoEditalUrl(selectedEdital.documentoEditalUrl || '');
    setShowCreateModal(true);
  };

  const handleCreateEdital = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titulo.trim()) {
      alert('Preencha o título do Edital.');
      return;
    }
    const url = isEditing ? `/api/editais/${editingId}` : '/api/editais';
    const method = isEditing ? 'PUT' : 'POST';
    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          titulo,
          descricao,
          ano,
          quotas,
          criteria,
          requirements,
          inscriptionReqs,
          inscricaoInicio,
          inscricaoFim,
          avaliacaoInicio,
          avaliacaoFim,
          resultadoParcial,
          resultadoFinal,
          onboardingInicio,
          onboardingFim,
          niveis: niveis.join(','),
          valorBolsaFAPEAM,
          valorBolsaCNPq,
          valorBolsaIFAM,
          duracaoMeses,
          modalidade,
          documentoEditalUrl
        })
      });
      if (response.ok) {
        const savedEdital = await response.json();
        setShowCreateModal(false);
        setTitulo('');
        setDescricao('');
        setQuotas([]);
        setCriteria([]);
        setInscriptionReqs([]);
        setRequirements([]);
        setInscricaoInicio('');
        setInscricaoFim('');
        setAvaliacaoInicio('');
        setAvaliacaoFim('');
        setResultadoParcial('');
        setResultadoFinal('');
        setOnboardingInicio('');
        setOnboardingFim('');
        setNiveis([]);
        setValorBolsaFAPEAM(600);
        setValorBolsaCNPq(700);
        setValorBolsaIFAM(400);
        setDuracaoMeses(12);
        setModalidade('PIBIC');
        setDocumentoEditalUrl('');
        setIsEditing(false);
        setEditingId(null);
        fetchEditais();
        if (isEditing) {
          setSelectedEdital(savedEdital);
        }
      } else {
        alert('Erro ao processar edital');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleConsolidate = async (editalId: string) => {
    setIsConsolidating(true);
    try {
      const response = await fetch(`/api/editais/${editalId}/consolidar`, { method: 'POST' });
      const data = await response.json();
      if (response.ok) {
        setConsolidatedProjects(data.projects || []);
        fetchEditais();
        if (selectedEdital && selectedEdital.id === editalId) {
          const updated = editais.find(e => e.id === editalId);
          if (updated) setSelectedEdital(updated);
        }
        alert('Resultados consolidados com sucesso! A classificação geral foi calculada com base nas cotas de cada campus e nota mínima.');
      } else {
        alert('Erro na consolidação: ' + data.error);
      }
    } catch (err) {
      console.error(err);
      alert('Erro ao conectar ao servidor.');
    } finally {
      setIsConsolidating(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ATIVO':
        return <span className="badge" style={{ backgroundColor: 'rgba(21,128,61,0.08)', color: 'var(--primary-color)', border: '1px solid rgba(21,128,61,0.18)' }}>ATIVO</span>;
      case 'CONCLUIDO':
        return <span className="badge" style={{ backgroundColor: 'rgba(37,99,235,0.08)', color: 'var(--secondary-color)', border: '1px solid rgba(37,99,235,0.18)' }}>CONCLUÍDO</span>;
      default:
        return <span className="badge" style={{ backgroundColor: 'rgba(148,163,184,0.08)', color: 'var(--text-secondary)' }}>{status}</span>;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* HEADER SECTION */}
      <div className="glass-panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 850, color: 'var(--text-primary)' }}>Módulo de Gestão de Editais</h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Configure cotas por campi, critérios avaliativos e homologue o resultado final da classificação geral.</p>
        </div>
        <button onClick={() => { setIsEditing(false); setShowCreateModal(true); handlePrepopulateForm(); }} className="btn-primary">
          <PlusCircle size={16} /> Novo Edital Parametrizável
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: selectedEdital ? '1.2fr 1.8fr' : '1fr', gap: '1.5rem', transition: 'all 0.3s' }}>
        
        {/* LISTA DE EDITAIS */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h4 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)', borderBottom: '1px solid rgba(0,0,0,0.08)', paddingBottom: '0.5rem' }}>Editais em Andamento</h4>
          {loading ? (
            <div className="glass-panel" style={{ textAlign: 'center', padding: '3rem' }}>Carregando Editais...</div>
          ) : editais.length === 0 ? (
            <div className="glass-panel" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
              <AlertCircle size={32} style={{ marginBottom: '1rem', color: 'var(--text-muted)' }} />
              <p>Nenhum edital cadastrado no sistema.</p>
            </div>
          ) : (
            editais.map(edital => {
              const totalBolsas = edital.quotas?.reduce((acc: number, q: any) => acc + q.quantidade, 0) || 0;
              return (
                <div 
                  key={edital.id} 
                  className="glass-panel" 
                  style={{ 
                    cursor: 'pointer', 
                    borderLeft: selectedEdital?.id === edital.id ? '5px solid var(--primary-color)' : '1px solid var(--panel-border)',
                    padding: '1.25rem' 
                  }}
                  onClick={() => {
                    setSelectedEdital(edital);
                    fetch(`/api/projects`)
                      .then(r => r.json())
                      .then(data => {
                        const editalProj = data.filter((p: any) => p.editalId === edital.id);
                        editalProj.sort((a: any, b: any) => (b.notaFinal || 0) - (a.notaFinal || 0));
                        setConsolidatedProjects(editalProj);
                      });
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>Ano Fomento: {edital.ano}</span>
                    {getStatusBadge(edital.status)}
                  </div>
                  <h5 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>{edital.titulo}</h5>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '1rem', lineClamp: 2, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{edital.descricao}</p>
                  
                  <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.75rem', color: 'var(--text-secondary)', borderTop: '1px solid rgba(0,0,0,0.05)', paddingTop: '0.75rem' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Building2 size={14} /> {edital.quotas?.length || 0} Campi</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Award size={14} /> {totalBolsas} Bolsas Totais</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><FileText size={14} /> {edital.projects?.length || 0} Projetos</span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* DETALHE DO EDITAL SELECIONADO */}
        {selectedEdital && (
          <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid rgba(0,0,0,0.08)', paddingBottom: '1rem' }}>
              <div>
                <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Configuração e Classificação</span>
                <h4 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>{selectedEdital.titulo}</h4>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button onClick={handleEditClick} className="btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem', borderColor: 'var(--primary-color)', color: 'var(--primary-color)' }}>Editar Configurações</button>
                <button onClick={() => setSelectedEdital(null)} className="btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}>Fechar Detalhes</button>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.15fr 1.25fr', gap: '1.5rem' }}>
              
              {/* Cotas e Critérios */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ background: 'rgba(0,0,0,0.02)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.04)' }}>
                  <h6 style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Building2 size={14} /> Distribuição de Cotas por Campus</h6>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', maxHeight: '120px', overflowY: 'auto' }}>
                    {selectedEdital.quotas?.map((q: any) => (
                      <span key={q.id} style={{ display: 'inline-flex', flexDirection: 'column', padding: '0.4rem 0.6rem', background: '#ffffff', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.08)', fontSize: '0.7rem', fontWeight: 700 }}>
                        <span>{q.campus}: {q.quantidade} bolsa(s)</span>
                        {q.valorTotalCampus && (
                          <span style={{ fontSize: '0.65rem', color: 'var(--primary-color)', fontWeight: 600 }}>R$ {q.valorTotalCampus.toLocaleString('pt-BR')}</span>
                        )}
                      </span>
                    ))}
                  </div>
                </div>

                <div style={{ background: 'rgba(0,0,0,0.02)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.04)' }}>
                  <h6 style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Award size={14} /> Critérios Avaliativos (Barema)</h6>
                  <ul style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', paddingLeft: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                    {selectedEdital.criteria?.map((c: any) => (
                      <li key={c.id}><strong>{c.nome}</strong>: máx {c.pontosMax} pontos</li>
                    ))}
                  </ul>
                </div>

                <div style={{ background: 'rgba(0,0,0,0.02)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.04)' }}>
                  <h6 style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><FileText size={14} /> Requisitos de Documentação</h6>
                  <div style={{ fontSize: '0.7rem' }}>
                    <div style={{ marginBottom: '0.4rem' }}>
                      <strong style={{ color: 'var(--text-primary)' }}>Inscrição (Fase 1):</strong>
                      <ul style={{ paddingLeft: '1rem', color: 'var(--text-secondary)' }}>
                        {selectedEdital.inscriptionReqs?.map((r: any) => <li key={r.id}>{r.nome}</li>)}
                      </ul>
                    </div>
                    <div>
                      <strong style={{ color: 'var(--text-primary)' }}>Homologação Bolsista (Fase 2):</strong>
                      <ul style={{ paddingLeft: '1rem', color: 'var(--text-secondary)' }}>
                        {selectedEdital.requirements?.map((r: any) => <li key={r.id}>{r.nome}</li>)}
                      </ul>
                    </div>
                  </div>
                </div>

                <button 
                  disabled={isConsolidating}
                  onClick={() => handleConsolidate(selectedEdital.id)} 
                  className="btn-primary" 
                  style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem', padding: '0.6rem' }}
                >
                  <BarChart2 size={16} /> {isConsolidating ? 'Consolidando...' : 'Consolidar e Processar Cotas'}
                </button>
              </div>

              {/* Classificação dos Projetos */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <h6 style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <FileSpreadsheet size={16} style={{ color: 'var(--primary-color)' }} /> 
                  Classificação Geral de Projetos
                </h6>
                <div style={{ overflowY: 'auto', maxHeight: '380px', border: '1px solid rgba(0,0,0,0.08)', borderRadius: '12px' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.75rem' }}>
                    <thead>
                      <tr style={{ background: 'rgba(0,0,0,0.03)', borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
                        <th style={{ padding: '0.5rem' }}>Rank</th>
                        <th style={{ padding: '0.5rem' }}>Código / Campus</th>
                        <th style={{ padding: '0.5rem' }}>Nota Final</th>
                        <th style={{ padding: '0.5rem' }}>Situação</th>
                      </tr>
                    </thead>
                    <tbody>
                      {consolidatedProjects.length === 0 ? (
                        <tr>
                          <td colSpan={4} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                            Nenhum projeto avaliado/submetido para este edital ou consolidação pendente.
                          </td>
                        </tr>
                      ) : (
                        consolidatedProjects.map((p, idx) => {
                          let situacaoLabel = p.situacao || 'CLASSIFICACAO_PENDENTE';
                          let situacaoColor = 'var(--text-muted)';
                          let situacaoBg = 'rgba(0,0,0,0.04)';

                          if (situacaoLabel === 'APROVADO') {
                            situacaoColor = 'var(--primary-color)';
                            situacaoBg = 'rgba(21,128,61,0.08)';
                          } else if (situacaoLabel === 'EXCEDENTE') {
                            situacaoColor = 'var(--secondary-color)';
                            situacaoBg = 'rgba(37,99,235,0.08)';
                          } else if (situacaoLabel === 'DESCLASSIFICADO') {
                            situacaoColor = 'var(--danger-color)';
                            situacaoBg = 'rgba(220,38,38,0.08)';
                          }

                          return (
                            <tr key={p.id} style={{ borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
                              <td style={{ padding: '0.5rem', fontWeight: 800 }}>#{idx + 1}</td>
                              <td style={{ padding: '0.5rem' }}>
                                <div style={{ fontWeight: 700 }}>{p.codigo}</div>
                                <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>{p.campus} - {p.orientador}</div>
                              </td>
                              <td style={{ padding: '0.5rem', fontWeight: 700 }}>{p.notaFinal != null ? p.notaFinal.toFixed(1) : '-'}</td>
                              <td style={{ padding: '0.5rem' }}>
                                <span className="badge" style={{ backgroundColor: situacaoBg, color: situacaoColor, fontSize: '0.6rem', padding: '0.15rem 0.4rem' }}>
                                  {situacaoLabel}
                                </span>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          </div>
        )}
      </div>

      {/* CREATE / EDIT EDITAL MODAL */}
      {showCreateModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div className="glass-panel" style={{ width: '90%', maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto', background: '#ffffff', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(0,0,0,0.08)', paddingBottom: '0.75rem' }}>
              <h4 style={{ fontSize: '1.2rem', fontWeight: 850, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <PlusCircle size={20} style={{ color: 'var(--primary-color)' }} />
                {isEditing ? 'Editar Configurações do Edital' : 'Novo Edital Parametrizável (Reitoria)'}
              </h4>
              <button onClick={() => setShowCreateModal(false)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateEdital} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700 }}>Título do Edital</label>
                  <input type="text" value={titulo} onChange={e => setTitulo(e.target.value)} placeholder="Ex: Edital PIBIC/IFAM 2026" style={{ padding: '0.5rem', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.15)' }} required />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700 }}>Ano Fomento</label>
                  <input type="text" value={ano} onChange={e => setAno(e.target.value)} placeholder="Ex: 2026/2027" style={{ padding: '0.5rem', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.15)' }} required />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 700 }}>Descrição / Objetivo</label>
                <textarea value={descricao} onChange={e => setDescricao(e.target.value)} placeholder="Objetivo do edital de incentivo à pesquisa..." rows={2} style={{ padding: '0.5rem', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.15)', resize: 'vertical' }} />
              </div>

              {/* Cronograma */}
              <div style={{ background: 'rgba(0,0,0,0.01)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.04)' }}>
                <h6 style={{ fontSize: '0.8rem', fontWeight: 800, marginBottom: '0.75rem', color: 'var(--text-primary)' }}>Cronograma de Datas (Opcional)</h6>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.75rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <label style={{ fontWeight: 700 }}>Inscrição (Início e Fim)</label>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <input type="date" value={inscricaoInicio} onChange={e => setInscricaoInicio(e.target.value)} style={{ padding: '0.4rem', borderRadius: '6px', border: '1px solid rgba(0,0,0,0.15)', width: '100%' }} />
                      <input type="date" value={inscricaoFim} onChange={e => setInscricaoFim(e.target.value)} style={{ padding: '0.4rem', borderRadius: '6px', border: '1px solid rgba(0,0,0,0.15)', width: '100%' }} />
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <label style={{ fontWeight: 700 }}>Avaliação do Comitê</label>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <input type="date" value={avaliacaoInicio} onChange={e => setAvaliacaoInicio(e.target.value)} style={{ padding: '0.4rem', borderRadius: '6px', border: '1px solid rgba(0,0,0,0.15)', width: '100%' }} />
                      <input type="date" value={avaliacaoFim} onChange={e => setAvaliacaoFim(e.target.value)} style={{ padding: '0.4rem', borderRadius: '6px', border: '1px solid rgba(0,0,0,0.15)', width: '100%' }} />
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <label style={{ fontWeight: 700 }}>Resultado Parcial</label>
                    <input type="date" value={resultadoParcial} onChange={e => setResultadoParcial(e.target.value)} style={{ padding: '0.4rem', borderRadius: '6px', border: '1px solid rgba(0,0,0,0.15)' }} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <label style={{ fontWeight: 700 }}>Resultado Final</label>
                    <input type="date" value={resultadoFinal} onChange={e => setResultadoFinal(e.target.value)} style={{ padding: '0.4rem', borderRadius: '6px', border: '1px solid rgba(0,0,0,0.15)' }} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', gridColumn: 'span 2' }}>
                    <label style={{ fontWeight: 700 }}>Onboarding (Entrega de Docs)</label>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <input type="date" value={onboardingInicio} onChange={e => setOnboardingInicio(e.target.value)} style={{ padding: '0.4rem', borderRadius: '6px', border: '1px solid rgba(0,0,0,0.15)', width: '100%' }} />
                      <input type="date" value={onboardingFim} onChange={e => setOnboardingFim(e.target.value)} style={{ padding: '0.4rem', borderRadius: '6px', border: '1px solid rgba(0,0,0,0.15)', width: '100%' }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Níveis Elegíveis */}
              <div style={{ background: 'rgba(0,0,0,0.01)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.04)' }}>
                <h6 style={{ fontSize: '0.8rem', fontWeight: 800, marginBottom: '0.75rem', color: 'var(--text-primary)' }}>Níveis Elegíveis</h6>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', fontSize: '0.75rem' }}>
                  {['Integrado', 'Subsequente', 'Proeja', 'Graduação', 'Pós-graduação'].map(nivel => (
                    <label key={nivel} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' }}>
                      <input 
                        type="checkbox" 
                        checked={niveis.includes(nivel)}
                        onChange={(e) => {
                          if (e.target.checked) setNiveis([...niveis, nivel]);
                          else setNiveis(niveis.filter(n => n !== nivel));
                        }}
                      />
                      {nivel}
                    </label>
                  ))}
                </div>
              </div>

              {/* Valores de Investimento (NOVO) */}
              <div style={{ background: 'rgba(234,179,8,0.03)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(234,179,8,0.15)' }}>
                <h6 style={{ fontSize: '0.8rem', fontWeight: 800, marginBottom: '0.75rem', color: 'var(--text-primary)' }}>💰 Valores de Bolsa e Configurações do Ciclo</h6>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr) 1fr 1fr', gap: '0.75rem', fontSize: '0.75rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <label style={{ fontWeight: 700 }}>Bolsa FAPEAM (R$)</label>
                    <input type="number" value={valorBolsaFAPEAM} onChange={e => setValorBolsaFAPEAM(Number(e.target.value))} style={{ padding: '0.4rem', borderRadius: '6px', border: '1px solid rgba(0,0,0,0.15)' }} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <label style={{ fontWeight: 700 }}>Bolsa CNPq (R$)</label>
                    <input type="number" value={valorBolsaCNPq} onChange={e => setValorBolsaCNPq(Number(e.target.value))} style={{ padding: '0.4rem', borderRadius: '6px', border: '1px solid rgba(0,0,0,0.15)' }} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <label style={{ fontWeight: 700 }}>Bolsa IFAM (R$)</label>
                    <input type="number" value={valorBolsaIFAM} onChange={e => setValorBolsaIFAM(Number(e.target.value))} style={{ padding: '0.4rem', borderRadius: '6px', border: '1px solid rgba(0,0,0,0.15)' }} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <label style={{ fontWeight: 700 }}>Duração (meses)</label>
                    <input type="number" value={duracaoMeses} onChange={e => setDuracaoMeses(Number(e.target.value))} min={1} max={24} style={{ padding: '0.4rem', borderRadius: '6px', border: '1px solid rgba(0,0,0,0.15)' }} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <label style={{ fontWeight: 700 }}>Modalidade</label>
                    <select value={modalidade} onChange={e => setModalidade(e.target.value)} style={{ padding: '0.4rem', borderRadius: '6px', border: '1px solid rgba(0,0,0,0.15)' }}>
                      <option value="PIBIC">PIBIC</option>
                      <option value="PAIC">PAIC</option>
                      <option value="PIBIC-EM">PIBIC-EM</option>
                      <option value="FC">FC (Formação Complementar)</option>
                    </select>
                  </div>
                </div>
                <div style={{ marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700 }}>Link do PDF do Edital (URL)</label>
                  <input type="url" value={documentoEditalUrl} onChange={e => setDocumentoEditalUrl(e.target.value)} placeholder="https://ifam.edu.br/editais/pibic-2026.pdf" style={{ padding: '0.4rem', borderRadius: '6px', border: '1px solid rgba(0,0,0,0.15)', width: '100%', fontSize: '0.8rem' }} />
                </div>
                <div style={{ marginTop: '0.75rem', fontSize: '0.7rem', color: 'var(--text-secondary)', background: 'rgba(234,179,8,0.05)', padding: '0.5rem 0.75rem', borderRadius: '6px' }}>
                  📊 Investimento estimado por campus = <strong>Quantidade de bolsas × Maior valor de bolsa × Duração</strong>. Exibido automaticamente no painel de cotas.
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                
                {/* Cotas e Critérios */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', background: 'rgba(0,0,0,0.01)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.04)' }}>
                  
                  {/* Cotas */}
                  <div>
                    <h6 style={{ fontSize: '0.8rem', fontWeight: 800, marginBottom: '0.5rem' }}>Definir Cotas de Bolsas por Campus</h6>
                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <select value={tempCampus} onChange={e => setTempCampus(e.target.value)} style={{ padding: '0.4rem', borderRadius: '6px', border: '1px solid rgba(0,0,0,0.15)', flex: 1, fontSize: '0.8rem' }}>
                        {campusesList.map(c => <option key={c.id} value={c.sigla}>{c.sigla} - {c.nome}</option>)}
                      </select>
                      <input type="number" value={tempQuota} onChange={e => setTempQuota(e.target.value)} placeholder="Qtd" style={{ padding: '0.4rem', borderRadius: '6px', border: '1px solid rgba(0,0,0,0.15)', width: '60px', fontSize: '0.8rem' }} />
                      <button type="button" onClick={handleAddQuota} className="btn-secondary" style={{ padding: '0.4rem 0.6rem', fontSize: '0.75rem' }}><Plus size={14} /></button>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', minHeight: '30px' }}>
                      {quotas.map((q, i) => (
                        <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', padding: '0.2rem 0.4rem', background: '#ffffff', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 700 }}>
                          {q.campus}: {q.quantidade}
                          <X size={12} style={{ cursor: 'pointer', color: 'red' }} onClick={() => setQuotas(quotas.filter((_, idx) => idx !== i))} />
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Critérios */}
                  <div>
                    <h6 style={{ fontSize: '0.8rem', fontWeight: 800, marginBottom: '0.5rem' }}>Critérios Avaliativos do Projeto</h6>
                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <input type="text" value={tempCriterionName} onChange={e => setTempCriterionName(e.target.value)} placeholder="Nome do Critério" style={{ padding: '0.4rem', borderRadius: '6px', border: '1px solid rgba(0,0,0,0.15)', flex: 2, fontSize: '0.8rem' }} />
                      <input type="number" value={tempCriterionPoints} onChange={e => setTempCriterionPoints(e.target.value)} placeholder="Max pts" style={{ padding: '0.4rem', borderRadius: '6px', border: '1px solid rgba(0,0,0,0.15)', flex: 1, fontSize: '0.8rem' }} />
                      <button type="button" onClick={handleAddCriterion} className="btn-secondary" style={{ padding: '0.4rem 0.6rem', fontSize: '0.75rem' }}><Plus size={14} /></button>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.7rem' }}>
                      {criteria.map((c, i) => (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.25rem', background: '#ffffff', border: '1px solid rgba(0,0,0,0.06)', borderRadius: '4px' }}>
                          <span>{c.nome}</span>
                          <span style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            {c.pontosMax} pts
                            <X size={12} style={{ cursor: 'pointer', color: 'red' }} onClick={() => setCriteria(criteria.filter((_, idx) => idx !== i))} />
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

                {/* Requisitos de Arquivos */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', background: 'rgba(0,0,0,0.01)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.04)' }}>
                  
                  {/* Fase 1 */}
                  <div>
                    <h6 style={{ fontSize: '0.8rem', fontWeight: 800, marginBottom: '0.5rem' }}>Docs Exigidos - Inscrição (Fase 1)</h6>
                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                      <select onChange={(e) => {
                        if (e.target.value) {
                          if (!inscriptionReqs.some(r => r.nome === e.target.value)) {
                            setInscriptionReqs([...inscriptionReqs, { nome: e.target.value, obrigatorio: true }]);
                          }
                          e.target.value = '';
                        }
                      }} style={{ padding: '0.4rem', borderRadius: '6px', border: '1px solid rgba(0,0,0,0.15)', flex: '1 1 150px', fontSize: '0.8rem' }}>
                        <option value="">-- Biblioteca Padrão --</option>
                        <option value="RG e CPF (PDF)">RG e CPF (PDF)</option>
                        <option value="Currículo Lattes (Link/PDF)">Currículo Lattes (Link/PDF)</option>
                        <option value="Comprovante de Matrícula">Comprovante de Matrícula</option>
                        <option value="Comprovante de Residência">Comprovante de Residência</option>
                        <option value="Histórico Escolar">Histórico Escolar</option>
                        <option value="Termo de Compromisso FAPEAM">Termo de Compromisso FAPEAM</option>
                        <option value="Termo de Voluntariado">Termo de Voluntariado</option>
                        <option value="Dados Bancários (Comprovante)">Dados Bancários (Comprovante)</option>
                      </select>
                      <input type="text" value={tempInsReqName} onChange={e => setTempInsReqName(e.target.value)} placeholder="Ou outro personalizado..." style={{ padding: '0.4rem', borderRadius: '6px', border: '1px solid rgba(0,0,0,0.15)', flex: '1 1 150px', fontSize: '0.8rem' }} />
                      <button type="button" onClick={handleAddInsReq} className="btn-secondary" style={{ padding: '0.4rem 0.6rem', fontSize: '0.75rem' }}><Plus size={14} /></button>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.7rem' }}>
                      {inscriptionReqs.map((r, i) => (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.25rem', background: '#ffffff', border: '1px solid rgba(0,0,0,0.06)', borderRadius: '4px' }}>
                          <span>{r.nome} (Obrigatório)</span>
                          <X size={12} style={{ cursor: 'pointer', color: 'red' }} onClick={() => setInscriptionReqs(inscriptionReqs.filter((_, idx) => idx !== i))} />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Fase 2 */}
                  <div>
                    <h6 style={{ fontSize: '0.8rem', fontWeight: 800, marginBottom: '0.5rem' }}>Docs Exigidos - Homologação (Fase 2)</h6>
                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                      <select onChange={(e) => {
                        if (e.target.value) {
                          if (!requirements.some(r => r.nome === e.target.value)) {
                            setRequirements([...requirements, { nome: e.target.value, obrigatorio: true }]);
                          }
                          e.target.value = '';
                        }
                      }} style={{ padding: '0.4rem', borderRadius: '6px', border: '1px solid rgba(0,0,0,0.15)', flex: '1 1 150px', fontSize: '0.8rem' }}>
                        <option value="">-- Biblioteca Padrão --</option>
                        <option value="RG e CPF (PDF)">RG e CPF (PDF)</option>
                        <option value="Currículo Lattes (Link/PDF)">Currículo Lattes (Link/PDF)</option>
                        <option value="Comprovante de Matrícula">Comprovante de Matrícula</option>
                        <option value="Comprovante de Residência">Comprovante de Residência</option>
                        <option value="Histórico Escolar">Histórico Escolar</option>
                        <option value="Termo de Compromisso FAPEAM">Termo de Compromisso FAPEAM</option>
                        <option value="Termo de Voluntariado">Termo de Voluntariado</option>
                        <option value="Dados Bancários (Comprovante)">Dados Bancários (Comprovante)</option>
                      </select>
                      <input type="text" value={tempReqName} onChange={e => setTempReqName(e.target.value)} placeholder="Ou outro personalizado..." style={{ padding: '0.4rem', borderRadius: '6px', border: '1px solid rgba(0,0,0,0.15)', flex: '1 1 150px', fontSize: '0.8rem' }} />
                      <button type="button" onClick={handleAddReq} className="btn-secondary" style={{ padding: '0.4rem 0.6rem', fontSize: '0.75rem' }}><Plus size={14} /></button>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.7rem' }}>
                      {requirements.map((r, i) => (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.25rem', background: '#ffffff', border: '1px solid rgba(0,0,0,0.06)', borderRadius: '4px' }}>
                          <span>{r.nome} (Obrigatório)</span>
                          <X size={12} style={{ cursor: 'pointer', color: 'red' }} onClick={() => setRequirements(requirements.filter((_, idx) => idx !== i))} />
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', borderTop: '1px solid rgba(0,0,0,0.08)', paddingTop: '1rem', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setShowCreateModal(false)} className="btn-secondary">Cancelar</button>
                <button type="submit" className="btn-primary">{isEditing ? 'Salvar Alterações' : 'Gravar e Publicar Edital'}</button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
