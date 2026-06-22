const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf-8');

// 1. Add import
content = content.replace(
  "import SubstitutionsModule from './components/SubstitutionsModule';",
  "import SubstitutionsModule from './components/SubstitutionsModule';\nimport FruitsModule from './components/FruitsModule';"
);

// 2. Remove states
const statesToRemove = [
  "  const [fruitProjId, setFruitProjId] = useState<string>('');",
  "  const [fruitTipo, setFruitTipo] = useState<string>('PUBLICACAO');",
  "  const [fruitClassificacao, setFruitClassificacao] = useState<string>('REVISTA_EXTERNA');",
  "  const [fruitTitulo, setFruitTitulo] = useState<string>('');",
  "  const [fruitUrl, setFruitUrl] = useState<string>('');",
];
statesToRemove.forEach(state => {
  content = content.replace(state + '\n', '');
});

// Remove handleAddFruit
content = content.replace(/  \/\/ Register a fruit[\s\S]*?finally \{\s*setIsLoading\(false\);\s*\}\s*\};\n/, '');

// Replace JSX
const jsxRegex = /\{\/\* FRUITS TAB \*\/\}[\s\S]*?\{\/\* CERTIFICATES TAB \*\/\}/;
const newJsx = `{/* FRUITS TAB */}
        {activeTab === 'fruits' && (
          <FruitsModule 
            projects={projects}
            fruits={fruits}
            currentRole={currentRole}
            selectedCampus={selectedCampus}
            onRefresh={loadData}
          />
        )}

        {/* CERTIFICATES TAB */}`;

content = content.replace(jsxRegex, newJsx);

fs.writeFileSync('src/App.tsx', content);
console.log('App.tsx updated successfully for Fruits');
