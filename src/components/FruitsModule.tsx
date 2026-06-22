import React, { useState } from 'react';
import { PlusCircle, ExternalLink } from 'lucide-react';

interface Project {
  id: string;
  codigo: string;
  campus: string;
  titulo: string;
  orientador: string;
  fomento: string;
  discente: string | null;
}

interface Fruit {
  id: string;
  tipo: string;
  classificacao: string;
  titulo: string;
  linkUrl: string | null;
  projectId: string;
  createdAt: string;
}

interface FruitsModuleProps {
  projects: Project[];
  fruits: Fruit[];
  currentRole: string;
  selectedCampus: string;
  onRefresh: () => void;
}

export default function FruitsModule({
  projects,
  fruits,
  currentRole,
  selectedCampus,
  onRefresh
}: FruitsModuleProps) {
  const [fruitProjId, setFruitProjId] = useState<string>('');
  const [fruitTipo, setFruitTipo] = useState<string>('PUBLICACAO');
  const [fruitClassificacao, setFruitClassificacao] = useState<string>('REVISTA_EXTERNA');
  const [fruitTitulo, setFruitTitulo] = useState<string>('');
  const [fruitUrl, setFruitUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleAddFruit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fruitProjId) {
      alert('Selecione um projeto associado.');
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch('/api/fruits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: fruitProjId,
          tipo: fruitTipo,
          classificacao: fruitClassificacao,
          titulo: fruitTitulo,
          linkUrl: fruitUrl
        })
      });
      if (res.ok) {
        alert('Produção registrada com sucesso!');
        setFruitTitulo('');
        setFruitUrl('');
        if (fruitTipo === 'PUBLICACAO') setFruitClassificacao('REVISTA_EXTERNA');
        else if (fruitTipo === 'PATENTE' || fruitTipo === 'SOFTWARE') setFruitClassificacao('NIT_IFAM');
        else if (fruitTipo === 'EVENTO') setFruitClassificacao('ORGANIZACAO_GRUPO');
        onRefresh();
      } else {
        alert('Erro ao registrar produção.');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const formatType = (tipo: string) => {
    if (tipo === 'PUBLICACAO') return 'Publicação';
    if (tipo === 'PATENTE') return 'Patente';
    if (tipo === 'SOFTWARE') return 'Software';
    if (tipo === 'EVENTO') return 'Evento';
    return tipo;
  };

  const formatClassificacao = (classif: string) => {
    const mapping: Record<string, string> = {
      REVISTA_EXTERNA: 'Revista Externa',
      REVISTA_IFAM: 'Revista do IFAM',
      NAO_PUBLICADO: 'Não Publicado',
      NIT_IFAM: 'Via NIT-IFAM',
      SERVIDOR_DIRETO: 'Registro/Depósito Direto',
      NAO_REGISTRADO: 'Registro Campus',
      ORGANIZACAO_GRUPO: 'Org. p/ Grupo',
      ORGANIZACAO_INSTITUCIONAL: 'Institucional (IFAM)',
      EVENTO_EXTERNO: 'Participação Externa'
    };
    return mapping[classif] || classif;
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '2rem' }}>
        
        {/* Add Fruit Form */}
        <form onSubmit={handleAddFruit} className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <PlusCircle size={20} style={{ color: 'var(--primary-color)' }} /> Registrar Produção / Produto de Pesquisa
          </h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Registre publicações científicas, patentes, softwares desenvolvidos ou eventos vinculados a projetos.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            
            {/* Select Project */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Projeto de Pesquisa Vinculado</label>
              <select 
                value={fruitProjId}
                onChange={(e) => setFruitProjId(e.target.value)}
                style={{ padding: '0.5rem', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '8px', fontSize: '0.85rem' }}
                required
              >
                <option value="">Selecione um projeto...</option>
                {projects
                  .filter(p => currentRole === 'PPGI' || currentRole === 'PROFESSOR' || p.campus === selectedCampus)
                  .map(p => (
                    <option key={p.id} value={p.id}>{p.codigo} - {p.titulo.slice(0, 55)}...</option>
                  ))}
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Tipo de Produção</label>
              <select 
                value={fruitTipo}
                onChange={(e) => {
                  const val = e.target.value;
                  setFruitTipo(val);
                  if (val === 'PUBLICACAO') setFruitClassificacao('REVISTA_EXTERNA');
                  else if (val === 'PATENTE' || val === 'SOFTWARE') setFruitClassificacao('NIT_IFAM');
                  else if (val === 'EVENTO') setFruitClassificacao('ORGANIZACAO_GRUPO');
                }}
                style={{ padding: '0.5rem', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '8px', fontSize: '0.85rem' }}
              >
                <option value="PUBLICACAO">Publicação Científica</option>
                <option value="PATENTE">Patente / Propriedade Intelectual</option>
                <option value="SOFTWARE">Software / Aplicativo Computacional</option>
                <option value="EVENTO">Evento Científico</option>
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Classificação / Canal</label>
              <select 
                value={fruitClassificacao}
                onChange={(e) => setFruitClassificacao(e.target.value)}
                style={{ padding: '0.5rem', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '8px', fontSize: '0.85rem' }}
              >
                {fruitTipo === 'PUBLICACAO' && (
                  <>
                    <option value="REVISTA_EXTERNA">Revista Externa</option>
                    <option value="REVISTA_IFAM">Revista IFAM</option>
                    <option value="NAO_PUBLICADO">Não Publicado</option>
                  </>
                )}
                {fruitTipo === 'PATENTE' && (
                  <>
                    <option value="NIT_IFAM">NIT IFAM</option>
                    <option value="SERVIDOR_DIRETO">Direto INPI</option>
                    <option value="NAO_REGISTRADO">Registro Campus</option>
                  </>
                )}
                {fruitTipo === 'SOFTWARE' && (
                  <>
                    <option value="NIT_IFAM">NIT IFAM</option>
                    <option value="SERVIDOR_DIRETO">Direto INPI</option>
                    <option value="NAO_REGISTRADO">Registro Campus</option>
                  </>
                )}
                {fruitTipo === 'EVENTO' && (
                  <>
                    <option value="ORGANIZACAO_GRUPO">Grupo Pesquisa</option>
                    <option value="ORGANIZACAO_INSTITUCIONAL">Campus IFAM</option>
                    <option value="EVENTO_EXTERNO">Evento Externo</option>
                  </>
                )}
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Título da Produção / Evento</label>
              <input 
                type="text" 
                required
                placeholder="Ex: Desenvolvimento de App de Monitoramento Climático"
                value={fruitTitulo}
                onChange={(e) => setFruitTitulo(e.target.value)}
                style={{ padding: '0.5rem', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '8px', fontSize: '0.85rem' }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>URL da Publicação / DOI / Link Repositório / Link Evento</label>
              <input 
                type="url" 
                placeholder="https://doi.org/10.1234/5678"
                value={fruitUrl}
                onChange={(e) => setFruitUrl(e.target.value)}
                style={{ padding: '0.5rem', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '8px', fontSize: '0.85rem' }}
              />
            </div>
          </div>

          <button type="submit" className="btn-primary" style={{ alignSelf: 'flex-start' }} disabled={isLoading}>
            {isLoading ? 'Registrando...' : 'Registrar Produto'}
          </button>
        </form>

        {/* List of Registered Fruits */}
        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)' }}>Produtos de Pesquisa Homologados</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '450px', overflowY: 'auto' }}>
            {fruits.map((fr, idx) => {
              const proj = projects.find(p => p.id === fr.projectId);
              return (
                <div key={idx} style={{ padding: '0.85rem', border: '1px solid rgba(0,0,0,0.06)', borderRadius: '12px', background: 'rgba(0,0,0,0.01)', borderLeft: '4px solid var(--primary-color)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.25rem' }}>
                    <div style={{ display: 'flex', gap: '0.35rem' }}>
                      <span className="badge" style={{ background: 'rgba(21,128,61,0.08)', color: 'var(--primary-color)', fontSize: '0.65rem' }}>
                        {formatType(fr.tipo)}
                      </span>
                      <span className="badge" style={{ background: 'rgba(59,130,246,0.08)', color: '#2563eb', fontSize: '0.65rem' }}>
                        {formatClassificacao(fr.classificacao)}
                      </span>
                    </div>
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                      {new Date(fr.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <strong style={{ fontSize: '0.85rem', color: 'var(--text-primary)', display: 'block' }}>{fr.titulo}</strong>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginTop: '0.25rem' }}>
                    Vínculo: {proj?.codigo} - {proj?.orientador}
                  </span>
                  {fr.linkUrl && (
                    <a href={fr.linkUrl} target="_blank" rel="noreferrer" style={{ fontSize: '0.75rem', color: 'var(--primary-color)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.5rem' }}>
                      Acessar link externo <ExternalLink size={12} />
                    </a>
                  )}
                </div>
              );
            })}
            {fruits.length === 0 && (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                Nenhum produto acadêmico registrado.
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
