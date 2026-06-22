import re

filepath = "src/App.tsx"

with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

# Define the start and end search markers for the triagem block
start_marker = "{activeTab === 'triagem' && ("
end_marker = "        {/* FREQUENCIES TAB */}"

# Let's locate the triagem block.
# There are two occurrences of `{activeTab === 'triagem' && (`:
# 1) Line 2140: {activeTab === 'triagem' && (currentRole === 'STUDENT' ? 'Triagem & Onboarding do Discente' : 'Perfil & Onboarding do Pesquisador')}
# 2) Line 2865: the main block we want to replace.
# Let's find the start of the main block by searching for the start_marker that occurs after the main routing section or has the specific style structure.
# More specifically, the main block starts with `{activeTab === 'triagem' && (\n          <div className="animate-fade-in"`
# Let's target that exactly.

target_pattern = r"\{\s*activeTab\s*===\s*'triagem'\s*&&\s*\(\s*<div\s+className=\"animate-fade-in\".*?\n\s*\)\s*\}"

# Let's find the text between `{activeTab === 'triagem' && (` and the matching closing parenthesis.
# Since the block is large and has nested parentheses/braces, we can search from the start marker:
# `{activeTab === 'triagem' && (` until we hit `\n        {/* FREQUENCIES TAB */}`.
# The content right before `\n        {/* FREQUENCIES TAB */}` should be the closing parenthesis/brace of the triagem block.

main_start_idx = content.find('{activeTab === \'triagem\' && (\n          <div className="animate-fade-in"')
if main_start_idx == -1:
    # Try different whitespace
    main_start_idx = content.find('{activeTab === \'triagem\' && (')
    # Make sure it's the one followed by the div
    while main_start_idx != -1:
        snippet = content[main_start_idx:main_start_idx+100]
        if 'animate-fade-in' in snippet:
            break
        main_start_idx = content.find('{activeTab === \'triagem\' && (', main_start_idx + 1)

if main_start_idx == -1:
    print("Error: Could not find start of the triagem block.")
    exit(1)

next_tab_idx = content.find("{/* FREQUENCIES TAB */}", main_start_idx)
if next_tab_idx == -1:
    print("Error: Could not find the frequencies tab marker.")
    exit(1)

# The triagem block ends before the frequencies tab. Let's find the closing brace.
# Let's backtrack from next_tab_idx to find the last closing parenthesis and brace ')}'
block_end_idx = content.rfind(')}', main_start_idx, next_tab_idx)
if block_end_idx == -1:
    print("Error: Could not find closing brace of the triagem block.")
    exit(1)

# We include the ')}' in the replaced content
block_end_idx += 2

print(f"Found triagem block from index {main_start_idx} to {block_end_idx}")
print("Block preview to replace:")
print(content[main_start_idx:main_start_idx+100])
print("...")
print(content[block_end_idx-100:block_end_idx])

# Replacement content
replacement = """{activeTab === 'triagem' && (
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
        )}"""

new_content = content[:main_start_idx] + replacement + content[block_end_idx:]

with open(filepath, "w", encoding="utf-8") as f:
    f.write(new_content)

print("Replacement successful!")
