import React, { useState, useEffect } from 'react';
import EditaisModule from './components/EditaisModule';
import AvaliacaoModule from './components/AvaliacaoModule';
import CursosModule from './components/CursosModule';
import EditaisPublicosModule from './components/EditaisPublicosModule';
import ReportsModule from './components/ReportsModule';
import GroupsModule from './components/GroupsModule';
import TriagemModule from './components/TriagemModule';
import FrequenciesModule from './components/FrequenciesModule';
import SubstitutionsModule from './components/SubstitutionsModule';
import FruitsModule from './components/FruitsModule';
import CertificatesModule from './components/CertificatesModule';


import { 
  Upload, CheckCircle2, XCircle, AlertCircle, Calendar, 
  DollarSign, Building2, Download, User, Users, FileText, 
  Check, RefreshCw, FileSpreadsheet, Layers, Search, ShieldAlert,
  ArrowRight, Landmark, HelpCircle, LogOut, Lock, Award,
  PlusCircle, BookOpen, ExternalLink, QrCode, FileCheck, Trash2, UserCheck, X, Shuffle, Menu, ChevronLeft, ChevronRight
} from 'lucide-react';

// Types
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

interface Frequency {
  id: string;
  projectId: string;
  studentName: string;
  month: string;
  hours: number;
  activityType: string;
  description: string;
  status: 'PENDENTE' | 'SUBMETIDO' | 'APROVADO' | 'CORRECAO';
  feedback?: string;
  banco?: string;
  agencia?: string;
  conta?: string;
  dailyLogs?: string | null;
  project?: Project;
}

interface ResearchGroup {
  id: string;
  nome: string;
  area: string | null;
  lideres: string;
  linhasPesquisa: string;
  membrosEquipe: string;
  campus: string;
  endereco?: string | null;
  status: 'ATIVO' | 'ALERTA';
  contatoEmail: string | null;
  linkCnpq: string | null;
  createdAt: string;
  updatedAt: string;
  lastActivity: string;
}

interface Fruit {
  id: string;
  tipo: string;
  classificacao: string;
  titulo: string;
  linkUrl: string | null;
  projectId: string;
  project?: Project;
  createdAt: string;
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

interface Certificate {
  id: string;
  projectId: string;
  studentName: string;
  role: string;
  hash: string;
  cargaHoraria: number;
  emissao: string;
  project?: Project;
}

const CAMPUSES = ['CMC', 'CMZL', 'CMDI', 'CPRF', 'CPIN', 'CITA', 'CLAB', 'COARI', 'CMA'];
const MONTHS = ['Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro', 'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho'];
const ACTIVITIES = [
  'Revisão Bibliográfica', 
  'Coleta de Dados', 
  'Testes de Campo', 
  'Trabalho de Laboratório', 
  'Análise de Resultados', 
  'Escrita de Relatório'
];

// Animated Counter Component
const AnimatedCounter = ({ value }: { value: number }) => {
  const [count, setCount] = useState(0);
  const [trigger, setTrigger] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = value;
    setCount(0);
    
    if (end === 0) {
      setCount(0);
      return;
    }

    const totalDuration = 800;
    const stepTime = Math.max(Math.floor(totalDuration / end), 16);
    const timer = setInterval(() => {
      start += 1;
      setCount(start);
      if (start >= end) {
        clearInterval(timer);
        setCount(end);
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [value, trigger]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTrigger(prev => prev + 1);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  return <>{count}</>;
};

// BI Speedometer (Gauge) Component
function BISpeedometer({ 
  value, 
  max = 30, 
  title, 
  subtitle,
  badgeText,
  icon: Icon,
  pill1Val,
  pill1Label,
  pill2Val,
  pill2Label,
  pill3Val,
  pill3Label,
  color = '#3b82f6'
}: { 
  value: number; 
  max?: number; 
  title: string; 
  subtitle?: string; 
  badgeText: string;
  icon: React.ComponentType<{ size?: number; style?: React.CSSProperties }>;
  pill1Val: number;
  pill1Label: React.ReactNode;
  pill2Val: number;
  pill2Label: React.ReactNode;
  pill3Val?: number;
  pill3Label?: React.ReactNode;
  color?: string;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const [animatedOffset, setAnimatedOffset] = useState(109.95);
  const [trigger, setTrigger] = useState(0);

  const percentage = Math.min(100, Math.max(0, (value / (max || 1)) * 100));
  const targetOffset = 109.95 - (109.95 * percentage) / 100;

  useEffect(() => {
    const interval = setInterval(() => {
      setTrigger(prev => prev + 1);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Reset/re-animate the arc gauge
    setAnimatedOffset(109.95);
    const timeout = setTimeout(() => {
      setAnimatedOffset(targetOffset);
    }, 150);
    return () => clearTimeout(timeout);
  }, [targetOffset, trigger]);

  return (
    <div 
      className="glass-panel animate-fade-in" 
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        padding: '1.25rem', 
        borderRadius: '24px', 
        background: '#ffffff', 
        border: isHovered ? `1px solid ${color}35` : '1px solid rgba(0,0,0,0.06)', 
        boxShadow: isHovered 
          ? `0 20px 35px -5px rgba(0, 0, 0, 0.05), 0 10px 20px ${color}20` 
          : `0 8px 30px rgba(0,0,0,0.015), 0 4px 12px ${color}08`, 
        position: 'relative', 
        borderTop: `5px solid ${color}`, 
        minHeight: '320px', 
        justifyContent: 'space-between',
        transform: isHovered ? 'translateY(-6px) scale(1.02)' : 'translateY(0) scale(1)',
        transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.3s ease, border-color 0.3s ease'
      }}
    >
      
      {/* Top Header Row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
        <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: color, flexShrink: 0 }}>
          <Icon size={24} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.2 }}>{title}</span>
          {subtitle && <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>{subtitle}</span>}
        </div>
      </div>

      {/* Speedometer Arc Visual */}
      <div style={{ position: 'relative', width: '100%', height: '115px', display: 'flex', justifyContent: 'center', alignItems: 'flex-end', overflow: 'hidden', margin: '0.5rem 0' }}>
        <svg width="155" height="155" style={{ position: 'absolute', bottom: '-40px' }} viewBox="0 0 100 100">
          {/* Base Track */}
          <path
            d="M 15 50 A 35 35 0 0 1 85 50"
            fill="none"
            stroke="#f1f5f9"
            strokeWidth="8"
            strokeLinecap="round"
          />
          {/* Active Progress Arc */}
          <path
            d="M 15 50 A 35 35 0 0 1 85 50"
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray="109.95"
            strokeDashoffset={animatedOffset}
            style={{ transition: 'stroke-dashoffset 1s ease-in-out' }}
          />
        </svg>

        {/* Center Text displaying value */}
        <div style={{ zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '4px' }}>
          <span style={{ fontSize: '2.2rem', fontWeight: 850, color: '#1e293b', lineHeight: 1, letterSpacing: '-0.03em' }}>
            <AnimatedCounter value={value} />
          </span>
          <span style={{ fontSize: '0.6rem', fontWeight: 700, color: 'var(--text-secondary)', background: '#f1f5f9', padding: '0.15rem 0.5rem', borderRadius: '12px', marginTop: '0.2rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {badgeText}
          </span>
        </div>
      </div>

      {/* Bottom Sub-Category Cards/Pills */}
      <div style={{ display: 'grid', gridTemplateColumns: pill3Label ? '1fr 1fr 1fr' : '1fr 1fr', gap: '0.4rem', marginTop: '0.25rem' }}>
        <div style={{ background: '#fff1f2', borderRadius: '12px', padding: '0.4rem 0.2rem', textAlign: 'center', border: '1px solid rgba(227,6,19,0.06)' }}>
          <div style={{ fontSize: '1rem', fontWeight: 850, color: 'var(--accent-color)', lineHeight: 1 }}><AnimatedCounter value={pill1Val} /></div>
          <div style={{ fontSize: '0.65rem', fontWeight: 800, color: 'rgba(227,6,19,0.7)', textTransform: 'uppercase', marginTop: '0.1rem', whiteSpace: 'normal', lineHeight: 1.1 }} title={typeof pill1Label === 'string' ? pill1Label : undefined}>{pill1Label}</div>
        </div>
        <div style={{ background: '#eff6ff', borderRadius: '12px', padding: '0.4rem 0.2rem', textAlign: 'center', border: '1px solid rgba(37,99,235,0.06)' }}>
          <div style={{ fontSize: '1rem', fontWeight: 850, color: '#2563eb', lineHeight: 1 }}><AnimatedCounter value={pill2Val} /></div>
          <div style={{ fontSize: '0.65rem', fontWeight: 800, color: '#1d4ed8', textTransform: 'uppercase', marginTop: '0.1rem', whiteSpace: 'normal', lineHeight: 1.1 }} title={typeof pill2Label === 'string' ? pill2Label : undefined}>{pill2Label}</div>
        </div>
        {pill3Label && (
          <div style={{ background: '#f0fdf4', borderRadius: '12px', padding: '0.4rem 0.2rem', textAlign: 'center', border: '1px solid rgba(21,128,61,0.06)' }}>
            <div style={{ fontSize: '1rem', fontWeight: 850, color: 'var(--primary-color)', lineHeight: 1 }}><AnimatedCounter value={pill3Val ?? 0} /></div>
            <div style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--primary-color)', textTransform: 'uppercase', marginTop: '0.1rem', whiteSpace: 'normal', lineHeight: 1.1 }} title={typeof pill3Label === 'string' ? pill3Label : undefined}>{pill3Label}</div>
          </div>
        )}
      </div>

    </div>
  );
}

export default function App() {
  // Navigation & Simulated Login/Session States
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'projects' | 'triagem' | 'substitutions' | 'groups' | 'fruits' | 'certificates' | 'lots' | 'import' | 'frequencies' | 'editais' | 'avaliacao' | 'cursos' | 'mural' | 'reports'>('dashboard');
  const [currentRole, setCurrentRole] = useState<'STUDENT' | 'PROFESSOR' | 'COORDINATOR' | 'PPGI'>('PPGI');
  const [selectedCampus, setSelectedCampus] = useState<string>('CMC');
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [showPublicMenuDropdown, setShowPublicMenuDropdown] = useState<boolean>(false);
  
  // Simulated Logged In Emails
  const [simulatedEmail, setSimulatedEmail] = useState<string>('ppgi.reitoria@ifam.edu.br');

  // App Data States
  const [projects, setProjects] = useState<Project[]>([]);
  const [frequencies, setFrequencies] = useState<Frequency[]>([]);
  const [researchGroups, setResearchGroups] = useState<ResearchGroup[]>([]);
  const [fruits, setFruits] = useState<Fruit[]>([]);
  const [substitutions, setSubstitutions] = useState<Substitution[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [editais, setEditais] = useState<any[]>([]);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  const [dashboardCampusFilter, setDashboardCampusFilter] = useState<string>('ALL');
  const [dashboardYearFilter, setDashboardYearFilter] = useState<string>('ALL');
  const [groupSearchName, setGroupSearchName] = useState<string>('');
  const [groupSearchLeader, setGroupSearchLeader] = useState<string>('');
  const [groupSearchCampus, setGroupSearchCampus] = useState<string>('ALL');
  const [publicTab, setPublicTab] = useState<'analytical' | 'projects' | 'groups' | 'portfolio'>('analytical');
  const [lastUpdate, setLastUpdate] = useState<string>('');

  const [productSearchQuery, setProductSearchQuery] = useState<string>('');
  const [productTypeFilter, setProductTypeFilter] = useState<string>('ALL');
  const [productCampusFilter, setProductCampusFilter] = useState<string>('ALL');

  const getProjectYear = (p: Project) => {
    const match = p.codigo.match(/-(\d{4})$/);
    return match ? match[1] : '2026';
  };

  const getProjectModality = (p: Project) => {
    const code = p.codigo.toUpperCase();
    if (code.startsWith('PVM')) return 'PIBIC';
    if (code.startsWith('PVC')) return 'PAIC';
    if (code.startsWith('PVZ')) return 'PIBIC-EM';
    return 'Fluxo Contínuo';
  };

  const getProjectType = (p: Project) => {
    const code = p.codigo.toUpperCase();
    if (code.startsWith('PVM')) return 'Pesquisa';
    if (code.startsWith('PVC')) return 'Aplicada';
    if (code.startsWith('PVZ')) return 'Inovação';
    if (p.fomento === 'VOLUNTÁRIO') return 'Cooperação';
    return 'Pesquisa';
  };


  
  // Student Input States (Frequency Submission)
  const [targetStudentProject, setTargetStudentProject] = useState<Project | null>(null);


  // Student Bank States
  const [studentBank, setStudentBank] = useState<string>('Bradesco');
  const [studentAgencia, setStudentAgencia] = useState<string>('');
  const [studentConta, setStudentConta] = useState<string>('');
  const [bankError, setBankError] = useState<string | null>(null);



  // Editing Discente (Indicação) State
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [editingStudentName, setEditingStudentName] = useState<string>('');


  // Substitutions Form State


  // Fruit Registration State

  // Certificate Issuance & Validation State
  
  const [searchCertHash, setSearchCertHash] = useState<string>('');
  const [validatedCert, setValidatedCert] = useState<Certificate | null>(null);
  const [certValError, setCertValError] = useState<string>('');
  const [showCertModal, setShowCertModal] = useState<boolean>(false);

  // Enforce role-based access to tabs
  useEffect(() => {
    const studentTabs = ['dashboard', 'projects', 'triagem', 'frequencies', 'certificates', 'mural', 'reports'];
    const professorTabs = ['dashboard', 'projects', 'frequencies', 'substitutions', 'groups', 'fruits', 'certificates', 'avaliacao', 'mural', 'reports'];
    const coordinatorTabs = ['dashboard', 'projects', 'frequencies', 'substitutions', 'groups', 'fruits', 'certificates', 'lots', 'import', 'editais', 'avaliacao', 'cursos', 'mural', 'reports'];
    const ppgiTabs = ['dashboard', 'projects', 'frequencies', 'substitutions', 'groups', 'fruits', 'certificates', 'lots', 'import', 'editais', 'avaliacao', 'cursos', 'mural', 'reports'];
    
    let allowed = true;
    if (currentRole === 'STUDENT' && !studentTabs.includes(activeTab)) allowed = false;
    if (currentRole === 'PROFESSOR' && !professorTabs.includes(activeTab)) allowed = false;
    
    if (!allowed) {
      setActiveTab('dashboard');
    }
  }, [currentRole, activeTab]);

  // Load Data from Backend SQLite
  const loadData = async () => {
    setIsLoading(true);
    try {
      const projRes = await fetch('/api/projects');
      const projData = await projRes.json();
      setProjects(projData);

      const freqRes = await fetch('/api/frequencies');
      const freqData = await freqRes.json();
      setFrequencies(freqData);

      const groupRes = await fetch('/api/research-groups');
      const groupData = await groupRes.json();
      setResearchGroups(groupData);

      const fruitRes = await fetch('/api/fruits');
      const fruitData = await fruitRes.json();
      setFruits(fruitData);

      const subRes = await fetch('/api/substitutions');
      const subData = await subRes.json();
      setSubstitutions(subData);

      const certRes = await fetch('/api/certificates');
      const certData = await certRes.json();
      setCertificates(certData);

      const editalRes = await fetch('/api/editais');
      const editalData = await editalRes.json();
      setEditais(editalData);

      const updateRes = await fetch('/api/last-update');
      const updateData = await updateRes.json();
      if (updateData && updateData.updatedAt) {
        setLastUpdate(new Date(updateData.updatedAt).toLocaleString('pt-BR'));
      }
    } catch (err) {
      console.error('Error fetching database logs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Sync simulated email when role or campus changes
  useEffect(() => {
    if (currentRole === 'PPGI') {
      setSimulatedEmail('ppgi.reitoria@ifam.edu.br');
    } else if (currentRole === 'COORDINATOR') {
      setSimulatedEmail(`coordenador.${selectedCampus.toLowerCase()}@ifam.edu.br`);
    } else if (currentRole === 'PROFESSOR') {
      setSimulatedEmail('orientador.pesquisa@ifam.edu.br');
    } else {
      setSimulatedEmail('bolsista.estudante@aluno.ifam.edu.br');
    }
  }, [currentRole, selectedCampus]);

  // Find simulated project matching student persona
  useEffect(() => {
    if (currentRole === 'STUDENT' && projects.length > 0) {
      const p = projects.find(proj => proj.discente && proj.campus === selectedCampus) || 
                projects.find(proj => proj.discente) || null;
      setTargetStudentProject(p);
      
      if (p) {
        const studentFreq = frequencies.find(f => f.projectId === p.id);
        if (studentFreq) {
          setStudentBank(studentFreq.banco || 'Bradesco');
          setStudentAgencia(studentFreq.agencia || '');
          setStudentConta(studentFreq.conta || '');
        }
      }
    }
  }, [currentRole, selectedCampus, projects, frequencies]);



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



  // Assign Student to project
  const handleAssignStudent = async (id: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/projects/${id}/assign-student`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentName: editingStudentName })
      });
      if (res.ok) {
        alert('Discente indicado com sucesso!');
        setEditingProjectId(null);
        setEditingStudentName('');
        loadData();
      } else {
        alert('Erro ao indicar discente.');
      }
    } catch (err) {
      console.error(err);
      alert('Erro de rede.');
    } finally {
      setIsLoading(false);
    }
  };





  // Validate digital certificate via Hash code
  const handleValidateCertificate = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidatedCert(null);
    setCertValError('');
    if (!searchCertHash) return;
    setIsLoading(true);
    try {
      const res = await fetch(`/api/certificates/validate/${searchCertHash}`);
      if (res.ok) {
        const data = await res.json();
        setValidatedCert(data);
      } else {
        const err = await res.json();
        setCertValError(err.error || 'Código inválido.');
      }
    } catch (err) {
      setCertValError('Erro ao comunicar com o servidor.');
    } finally {
      setIsLoading(false);
    }
  };

  // Upload Spreadsheet directly to SQLite Backend
  const handleSpreadsheetUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setIsLoading(true);
    try {
      const res = await fetch('/api/import', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (res.ok) {
        alert(data.message);
        loadData();
      } else {
        alert(`Erro de importação: ${data.error}`);
      }
    } catch (err) {
      console.error(err);
      alert('Erro de conexão ao servidor de banco de dados.');
    } finally {
      setIsLoading(false);
    }
  };

  // Upload Research Group Spreadsheet to SQLite Backend
  const handleGroupSpreadsheetUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setIsLoading(true);
    try {
      const res = await fetch('/api/import/groups', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (res.ok) {
        alert(data.message);
        loadData();
      } else {
        alert(`Erro de importação de grupos: ${data.error}`);
      }
    } catch (err) {
      console.error(err);
      alert('Erro de conexão ao servidor.');
    } finally {
      setIsLoading(false);
    }
  };

  // Restore Default Projects Database Seed
  const resetProjectsToDefault = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/import/reset', { method: 'POST' });
      const data = await res.json();
      alert(data.message);
      loadData();
    } catch (err) {
      console.error(err);
      alert('Erro ao conectar com o banco de dados.');
    } finally {
      setIsLoading(false);
    }
  };



  // Export Payment Lot CSV
  const handleExportPaymentLot = (campus: string) => {
    const campusFrequencies = frequencies.filter(f => {
      const proj = projects.find(p => p.id === f.projectId);
      return proj?.campus === campus && f.status === 'APROVADO';
    });

    if (campusFrequencies.length === 0) {
      alert(`Nenhuma frequência APROVADA encontrada para o campus ${campus} neste mês.`);
      return;
    }

    // Generate CSV Content
    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += 'Nome Bolsista,Código Projeto,Fomento,Banco,Agência,Conta Corrente,Valor Bolsa (R$)\n';

    campusFrequencies.forEach(f => {
      const proj = projects.find(p => p.id === f.projectId);
      const valor = proj?.fomento === 'FAPEAM' ? '600.00' : proj?.fomento === 'CNPQ' ? '700.00' : '400.00';
      const banco = f.banco || 'N/A';
      const agencia = f.agencia || 'N/A';
      const conta = f.conta || 'N/A';
      csvContent += `"${f.studentName}","${proj?.codigo}","${proj?.fomento}","${banco}","${agencia}","${conta}",${valor}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `lote_pagamento_${campus}_Agosto_2026.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Stats Calculations for Dashboard
  const activeProjects = projects.filter(p => p.discente);
  const totalBolsas = projects.filter(p => p.discente && p.fomento !== 'VOLUNTÁRIO').length;
  const submittedFrequencies = frequencies.filter(f => f.status === 'SUBMETIDO').length;
  const approvedFrequencies = frequencies.filter(f => f.status === 'APROVADO').length;

  // Extract Unique Specialists / Advisors for Public Showcase
  const uniqueAdvisors = Array.from(new Set(projects.map(p => p.orientador)))
    .map(name => {
      const proj = projects.find(p => p.orientador === name);
      return {
        name,
        campus: proj?.campus || 'CMC',
        email: `${name.toLowerCase().replace(/\s+/g, '.')}@ifam.edu.br`
      };
    })
    .slice(0, 15);

  // If Not logged in, render the Public Portal (Vitrine Pública)
  if (!isLoggedIn) {
    return (
      <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', flexDirection: 'column' }}>
        
        {/* Header da Vitrine */}
        <header style={{ background: '#ffffff', borderBottom: '1px solid rgba(0,0,0,0.06)', padding: '0.75rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <button 
              onClick={() => setShowPublicMenuDropdown(!showPublicMenuDropdown)} 
              className="tab-btn"
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.4rem', 
                padding: '0.5rem 0.85rem', 
                borderRadius: '8px', 
                border: '1px solid rgba(0,0,0,0.08)',
                background: '#ffffff',
                cursor: 'pointer',
                fontWeight: 700,
                fontSize: '0.85rem',
                color: 'var(--text-primary)',
                minWidth: 'auto'
              }}
            >
              <Menu size={16} /> Menu
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ background: 'var(--primary-color)', width: '38px', height: '38px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 'bold', flexShrink: 0 }}>
                IF
              </div>
              <div>
                <h1 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>Painel de Pesquisa IFAM</h1>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Vitrine de Inovação & Acesso Aberto</span>
              </div>
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <button onClick={() => setShowLoginModal(true)} className="btn-primary" style={{ padding: '0.5rem 1.25rem', fontSize: '0.85rem' }}>
              <Lock size={15} /> Entrar (SSO)
            </button>
          </div>
        </header>

        {/* Dropdown Menu de Navegação */}
        {showPublicMenuDropdown && (
          <div 
            className="glass-panel animate-fade-in" 
            style={{ 
              position: 'absolute', 
              top: '58px', 
              left: '2rem', 
              zIndex: 100, 
              width: '260px', 
              background: '#ffffff', 
              boxShadow: '0 10px 25px rgba(0,0,0,0.1)', 
              borderRadius: '16px', 
              padding: '0.75rem', 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '0.25rem',
              border: '1px solid rgba(0,0,0,0.06)'
            }}
          >
            <div style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.4rem', paddingLeft: '0.5rem' }}>
              Menu de Navegação
            </div>
            {[
              { tab: 'analytical', label: 'Indicadores', icon: Layers },
              { tab: 'projects', label: 'Projetos de Pesquisa', icon: Search },
              { tab: 'groups', label: 'Grupos de Pesquisa', icon: Users },
              { tab: 'portfolio', label: 'Vitrine Tecnológica', icon: Award }
            ].map(item => {
              const Icon = item.icon;
              const isActive = publicTab === item.tab;
              return (
                <button 
                  key={item.tab}
                  onClick={() => {
                    setPublicTab(item.tab as any);
                    setShowPublicMenuDropdown(false);
                  }}
                  className={`tab-btn ${isActive ? 'active' : ''}`}
                  style={{ width: '100%', justifyContent: 'flex-start', padding: '0.6rem 0.75rem', fontSize: '0.85rem' }}
                >
                  <Icon size={16} /> {item.label}
                </button>
              );
            })}
          </div>
        )}

        {/* Corpo da Vitrine */}
        <div style={{ display: 'flex', flex: 1, minHeight: 'calc(100vh - 58px)', position: 'relative' }}>
          
          {/* Wrapper do Conteúdo e Rodapé */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
            {/* Corpo da Vitrine */}
            <main style={{ flex: 1, padding: '2rem', maxWidth: '100%', width: '100%', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

          {/* Painel Analítico de Produção Científica e Tecnológica */}
          {publicTab === 'analytical' && (() => {
            const filteredProjects = projects.filter(p => {
              const matchesCampus = dashboardCampusFilter === 'ALL' || p.campus === dashboardCampusFilter;
              const matchesYear = dashboardYearFilter === 'ALL' || getProjectYear(p) === dashboardYearFilter;
              return matchesCampus && matchesYear;
            });

            const filteredGroups = researchGroups.filter(g => {
              const matchesCampus = dashboardCampusFilter === 'ALL' || g.campus === dashboardCampusFilter;
              return matchesCampus;
            });
        const filteredFruits = fruits.filter(f => {
              const proj = f.project || projects.find(p => p.id === f.projectId);
              if (!proj) return false;
              const matchesCampus = dashboardCampusFilter === 'ALL' || proj.campus === dashboardCampusFilter;
              const matchesYear = dashboardYearFilter === 'ALL' || getProjectYear(proj) === dashboardYearFilter;
              return matchesCampus && matchesYear;
            });

            const artCount = filteredFruits.filter(f => f.tipo === 'PUBLICACAO').length;
            const artExt = filteredFruits.filter(f => f.tipo === 'PUBLICACAO' && f.classificacao === 'REVISTA_EXTERNA').length;
            const artIfam = filteredFruits.filter(f => f.tipo === 'PUBLICACAO' && f.classificacao === 'REVISTA_IFAM').length;
            const artNPub = filteredFruits.filter(f => f.tipo === 'PUBLICACAO' && f.classificacao === 'NAO_PUBLICADO').length;

            const softCount = filteredFruits.filter(f => f.tipo === 'SOFTWARE').length;
            const softNit = filteredFruits.filter(f => f.tipo === 'SOFTWARE' && f.classificacao === 'NIT_IFAM').length;
            const softDireto = filteredFruits.filter(f => f.tipo === 'SOFTWARE' && f.classificacao === 'SERVIDOR_DIRETO').length;
            const softNReg = filteredFruits.filter(f => f.tipo === 'SOFTWARE' && f.classificacao === 'NAO_REGISTRADO').length;

            const patCount = filteredFruits.filter(f => f.tipo === 'PATENTE').length;
            const patNit = filteredFruits.filter(f => f.tipo === 'PATENTE' && f.classificacao === 'NIT_IFAM').length;
            const patDireto = filteredFruits.filter(f => f.tipo === 'PATENTE' && f.classificacao === 'SERVIDOR_DIRETO').length;
            const patNReg = filteredFruits.filter(f => f.tipo === 'PATENTE' && f.classificacao === 'NAO_REGISTRADO').length;

            const eventCount = filteredFruits.filter(f => f.tipo === 'EVENTO').length;
            const eventGroup = filteredFruits.filter(f => f.tipo === 'EVENTO' && f.classificacao === 'ORGANIZACAO_GRUPO').length;
            const eventInst = filteredFruits.filter(f => f.tipo === 'EVENTO' && f.classificacao === 'ORGANIZACAO_INSTITUCIONAL').length;
            const eventExt = filteredFruits.filter(f => f.tipo === 'EVENTO' && f.classificacao === 'EVENTO_EXTERNO').length;

            const filteredEditais = editais.filter(e => {
              const matchesYear = dashboardYearFilter === 'ALL' || e.ano.includes(dashboardYearFilter);
              return matchesYear;
            });

            let totalInvestment = filteredEditais.reduce((sum: number, edital: any) => {
              const matchingQuotas = (edital.quotas || []).filter((q: any) => {
                return dashboardCampusFilter === 'ALL' || q.campus === dashboardCampusFilter;
              });
              const quotaSum = matchingQuotas.reduce((qSum: number, q: any) => qSum + (q.valorTotalCampus || 0), 0);
              return sum + quotaSum;
            }, 0);

            // Fallback to active projects if no editais/quotas are defined yet
            if (totalInvestment === 0) {
              totalInvestment = filteredProjects.reduce((acc, p) => {
                if (p.fomento === 'VOLUNTÁRIO') return acc;
                const val = p.fomento === 'FAPEAM' ? 600 : p.fomento === 'CNPQ' ? 700 : 400;
                return acc + (val * 12);
              }, 0);
            }

            return (
              <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>Indicadores de Produção Científica & Tecnológica</h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Mapeamento em tempo real dos resultados de pesquisa do IFAM</p>
                  </div>

                  {/* Filtros */}
                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      <label style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Campus</label>
                      <select 
                        value={dashboardCampusFilter}
                        onChange={(e) => setDashboardCampusFilter(e.target.value)}
                        style={{ padding: '0.5rem', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '8px', background: '#ffffff', fontSize: '0.8rem', minWidth: '130px' }}
                      >
                        <option value="ALL">Todos os Campi</option>
                        {CAMPUSES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      <label style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Ano de Execução</label>
                      <select 
                        value={dashboardYearFilter}
                        onChange={(e) => setDashboardYearFilter(e.target.value)}
                        style={{ padding: '0.5rem', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '8px', background: '#ffffff', fontSize: '0.8rem', minWidth: '100px' }}
                      >
                        <option value="ALL">Todos os Anos</option>
                        {Array.from(new Set(projects.map(getProjectYear))).sort().map(yr => (
                          <option key={yr} value={yr}>{yr}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Cards de Métricas Gerais */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.25rem' }}>
                  
                  {/* Card Projetos */}
                  <div className="glass-panel pulse-card-green" style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid rgba(0,0,0,0.06)', padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                    <div style={{ background: 'rgba(21, 128, 61, 0.08)', color: 'var(--primary-color)', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <FileText size={24} />
                    </div>
                    <div>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Projetos de Pesquisa</span>
                      <h4 style={{ fontSize: '1.75rem', fontWeight: 855, color: 'var(--text-primary)', margin: '0.2rem 0 0 0' }}>{filteredProjects.length}</h4>
                    </div>
                  </div>

                  {/* Card Grupos de Pesquisa */}
                  <div className="glass-panel pulse-card-blue" style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid rgba(0,0,0,0.06)', padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                    <div style={{ background: 'rgba(37, 99, 235, 0.08)', color: 'var(--secondary-color)', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Users size={24} />
                    </div>
                    <div>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Grupos de Pesquisa</span>
                      <h4 style={{ fontSize: '1.75rem', fontWeight: 855, color: 'var(--text-primary)', margin: '0.2rem 0 0 0' }}>{filteredGroups.length}</h4>
                    </div>
                  </div>

                  {/* Card Produtos Tecnológicos */}
                  <div className="glass-panel pulse-card-orange" style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid rgba(0,0,0,0.06)', padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                    <div style={{ background: 'rgba(235, 94, 37, 0.08)', color: 'var(--accent-color)', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Award size={24} />
                    </div>
                    <div>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Produtos Tecnológicos</span>
                      <h4 style={{ fontSize: '1.75rem', fontWeight: 855, color: 'var(--text-primary)', margin: '0.2rem 0 0 0' }}>{artCount + softCount + patCount + eventCount}</h4>
                    </div>
                  </div>

                  {/* Card Bolsistas Ativos */}
                  <div className="glass-panel pulse-card-purple" style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid rgba(0,0,0,0.06)', padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                    <div style={{ background: 'rgba(139, 92, 246, 0.08)', color: '#8b5cf6', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <UserCheck size={24} />
                    </div>
                    <div>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Bolsistas Ativos</span>
                      <h4 style={{ fontSize: '1.75rem', fontWeight: 855, color: 'var(--text-primary)', margin: '0.2rem 0 0 0' }}>{filteredProjects.filter(p => p.discente && p.fomento !== 'VOLUNTÁRIO').length}</h4>
                    </div>
                  </div>

                  {/* Card Investimento em Bolsas */}
                  <div className="glass-panel pulse-card-yellow" style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid rgba(0,0,0,0.06)', padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                    <div style={{ background: 'rgba(234, 179, 8, 0.08)', color: '#eab308', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <DollarSign size={24} />
                    </div>
                    <div>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Investimento Total</span>
                      <h4 style={{ fontSize: '1.5rem', fontWeight: 855, color: 'var(--text-primary)', margin: '0.2rem 0 0 0' }}>R$ {totalInvestment.toLocaleString('pt-BR')}</h4>
                      <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Projetos do Edital (Ciclo 12m)</span>
                    </div>
                  </div>

                </div>

                {/* Grid de Velocímetros (Speedometers) */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '0.75rem' }}>
                  <BISpeedometer 
                    value={artCount} 
                    max={30} 
                    title="Publicações Científicas" 
                    subtitle="Publicações homologadas" 
                    badgeText="Publicações"
                    icon={BookOpen}
                    pill1Val={artIfam}
                    pill1Label={<>Revista<br/>IFAM</>}
                    pill2Val={artExt}
                    pill2Label={<>Revista<br/>Externa</>}
                    pill3Val={artNPub}
                    pill3Label="Não Publicado"
                    color="var(--secondary-color)" 
                  />
                  <BISpeedometer 
                    value={softCount} 
                    max={20} 
                    title="Softwares Desenvolvidos" 
                    subtitle="Sistemas & Aplicativos" 
                    badgeText="Softwares"
                    icon={Layers}
                    pill1Val={softNit}
                    pill1Label={<>NIT<br/>IFAM</>}
                    pill2Val={softDireto}
                    pill2Label={<>Direto<br/>INPI</>}
                    pill3Val={softNReg}
                    pill3Label={<>Registro<br/>Campus</>}
                    color="var(--primary-color)" 
                  />
                  <BISpeedometer 
                    value={patCount} 
                    max={5} 
                    title="Patentes Registradas" 
                    subtitle="Depósitos de propriedade" 
                    badgeText="Patentes"
                    icon={Award}
                    pill1Val={patNit}
                    pill1Label={<>NIT<br/>IFAM</>}
                    pill2Val={patDireto}
                    pill2Label={<>Direto<br/>INPI</>}
                    pill3Val={patNReg}
                    pill3Label={<>Registro<br/>Campus</>}
                    color="var(--accent-color)" 
                  />
                  <BISpeedometer 
                    value={eventCount} 
                    max={15} 
                    title="Eventos Científicos" 
                    subtitle="Mostras, seminários e congressos" 
                    badgeText="Eventos"
                    icon={Calendar}
                    pill1Val={eventInst}
                    pill1Label={<>Campus<br/>IFAM</>}
                    pill2Val={eventExt}
                    pill2Label={<>Evento<br/>Externo</>}
                    pill3Val={eventGroup}
                    pill3Label="Grupo Pesquisa"
                    color="#8b5cf6" 
                  />
                  <BISpeedometer 
                    value={filteredProjects.length} 
                    max={30} 
                    title="Projetos de Pesquisa" 
                    subtitle="Projetos de pesquisa ativos" 
                    badgeText="Projetos"
                    icon={FileText}
                    pill1Val={filteredProjects.filter(p => !p.researchGroupId && p.fomento !== 'FAPEAM').length}
                    pill1Label={<>IFAM<br/>Campus</>}
                    pill2Val={filteredProjects.filter(p => !p.researchGroupId && p.fomento === 'FAPEAM').length}
                    pill2Label={<>IES<br/>Externa</>}
                    pill3Val={filteredProjects.filter(p => p.researchGroupId).length}
                    pill3Label={<>Grupo<br/>Pesquisa</>}
                    color="#06b6d4" 
                  />
                  <BISpeedometer 
                    value={filteredFruits.filter(f => f.tipo === 'SOFTWARE' || f.tipo === 'PATENTE').length} 
                    max={15} 
                    title="Transferência Tecnológica" 
                    subtitle="Acordos de transferência" 
                    badgeText="Contratos"
                    icon={Shuffle}
                    pill1Val={filteredFruits.filter(f => (f.tipo === 'SOFTWARE' || f.tipo === 'PATENTE') && f.classificacao === 'NIT_IFAM').length}
                    pill1Label="Recebidas"
                    pill2Val={filteredFruits.filter(f => (f.tipo === 'SOFTWARE' || f.tipo === 'PATENTE') && f.classificacao === 'SERVIDOR_DIRETO').length}
                    pill2Label="Fornecidas"
                    color="#f59e0b" 
                  />
                </div>

                {/* Tabela de Quotas e Investimentos por Campus (Pública) */}
                <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginTop: '1.5rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 850, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Building2 size={20} style={{ color: 'var(--primary-color)' }} /> Distribuição de Bolsas e Investimentos por Campus
                    </h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Valores acumulados a partir dos editais cadastrados e cotas de fomento vigentes.</p>
                  </div>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left' }}>
                      <thead>
                        <tr style={{ borderBottom: '2px solid rgba(0,0,0,0.06)', color: 'var(--text-secondary)', background: '#f8fafc' }}>
                          <th style={{ padding: '0.75rem 1rem' }}>Campus</th>
                          <th style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>Projetos Ativos</th>
                          <th style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>Total de Bolsas</th>
                          <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Valor Total Investido</th>
                        </tr>
                      </thead>
                      <tbody>
                        {CAMPUSES.map(camp => {
                          const campProjects = filteredProjects.filter(p => p.campus === camp);
                          const activeCampProjects = campProjects.filter(p => p.discente).length;

                          const campQuotas = filteredEditais.reduce((acc, edital) => {
                            const q = (edital.quotas || []).find((quota: any) => quota.campus === camp);
                            return acc + (q ? q.quantidade : 0);
                          }, 0);

                          const campInvestment = filteredEditais.reduce((acc, edital) => {
                            const q = (edital.quotas || []).find((quota: any) => quota.campus === camp);
                            return acc + (q ? (q.valorTotalCampus || 0) : 0);
                          }, 0);

                          const displayQuotas = campQuotas > 0 ? campQuotas : activeCampProjects;
                          const displayInvestment = campInvestment > 0 ? campInvestment : campProjects.reduce((acc, p) => {
                            if (p.fomento === 'VOLUNTÁRIO') return acc;
                            const val = p.fomento === 'FAPEAM' ? 600 : p.fomento === 'CNPQ' ? 700 : 400;
                            return acc + (val * 12);
                          }, 0);

                          return (
                            <tr key={camp} style={{ borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
                              <td style={{ padding: '0.75rem 1rem', fontWeight: 700, color: 'var(--text-primary)' }}>{camp}</td>
                              <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>{activeCampProjects}</td>
                              <td style={{ padding: '0.75rem 1rem', textAlign: 'center', fontWeight: 600 }}>{displayQuotas}</td>
                              <td style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: 700, color: 'var(--primary-color)' }}>
                                R$ {displayInvestment.toLocaleString('pt-BR')}
                              </td>
                            </tr>
                          );
                        })}
                        <tr style={{ background: '#f8fafc', fontWeight: 800, borderTop: '2px solid rgba(0,0,0,0.06)' }}>
                          <td style={{ padding: '0.75rem 1rem' }}>Total Geral</td>
                          <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                            {filteredProjects.filter(p => p.discente).length}
                          </td>
                          <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                            {(() => {
                              const totalQuotas = filteredEditais.reduce((acc, edital) => {
                                return acc + (edital.quotas || []).reduce((qAcc: number, q: any) => qAcc + q.quantidade, 0);
                              }, 0);
                              return totalQuotas > 0 ? totalQuotas : filteredProjects.filter(p => p.discente).length;
                            })()}
                          </td>
                          <td style={{ padding: '0.75rem 1rem', textAlign: 'right', color: 'var(--primary-color)' }}>
                            R$ {totalInvestment.toLocaleString('pt-BR')}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            );
          })()}

          {/* Buscador Público */}
          {publicTab === 'projects' && (
            <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)' }}>Projetos de Pesquisa</h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Acesso rápido à lista oficial de fomento ativo no IFAM</p>
                </div>
                
                <div style={{ display: 'flex', gap: '0.75rem', width: '100%', maxWidth: '600px' }}>
                  <div style={{ flex: 1, position: 'relative' }}>
                    <Search size={18} style={{ position: 'absolute', left: '12px', top: '11px', color: 'var(--text-muted)' }} />
                    <input 
                      type="text" 
                      placeholder="Palavra-chave, título, orientador ou código..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      style={{ width: '100%', padding: '0.6rem 1rem 0.6rem 2.5rem', background: '#ffffff', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '10px', color: 'var(--text-primary)', fontSize: '0.85rem' }}
                    />
                  </div>
                  
                  <select 
                    value={selectedCampus}
                    onChange={(e) => setSelectedCampus(e.target.value)}
                    style={{ padding: '0.6rem', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '10px', background: '#ffffff', fontSize: '0.85rem' }}
                  >
                    <option value="ALL">Todos os Campi</option>
                    {CAMPUSES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              {/* Projetos Publicados */}
              <div style={{ overflow: 'auto', maxHeight: '500px', border: '1px solid rgba(0,0,0,0.05)', borderRadius: '12px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', background: '#ffffff' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', borderBottom: '1px solid rgba(0,0,0,0.06)', color: 'var(--text-secondary)', textAlign: 'left' }}>
                      <th style={{ padding: '0.75rem 1rem' }}>Código</th>
                      <th style={{ padding: '0.75rem 1rem' }}>Campus</th>
                      <th style={{ padding: '0.75rem 1rem' }}>Título do Trabalho</th>
                      <th style={{ padding: '0.75rem 1rem' }}>Orientador</th>
                      <th style={{ padding: '0.75rem 1rem' }}>Modalidade</th>
                      <th style={{ padding: '0.75rem 1rem' }}>Fomento</th>
                      <th style={{ padding: '0.75rem 1rem' }}>Investimento Total</th>
                      <th style={{ padding: '0.75rem 1rem' }}>Situação</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(() => {
                      const filteredList = projects.filter(p => {
                        const matchesSearch = p.titulo.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                              p.orientador.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                              p.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                              (p.discente && p.discente.toLowerCase().includes(searchTerm.toLowerCase()));
                        const matchesCampus = selectedCampus === 'ALL' || p.campus === selectedCampus;
                        return matchesSearch && matchesCampus;
                      });

                      const totalValue = filteredList.reduce((acc, p) => {
                        if (p.fomento === 'VOLUNTÁRIO') return acc;
                        const val = p.fomento === 'FAPEAM' ? 600 : p.fomento === 'CNPQ' ? 700 : 400;
                        return acc + (val * 12);
                      }, 0);

                      return (
                        <>
                          {filteredList.map((p, idx) => {
                            const valorProjeto = p.fomento === 'VOLUNTÁRIO' ? 0 : (p.fomento === 'FAPEAM' ? 600 * 12 : p.fomento === 'CNPQ' ? 700 * 12 : 400 * 12);
                            return (
                              <tr key={idx} style={{ borderBottom: '1px solid rgba(0,0,0,0.03)' }}>
                                <td style={{ padding: '0.75rem 1rem', fontWeight: 600, color: 'var(--primary-color)' }}>{p.codigo}</td>
                                <td style={{ padding: '0.75rem 1rem' }}>{p.campus}</td>
                                <td style={{ padding: '0.75rem 1rem', fontWeight: 500 }} title={p.titulo}>{p.titulo}</td>
                                <td style={{ padding: '0.75rem 1rem' }}>{p.orientador}</td>
                                <td style={{ padding: '0.75rem 1rem' }}>
                                  <span style={{ color: 'var(--text-secondary)' }}>{getProjectModality(p)}</span>
                                </td>
                                <td style={{ padding: '0.75rem 1rem' }}>
                                  <span className={`badge badge-${p.fomento.toLowerCase()}`}>{p.fomento}</span>
                                </td>
                                <td style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>
                                  {valorProjeto > 0 ? `R$ ${valorProjeto.toLocaleString('pt-BR')},00` : 'R$ 0,00'}
                                </td>
                                <td style={{ padding: '0.75rem 1rem' }}>
                                  <span style={{ color: p.discente ? '#16a34a' : '#d97706', fontWeight: 600 }}>
                                    {p.discente ? 'Bolsista Alocado' : 'Aguardando Indicação'}
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                          <tr style={{ background: '#f8fafc', fontWeight: 'bold', borderTop: '2px solid rgba(0,0,0,0.06)' }}>
                            <td colSpan={6} style={{ padding: '1rem', textAlign: 'right' }}>Total Disponibilizado nos Editais (Filtrados):</td>
                            <td colSpan={2} style={{ padding: '1rem', color: 'var(--primary-color)', fontSize: '0.95rem' }}>R$ {totalValue.toLocaleString('pt-BR')},00</td>
                          </tr>
                        </>
                      );
                    })()}
                  </tbody>
                </table>
              </div>
            </div>
          )}


          {/* Grupos de Pesquisa */}
          {publicTab === 'groups' && (
            <div className="glass-panel animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', background: '#ffffff', borderRadius: '24px', padding: '2rem', border: '1px solid rgba(0,0,0,0.06)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 850, color: 'var(--text-primary)' }}>Produtividade de Grupos de Pesquisa</h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Produtividade, liderança e indicadores dos grupos de pesquisa cadastrados no IFAM</p>
                </div>
                {lastUpdate && (
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', background: 'var(--primary-glow)', padding: '0.4rem 0.8rem', borderRadius: '8px', border: '1px solid rgba(21,128,61,0.15)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <span>📅 Última Atualização:</span> <strong>{lastUpdate}</strong>
                  </div>
                )}
              </div>

              {/* Ranking de Produtividade dos Grupos de Pesquisa */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
                  <h4 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)' }}>Ranking de Produtividade dos Grupos</h4>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', width: '100%', maxWidth: '600px' }}>
                     <div style={{ flex: 2, minWidth: '240px' }}>
                        <input 
                          type="text"
                          placeholder="🔍 Nome do Grupo ou Pesquisador..."
                          value={groupSearchName}
                          onChange={(e) => setGroupSearchName(e.target.value)}
                          style={{ 
                            padding: '0.55rem 1rem', 
                            border: '1px solid rgba(0,0,0,0.1)', 
                            borderRadius: '12px', 
                            fontSize: '0.8rem', 
                            width: '100%', 
                            outline: 'none',
                            background: '#ffffff',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.01)',
                            transition: 'all 0.2s'
                          }}
                        />
                     </div>
                     <div style={{ width: '160px' }}>
                        <select
                          value={groupSearchCampus}
                          onChange={(e) => setGroupSearchCampus(e.target.value)}
                          style={{ 
                            padding: '0.55rem 2rem 0.55rem 1rem', 
                            border: '1px solid rgba(0,0,0,0.1)', 
                            borderRadius: '12px', 
                            fontSize: '0.8rem', 
                            width: '100%', 
                            outline: 'none', 
                            background: '#ffffff',
                            cursor: 'pointer',
                            appearance: 'none',
                            backgroundImage: `url("data:image/svg+xml;utf8,<svg fill='%23000000' height='24' viewBox='0 0 24 24' width='24' xmlns='http://www.w3.org/2000/svg'><path d='M7 10l5 5 5-5z'/></svg>")`,
                            backgroundRepeat: 'no-repeat',
                            backgroundPosition: 'right 10px center',
                            backgroundSize: '20px',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.01)',
                            transition: 'all 0.2s'
                          }}
                        >
                          <option value="ALL">Todos os Campi</option>
                          {CAMPUSES.map(campus => (
                            <option key={campus} value={campus}>{campus}</option>
                          ))}
                        </select>
                     </div>
                  </div>
                </div>
                
                <div style={{ maxHeight: '600px', overflowY: 'auto', paddingRight: '0.5rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {(() => {
                      const searchedGroups = researchGroups.filter(g => {
                        const query = groupSearchName.toLowerCase().trim();
                        const matchesMulti = !query || g.nome.toLowerCase().includes(query) || g.lideres.toLowerCase().includes(query);
                        const matchesCampus = groupSearchCampus === 'ALL' || g.campus === groupSearchCampus;
                        return matchesMulti && matchesCampus;
                      });

                      const groupItems = searchedGroups.map(g => {
                        const groupFruits = fruits.filter(f => {
                          const proj = f.project || projects.find(p => p.id === f.projectId);
                          return proj && proj.researchGroupId === g.id;
                        });
                        const artCountVal = groupFruits.filter(f => f.tipo === 'PUBLICACAO').length;
                        const softCountVal = groupFruits.filter(f => f.tipo === 'SOFTWARE').length;
                        const patCountVal = groupFruits.filter(f => f.tipo === 'PATENTE').length;
                        const eventCountVal = groupFruits.filter(f => f.tipo === 'EVENTO').length;
                        const totalProd = artCountVal + softCountVal + patCountVal + eventCountVal;

                        return {
                          isIndependent: false,
                          id: g.id,
                          nome: g.nome,
                          lideres: g.lideres,
                          campus: g.campus,
                          artCountVal,
                          softCountVal,
                          patCountVal,
                          eventCountVal,
                          totalProd
                        };
                      });

                      const independentFruits = fruits.filter(f => {
                        const proj = f.project || projects.find(p => p.id === f.projectId);
                        if (!proj) return false;
                        const matchesCampus = groupSearchCampus === 'ALL' || proj.campus === groupSearchCampus;
                        return matchesCampus && !proj.researchGroupId;
                      });

                      const indArt = independentFruits.filter(f => f.tipo === 'PUBLICACAO').length;
                      const indSoft = independentFruits.filter(f => f.tipo === 'SOFTWARE').length;
                      const indPat = independentFruits.filter(f => f.tipo === 'PATENTE').length;
                      const indEvent = independentFruits.filter(f => f.tipo === 'EVENTO').length;
                      const indTotal = indArt + indSoft + indPat + indEvent;

                      const independentRow = {
                        isIndependent: true,
                        id: 'independent',
                        nome: 'Pesquisa Independente - Docentes Sem Grupo',
                        lideres: 'Pesquisadores não vinculados',
                        campus: groupSearchCampus === 'ALL' ? 'Múltiplos' : groupSearchCampus,
                        artCountVal: indArt,
                        softCountVal: indSoft,
                        patCountVal: indPat,
                        eventCountVal: indEvent,
                        totalProd: indTotal
                      };

                      const allRankingRows = [...groupItems];
                      if (indTotal > 0) {
                        const query = groupSearchName.toLowerCase().trim();
                        const matchesQuery = !query || independentRow.nome.toLowerCase().includes(query);
                        if (matchesQuery) {
                          allRankingRows.push(independentRow);
                        }
                      }

                      const sortedRows = allRankingRows.sort((a, b) => b.totalProd - a.totalProd);

                      return (
                        <>
                          {sortedRows.map((row, idx) => (
                            <div key={row.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.25rem', background: '#ffffff', borderRadius: '14px', border: '1px solid rgba(0,0,0,0.05)', borderLeft: row.isIndependent ? '4px solid var(--accent-color)' : '4px solid var(--primary-color)', gap: '1rem' }}>
                              <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                                  <span style={{ fontSize: '0.75rem', fontWeight: 800, background: row.isIndependent ? 'rgba(235, 94, 37, 0.08)' : 'rgba(21, 128, 61, 0.08)', color: row.isIndependent ? 'var(--accent-color)' : 'var(--primary-color)', width: '22px', height: '22px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px' }}>
                                    {idx + 1}
                                  </span>
                                  <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)', whiteSpace: 'normal', lineHeight: 1.35, wordBreak: 'break-word' }}>
                                    {row.nome}
                                  </strong>
                                </div>
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginLeft: '1.75rem', marginTop: '0.3rem' }}>
                                  {row.isIndependent ? '💡 Pesquisas sem grupo de pesquisa local certificado' : `👤 Líder(es): ${row.lideres}`} | 📍 Campus: <strong>{row.campus}</strong>
                                </span>
                              </div>
                              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.35rem', flexShrink: 0 }}>
                                <span style={{ fontSize: '0.8rem', fontWeight: 800, color: row.isIndependent ? 'var(--accent-color)' : 'var(--primary-color)' }}>{row.totalProd} Pontos</span>
                                <div style={{ display: 'flex', gap: '0.3rem' }}>
                                  <span style={{ fontSize: '0.65rem', color: '#1e40af', background: '#eff6ff', padding: '0.15rem 0.35rem', borderRadius: '4px', fontWeight: 700 }} title="Publicações">{row.artCountVal} Pubs</span>
                                  <span style={{ fontSize: '0.65rem', color: '#166534', background: '#f0fdf4', padding: '0.15rem 0.35rem', borderRadius: '4px', fontWeight: 700 }} title="Softwares">{row.softCountVal} Softs</span>
                                  <span style={{ fontSize: '0.65rem', color: '#9f1239', background: '#fff1f2', padding: '0.15rem 0.35rem', borderRadius: '4px', fontWeight: 700 }} title="Patentes">{row.patCountVal} Pats</span>
                                  <span style={{ fontSize: '0.65rem', color: '#92400e', background: '#fef3c7', padding: '0.15rem 0.35rem', borderRadius: '4px', fontWeight: 700 }} title="Eventos">{row.eventCountVal} Eventos</span>
                                </div>
                              </div>
                            </div>
                          ))}
                          {sortedRows.length === 0 && (
                            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                              Nenhum grupo de pesquisa encontrado para os filtros selecionados.
                            </div>
                          )}
                        </>
                      );
                    })()}
                  </div>
                </div>
              </div>
            </div>
          )}


          {/* Vitrine Tecnológica */}
          {publicTab === 'portfolio' && (
            <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', background: '#ffffff', borderRadius: '24px', padding: '1.5rem', border: '1px solid rgba(0,0,0,0.06)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid rgba(0,0,0,0.06)', paddingBottom: '1.25rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 850, color: 'var(--text-primary)' }}>Vitrine Tecnológica</h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Explore todas as publicações, softwares, patentes e eventos gerados pelos pesquisadores do IFAM</p>
                </div>
              </div>
              
              {/* Filters & Search Row */}
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center', width: '100%', marginTop: '0.5rem' }}>
                {/* Text Search */}
                <div style={{ flex: 2, minWidth: '240px' }}>
                  <input 
                    type="text"
                    placeholder="🔍 Buscar por título ou orientador..."
                    value={productSearchQuery}
                    onChange={(e) => setProductSearchQuery(e.target.value)}
                    style={{ 
                      padding: '0.55rem 1rem', 
                      border: '1px solid rgba(0,0,0,0.1)', 
                      borderRadius: '12px', 
                      fontSize: '0.8rem', 
                      width: '100%', 
                      outline: 'none',
                      background: '#ffffff',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.01)',
                      transition: 'all 0.2s'
                    }}
                  />
                </div>
                
                {/* Type Filter */}
                <div style={{ flex: 1, minWidth: '160px' }}>
                  <select
                    value={productTypeFilter}
                    onChange={(e) => setProductTypeFilter(e.target.value)}
                    style={{ 
                      padding: '0.55rem 1rem', 
                      border: '1px solid rgba(0,0,0,0.1)', 
                      borderRadius: '12px', 
                      fontSize: '0.8rem', 
                      width: '100%', 
                      outline: 'none', 
                      background: '#ffffff',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="ALL">Todos os Tipos</option>
                    <option value="PUBLICACAO">Publicações</option>
                    <option value="SOFTWARE">Softwares</option>
                    <option value="PATENTE">Patentes</option>
                    <option value="EVENTO">Eventos</option>
                  </select>
                </div>

                {/* Campus Filter */}
                <div style={{ flex: 1, minWidth: '160px' }}>
                  <select
                    value={productCampusFilter}
                    onChange={(e) => setProductCampusFilter(e.target.value)}
                    style={{ 
                      padding: '0.55rem 1rem', 
                      border: '1px solid rgba(0,0,0,0.1)', 
                      borderRadius: '12px', 
                      fontSize: '0.8rem', 
                      width: '100%', 
                      outline: 'none', 
                      background: '#ffffff',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="ALL">Todos os Campi</option>
                    {CAMPUSES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* List/Grid of Products */}
              <div style={{ maxHeight: '450px', overflowY: 'auto', paddingRight: '0.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
                {(() => {
                  const filteredProducts = fruits.filter(fr => {
                    const proj = fr.project || projects.find(p => p.id === fr.projectId);
                    const advisor = proj ? proj.orientador : '';
                    const campus = proj ? proj.campus : '';

                    const query = productSearchQuery.toLowerCase().trim();
                    const matchesQuery = !query || fr.titulo.toLowerCase().includes(query) || advisor.toLowerCase().includes(query);
                    const matchesType = productTypeFilter === 'ALL' || fr.tipo === productTypeFilter;
                    const matchesCampus = productCampusFilter === 'ALL' || campus === productCampusFilter;

                    return matchesQuery && matchesType && matchesCampus;
                  });

                  return (
                    <>
                      {filteredProducts.map((fr, idx) => {
                        const proj = fr.project || projects.find(p => p.id === fr.projectId);
                        const advisor = proj ? proj.orientador : 'Orientador não cadastrado';
                        const campus = proj ? proj.campus : 'Campus Geral';
                        
                        let badgeBg = 'rgba(59, 130, 246, 0.08)';
                        let badgeColor = '#3b82f6';
                        if (fr.tipo === 'SOFTWARE') {
                          badgeBg = 'rgba(16, 185, 129, 0.08)';
                          badgeColor = '#10b981';
                        } else if (fr.tipo === 'PATENTE') {
                          badgeBg = 'rgba(239, 68, 68, 0.08)';
                          badgeColor = '#ef4444';
                        } else if (fr.tipo === 'EVENTO') {
                          badgeBg = 'rgba(139, 92, 246, 0.08)';
                          badgeColor = '#8b5cf6';
                        }

                        return (
                          <div key={idx} className="glass-panel" style={{ padding: '1rem', border: '1px solid rgba(0,0,0,0.05)', borderRadius: '16px', background: '#ffffff', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '0.75rem', transition: 'all 0.2s', boxShadow: '0 4px 20px rgba(0,0,0,0.01)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span className="badge" style={{ background: badgeBg, color: badgeColor, fontSize: '0.65rem', fontWeight: 800, padding: '0.2rem 0.5rem', borderRadius: '8px' }}>
                                {fr.tipo === 'EVENTO' ? 'EVENTO CIENTÍFICO' : fr.tipo === 'PUBLICACAO' ? 'PUBLICAÇÃO' : fr.tipo}
                              </span>
                              <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>
                                {new Date(fr.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            <div>
                              <strong style={{ fontSize: '0.85rem', display: 'block', color: 'var(--text-primary)', lineHeight: 1.3, marginBottom: '0.2rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={fr.titulo}>
                                {fr.titulo}
                              </strong>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                                <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                                  👤 Orientador: <strong style={{ color: 'var(--text-primary)' }}>{advisor}</strong>
                                </span>
                                <span style={{ color: 'rgba(0,0,0,0.15)', fontSize: '0.7rem' }}>•</span>
                                <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                                  📍 Campus: <strong style={{ color: 'var(--text-primary)' }}>{campus}</strong>
                                </span>
                              </div>
                            </div>
                            {fr.linkUrl && (
                              <a href={fr.linkUrl} target="_blank" rel="noreferrer" style={{ fontSize: '0.75rem', color: 'var(--primary-color)', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.25rem', textDecoration: 'none', border: '1px solid rgba(0, 114, 54, 0.2)', padding: '0.4rem 0.8rem', borderRadius: '8px', transition: 'all 0.2s', flexShrink: 0, background: '#ffffff' }}>
                                Visualizar <ExternalLink size={12} />
                              </a>
                            )}
                          </div>
                        );
                      })}
                      {filteredProducts.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                          Nenhum produto encontrado para os filtros de busca.
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>
            </div>
          )}

        </main>

        {/* Footer */}
        <footer style={{ background: '#ffffff', borderTop: '1px solid rgba(0,0,0,0.06)', padding: '1.5rem', textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
          © {new Date().getFullYear()} Instituto Federal de Educação, Ciência e Tecnologia do Amazonas (IFAM) | Pró-Reitoria de Pesquisa, Pós-Graduação e Inovação (PPGI)
        </footer>
        
          </div>
        </div>

        {/* Login Simulator Modal */}
        {showLoginModal && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
            <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '400px', display: 'flex', flexDirection: 'column', gap: '1.25rem', background: '#ffffff' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>Acesso Restrito SSO</h3>
                <button onClick={() => setShowLoginModal(false)} className="btn-secondary" style={{ padding: '0.25rem 0.5rem', borderRadius: '6px' }}>X</button>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Selecione o perfil desejado para simular o login integrado via SUAP/SSO:
              </p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {[
                  { role: 'PPGI', label: 'Alta Gestão PPGI (Reitoria)', email: 'ppgi.reitoria@ifam.edu.br' },
                  { role: 'COORDINATOR', label: `Coord. de Pesquisa (Campus ${selectedCampus})`, email: `coordenador.${selectedCampus.toLowerCase()}@ifam.edu.br` },
                  { role: 'PROFESSOR', label: 'Orientador (Professor)', email: 'orientador.pesquisa@ifam.edu.br' },
                  { role: 'STUDENT', label: 'Estudante (Bolsista/Voluntário)', email: 'bolsista.estudante@aluno.ifam.edu.br' }
                ].map(item => (
                  <button 
                    key={item.role}
                    onClick={() => {
                      setCurrentRole(item.role as any);
                      setSimulatedEmail(item.email);
                      setIsLoggedIn(true);
                      setShowLoginModal(false);
                    }}
                    className="btn-secondary"
                    style={{ justifyContent: 'space-between', padding: '0.75rem', fontSize: '0.8rem', width: '100%' }}
                  >
                    <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                      <strong>{item.label}</strong>
                      <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>{item.email}</span>
                    </span>
                    <ArrowRight size={14} style={{ color: 'var(--primary-color)' }} />
                  </button>
                ))}
              </div>

              {currentRole !== 'PPGI' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', borderTop: '1px solid rgba(0,0,0,0.06)', paddingTop: '0.75rem' }}>
                  <label style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Campus Simulado:</label>
                  <select 
                    value={selectedCampus} 
                    onChange={(e) => setSelectedCampus(e.target.value)}
                    style={{ width: '100%', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '8px', padding: '0.5rem', fontSize: '0.85rem' }}
                  >
                    {CAMPUSES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Certificate Validation Modal */}
        {showCertModal && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
            <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '500px', display: 'flex', flexDirection: 'column', gap: '1.25rem', background: '#ffffff' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <QrCode style={{ color: 'var(--primary-color)' }} /> Validar Assinatura Digital
                </h3>
                <button onClick={() => { setShowCertModal(false); setValidatedCert(null); setSearchCertHash(''); }} className="btn-secondary" style={{ padding: '0.25rem 0.5rem', borderRadius: '6px' }}>X</button>
              </div>

              <form onSubmit={handleValidateCertificate} style={{ display: 'flex', gap: '0.5rem' }}>
                <input 
                  type="text" 
                  placeholder="IFAM-XXXX-XXXX-XXXX" 
                  value={searchCertHash}
                  onChange={(e) => setSearchCertHash(e.target.value)}
                  style={{ flex: 1, padding: '0.5rem 1rem', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '8px', fontSize: '0.85rem' }}
                  required
                />
                <button type="submit" className="btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
                  Verificar
                </button>
              </form>

              {certValError && (
                <div style={{ padding: '0.75rem', background: 'rgba(220,38,38,0.06)', borderLeft: '4px solid var(--danger-color)', borderRadius: '6px', color: 'var(--danger-color)', fontSize: '0.8rem' }}>
                  {certValError}
                </div>
              )}

              {validatedCert && (
                <div style={{ padding: '1rem', border: '1px solid rgba(16,185,129,0.2)', background: 'rgba(16,185,129,0.03)', borderRadius: '10px', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: '#15803d', fontWeight: 700, fontSize: '0.8rem' }}>
                    <CheckCircle2 size={16} /> Certificado Autêntico & Homologado
                  </span>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                    <strong>Bolsista:</strong> {validatedCert.studentName} <br />
                    <strong>Função:</strong> {validatedCert.role} <br />
                    <strong>Carga Horária:</strong> {validatedCert.cargaHoraria} horas <br />
                    <strong>Chave de Segurança:</strong> {validatedCert.hash} <br />
                    <strong>Emissão:</strong> {new Date(validatedCert.emissao).toLocaleDateString()}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Admin / Restrict Area Render
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc' }}>
      
      {/* Sidebar Navigation */}
      <aside style={{ 
        width: sidebarCollapsed ? '88px' : '280px', 
        borderRight: '1px solid rgba(0,0,0,0.06)', 
        padding: sidebarCollapsed ? '1.5rem 0.5rem' : '1.5rem', 
        background: '#ffffff', 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '1.5rem',
        transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1), padding 0.3s ease',
        overflowX: 'hidden'
      }}>
        
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: sidebarCollapsed ? 'center' : 'space-between', paddingBottom: '1rem', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ background: 'var(--primary-color)', width: '36px', height: '36px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 'bold', flexShrink: 0 }}>
              IF
            </div>
            {!sidebarCollapsed && (
              <div>
                <h1 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)' }}>Painel de Pesquisa</h1>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Ambiente Administrativo</span>
              </div>
            )}
          </div>
          <button 
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)} 
            className="tab-btn" 
            style={{ 
              padding: '0.35rem', 
              minWidth: 'auto', 
              borderRadius: '8px', 
              border: 'none', 
              background: 'transparent',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title={sidebarCollapsed ? "Expandir menu" : "Recolher menu"}
          >
            {sidebarCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        {/* User Session Info */}
        {!sidebarCollapsed ? (
          <div className="glass-panel" style={{ padding: '0.75rem', borderRadius: '12px', background: 'rgba(0,0,0,0.01)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Lock size={14} style={{ color: 'var(--primary-color)' }} />
              <span style={{ fontSize: '0.7rem', fontWeight: 'bold', textTransform: 'uppercase', color: 'var(--accent-color)' }}>Sessão Integrada</span>
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: 600 }}>
              {simulatedEmail}
            </div>
            <button 
              onClick={() => setIsLoggedIn(false)} 
              className="btn-secondary" 
              style={{ width: '100%', padding: '0.4rem', fontSize: '0.75rem', justifyContent: 'center', gap: '0.25rem', marginTop: '0.25rem', borderColor: 'rgba(227,6,19,0.2)', color: 'var(--accent-color)' }}
            >
              <LogOut size={12} /> Sair da Área Restrita
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <button 
              onClick={() => setIsLoggedIn(false)} 
              style={{ border: 'none', background: 'transparent', color: 'var(--accent-color)', cursor: 'pointer', padding: '0.5rem' }}
              title="Sair da Área Restrita"
            >
              <LogOut size={18} />
            </button>
          </div>
        )}

        {/* Navigation Items */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', flex: 1, alignItems: sidebarCollapsed ? 'center' : 'stretch' }}>
          <button onClick={() => setActiveTab('dashboard')} className={`tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`} style={{ width: '100%', justifyContent: sidebarCollapsed ? 'center' : 'flex-start' }} title={sidebarCollapsed ? 'Dashboard Executivo' : undefined}>
            <Layers size={18} /> {!sidebarCollapsed && ' Dashboard Executivo'}
          </button>
          
          <button onClick={() => setActiveTab('projects')} className={`tab-btn ${activeTab === 'projects' ? 'active' : ''}`} style={{ width: '100%', justifyContent: sidebarCollapsed ? 'center' : 'flex-start' }} title={sidebarCollapsed ? 'Busca de Projetos' : undefined}>
            <Search size={18} /> {!sidebarCollapsed && ' Busca de Projetos'}
          </button>

          <button onClick={() => setActiveTab('mural')} className={`tab-btn ${activeTab === 'mural' ? 'active' : ''}`} style={{ width: '100%', justifyContent: sidebarCollapsed ? 'center' : 'flex-start' }} title={sidebarCollapsed ? 'Mural de Editais' : undefined}>
            <Award size={18} /> {!sidebarCollapsed && ' Mural de Editais'}
          </button>

          {(currentRole === 'STUDENT' || currentRole === 'PROFESSOR') && (
            <button onClick={() => setActiveTab('triagem')} className={`tab-btn ${activeTab === 'triagem' ? 'active' : ''}`} style={{ width: '100%', justifyContent: sidebarCollapsed ? 'center' : 'flex-start' }} title={sidebarCollapsed ? (currentRole === 'STUDENT' ? 'Triagem & Onboarding' : 'Perfil & Onboarding') : undefined}>
              <FileCheck size={18} /> {!sidebarCollapsed && (currentRole === 'STUDENT' ? ' Triagem & Onboarding' : ' Perfil & Onboarding')}
            </button>
          )}

          <button onClick={() => setActiveTab('frequencies')} className={`tab-btn ${activeTab === 'frequencies' ? 'active' : ''}`} style={{ width: '100%', justifyContent: sidebarCollapsed ? 'center' : 'flex-start' }} title={sidebarCollapsed ? 'Frequência Mensal' : undefined}>
            <Calendar size={18} /> {!sidebarCollapsed && ' Frequência Mensal'}
          </button>

          {currentRole !== 'STUDENT' && (
            <button onClick={() => setActiveTab('substitutions')} className={`tab-btn ${activeTab === 'substitutions' ? 'active' : ''}`} style={{ width: '100%', justifyContent: sidebarCollapsed ? 'center' : 'flex-start' }} title={sidebarCollapsed ? 'Desligamento & Substituição' : undefined}>
              <RefreshCw size={18} /> {!sidebarCollapsed && ' Desligamento & Subst.'}
            </button>
          )}

          {currentRole !== 'STUDENT' && (
            <button onClick={() => setActiveTab('groups')} className={`tab-btn ${activeTab === 'groups' ? 'active' : ''}`} style={{ width: '100%', justifyContent: sidebarCollapsed ? 'center' : 'flex-start' }} title={sidebarCollapsed ? 'Grupos de Pesquisa' : undefined}>
              <Users size={18} /> {!sidebarCollapsed && ' Grupos de Pesquisa'}
            </button>
          )}

          {currentRole !== 'STUDENT' && (
            <button onClick={() => setActiveTab('fruits')} className={`tab-btn ${activeTab === 'fruits' ? 'active' : ''}`} style={{ width: '100%', justifyContent: sidebarCollapsed ? 'center' : 'flex-start' }} title={sidebarCollapsed ? 'Produções Científicas' : undefined}>
              <BookOpen size={18} /> {!sidebarCollapsed && ' Produções Científicas'}
            </button>
          )}

          <button onClick={() => setActiveTab('certificates')} className={`tab-btn ${activeTab === 'certificates' ? 'active' : ''}`} style={{ width: '100%', justifyContent: sidebarCollapsed ? 'center' : 'flex-start' }} title={sidebarCollapsed ? 'Certificados Digitais' : undefined}>
            <Award size={18} /> {!sidebarCollapsed && ' Certificados Digitais'}
          </button>

          <button onClick={() => setActiveTab('reports')} className={`tab-btn ${activeTab === 'reports' ? 'active' : ''}`} style={{ width: '100%', justifyContent: sidebarCollapsed ? 'center' : 'flex-start' }} title={sidebarCollapsed ? 'Relatórios Técnicos' : undefined}>
            <FileText size={18} /> {!sidebarCollapsed && ' Relatórios Técnicos'}
          </button>

          {currentRole !== 'STUDENT' && (
            <button onClick={() => setActiveTab('avaliacao')} className={`tab-btn ${activeTab === 'avaliacao' ? 'active' : ''}`} style={{ width: '100%', justifyContent: sidebarCollapsed ? 'center' : 'flex-start' }} title={sidebarCollapsed ? 'Comitê de Avaliação' : undefined}>
              <Award size={18} /> {!sidebarCollapsed && ' Comitê de Avaliação'}
            </button>
          )}
          
          {(currentRole === 'COORDINATOR' || currentRole === 'PPGI') && (
            <>
              {!sidebarCollapsed ? (
                <div style={{ margin: '0.75rem 0 0.25rem 0.5rem', fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Gestão Geral</div>
              ) : (
                <div style={{ height: '1px', background: 'rgba(0,0,0,0.06)', width: '70%', margin: '0.75rem 0' }} />
              )}
              <button onClick={() => setActiveTab('editais')} className={`tab-btn ${activeTab === 'editais' ? 'active' : ''}`} style={{ width: '100%', justifyContent: sidebarCollapsed ? 'center' : 'flex-start' }} title={sidebarCollapsed ? 'Gestão de Editais' : undefined}>
                <FileText size={18} /> {!sidebarCollapsed && ' Gestão de Editais'}
              </button>
              <button onClick={() => setActiveTab('cursos')} className={`tab-btn ${activeTab === 'cursos' ? 'active' : ''}`} style={{ width: '100%', justifyContent: sidebarCollapsed ? 'center' : 'flex-start' }} title={sidebarCollapsed ? 'Gestão de Cursos' : undefined}>
                <BookOpen size={18} /> {!sidebarCollapsed && ' Gestão de Cursos'}
              </button>
              <button onClick={() => setActiveTab('lots')} className={`tab-btn ${activeTab === 'lots' ? 'active' : ''}`} style={{ width: '100%', justifyContent: sidebarCollapsed ? 'center' : 'flex-start' }} title={sidebarCollapsed ? 'Lotes de Pagamento' : undefined}>
                <DollarSign size={18} /> {!sidebarCollapsed && ' Lotes de Pagamento'}
              </button>
              <button onClick={() => setActiveTab('import')} className={`tab-btn ${activeTab === 'import' ? 'active' : ''}`} style={{ width: '100%', justifyContent: sidebarCollapsed ? 'center' : 'flex-start' }} title={sidebarCollapsed ? 'Módulo de Importação' : undefined}>
                <FileSpreadsheet size={18} /> {!sidebarCollapsed && ' Módulo Importação'}
              </button>
            </>
          )}
        </nav>

        {isLoading && !sidebarCollapsed && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--primary-color)', padding: '0.5rem', background: 'rgba(21,128,61,0.05)', borderRadius: '8px', border: '1px solid rgba(21,128,61,0.1)' }}>
            <RefreshCw size={14} className="animate-spin" /> Conectando ao SQLite...
          </div>
        )}

        {!sidebarCollapsed ? (
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textAlign: 'center', borderTop: '1px solid rgba(0,0,0,0.06)', paddingTop: '1rem' }}>
            Banco de Dados: SQLite (Prisma)<br/>Edição 2026/2027
          </div>
        ) : (
          <div style={{ display: 'flex', justifyContent: 'center', borderTop: '1px solid rgba(0,0,0,0.06)', paddingTop: '1rem', fontSize: '0.8rem', color: 'var(--text-muted)' }} title="SQLite Ativo">
            db
          </div>
        )}
      </aside>

      {/* Main Content Area */}
      <main style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>
        
        {/* Top bar */}
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              {activeTab === 'dashboard' && 'Dashboard Executivo da Pesquisa'} 
              {activeTab === 'editais' && 'Gestão de Editais (Reitoria)'}
              {activeTab === 'cursos' && 'Gestão de Cursos e Campi'}
              {activeTab === 'avaliacao' && 'Avaliação de Projetos (Comitê)'}
              {activeTab === 'projects' && 'Buscador de Projetos e Editais'}
              {activeTab === 'triagem' && (currentRole === 'STUDENT' ? 'Triagem & Onboarding do Discente' : 'Perfil & Onboarding do Pesquisador')}
              {activeTab === 'frequencies' && 'Módulo de Frequência Mensal'}
              {activeTab === 'substitutions' && 'Desligamentos e Substituições de Discentes'}
              {activeTab === 'groups' && 'Grupos de Pesquisa - Resolução nº 026/2014'}
              {activeTab === 'fruits' && 'Cadastro de Produções Científicas e Tecnológicas'}
              {activeTab === 'certificates' && 'Certificados Digitais com Validação'}
              {activeTab === 'lots' && 'Geração de Lotes de Pagamento'}
              {activeTab === 'import' && 'Módulo de Importação da Reitoria'}
              {activeTab === 'reports' && 'Relatórios Técnicos'}
              {activeTab === 'mural' && 'Mural de Editais Vigentes'}
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
              Plataforma Painel de Pesquisa IFAM
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {currentRole === 'PPGI' ? 'Pró-Reitor PPGI' : currentRole === 'COORDINATOR' ? `Coordenador ${selectedCampus}` : currentRole === 'PROFESSOR' ? 'Prof. Orientador' : 'Discente Bolsista'}
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--primary-color)', fontWeight: 600 }}>
                {simulatedEmail}
              </span>
            </div>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary-color), var(--accent-color))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 'bold' }}>
              {currentRole[0]}
            </div>
          </div>
        </header>

        {/* Tabs Content */}
        
        {/* DASHBOARD TAB */}
        {activeTab === 'dashboard' && (
          <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            
            {/* Filtros do Dashboard Interno */}
            <div className="glass-panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 850, color: 'var(--text-primary)' }}>Filtros Analíticos</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Filtre todas as métricas e rankings por campus e ano de fomento</p>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <label style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Campus</label>
                  <select 
                    value={dashboardCampusFilter}
                    onChange={(e) => setDashboardCampusFilter(e.target.value)}
                    style={{ padding: '0.5rem', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '8px', background: '#ffffff', fontSize: '0.8rem', minWidth: '140px' }}
                  >
                    <option value="ALL">Todos os Campi</option>
                    {CAMPUSES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <label style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Ano</label>
                  <select 
                    value={dashboardYearFilter}
                    onChange={(e) => setDashboardYearFilter(e.target.value)}
                    style={{ padding: '0.5rem', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '8px', background: '#ffffff', fontSize: '0.8rem', minWidth: '100px' }}
                  >
                    <option value="ALL">Todos os Anos</option>
                    {Array.from(new Set(projects.map(getProjectYear))).sort().map(yr => (
                      <option key={yr} value={yr}>{yr}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Stats Metrics Cards */}
            {(() => {
              const dProjects = projects.filter(p => {
                const matchesCampus = dashboardCampusFilter === 'ALL' || p.campus === dashboardCampusFilter;
                const matchesYear = dashboardYearFilter === 'ALL' || getProjectYear(p) === dashboardYearFilter;
                return matchesCampus && matchesYear;
              });

              const dActiveProjects = dProjects.filter(p => p.discente);
              const dPendingIndication = dProjects.filter(p => !p.discente);

              const indFapeam = dActiveProjects.filter(p => p.fomento === 'FAPEAM').length;
              const indCnpq = dActiveProjects.filter(p => p.fomento === 'CNPQ').length;
              const indOthers = dActiveProjects.filter(p => p.fomento !== 'FAPEAM' && p.fomento !== 'CNPQ').length;

              const dFrequencies = frequencies.filter(f => {
                const proj = projects.find(p => p.id === f.projectId);
                if (!proj) return false;
                const matchesCampus = dashboardCampusFilter === 'ALL' || proj.campus === dashboardCampusFilter;
                const matchesYear = dashboardYearFilter === 'ALL' || getProjectYear(proj) === dashboardYearFilter;
                return matchesCampus && matchesYear;
              });
              const dSubmittedFreq = dFrequencies.filter(f => f.status === 'SUBMETIDO').length;
              const dApprovedFreq = dFrequencies.filter(f => f.status === 'APROVADO').length;

              const dCertificates = certificates.filter(c => {
                const proj = projects.find(p => p.id === c.projectId);
                if (!proj) return false;
                const matchesCampus = dashboardCampusFilter === 'ALL' || proj.campus === dashboardCampusFilter;
                const matchesYear = dashboardYearFilter === 'ALL' || getProjectYear(proj) === dashboardYearFilter;
                return matchesCampus && matchesYear;
              });

              const dFruits = fruits.filter(f => {
                const proj = f.project || projects.find(p => p.id === f.projectId);
                if (!proj) return false;
                const matchesCampus = dashboardCampusFilter === 'ALL' || proj.campus === dashboardCampusFilter;
                const matchesYear = dashboardYearFilter === 'ALL' || getProjectYear(proj) === dashboardYearFilter;
                return matchesCampus && matchesYear;
              });

              const dArtCount = dFruits.filter(f => f.tipo === 'PUBLICACAO').length;
              const dSoftCount = dFruits.filter(f => f.tipo === 'SOFTWARE').length;
              const dPatCount = dFruits.filter(f => f.tipo === 'PATENTE').length;
              const dEventCount = dFruits.filter(f => f.tipo === 'EVENTO').length;

              const dFilteredEditais = editais.filter(e => {
                const matchesYear = dashboardYearFilter === 'ALL' || e.ano.includes(dashboardYearFilter);
                return matchesYear;
              });

              let dTotalInvestment = dFilteredEditais.reduce((sum: number, edital: any) => {
                const matchingQuotas = (edital.quotas || []).filter((q: any) => {
                  return dashboardCampusFilter === 'ALL' || q.campus === dashboardCampusFilter;
                });
                const quotaSum = matchingQuotas.reduce((qSum: number, q: any) => qSum + (q.valorTotalCampus || 0), 0);
                return sum + quotaSum;
              }, 0);

              // Fallback to active projects
              if (dTotalInvestment === 0) {
                dTotalInvestment = dProjects.reduce((acc, p) => {
                  if (p.fomento === 'VOLUNTÁRIO') return acc;
                  const val = p.fomento === 'FAPEAM' ? 600 : p.fomento === 'CNPQ' ? 700 : 400;
                  return acc + (val * 12);
                }, 0);
              }

              return (
                <>
                  {/* General KPIs Row */}
                  {/* General KPIs Row */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.25rem' }}>
                    <div className="glass-panel pulse-card-green" style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid rgba(0,0,0,0.06)', padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                      <div style={{ background: 'rgba(21, 128, 61, 0.08)', color: 'var(--primary-color)', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Layers size={24} />
                      </div>
                      <div>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Projetos Filtrados</span>
                        <h4 style={{ fontSize: '1.75rem', fontWeight: 855, color: 'var(--text-primary)', margin: '0.2rem 0 0 0' }}>{dProjects.length}</h4>
                      </div>
                    </div>
                    <div className="glass-panel pulse-card-blue" style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid rgba(0,0,0,0.06)', padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                      <div style={{ background: 'rgba(37, 99, 235, 0.08)', color: 'var(--secondary-color)', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Users size={24} />
                      </div>
                      <div>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Indicações Realizadas</span>
                        <h4 style={{ fontSize: '1.75rem', fontWeight: 855, color: 'var(--text-primary)', margin: '0.2rem 0 0 0' }}>{dActiveProjects.length}</h4>
                      </div>
                    </div>
                    <div className="glass-panel pulse-card-orange" style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid rgba(0,0,0,0.06)', padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                      <div style={{ background: 'rgba(235, 94, 37, 0.08)', color: 'var(--accent-color)', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <ShieldAlert size={24} />
                      </div>
                      <div>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Aguardando Indicação</span>
                        <h4 style={{ fontSize: '1.75rem', fontWeight: 855, color: 'var(--text-primary)', margin: '0.2rem 0 0 0' }}>{dPendingIndication.length}</h4>
                      </div>
                    </div>
                    <div className="glass-panel pulse-card-purple" style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid rgba(0,0,0,0.06)', padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                      <div style={{ background: 'rgba(139, 92, 246, 0.08)', color: '#8b5cf6', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Award size={24} />
                      </div>
                      <div>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Certificados Digitais</span>
                        <h4 style={{ fontSize: '1.75rem', fontWeight: 855, color: 'var(--text-primary)', margin: '0.2rem 0 0 0' }}>{dCertificates.length}</h4>
                      </div>
                    </div>
                    <div className="glass-panel pulse-card-yellow" style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid rgba(0,0,0,0.06)', padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                      <div style={{ background: 'rgba(234, 179, 8, 0.08)', color: '#eab308', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <DollarSign size={24} />
                      </div>
                      <div>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Investimento Total</span>
                        <h4 style={{ fontSize: '1.5rem', fontWeight: 855, color: 'var(--text-primary)', margin: '0.2rem 0 0 0' }}>R$ {dTotalInvestment.toLocaleString('pt-BR')}</h4>
                        <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Projetos do Edital (Ciclo 12m)</span>
                      </div>
                    </div>
                  </div>

                  {/* Section for Indication Status (Reitoria & Coordenador focus) */}
                  {(currentRole === 'PPGI' || currentRole === 'COORDINATOR') && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.5rem' }}>
                      <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 850, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <ShieldAlert size={20} style={{ color: 'var(--danger-color)' }} /> Status de Indicações Pendentes por Campus
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                          {CAMPUSES.map(camp => {
                            const campProj = projects.filter(p => p.campus === camp);
                            const campPending = campProj.filter(p => !p.discente);
                            const campTotal = campProj.length;
                            const pctPending = campTotal > 0 ? (campPending.length / campTotal) * 100 : 0;
                            return (
                              <div key={camp} style={{ display: 'flex', alignItems: 'center', justifyItems: 'space-between', gap: '1rem' }}>
                                <span style={{ width: '60px', fontWeight: 'bold', fontSize: '0.85rem' }}>{camp}</span>
                                <div style={{ flex: 1, height: '8px', background: 'rgba(0,0,0,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                                  <div style={{ width: `${pctPending}%`, height: '100%', background: 'var(--danger-color)', borderRadius: '4px' }}></div>
                                </div>
                                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', width: '150px', textAlign: 'right' }}>
                                  <strong>{campPending.length}</strong> pendente de {campTotal}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Speedometer for Indication Rate */}
                      <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', border: 'none', background: 'transparent', padding: 0 }}>
                        <BISpeedometer 
                          value={dActiveProjects.length}
                          max={dProjects.length || 1}
                          title="Taxa Global de Indicações de Discentes"
                          subtitle="Projetos com estudante alocado"
                          badgeText="Alocados"
                          icon={Users}
                          pill1Val={indFapeam}
                          pill1Label="FAPEAM"
                          pill2Val={indCnpq}
                          pill2Label="CNPQ"
                          pill3Val={indOthers}
                          pill3Label="OUTROS"
                          color="var(--primary-color)"
                        />
                      </div>
                    </div>
                  )}

                  {/* Tabela de Quotas e Investimentos por Campus (Dashboard Executivo) */}
                  {(currentRole === 'PPGI' || currentRole === 'COORDINATOR') && (
                    <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                      <div>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 855, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <DollarSign size={20} style={{ color: 'var(--primary-color)' }} /> Distribuição de Bolsas e Investimentos por Campus
                        </h3>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Valores acumulados a partir dos editais cadastrados e cotas de fomento vigentes.</p>
                      </div>
                      <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left' }}>
                          <thead>
                            <tr style={{ borderBottom: '2px solid rgba(0,0,0,0.06)', color: 'var(--text-secondary)', background: '#f8fafc' }}>
                              <th style={{ padding: '0.75rem 1rem' }}>Campus</th>
                              <th style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>Projetos Ativos</th>
                              <th style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>Total de Bolsas</th>
                              <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Valor Total Investido</th>
                            </tr>
                          </thead>
                          <tbody>
                            {CAMPUSES.map(camp => {
                              const campProjects = dProjects.filter(p => p.campus === camp);
                              const activeCampProjects = campProjects.filter(p => p.discente).length;

                              const campQuotas = dFilteredEditais.reduce((acc, edital) => {
                                const q = (edital.quotas || []).find((quota: any) => quota.campus === camp);
                                return acc + (q ? q.quantidade : 0);
                              }, 0);

                              const campInvestment = dFilteredEditais.reduce((acc, edital) => {
                                const q = (edital.quotas || []).find((quota: any) => quota.campus === camp);
                                return acc + (q ? (q.valorTotalCampus || 0) : 0);
                              }, 0);

                              const displayQuotas = campQuotas > 0 ? campQuotas : activeCampProjects;
                              const displayInvestment = campInvestment > 0 ? campInvestment : campProjects.reduce((acc, p) => {
                                if (p.fomento === 'VOLUNTÁRIO') return acc;
                                const val = p.fomento === 'FAPEAM' ? 600 : p.fomento === 'CNPQ' ? 700 : 400;
                                return acc + (val * 12);
                              }, 0);

                              return (
                                <tr key={camp} style={{ borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
                                  <td style={{ padding: '0.75rem 1rem', fontWeight: 700, color: 'var(--text-primary)' }}>{camp}</td>
                                  <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>{activeCampProjects}</td>
                                  <td style={{ padding: '0.75rem 1rem', textAlign: 'center', fontWeight: 600 }}>{displayQuotas}</td>
                                  <td style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: 700, color: 'var(--primary-color)' }}>
                                    R$ {displayInvestment.toLocaleString('pt-BR')}
                                  </td>
                                </tr>
                              );
                            })}
                            <tr style={{ background: '#f8fafc', fontWeight: 800, borderTop: '2px solid rgba(0,0,0,0.06)' }}>
                              <td style={{ padding: '0.75rem 1rem' }}>Total Geral</td>
                              <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                                {dActiveProjects.length}
                              </td>
                              <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                                {(() => {
                                  const totalQuotas = dFilteredEditais.reduce((acc, edital) => {
                                    return acc + (edital.quotas || []).reduce((qAcc: number, q: any) => qAcc + q.quantidade, 0);
                                  }, 0);
                                  return totalQuotas > 0 ? totalQuotas : dActiveProjects.length;
                                })()}
                              </td>
                              <td style={{ padding: '0.75rem 1rem', textAlign: 'right', color: 'var(--primary-color)' }}>
                                R$ {dTotalInvestment.toLocaleString('pt-BR')}
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Speedometers for Output Types */}
                  {(() => {
                    const artCount = dFruits.filter(f => f.tipo === 'PUBLICACAO').length;
                    const artExt = dFruits.filter(f => f.tipo === 'PUBLICACAO' && f.classificacao === 'REVISTA_EXTERNA').length;
                    const artIfam = dFruits.filter(f => f.tipo === 'PUBLICACAO' && f.classificacao === 'REVISTA_IFAM').length;
                    const artNPub = dFruits.filter(f => f.tipo === 'PUBLICACAO' && f.classificacao === 'NAO_PUBLICADO').length;

                    const softCount = dFruits.filter(f => f.tipo === 'SOFTWARE').length;
                    const softNit = dFruits.filter(f => f.tipo === 'SOFTWARE' && f.classificacao === 'NIT_IFAM').length;
                    const softDireto = dFruits.filter(f => f.tipo === 'SOFTWARE' && f.classificacao === 'SERVIDOR_DIRETO').length;
                    const softNReg = dFruits.filter(f => f.tipo === 'SOFTWARE' && f.classificacao === 'NAO_REGISTRADO').length;

                    const patCount = dFruits.filter(f => f.tipo === 'PATENTE').length;
                    const patNit = dFruits.filter(f => f.tipo === 'PATENTE' && f.classificacao === 'NIT_IFAM').length;
                    const patDireto = dFruits.filter(f => f.tipo === 'PATENTE' && f.classificacao === 'SERVIDOR_DIRETO').length;
                    const patNReg = dFruits.filter(f => f.tipo === 'PATENTE' && f.classificacao === 'NAO_REGISTRADO').length;

                    const eventCount = dFruits.filter(f => f.tipo === 'EVENTO').length;
                    const eventGroup = dFruits.filter(f => f.tipo === 'EVENTO' && f.classificacao === 'ORGANIZACAO_GRUPO').length;
                    const eventInst = dFruits.filter(f => f.tipo === 'EVENTO' && f.classificacao === 'ORGANIZACAO_INSTITUCIONAL').length;
                    const eventExt = dFruits.filter(f => f.tipo === 'EVENTO' && f.classificacao === 'EVENTO_EXTERNO').length;

                    return (
                      <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)' }}>KPIs de Produção Científica & Tecnológica</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '0.75rem' }}>
                          <BISpeedometer 
                            value={artCount} 
                            max={30} 
                            title="Publicações Científicas" 
                            subtitle="Publicações homologadas" 
                            badgeText="Publicações"
                            icon={BookOpen}
                            pill1Val={artIfam}
                            pill1Label={<>Revista<br/>IFAM</>}
                            pill2Val={artExt}
                            pill2Label={<>Revista<br/>Externa</>}
                            pill3Val={artNPub}
                            pill3Label="Não Publicado"
                            color="var(--secondary-color)" 
                          />
                          <BISpeedometer 
                            value={softCount} 
                            max={20} 
                            title="Softwares Desenvolvidos" 
                            subtitle="Sistemas & Aplicativos" 
                            badgeText="Softwares"
                            icon={Layers}
                            pill1Val={softNit}
                            pill1Label={<>NIT<br/>IFAM</>}
                            pill2Val={softDireto}
                            pill2Label={<>Direto<br/>INPI</>}
                            pill3Val={softNReg}
                            pill3Label={<>Registro<br/>Campus</>}
                            color="var(--primary-color)" 
                          />
                          <BISpeedometer 
                            value={patCount} 
                            max={5} 
                            title="Patentes Registradas" 
                            subtitle="Depósitos de propriedade" 
                            badgeText="Patentes"
                            icon={Award}
                            pill1Val={patNit}
                            pill1Label={<>NIT<br/>IFAM</>}
                            pill2Val={patDireto}
                            pill2Label={<>Direto<br/>INPI</>}
                            pill3Val={patNReg}
                            pill3Label={<>Registro<br/>Campus</>}
                            color="var(--accent-color)" 
                          />
                          <BISpeedometer 
                            value={eventCount} 
                            max={15} 
                            title="Eventos Científicos" 
                            subtitle="Mostras, seminários e congressos" 
                            badgeText="Eventos"
                            icon={Calendar}
                            pill1Val={eventInst}
                            pill1Label={<>Campus<br/>IFAM</>}
                            pill2Val={eventExt}
                            pill2Label={<>Evento<br/>Externo</>}
                            pill3Val={eventGroup}
                            pill3Label="Grupo Pesquisa"
                            color="#8b5cf6" 
                          />
                          <BISpeedometer 
                            value={dProjects.length} 
                            max={30} 
                            title="Projetos de Pesquisa" 
                            subtitle="Projetos de pesquisa ativos" 
                            badgeText="Projetos"
                            icon={FileText}
                            pill1Val={dProjects.filter(p => !p.researchGroupId && p.fomento !== 'FAPEAM').length}
                            pill1Label={<>IFAM<br/>Campus</>}
                            pill2Val={dProjects.filter(p => !p.researchGroupId && p.fomento === 'FAPEAM').length}
                            pill2Label={<>IES<br/>Externa</>}
                            pill3Val={dProjects.filter(p => p.researchGroupId).length}
                            pill3Label={<>Grupo<br/>Pesquisa</>}
                            color="#06b6d4" 
                          />
                          <BISpeedometer 
                            value={dFruits.filter(f => f.tipo === 'SOFTWARE' || f.tipo === 'PATENTE').length} 
                            max={15} 
                            title="Transferência Tecnológica" 
                            subtitle="Acordos de transferência" 
                            badgeText="Contratos"
                            icon={Shuffle}
                            pill1Val={dFruits.filter(f => (f.tipo === 'SOFTWARE' || f.tipo === 'PATENTE') && f.classificacao === 'NIT_IFAM').length}
                            pill1Label="Recebidas"
                            pill2Val={dFruits.filter(f => (f.tipo === 'SOFTWARE' || f.tipo === 'PATENTE') && f.classificacao === 'SERVIDOR_DIRETO').length}
                            pill2Label="Fornecidas"
                            color="#f59e0b" 
                          />
                        </div>
                      </div>
                    );
                  })()}

                  {/* Distribution of Projects and Groups */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.5rem' }}>
                    
                    {/* Groups by Campus / Areas */}
                    <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>Grupos de Pesquisa por Campus</h3>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: '0.75rem' }}>
                        {CAMPUSES.map(camp => {
                          const count = researchGroups.filter(g => g.campus === camp).length;
                          return (
                            <div key={camp} style={{ padding: '0.75rem', background: 'rgba(0,0,0,0.02)', borderRadius: '10px', textAlign: 'center', border: '1px solid rgba(0,0,0,0.04)' }}>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>{camp}</div>
                              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary-color)', marginTop: '0.25rem' }}>{count}</div>
                              <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>grupos</span>
                            </div>
                          );
                        })}
                      </div>

                      <div style={{ borderTop: '1px solid rgba(0,0,0,0.06)', paddingTop: '1rem', marginTop: '0.5rem' }}>
                        <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>Áreas de Conhecimento Dominantes</h4>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                          {Array.from(new Set(researchGroups.map(g => g.area || 'Outras'))).map((area, idx) => {
                            const count = researchGroups.filter(g => (g.area || 'Outras') === area).length;
                            return (
                              <span key={idx} className="badge" style={{ background: 'rgba(21,128,61,0.06)', color: 'var(--primary-color)', textTransform: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem' }}>
                                {area}: <strong>{count}</strong>
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                     {/* Groups Productivity Ranking (Filtered) */}
                     <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                       <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>Ranking de Produtividade dos Grupos / Líderes</h3>
                       <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '220px', overflowY: 'auto', paddingRight: '0.25rem' }}>
                         {(() => {
                            const dFilteredGroups = researchGroups.filter(g => dashboardCampusFilter === 'ALL' || g.campus === dashboardCampusFilter);
                            const groupItems = dFilteredGroups.map(g => {
                              const groupFruits = dFruits.filter(f => {
                                const proj = projects.find(p => p.id === f.projectId);
                                return proj && proj.researchGroupId === g.id;
                              });
                              
                              const articlesCount = groupFruits.filter(f => f.tipo === 'PUBLICACAO').length;
                              const softwareCount = groupFruits.filter(f => f.tipo === 'SOFTWARE').length;
                              const patentsCount = groupFruits.filter(f => f.tipo === 'PATENTE').length;
                              const eventCount = groupFruits.filter(f => f.tipo === 'EVENTO').length;
                              const totalProd = articlesCount + softwareCount + patentsCount + eventCount;
                              
                              return {
                                isIndependent: false,
                                id: g.id,
                                nome: g.nome,
                                lideres: g.lideres,
                                campus: g.campus,
                                articlesCount,
                                softwareCount,
                                patentsCount,
                                eventCount,
                                totalProd
                              };
                            });

                            const independentFruits = dFruits.filter(f => {
                              const proj = projects.find(p => p.id === f.projectId);
                              return proj && !proj.researchGroupId;
                            });

                            const indArt = independentFruits.filter(f => f.tipo === 'PUBLICACAO').length;
                            const indSoft = independentFruits.filter(f => f.tipo === 'SOFTWARE').length;
                            const indPat = independentFruits.filter(f => f.tipo === 'PATENTE').length;
                            const indEvent = independentFruits.filter(f => f.tipo === 'EVENTO').length;
                            const indTotal = indArt + indSoft + indPat + indEvent;

                            const independentRow = {
                              isIndependent: true,
                              id: 'independent',
                              nome: 'Pesquisa Independente - Docentes Sem Grupo',
                              lideres: 'Pesquisadores não vinculados',
                              campus: dashboardCampusFilter === 'ALL' ? 'Múltiplos' : dashboardCampusFilter,
                              articlesCount: indArt,
                              softwareCount: indSoft,
                              patentsCount: indPat,
                              eventCount: indEvent,
                              totalProd: indTotal
                            };

                            const allRows = [...groupItems];
                            if (indTotal > 0) {
                              allRows.push(independentRow);
                            }

                            const sortedRows = allRows.sort((a, b) => b.totalProd - a.totalProd);

                            return sortedRows.map((row) => (
                              <div key={row.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: '#ffffff', borderRadius: '10px', border: '1px solid rgba(0,0,0,0.05)', borderLeft: row.isIndependent ? '4px solid var(--accent-color)' : '4px solid var(--primary-color)', gap: '1rem' }}>
                                <div style={{ flex: 1 }}>
                                  <strong style={{ fontSize: '0.8rem', color: 'var(--text-primary)', display: 'block', whiteSpace: 'normal', lineHeight: 1.3, wordBreak: 'break-word' }} title={row.nome}>{row.nome}</strong>
                                  <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', display: 'block', marginTop: '0.2rem' }}>
                                    {row.isIndependent ? '💡 Docentes sem grupo de pesquisa' : `👤 Líder: ${row.lideres}`} | 📍 Campus: <strong>{row.campus}</strong>
                                  </span>
                                </div>
                                <div style={{ display: 'flex', gap: '0.25rem', flexShrink: 0, alignItems: 'center' }}>
                                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: row.isIndependent ? 'var(--accent-color)' : 'var(--primary-color)', marginRight: '0.25rem' }}>{row.totalProd} Pts</span>
                                  <span style={{ background: '#eff6ff', color: '#1e40af', padding: '0.2rem 0.4rem', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 700 }} title="Publicações">{row.articlesCount}A</span>
                                  <span style={{ background: '#f0fdf4', color: '#166534', padding: '0.2rem 0.4rem', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 700 }} title="Softwares">{row.softwareCount}S</span>
                                  <span style={{ background: '#fff1f2', color: '#9f1239', padding: '0.2rem 0.4rem', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 700 }} title="Patentes">{row.patentsCount}P</span>
                                  <span style={{ background: '#fef3c7', color: '#92400e', padding: '0.2rem 0.4rem', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 700 }} title="Eventos">{row.eventCount}E</span>
                                </div>
                              </div>
                            ));
                         })()}
                       </div>
                     </div>

                  </div>
                </>
              );
            })()}

          </div>
        )}

        {/* EDITAIS TAB */}
        {activeTab === 'editais' && (
          <div className="glass-panel animate-fade-in">
            <EditaisModule />
          </div>
        )}

        {/* AVALIACAO TAB */}
        {activeTab === 'avaliacao' && (
          <div className="glass-panel animate-fade-in">
            <AvaliacaoModule />
          </div>
        )}

        {/* CURSOS TAB */}
        {activeTab === 'cursos' && (
          <div className="glass-panel animate-fade-in">
            <CursosModule />
          </div>
        )}

        {/* MURAL DE EDITAIS TAB */}
        {activeTab === 'mural' && (
          <div className="animate-fade-in">
            <EditaisPublicosModule currentRole={currentRole} selectedCampus={selectedCampus} />
          </div>
        )}

        {/* PROJECT SEARCH TAB */}
        {activeTab === 'projects' && (
          <div className="glass-panel animate-fade-in">
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ flex: 1, position: 'relative' }}>
                <Search size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-secondary)' }} />
                <input 
                  type="text" 
                  placeholder="Pesquisar por Título do Projeto, Código ou Orientador..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '12px', color: 'var(--text-primary)' }}
                />
              </div>
              <select 
                value={selectedCampus} 
                onChange={(e) => setSelectedCampus(e.target.value)}
                style={{ border: '1px solid rgba(0,0,0,0.1)', borderRadius: '12px', padding: '0.75rem', color: 'var(--text-primary)' }}
              >
                <option value="ALL">Todos os Campi</option>
                {CAMPUSES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {/* Table */}
            <div style={{ overflow: 'auto', maxHeight: '550px', border: '1px solid rgba(0,0,0,0.05)', borderRadius: '12px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(0,0,0,0.06)', color: 'var(--text-secondary)', textAlign: 'left', background: '#f8fafc', position: 'sticky', top: 0, zIndex: 1 }}>
                    <th style={{ padding: '0.75rem' }}>Código</th>
                    <th style={{ padding: '0.75rem' }}>Campus</th>
                    <th style={{ padding: '0.75rem' }}>Título do Trabalho</th>
                    <th style={{ padding: '0.75rem' }}>Orientador</th>
                    <th style={{ padding: '0.75rem' }}>Discente Bolsista</th>
                    <th style={{ padding: '0.75rem' }}>Tipo</th>
                    <th style={{ padding: '0.75rem' }}>Modalidade</th>
                    <th style={{ padding: '0.75rem' }}>Fomento</th>
                    <th style={{ padding: '0.75rem' }}>Investimento Total</th>
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    const filteredList = projects.filter(p => {
                      const matchSearch = p.titulo.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                          p.orientador.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                          p.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                          (p.discente && p.discente.toLowerCase().includes(searchTerm.toLowerCase()));
                      const matchCampus = selectedCampus === 'ALL' || p.campus === selectedCampus;
                      return matchSearch && matchCampus;
                    });

                    const totalValue = filteredList.reduce((acc, p) => {
                      if (p.fomento === 'VOLUNTÁRIO') return acc;
                      const val = p.fomento === 'FAPEAM' ? 600 : p.fomento === 'CNPQ' ? 700 : 400;
                      return acc + (val * 12);
                    }, 0);

                    return (
                      <>
                        {filteredList.map((p, idx) => {
                          const valorProjeto = p.fomento === 'VOLUNTÁRIO' ? 0 : (p.fomento === 'FAPEAM' ? 600 * 12 : p.fomento === 'CNPQ' ? 700 * 12 : 400 * 12);
                          return (
                            <tr key={idx} style={{ borderBottom: '1px solid rgba(0,0,0,0.03)', transition: 'background 0.2s' }}>
                              <td style={{ padding: '0.75rem', fontWeight: 600, color: 'var(--primary-color)' }}>{p.codigo}</td>
                              <td style={{ padding: '0.75rem' }}>{p.campus}</td>
                              <td style={{ padding: '0.75rem', maxWidth: '350px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={p.titulo}>{p.titulo}</td>
                              <td style={{ padding: '0.75rem' }}>{p.orientador}</td>
                              <td style={{ padding: '0.75rem' }}>
                                {editingProjectId === p.id ? (
                                  <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
                                    <input 
                                      type="text" 
                                      placeholder="Nome do Aluno"
                                      value={editingStudentName}
                                      onChange={(e) => setEditingStudentName(e.target.value)}
                                      style={{ padding: '0.25rem 0.5rem', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '6px', color: 'var(--text-primary)', fontSize: '0.8rem' }}
                                    />
                                    <button 
                                      onClick={() => handleAssignStudent(p.id)} 
                                      className="btn-primary" 
                                      style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                                    >
                                      Salvar
                                    </button>
                                    <button 
                                      onClick={() => setEditingProjectId(null)} 
                                      className="btn-secondary" 
                                      style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                                    >
                                      X
                                    </button>
                                  </div>
                                ) : (
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'space-between' }}>
                                    <span style={{ color: p.discente ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                                      {p.discente || 'Pendente de indicação'}
                                    </span>
                                    {(currentRole === 'PROFESSOR' || (currentRole === 'COORDINATOR' && p.campus === selectedCampus)) && (
                                      <button 
                                        onClick={() => { setEditingProjectId(p.id); setEditingStudentName(p.discente || ''); }}
                                        className="btn-secondary"
                                        style={{ padding: '0.2rem 0.4rem', fontSize: '0.7rem', opacity: 0.8 }}
                                      >
                                        Indicar
                                      </button>
                                    )}
                                  </div>
                                )}
                              </td>
                              <td style={{ padding: '0.75rem' }}>
                                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{getProjectType(p)}</span>
                              </td>
                              <td style={{ padding: '0.75rem' }}>
                                <span style={{ color: 'var(--text-secondary)' }}>{getProjectModality(p)}</span>
                              </td>
                              <td style={{ padding: '0.75rem' }}>
                                <span className={`badge badge-${p.fomento.toLowerCase()}`}>{p.fomento}</span>
                              </td>
                              <td style={{ padding: '0.75rem', fontWeight: 600 }}>
                                {valorProjeto > 0 ? `R$ ${valorProjeto.toLocaleString('pt-BR')},00` : 'R$ 0,00'}
                              </td>
                            </tr>
                          );
                        })}
                        <tr style={{ background: '#f8fafc', fontWeight: 'bold', borderTop: '2px solid rgba(0,0,0,0.06)' }}>
                          <td colSpan={8} style={{ padding: '1rem', textAlign: 'right' }}>Total Disponibilizado nos Editais (Filtrados):</td>
                          <td colSpan={1} style={{ padding: '1rem', color: 'var(--primary-color)', fontSize: '0.95rem' }}>R$ {totalValue.toLocaleString('pt-BR')},00</td>
                        </tr>
                      </>
                    );
                  })()}
                </tbody>
              </table>
            </div>
          </div>
        )}
        {/* TRIAGEM E ONBOARDING TAB */}
        {activeTab === 'triagem' && (
          <TriagemModule
            projects={projects}
            editais={editais}
            researchGroups={researchGroups}
            currentRole={currentRole}
            selectedCampus={selectedCampus}
            onRefresh={loadData}
            studentBank={studentBank}
            setStudentBank={setStudentBank}
            studentAgencia={studentAgencia}
            setStudentAgencia={setStudentAgencia}
            studentConta={studentConta}
            setStudentConta={setStudentConta}
          />
        )}

        {/* FREQUENCIES TAB */}
        {activeTab === 'frequencies' && (
          <FrequenciesModule
            frequencies={frequencies}
            projects={projects}
            editais={editais}
            currentRole={currentRole}
            selectedCampus={selectedCampus}
            onRefresh={loadData}
            targetStudentProject={targetStudentProject}
            studentBank={studentBank}
            setStudentBank={setStudentBank}
            studentAgencia={studentAgencia}
            setStudentAgencia={setStudentAgencia}
            studentConta={studentConta}
            setStudentConta={setStudentConta}
            bankError={bankError}
            setBankError={setBankError}
          />
        )}

        {/* SUBSTITUTIONS TAB */}
        {activeTab === 'substitutions' && (
          <SubstitutionsModule 
            projects={projects}
            substitutions={substitutions}
            currentRole={currentRole}
            selectedCampus={selectedCampus}
            onRefresh={loadData}
          />
        )}

        {/* GROUPS TAB */}
        {activeTab === 'groups' && (
          <GroupsModule
            researchGroups={researchGroups}
            currentRole={currentRole}
            selectedCampus={selectedCampus}
            onRefresh={loadData}
          />
        )}

        {/* FRUITS TAB */}
        {activeTab === 'fruits' && (
          <FruitsModule 
            projects={projects}
            fruits={fruits}
            currentRole={currentRole}
            selectedCampus={selectedCampus}
            onRefresh={loadData}
          />
        )}

        {/* CERTIFICATES TAB */}
        {activeTab === 'certificates' && (
          <CertificatesModule 
            projects={projects}
            certificates={certificates}
            currentRole={currentRole}
            selectedCampus={selectedCampus}
            onRefresh={loadData}
          />
        )}

        {/* PAYMENT LOTS TAB */}
        {activeTab === 'lots' && (
          <div className="glass-panel animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>Consolidador Financeiro e Geração de Lotes</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Consolide as frequências aprovadas pelo campus atual e gere o lote de exportação CSV contendo as contas correntes validadas.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
              {CAMPUSES
                .filter(camp => currentRole === 'PPGI' || camp === selectedCampus)
                .map(camp => {
                  const approvedCount = frequencies.filter(f => {
                    const proj = projects.find(p => p.id === f.projectId);
                    return proj?.campus === camp && f.status === 'APROVADO';
                  }).length;
                  
                  const pendingCount = frequencies.filter(f => {
                    const proj = projects.find(p => p.id === f.projectId);
                    return proj?.campus === camp && f.status === 'SUBMETIDO';
                  }).length;

                  const approvedAmount = frequencies.filter(f => {
                    const proj = projects.find(p => p.id === f.projectId);
                    return proj?.campus === camp && f.status === 'APROVADO';
                  }).reduce((acc, f) => {
                    const proj = projects.find(p => p.id === f.projectId);
                    if (!proj || proj.fomento === 'VOLUNTÁRIO') return acc;
                    const val = proj.fomento === 'FAPEAM' ? 600 : proj.fomento === 'CNPQ' ? 700 : 400;
                    return acc + val;
                  }, 0);

                  const pendingAmount = frequencies.filter(f => {
                    const proj = projects.find(p => p.id === f.projectId);
                    return proj?.campus === camp && f.status === 'SUBMETIDO';
                  }).reduce((acc, f) => {
                    const proj = projects.find(p => p.id === f.projectId);
                    if (!proj || proj.fomento === 'VOLUNTÁRIO') return acc;
                    const val = proj.fomento === 'FAPEAM' ? 600 : proj.fomento === 'CNPQ' ? 700 : 400;
                    return acc + val;
                  }, 0);

                  return (
                    <div key={camp} className="glass-panel" style={{ background: 'rgba(0,0,0,0.01)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h4 style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '1.1rem' }}>Campus {camp}</h4>
                        <Building2 size={20} style={{ color: 'var(--text-secondary)' }} />
                      </div>
                      
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                          <span>Aprovados no Mês:</span>
                          <strong style={{ color: 'var(--primary-color)' }}>{approvedCount} (R$ {approvedAmount.toLocaleString('pt-BR')},00)</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span>Aguardando Aprovação:</span>
                          <strong style={{ color: 'var(--accent-color)' }}>{pendingCount} (R$ {pendingAmount.toLocaleString('pt-BR')},00)</strong>
                        </div>
                      </div>

                      <button 
                        onClick={() => handleExportPaymentLot(camp)} 
                        className="btn-primary" 
                        style={{ marginTop: '0.5rem', width: '100%', justifyContent: 'center' }}
                        disabled={approvedCount === 0}
                      >
                        <Download size={16} /> Exportar Lote para Pagamento
                      </button>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* IMPORT MODULE TAB */}
        {activeTab === 'import' && (
          <div className="glass-panel animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>Leitor da Planilha Mestre (Projetos)</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Carregue o arquivo Excel (`Controle Bolsas por campus AC.xlsx`) para processar e atualizar os registros do banco de dados do SQLite.
                </p>

                <div style={{ border: '2px dashed rgba(0,0,0,0.15)', borderRadius: '12px', padding: '2rem', textAlign: 'center', cursor: 'pointer', background: 'rgba(0,0,0,0.01)', transition: 'var(--transition-smooth)' }}>
                  <input 
                    type="file" 
                    id="excel-uploader" 
                    accept=".xlsx, .xls"
                    onChange={handleSpreadsheetUpload}
                    style={{ display: 'none' }}
                  />
                  <label htmlFor="excel-uploader" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
                    <Upload size={36} style={{ color: 'var(--primary-color)' }} />
                    <span style={{ fontWeight: 800, color: 'var(--text-primary)' }}>Upload de Nova Planilha (.xlsx)</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Mapeamento automático com o SQLite</span>
                  </label>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>Leitor de Grupos de Pesquisa</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Carregue um arquivo Excel contendo colunas (Nome, Líder, Área, Campus, Linhas, Equipe) para popular os grupos.
                </p>

                <div style={{ border: '2px dashed rgba(0,0,0,0.15)', borderRadius: '12px', padding: '2rem', textAlign: 'center', cursor: 'pointer', background: 'rgba(0,0,0,0.01)', transition: 'var(--transition-smooth)' }}>
                  <input 
                    type="file" 
                    id="group-excel-uploader" 
                    accept=".xlsx, .xls"
                    onChange={handleGroupSpreadsheetUpload}
                    style={{ display: 'none' }}
                  />
                  <label htmlFor="group-excel-uploader" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
                    <Upload size={36} style={{ color: 'var(--secondary-color)' }} />
                    <span style={{ fontWeight: 800, color: 'var(--text-primary)' }}>Upload Planilha de Grupos (.xlsx)</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Sincronização offline estruturada</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="glass-panel" style={{ background: 'rgba(0, 0, 0, 0.01)', display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
              <h4 style={{ fontWeight: 800, color: 'var(--text-primary)' }}>Ações de Controle Operacional</h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Se você deseja resetar a base do SQLite para o seed original de 132 projetos da Reitoria:
              </p>
              <button onClick={resetProjectsToDefault} className="btn-primary" style={{ alignSelf: 'flex-start' }}>
                <RefreshCw size={16} /> Restaurar Planilha Mestre Original
              </button>
            </div>
          </div>
        )}

        {/* REPORTS TAB */}
        {activeTab === 'reports' && (
          <ReportsModule
            projects={projects}
            currentRole={currentRole}
            selectedCampus={selectedCampus}
          />
        )}

      </main>
    </div>
  );
}


