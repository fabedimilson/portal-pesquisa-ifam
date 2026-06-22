import React, { useState } from 'react';
import { Landmark, ShieldAlert, AlertCircle, Trash2 } from 'lucide-react';

const ACTIVITIES = [
  'Revisão Bibliográfica', 
  'Coleta de Dados', 
  'Testes de Campo', 
  'Trabalho de Laboratório', 
  'Análise de Resultados', 
  'Escrita de Relatório'
];

interface Frequency {
  id: string;
  projectId: string;
  studentName: string;
  month: string;
  hours: number;
  activityType: string;
  description: string;
  status: string;
  feedback?: string | null;
  dailyLogs?: string | null;
  banco?: string | null;
  agencia?: string | null;
  conta?: string | null;
}

interface Project {
  id: string;
  codigo: string;
  campus: string;
  titulo: string;
  orientador: string;
  fomento: string;
  discente: string | null;
  status: string;
  editalId?: string | null;
}

interface FrequenciesModuleProps {
  frequencies: Frequency[];
  projects: Project[];
  editais: any[];
  currentRole: string;
  selectedCampus: string;
  onRefresh: () => void;
  targetStudentProject: Project | null;
  studentBank: string;
  setStudentBank: (v: string) => void;
  studentAgencia: string;
  setStudentAgencia: (v: string) => void;
  studentConta: string;
  setStudentConta: (v: string) => void;
  bankError: string | null;
  setBankError: (v: string | null) => void;
}

export default function FrequenciesModule({
  frequencies,
  projects,
  editais,
  currentRole,
  selectedCampus,
  onRefresh,
  targetStudentProject,
  studentBank,
  setStudentBank,
  studentAgencia,
  setStudentAgencia,
  studentConta,
  setStudentConta,
  bankError,
  setBankError
}: FrequenciesModuleProps) {
  const [loading, setLoading] = useState(false);

  // Student specific state
  const [selectedMonth, setSelectedMonth] = useState<string>('Agosto');
  const [dailyLogsList, setDailyLogsList] = useState<{ day: number; hours: number; activity: string }[]>([]);
  const [inputDay, setInputDay] = useState<number>(1);
  const [inputHours, setInputHours] = useState<number>(4);
  const [inputActivity, setInputActivity] = useState<string>(ACTIVITIES[0]);
  const [studentDesc, setStudentDesc] = useState<string>('');

  // Professor specific state
  const [selectedFreqForEval, setSelectedFreqForEval] = useState<Frequency | null>(null);
  const [evalComment, setEvalComment] = useState<string>('');

  // Handle bank account validation
  const validateBankAccount = (banco: string): boolean => {
    if (!targetStudentProject) return true;
    const fomento = targetStudentProject.fomento;
    
    if (fomento === 'FAPEAM') {
      const isAllowed = ['Bradesco', 'Next', 'Banco Bradesco', 'Banco Next'].some(b => 
        banco.toLowerCase().includes(b.toLowerCase())
      );
      if (!isAllowed) {
        setBankError('Erro crítico: Para bolsas FAPEAM/PAIC, a conta deve ser obrigatoriamente do Banco Bradesco ou Banco Next.');
        return false;
      }
    }
    setBankError(null);
    return true;
  };

  const handleAddDailyEntry = () => {
    if (inputDay < 1 || inputDay > 31) {
      alert('Selecione um dia do mês válido (1 a 31).');
      return;
    }
    if (inputHours <= 0 || inputHours > 24) {
      alert('Digite uma carga horária diária válida.');
      return;
    }
    setDailyLogsList([...dailyLogsList, { day: inputDay, hours: inputHours, activity: inputActivity }]);
    setInputDay(prev => prev < 31 ? prev + 1 : prev);
  };

  const handleRemoveDailyEntry = (index: number) => {
    setDailyLogsList(dailyLogsList.filter((_, i) => i !== index));
  };

  const calculatedTotalHours = dailyLogsList.reduce((acc, curr) => acc + curr.hours, 0);

  const handleFrequencySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetStudentProject) return;

    if (!validateBankAccount(studentBank)) {
      return;
    }

    if (dailyLogsList.length === 0) {
      alert('Adicione pelo menos um dia com atividades executadas para submeter.');
      return;
    }

    if (calculatedTotalHours < 80) {
      if (!confirm(`Atenção: A carga horária total somada (${calculatedTotalHours}h) está abaixo do mínimo exigido de 80h para o edital. Deseja enviar assim mesmo?`)) {
        return;
      }
    }

    const studentName = targetStudentProject.discente || 'Estudante Simulado';
    
    if (!selectedMonth) {
      alert('Selecione o mês de referência para a frequência.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/frequencies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: targetStudentProject.id,
          studentName,
          month: selectedMonth,
          hours: calculatedTotalHours,
          activityType: dailyLogsList[0]?.activity || ACTIVITIES[0],
          description: studentDesc || `Relatório diário consolidado com total de ${dailyLogsList.length} dias de atividades.`,
          banco: targetStudentProject.fomento !== 'VOLUNTÁRIO' ? studentBank : null,
          agencia: targetStudentProject.fomento !== 'VOLUNTÁRIO' ? studentAgencia : null,
          conta: targetStudentProject.fomento !== 'VOLUNTÁRIO' ? studentConta : null,
          dailyLogs: JSON.stringify(dailyLogsList)
        })
      });

      if (res.ok) {
        alert('Frequência submetida com sucesso ao Orientador!');
        setStudentDesc('');
        setDailyLogsList([]);
        onRefresh();
      } else {
        const errData = await res.json();
        alert(`Erro ao submeter: ${errData.error}`);
      }
    } catch (err) {
      console.error(err);
      alert('Erro de conexão.');
    } finally {
      setLoading(false);
    }
  };

  const handleEvaluateFrequency = async (approved: boolean) => {
    if (!selectedFreqForEval) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/frequencies/${selectedFreqForEval.id}/evaluate`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          approved,
          comment: evalComment
        })
      });

      if (res.ok) {
        alert(approved ? 'Frequência homologada!' : 'Frequência devolvida para correção.');
        setSelectedFreqForEval(null);
        setEvalComment('');
        onRefresh();
      } else {
        alert('Falha ao registrar avaliação.');
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
      
      {/* STUDENT VIEW */}
      {currentRole === 'STUDENT' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '2rem' }}>
          <form onSubmit={handleFrequencySubmit} className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>Lançamento de Frequência Mensal (Diário de Bordo)</h3>

            {targetStudentProject ? (
              <>
                <div style={{ padding: '0.75rem', background: 'rgba(0,0,0,0.02)', borderRadius: '10px', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Projeto Vinculado</span>
                  <strong style={{ color: 'var(--text-primary)', fontSize: '0.9rem' }}>{targetStudentProject.titulo}</strong>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Orientador: {targetStudentProject.orientador} | Fomento: {targetStudentProject.fomento}</span>
                </div>

                {/* Mês de Referência */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Mês de Referência *</label>
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '8px', color: 'var(--text-primary)', fontSize: '0.85rem' }}
                    required
                  >
                    {['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'].map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Selecione o mês ao qual esta frequência se refere</span>
                </div>

                {/* Bank Details Block (If not volunteer) */}
                {targetStudentProject.fomento !== 'VOLUNTÁRIO' && (
                  <div style={{ border: '1px solid rgba(0, 0, 0, 0.05)', padding: '1rem', borderRadius: '10px', background: 'rgba(0, 0, 0, 0.01)' }}>
                    <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent-color)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Landmark size={16} /> Dados Bancários da Cota
                    </h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
                      <div>
                        <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Banco</label>
                        <select 
                          value={studentBank} 
                          onChange={(e) => { setStudentBank(e.target.value); validateBankAccount(e.target.value); }}
                          style={{ width: '100%', padding: '0.5rem', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '8px', color: 'var(--text-primary)', fontSize: '0.85rem' }}
                        >
                          <option value="Bradesco">Banco Bradesco</option>
                          <option value="Next">Banco Next</option>
                          <option value="Banco do Brasil">Banco do Brasil</option>
                          <option value="Caixa">Caixa Econômica</option>
                          <option value="Itaú">Itaú Unibanco</option>
                        </select>
                      </div>
                      <div>
                        <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Agência</label>
                        <input 
                          type="text" 
                          required
                          placeholder="1234" 
                          value={studentAgencia} 
                          onChange={(e) => setStudentAgencia(e.target.value)}
                          style={{ width: '100%', padding: '0.5rem', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '8px', color: 'var(--text-primary)', fontSize: '0.85rem' }}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Conta Corrente</label>
                        <input 
                          type="text" 
                          required
                          placeholder="56789-0" 
                          value={studentConta} 
                          onChange={(e) => setStudentConta(e.target.value)}
                          style={{ width: '100%', padding: '0.5rem', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '8px', color: 'var(--text-primary)', fontSize: '0.85rem' }}
                        />
                      </div>
                    </div>
                    {bankError && (
                      <div style={{ marginTop: '0.75rem', padding: '0.5rem', background: 'rgba(220,38,38,0.06)', border: '1px solid var(--danger-color)', borderRadius: '6px', fontSize: '0.75rem', color: 'var(--danger-color)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <ShieldAlert size={14} /> {bankError}
                      </div>
                    )}
                  </div>
                )}

                {/* Daily Activity Input Grid (Button +) */}
                <div style={{ border: '1px solid rgba(0,0,0,0.05)', padding: '1rem', borderRadius: '12px', background: 'rgba(0,0,0,0.01)' }}>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--primary-color)', marginBottom: '0.75rem' }}>Adicionar Registro Diário</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '0.8fr 1fr 2fr auto', gap: '0.75rem', alignItems: 'end' }}>
                    <div>
                      <label style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Dia do Mês</label>
                      <input 
                        type="number" 
                        min={1} 
                        max={31} 
                        value={inputDay}
                        onChange={(e) => setInputDay(parseInt(e.target.value) || 1)}
                        style={{ width: '100%', padding: '0.4rem', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '6px' }}
                      />
                    </div>
                    
                    <div>
                      <label style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Horas</label>
                      <input 
                        type="number" 
                        min={1} 
                        max={24} 
                        value={inputHours}
                        onChange={(e) => setInputHours(parseInt(e.target.value) || 1)}
                        style={{ width: '100%', padding: '0.4rem', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '6px' }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Atividade</label>
                      <select 
                        value={inputActivity}
                        onChange={(e) => setInputActivity(e.target.value)}
                        style={{ width: '100%', padding: '0.4rem', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '6px' }}
                      >
                        {ACTIVITIES.map(a => <option key={a} value={a}>{a}</option>)}
                      </select>
                    </div>

                    <button 
                      type="button" 
                      onClick={handleAddDailyEntry} 
                      className="btn-primary" 
                      style={{ padding: '0.45rem 1rem', display: 'flex', alignItems: 'center', height: '33px' }}
                    >
                      + Add
                    </button>
                  </div>

                  {/* List of Added Daily Logs */}
                  {dailyLogsList.length > 0 && (
                    <div style={{ marginTop: '1rem', borderTop: '1px solid rgba(0,0,0,0.06)', paddingTop: '0.75rem' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Registros Adicionados:</span>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', marginTop: '0.5rem', maxHeight: '150px', overflowY: 'auto' }}>
                        {dailyLogsList.map((item, idx) => (
                          <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.35rem 0.5rem', background: '#f8fafc', borderRadius: '6px', fontSize: '0.8rem' }}>
                            <span>Dia <strong>{item.day}</strong>: {item.hours}h - <span style={{ color: 'var(--text-secondary)' }}>{item.activity}</span></span>
                            <button type="button" onClick={() => handleRemoveDailyEntry(idx)} style={{ background: 'none', border: 'none', color: 'var(--danger-color)', cursor: 'pointer' }}>
                              <Trash2 size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Cumulative Sum and Warning */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: 'rgba(21,128,61,0.03)', border: '1px solid rgba(21,128,61,0.1)', borderRadius: '10px' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Soma da Carga Horária do Mês:</span> <br />
                    <strong style={{ fontSize: '1.2rem', color: 'var(--primary-color)' }}>{calculatedTotalHours} / 80 horas</strong>
                  </div>
                  {calculatedTotalHours < 80 && (
                    <span style={{ fontSize: '0.75rem', color: 'var(--accent-color)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <AlertCircle size={14} /> Abaixo do mínimo do Edital
                    </span>
                  )}
                </div>

                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Observações ou Justificativa Mensal (Texto Livre)</label>
                  <textarea 
                    rows={3}
                    placeholder="Digite considerações adicionais do mês letivo..."
                    value={studentDesc} 
                    onChange={(e) => setStudentDesc(e.target.value)}
                    style={{ width: '100%', padding: '0.6rem', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '8px', color: 'var(--text-primary)', resize: 'vertical' }}
                  />
                </div>

                <button type="submit" className="btn-primary" style={{ alignSelf: 'flex-start' }} disabled={!!bankError || dailyLogsList.length === 0 || loading}>
                  Submeter Frequência Mensal
                </button>
              </>
            ) : (
              <div style={{ color: 'var(--text-secondary)', padding: '1rem', textAlign: 'center' }}>
                Nenhum projeto associado encontrado para este discente.
              </div>
            )}
          </form>

          {/* Submission Status List */}
          <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)' }}>Situação das Frequências</h3>
            
            {targetStudentProject && frequencies.filter(f => f.projectId === targetStudentProject.id).map(f => (
              <div key={f.id} style={{ padding: '0.75rem', background: 'rgba(0,0,0,0.01)', border: '1px solid rgba(0,0,0,0.06)', borderRadius: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                  <span style={{ fontWeight: 'bold' }}>{f.month} Letivo</span>
                  <span className={`badge`} style={{
                    background: f.status === 'APROVADO' ? 'rgba(16,185,129,0.15)' : f.status === 'CORRECAO' ? 'rgba(239,68,68,0.15)' : 'rgba(245,158,11,0.15)',
                    color: f.status === 'APROVADO' ? '#059669' : f.status === 'CORRECAO' ? '#dc2626' : '#d97706'
                  }}>
                    {f.status}
                  </span>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  Carga Horária Consolidada: <strong>{f.hours}h</strong> ({f.activityType})
                </div>
                
                {f.dailyLogs && (
                  <div style={{ marginTop: '0.5rem', padding: '0.4rem', background: '#f8fafc', borderRadius: '6px', fontSize: '0.75rem' }}>
                    <span style={{ fontWeight: 700, display: 'block', marginBottom: '0.25rem' }}>Detalhamento Diário:</span>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                      {JSON.parse(f.dailyLogs).map((log: any, lIdx: number) => (
                        <span key={lIdx} style={{ background: '#e2e8f0', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>
                          Dia {log.day}: {log.hours}h
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {f.feedback && (
                  <div style={{ marginTop: '0.5rem', padding: '0.5rem', background: 'rgba(239,68,68,0.05)', borderRadius: '6px', fontSize: '0.75rem', borderLeft: '3px solid var(--danger-color)', color: 'var(--danger-color)' }}>
                    <strong>Orientador:</strong> {f.feedback}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PROFESSOR VIEW */}
      {currentRole === 'PROFESSOR' && (
        <div className="glass-panel">
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '1rem' }}>Avaliação de Relatórios de Alunos</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {frequencies
              .filter(f => f.status === 'SUBMETIDO')
              .map(f => {
                const proj = projects.find(p => p.id === f.projectId);
                return (
                  <div key={f.id} style={{ border: '1px solid rgba(0,0,0,0.06)', borderRadius: '12px', padding: '1rem', background: 'rgba(0,0,0,0.01)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                      <div>
                        <strong style={{ color: 'var(--text-primary)' }}>{f.studentName}</strong>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginLeft: '0.5rem' }}>
                          Projeto: {proj?.codigo} | Fomento: {proj?.fomento}
                        </span>
                      </div>
                      <span className="badge" style={{ background: 'rgba(245,158,11,0.1)', color: '#d97706' }}>
                        Aguardando Homologação
                      </span>
                    </div>
                    
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.75rem', padding: '0.75rem', background: 'rgba(0,0,0,0.02)', borderRadius: '6px' }}>
                      <strong>Carga Horária Total: {f.hours}h </strong> ({f.activityType}) <br />
                      <p style={{ marginTop: '0.25rem' }}>{f.description}</p>
                      
                      {f.dailyLogs && (
                        <div style={{ marginTop: '0.75rem', padding: '0.5rem', background: '#ffffff', borderRadius: '6px', border: '1px solid rgba(0,0,0,0.05)' }}>
                          <strong style={{ fontSize: '0.75rem', color: 'var(--text-primary)' }}>Diário de Bordo Submetido:</strong>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '0.4rem', marginTop: '0.35rem' }}>
                            {JSON.parse(f.dailyLogs).map((log: any, lIdx: number) => (
                              <div key={lIdx} style={{ padding: '0.25rem', background: '#f1f5f9', borderRadius: '4px', fontSize: '0.7rem' }}>
                                Dia {log.day}: <strong>{log.hours}h</strong> <br />
                                <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>{log.activity}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {selectedFreqForEval?.id === f.id ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.75rem' }}>
                        <textarea 
                          placeholder="Justificativa obrigatória caso devolva para correção..." 
                          value={evalComment} 
                          onChange={(e) => setEvalComment(e.target.value)}
                          style={{ width: '100%', padding: '0.5rem', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '8px', color: 'var(--text-primary)' }}
                        />
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button onClick={() => handleEvaluateFrequency(true)} className="btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }} disabled={loading}>
                            Homologar Frequência
                          </button>
                          <button 
                            onClick={() => handleEvaluateFrequency(false)} 
                            className="btn-secondary" 
                            style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', borderColor: 'var(--danger-color)', color: 'var(--danger-color)' }}
                            disabled={!evalComment.trim() || loading}
                          >
                            Devolver para Correção
                          </button>
                          <button onClick={() => setSelectedFreqForEval(null)} className="btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}>
                            Cancelar
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button onClick={() => setSelectedFreqForEval(f)} className="btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}>
                        Revisar e Homologar
                      </button>
                    )}
                  </div>
                );
              })}

            {frequencies.filter(f => f.status === 'SUBMETIDO').length === 0 && (
              <div style={{ color: 'var(--text-secondary)', padding: '2rem', textAlign: 'center' }}>
                Nenhum relatório pendente de homologação.
              </div>
            )}
          </div>
        </div>
      )}

      {/* COORDINATOR & PPGI VIEW */}
      {(currentRole === 'COORDINATOR' || currentRole === 'PPGI') && (
        <div className="glass-panel">
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '1rem' }}>Frequências Consolidadas (Campus)</h3>
          
          <div style={{ overflowX: 'auto', maxHeight: '550px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(0,0,0,0.06)', color: 'var(--text-secondary)', textAlign: 'left', background: '#f8fafc', position: 'sticky', top: 0, zIndex: 1 }}>
                  <th style={{ padding: '0.75rem' }}>Bolsista</th>
                  <th style={{ padding: '0.75rem' }}>Projeto</th>
                  <th style={{ padding: '0.75rem' }}>Banco</th>
                  <th style={{ padding: '0.75rem' }}>Mês</th>
                  <th style={{ padding: '0.75rem' }}>Horas</th>
                  <th style={{ padding: '0.75rem' }}>Atividade Principal</th>
                  <th style={{ padding: '0.75rem' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {frequencies
                  .filter(f => {
                    const proj = projects.find(p => p.id === f.projectId);
                    return currentRole === 'PPGI' || proj?.campus === selectedCampus;
                  })
                  .map((f, idx) => {
                    const proj = projects.find(p => p.id === f.projectId);
                    return (
                      <tr key={idx} style={{ borderBottom: '1px solid rgba(0,0,0,0.03)' }}>
                        <td style={{ padding: '0.75rem', fontWeight: 600 }}>{f.studentName}</td>
                        <td style={{ padding: '0.75rem', fontSize: '0.8rem' }}>{proj?.codigo} ({proj?.campus})</td>
                        <td style={{ padding: '0.75rem', fontSize: '0.8rem' }}>{f.banco || 'Sem banco'}</td>
                        <td style={{ padding: '0.75rem' }}>{f.month}</td>
                        <td style={{ padding: '0.75rem' }}>{f.hours}h</td>
                        <td style={{ padding: '0.75rem' }}>{f.activityType}</td>
                        <td style={{ padding: '0.75rem' }}>
                          <span className={`badge`} style={{
                            background: f.status === 'APROVADO' ? 'rgba(16,185,129,0.15)' : f.status === 'CORRECAO' ? 'rgba(239,68,68,0.15)' : 'rgba(245,158,11,0.15)',
                            color: f.status === 'APROVADO' ? '#059669' : f.status === 'CORRECAO' ? '#dc2626' : '#d97706'
                          }}>
                            {f.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
    </div>
  );
}
