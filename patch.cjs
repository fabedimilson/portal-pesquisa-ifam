const fs = require('fs');

let code = fs.readFileSync('src/App.tsx', 'utf8');

// Inject imports
if (!code.includes('EditaisModule')) {
  code = code.replace(
    "import React, { useState, useEffect } from 'react';", 
    "import React, { useState, useEffect } from 'react';\nimport EditaisModule from './components/EditaisModule';\nimport AvaliacaoModule from './components/AvaliacaoModule';"
  );
}

// Inject types
code = code.replace(
  /const \[activeTab, setActiveTab\] = useState<'dashboard'(.*?)>\('dashboard'\);/,
  "const [activeTab, setActiveTab] = useState<'dashboard'$1 | 'editais' | 'avaliacao'>('dashboard');"
);

// Inject buttons right after "Buscador de Projetos"
const btnRegex = /<button onClick=\{\(\) => setActiveTab\('projects'\)\}(.*?)>\s*<Search className=(.*?)\/>\s*<span>Buscador de Projetos<\/span>\s*<\/button>/;
const editaisBtn = `
          <button onClick={() => setActiveTab('editais')} className={\`tab-btn \${activeTab === 'editais' ? 'active' : ''}\`} style={{ width: '100%', justifyContent: 'flex-start' }}>
            <FileText className="w-5 h-5 flex-shrink-0" />
            <span>Gestão de Editais</span>
          </button>
          <button onClick={() => setActiveTab('avaliacao')} className={\`tab-btn \${activeTab === 'avaliacao' ? 'active' : ''}\`} style={{ width: '100%', justifyContent: 'flex-start' }}>
            <Award className="w-5 h-5 flex-shrink-0" />
            <span>Comitê de Avaliação</span>
          </button>
`;
if (!code.includes("setActiveTab('editais')")) {
  code = code.replace(btnRegex, `$& \n ${editaisBtn}`);
}

// Inject Headers
const headerRegex = /\{activeTab === 'dashboard' && 'Dashboard Executivo da Pesquisa'\}/;
const headers = `$& \n              {activeTab === 'editais' && 'Gestão de Editais (Reitoria)'}\n              {activeTab === 'avaliacao' && 'Avaliação de Projetos (Comitê)'}`;
if (!code.includes("Gestão de Editais (Reitoria)")) {
  code = code.replace(headerRegex, headers);
}

// Inject Modules into render block
const renderRegex = /\{activeTab === 'dashboard' && \(\s*<Dashboard \/>\s*\)\}/;
const renderModules = `$& \n        {activeTab === 'editais' && <EditaisModule />} \n        {activeTab === 'avaliacao' && <AvaliacaoModule />}`;
if (!code.includes("<EditaisModule />")) {
  code = code.replace(renderRegex, renderModules);
}

// Add tabs to roles
code = code.replace(
  /const adminTabs = \['dashboard', /,
  "const adminTabs = ['dashboard', 'editais', 'avaliacao', "
);

fs.writeFileSync('src/App.tsx', code);
console.log('App.tsx patched successfully.');
