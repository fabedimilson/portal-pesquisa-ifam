const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf-8');

// 1. Add import
content = content.replace(
  "import FrequenciesModule from './components/FrequenciesModule';",
  "import FrequenciesModule from './components/FrequenciesModule';\nimport SubstitutionsModule from './components/SubstitutionsModule';"
);

// 2. Remove states
const statesToRemove = [
  "  const [selectedSubProjId, setSelectedSubProjId] = useState<string>('');",
  "  const [subJustificativa, setSubJustificativa] = useState<string>('');",
  "  const [subSainteName, setSubSainteName] = useState<string>('');",
  "  const [subEntranteName, setSubEntranteName] = useState<string>('');",
  "  const [subRelatorioParcial, setSubRelatorioParcial] = useState<boolean>(false);",
  "  const [subProjectSearch, setSubProjectSearch] = useState<string>('');",
];
statesToRemove.forEach(state => {
  content = content.replace(state + '\n', '');
});

// Remove function handleCreateSubstitution
content = content.replace(/  \/\/ Process substitution[\s\S]*?finally \{\s*setIsLoading\(false\);\s*\}\s*\};\n/, '');

// Replace JSX
const jsxRegex = /\{\/\* SUBSTITUTIONS TAB \*\/\}[\s\S]*?\{\/\* GROUPS TAB \*\/\}/;
const newJsx = `{/* SUBSTITUTIONS TAB */}
        {activeTab === 'substitutions' && (
          <SubstitutionsModule 
            projects={projects}
            substitutions={substitutions}
            currentRole={currentRole}
            selectedCampus={selectedCampus}
            onRefresh={loadData}
          />
        )}

        {/* GROUPS TAB */}`;

content = content.replace(jsxRegex, newJsx);

fs.writeFileSync('src/App.tsx', content);
console.log('App.tsx updated successfully');
