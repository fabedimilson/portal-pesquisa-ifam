const fs = require('fs');
const path = require('path');

const filepath = path.join(__dirname, '..', 'src', 'App.tsx');
let content = fs.readFileSync(filepath, 'utf8');

const startMarker = "{activeTab === 'triagem' && (\n          <div className=\"animate-fade-in\"";
const startIdx = content.indexOf(startMarker);

if (startIdx === -1) {
  console.error("Error: Could not find start of the triagem block.");
  process.exit(1);
}

const nextTabMarker = "{/* FREQUENCIES TAB */}";
const nextTabIdx = content.indexOf(nextTabMarker, startIdx);

if (nextTabIdx === -1) {
  console.error("Error: Could not find the frequencies tab marker.");
  process.exit(1);
}

// Find the last closing brace before next tab
const blockEndIdx = content.lastIndexOf(')}', nextTabIdx);

if (blockEndIdx === -1 || blockEndIdx < startIdx) {
  console.error("Error: Could not find closing brace of the triagem block.");
  process.exit(1);
}

const finalEndIdx = blockEndIdx + 2;

console.log(`Found triagem block from index ${startIdx} to ${finalEndIdx}`);
console.log("Replaced block preview:");
console.log(content.substring(startIdx, startIdx + 100));
console.log("...");
console.log(content.substring(finalEndIdx - 100, finalEndIdx));

const replacement = `{activeTab === 'triagem' && (
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
        )}`;

const newContent = content.substring(0, startIdx) + replacement + content.substring(finalEndIdx);
fs.writeFileSync(filepath, newContent, 'utf8');
console.log("Replacement successful!");
