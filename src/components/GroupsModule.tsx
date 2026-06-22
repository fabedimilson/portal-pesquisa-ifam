import React, { useState } from 'react';
import { Users, ExternalLink, Edit } from 'lucide-react';

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

interface GroupsModuleProps {
  researchGroups: ResearchGroup[];
  currentRole: string;
  selectedCampus: string;
  onRefresh: () => void;
}

const CAMPUSES = ['CMC', 'CMZL', 'CMDI', 'CPRF', 'CPIN', 'CITA', 'CLAB', 'COARI', 'CMA'];

export default function GroupsModule({ researchGroups, currentRole, selectedCampus, onRefresh }: GroupsModuleProps) {
  const [loading, setLoading] = useState(false);

  // Proposal Form State
  const [rgNome, setRgNome] = useState('');
  const [rgLideres, setRgLideres] = useState('');
  const [rgArea, setRgArea] = useState('');
  const [rgEmail, setRgEmail] = useState('');
  const [rgCnpq, setRgCnpq] = useState('');
  const [rgLinhasPesquisa, setRgLinhasPesquisa] = useState('');
  const [rgMembrosEquipe, setRgMembrosEquipe] = useState('');
  const [rgEndereco, setRgEndereco] = useState('');
  const [rgCampus, setRgCampus] = useState('CMC');

  // Editing Group State
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [editingGroupName, setEditingGroupName] = useState('');
  const [editingGroupLideres, setEditingGroupLideres] = useState('');
  const [editingGroupLinhas, setEditingGroupLinhas] = useState('');
  const [editingGroupMembros, setEditingGroupMembros] = useState('');
  const [editingGroupCampus, setEditingGroupCampus] = useState('CMC');
  const [editingGroupArea, setEditingGroupArea] = useState('');
  const [editingGroupEmail, setEditingGroupEmail] = useState('');
  const [editingGroupCnpq, setEditingGroupCnpq] = useState('');
  const [editingGroupEndereco, setEditingGroupEndereco] = useState('');
  const [editingGroupStatus, setEditingGroupStatus] = useState<'ATIVO' | 'ALERTA'>('ATIVO');

  const handleCreateResearchGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/research-groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: rgNome,
          lideres: rgLideres,
          linhasPesquisa: rgLinhasPesquisa,
          membrosEquipe: rgMembrosEquipe,
          campus: rgCampus,
          area: rgArea,
          contatoEmail: rgEmail || null,
          linkCnpq: rgCnpq || null,
          endereco: rgEndereco || null
        })
      });
      if (res.ok) {
        alert('Proposta de credenciamento do grupo enviada com sucesso!');
        setRgNome('');
        setRgLideres('');
        setRgLinhasPesquisa('');
        setRgMembrosEquipe('');
        setRgEmail('');
        setRgCnpq('');
        setRgEndereco('');
        onRefresh();
      } else {
        alert('Erro ao criar grupo.');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditResearchGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGroupId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/research-groups/${editingGroupId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: editingGroupName,
          lideres: editingGroupLideres,
          linhasPesquisa: editingGroupLinhas,
          membrosEquipe: editingGroupMembros,
          campus: editingGroupCampus,
          area: editingGroupArea,
          contatoEmail: editingGroupEmail || null,
          linkCnpq: editingGroupCnpq || null,
          endereco: editingGroupEndereco || null,
          status: editingGroupStatus
        })
      });
      if (res.ok) {
        alert('Grupo de pesquisa atualizado com sucesso!');
        setEditingGroupId(null);
        onRefresh();
      } else {
        alert('Erro ao atualizar grupo.');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateGroupStatus = async (id: string, status: 'ATIVO' | 'ALERTA') => {
    setLoading(true);
    try {
      const res = await fetch(`/api/research-groups/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, lastActivity: new Date().toISOString() })
      });
      if (res.ok) {
        alert('Status do grupo de pesquisa atualizado com sucesso!');
        onRefresh();
      } else {
        alert('Erro ao atualizar status do grupo.');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '2rem' }}>
        
        {/* Proposal Form */}
        <form onSubmit={handleCreateResearchGroup} className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Users size={20} style={{ color: 'var(--primary-color)' }} /> Nova Proposta de Credenciamento
          </h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Segundo a Resolução nº 026/2014, o credenciamento tramitará no colegiado do campus antes do envio à PPGI.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Nome do Grupo de Pesquisa</label>
              <input 
                type="text" 
                required
                placeholder="Ex: Grupo de Estudo em Energias Renováveis"
                value={rgNome}
                onChange={(e) => setRgNome(e.target.value)}
                style={{ padding: '0.5rem', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '8px', fontSize: '0.85rem' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Líder do Grupo (Orientador)</label>
                <input 
                  type="text" 
                  required
                  placeholder="Nome do pesquisador líder"
                  value={rgLideres}
                  onChange={(e) => setRgLideres(e.target.value)}
                  style={{ padding: '0.5rem', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '8px', fontSize: '0.85rem' }}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Área do Conhecimento</label>
                <input 
                  type="text" 
                  required
                  placeholder="Ex: Ciências Tecnológicas / Agrárias"
                  value={rgArea}
                  onChange={(e) => setRgArea(e.target.value)}
                  style={{ padding: '0.5rem', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '8px', fontSize: '0.85rem' }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>E-mail de Contato</label>
                <input 
                  type="email" 
                  placeholder="lider@ifam.edu.br"
                  value={rgEmail}
                  onChange={(e) => setRgEmail(e.target.value)}
                  style={{ padding: '0.5rem', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '8px', fontSize: '0.85rem' }}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Link CNPq (DGP)</label>
                <input 
                  type="url" 
                  placeholder="http://dgp.cnpq.br/dgp/espelhogrupo/..."
                  value={rgCnpq}
                  onChange={(e) => setRgCnpq(e.target.value)}
                  style={{ padding: '0.5rem', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '8px', fontSize: '0.85rem' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Linhas de Pesquisa (separadas por vírgula)</label>
              <input 
                type="text" 
                required
                placeholder="Ex: Energia Solar, Sustentabilidade, Amazônia"
                value={rgLinhasPesquisa}
                onChange={(e) => setRgLinhasPesquisa(e.target.value)}
                style={{ padding: '0.5rem', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '8px', fontSize: '0.85rem' }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Membros da Equipe (separados por vírgula)</label>
              <textarea 
                rows={2}
                required
                placeholder="Ex: Dr. Fulano de Tal, Profa. Ciclana (Docentes), Beltrano (Discente)"
                value={rgMembrosEquipe}
                onChange={(e) => setRgMembrosEquipe(e.target.value)}
                style={{ padding: '0.5rem', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '8px', fontSize: '0.85rem' }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Endereço do Campus (CNPq)</label>
              <input 
                type="text" 
                placeholder="Ex: Rua Ruy Gama e Silva, 159 - Raiz"
                value={rgEndereco}
                onChange={(e) => {
                  const val = e.target.value;
                  setRgEndereco(val);
                  const clean = val.toLowerCase();
                  if (clean.includes('sete de setembro') || clean.includes('centro')) setRgCampus('CMC');
                  else if (clean.includes('ruy gama') || clean.includes('raiz') || clean.includes('zona leste') || clean.includes('grande circular')) setRgCampus('CMZL');
                  else if (clean.includes('danilo de mattos') || clean.includes('distrito industrial') || clean.includes('cosme ferreira')) setRgCampus('CMDI');
                  else if (clean.includes('coari') || clean.includes('mami')) setRgCampus('COARI');
                  else if (clean.includes('figueiredo')) setRgCampus('CPRF');
                  else if (clean.includes('parintins') || clean.includes('pinheiro')) setRgCampus('CPIN');
                  else if (clean.includes('itacoatiara')) setRgCampus('CITA');
                  else if (clean.includes('lábrea') || clean.includes('labrea')) setRgCampus('CLAB');
                  else if (clean.includes('maués') || clean.includes('maues') || clean.includes('moraes')) setRgCampus('CMA');
                }}
                style={{ padding: '0.5rem', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '8px', fontSize: '0.85rem' }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Campus de Sede</label>
              <select 
                value={rgCampus}
                onChange={(e) => setRgCampus(e.target.value)}
                style={{ padding: '0.5rem', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '8px', fontSize: '0.85rem' }}
              >
                {CAMPUSES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <button type="submit" className="btn-primary" style={{ alignSelf: 'flex-start' }} disabled={loading}>
            Submeter Proposta
          </button>
        </form>

        {/* Inactivity Audit & List of Groups */}
        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)' }}>Grupos de Pesquisa Homologados</h3>
            <span style={{ fontSize: '0.7rem', background: 'rgba(227,6,19,0.08)', color: 'var(--accent-color)', padding: '0.25rem 0.5rem', borderRadius: '6px', fontWeight: 700 }}>
              Auditoria de Inatividade Ativa
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '500px', overflowY: 'auto' }}>
            {researchGroups.map((g) => {
              const monthsInactive = Math.floor((Date.now() - new Date(g.lastActivity).getTime()) / (1000 * 60 * 60 * 24 * 30));
              const isInactive = monthsInactive >= 12;
              return (
                <div key={g.id} style={{ padding: '1rem', border: '1px solid rgba(0,0,0,0.06)', borderRadius: '12px', background: g.status === 'ALERTA' || isInactive ? 'rgba(227,6,19,0.02)' : 'rgba(21,128,61,0.01)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0, lineHeight: 1.3 }}>{g.nome}</h4>
                    <span className="badge" style={{
                      background: g.status === 'ATIVO' && !isInactive ? 'rgba(21,128,61,0.1)' : 'rgba(227,6,19,0.1)',
                      color: g.status === 'ATIVO' && !isInactive ? '#15803d' : '#e30613',
                      fontSize: '0.65rem',
                      whiteSpace: 'nowrap'
                    }}>
                      {g.status === 'ALERTA' || isInactive ? 'ALERTA DE INATIVIDADE' : 'ATIVO'}
                    </span>
                  </div>
                  
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    <div><strong>Líder(es):</strong> {g.lideres}</div>
                    <div><strong>Campus Sede:</strong> <span className="badge badge-ifam" style={{ fontSize: '0.7rem' }}>{g.campus}</span></div>
                    {g.area && <div><strong>Área:</strong> {g.area}</div>}
                    {g.endereco && <div><strong>Endereço CNPq:</strong> {g.endereco}</div>}
                    {g.contatoEmail && <div><strong>Contato:</strong> <a href={`mailto:${g.contatoEmail}`} style={{ color: 'var(--primary-color)', textDecoration: 'underline' }}>{g.contatoEmail}</a></div>}
                    <div><strong>Linhas de Pesquisa:</strong> {g.linhasPesquisa}</div>
                    <div><strong>Equipe:</strong> {g.membrosEquipe}</div>
                    {g.linkCnpq && (
                      <div style={{ marginTop: '0.25rem' }}>
                        <a href={g.linkCnpq} target="_blank" rel="noreferrer" className="btn-secondary" style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem', borderRadius: '8px', gap: '0.25rem' }}>
                          Acessar CNPq <ExternalLink size={12} />
                        </a>
                      </div>
                    )}
                    <span style={{ color: isInactive ? 'var(--accent-color)' : 'var(--text-muted)', fontSize: '0.7rem', marginTop: '0.25rem' }}>
                      Última atividade: {new Date(g.lastActivity).toLocaleDateString()} ({monthsInactive} meses atrás)
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                    {(g.status === 'ALERTA' || isInactive) && (currentRole === 'PPGI' || currentRole === 'COORDINATOR') && (
                      <button 
                        onClick={() => handleUpdateGroupStatus(g.id, 'ATIVO')}
                        className="btn-primary" 
                        style={{ padding: '0.3rem 0.6rem', fontSize: '0.7rem', alignSelf: 'flex-start' }}
                      >
                        Reativar Grupo
                      </button>
                    )}
                    {(currentRole === 'PPGI' || currentRole === 'COORDINATOR' || currentRole === 'PROFESSOR') && (
                      <button 
                        onClick={() => {
                          setEditingGroupId(g.id);
                          setEditingGroupName(g.nome);
                          setEditingGroupLideres(g.lideres);
                          setEditingGroupLinhas(g.linhasPesquisa);
                          setEditingGroupMembros(g.membrosEquipe);
                          setEditingGroupCampus(g.campus);
                          setEditingGroupArea(g.area || 'Ciências Tecnológicas');
                          setEditingGroupEmail(g.contatoEmail || '');
                          setEditingGroupCnpq(g.linkCnpq || '');
                          setEditingGroupEndereco(g.endereco || '');
                          setEditingGroupStatus(g.status);
                        }}
                        className="btn-secondary" 
                        style={{ padding: '0.3rem 0.6rem', fontSize: '0.7rem', alignSelf: 'flex-start', gap: '0.25rem' }}
                      >
                        <Edit size={12} /> Editar
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Editing Modal */}
      {editingGroupId && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '500px', display: 'flex', flexDirection: 'column', gap: '1.25rem', background: '#ffffff', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ fontWeight: 800, color: 'var(--text-primary)' }}>Editar Grupo de Pesquisa</h3>
            <form onSubmit={handleEditResearchGroup} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '0.5rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Nome do Grupo *</label>
                <input type="text" required value={editingGroupName} onChange={e => setEditingGroupName(e.target.value)} style={{ padding: '0.5rem', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '8px', fontSize: '0.85rem' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Líder(es) *</label>
                <input type="text" required value={editingGroupLideres} onChange={e => setEditingGroupLideres(e.target.value)} style={{ padding: '0.5rem', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '8px', fontSize: '0.85rem' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Área do Conhecimento *</label>
                  <input type="text" required value={editingGroupArea} onChange={e => setEditingGroupArea(e.target.value)} style={{ padding: '0.5rem', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '8px', fontSize: '0.85rem' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Campus *</label>
                  <select value={editingGroupCampus} onChange={e => setEditingGroupCampus(e.target.value)} style={{ padding: '0.5rem', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '8px', fontSize: '0.85rem' }}>
                    {CAMPUSES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>E-mail de Contato</label>
                  <input type="email" value={editingGroupEmail} onChange={e => setEditingGroupEmail(e.target.value)} style={{ padding: '0.5rem', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '8px', fontSize: '0.85rem' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>CNPq Link</label>
                  <input type="url" value={editingGroupCnpq} onChange={e => setEditingGroupCnpq(e.target.value)} style={{ padding: '0.5rem', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '8px', fontSize: '0.85rem' }} />
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Endereço CNPq</label>
                <input type="text" value={editingGroupEndereco} onChange={e => setEditingGroupEndereco(e.target.value)} style={{ padding: '0.5rem', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '8px', fontSize: '0.85rem' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Linhas de Pesquisa *</label>
                <input type="text" required value={editingGroupLinhas} onChange={e => setEditingGroupLinhas(e.target.value)} style={{ padding: '0.5rem', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '8px', fontSize: '0.85rem' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Membros da Equipe *</label>
                <textarea rows={2} required value={editingGroupMembros} onChange={e => setEditingGroupMembros(e.target.value)} style={{ padding: '0.5rem', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '8px', fontSize: '0.85rem' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Status *</label>
                <select value={editingGroupStatus} onChange={e => setEditingGroupStatus(e.target.value as any)} style={{ padding: '0.5rem', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '8px', fontSize: '0.85rem' }}>
                  <option value="ATIVO">Ativo</option>
                  <option value="ALERTA">Alerta de Inatividade</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                <button type="button" className="btn-secondary" onClick={() => setEditingGroupId(null)}>Cancelar</button>
                <button type="submit" className="btn-primary">Salvar Alterações</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
