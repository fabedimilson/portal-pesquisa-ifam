const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf-8');

// 1. Add import
content = content.replace(
  "import FruitsModule from './components/FruitsModule';",
  "import FruitsModule from './components/FruitsModule';\nimport CertificatesModule from './components/CertificatesModule';"
);

// 2. Remove states
const statesToRemove = [
  "  const [certProjId, setCertProjId] = useState<string>('');",
  "  const [certStudentName, setCertStudentName] = useState<string>('');",
  "  const [certRole, setCertRole] = useState<string>('BOLSISTA');",
  "  const [certHours, setCertHours] = useState<number>(400);",
  "  const [activeCertForView, setActiveCertForView] = useState<Certificate | null>(null);",
  "  const [certProjectSearch, setCertProjectSearch] = useState<string>('');",
];
statesToRemove.forEach(state => {
  content = content.replace(state + '\n', '');
});

// Remove handleCreateCertificate
content = content.replace(/  \/\/ Issue digital certificate[\s\S]*?finally \{\s*setIsLoading\(false\);\s*\}\s*\};\n/, '');

// Replace JSX
const jsxRegex = /\{\/\* CERTIFICATES TAB \*\/\}[\s\S]*?\{\/\* PAYMENT LOTS TAB \*\/\}/;
const newJsx = `{/* CERTIFICATES TAB */}
        {activeTab === 'certificates' && (
          <CertificatesModule 
            projects={projects}
            certificates={certificates}
            currentRole={currentRole}
            selectedCampus={selectedCampus}
            onRefresh={loadData}
          />
        )}

        {/* PAYMENT LOTS TAB */}`;

content = content.replace(jsxRegex, newJsx);

fs.writeFileSync('src/App.tsx', content);
console.log('App.tsx updated successfully for Certificates');
