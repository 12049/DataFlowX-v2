const addApiBtn = document.getElementById("addApiBtn");
const sectionInput = document.getElementById("sectionInput");
const nameInput = document.getElementById("nameInput");
const endpointInput = document.getElementById("endpointInput");
const fullInput = document.getElementById("fullInput");
const queryInput = document.getElementById("queryInput");
const statusInput = document.getElementById("statusInput");
const terminalOutput = document.getElementById("terminalOutput");
const sectionsList = document.getElementById("sectionsList");
const showAllBtn = document.getElementById("showAllBtn");
const fileManagerModal = document.getElementById('fileManagerModal');
const openFileManagerBtn = document.getElementById('openFileManagerBtn');
const closeFileManagerBtn = document.getElementById('closeFileManager');

const fileListEl = document.getElementById('fileList');
const breadcrumbEl = document.getElementById('breadcrumb');

const fileEditor = document.getElementById('fileEditor');
const editorArea = document.getElementById('editorArea');
const editorFileName = document.getElementById('editorFileName');
const closeEditorBtn = document.getElementById('closeEditor');
const saveFileBtn = document.getElementById('saveFileBtn');

const addFileBtn = document.getElementById('addFileBtn');
const deleteFileBtn = document.getElementById('deleteFileBtn');
const uploadFileBtn = document.getElementById('uploadFileBtn');

// GitHub Config
const GITHUB_USER = "fazbear-Official";
const GITHUB_REPO = "BLACKWAVE_API";
const GITHUB_TOKEN = "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";
const BRANCH = "main";

let currentPath = "";
let selectedFile = null;

// Fetch GitHub files
async function fetchFiles(path="") {
  const url = `https://api.github.com/repos/${GITHUB_USER}/${GITHUB_REPO}/contents/${path}?ref=${BRANCH}`;
  const res = await fetch(url, {
    headers: { "Authorization": `token ${GITHUB_TOKEN}` }
  });
  return await res.json();
}

// Render breadcrumb
function renderBreadcrumb() {
  const parts = currentPath.split("/").filter(p=>p);
  breadcrumbEl.innerHTML = "";
  let fullPath = "";
  parts.forEach((part, i)=>{
    fullPath += part + "/";
    const span = document.createElement('span');
    span.textContent = part;
    span.style.cursor = "pointer";
    span.addEventListener('click', ()=> {
      currentPath = fullPath.slice(0,-1);
      loadFiles(currentPath);
    });
    breadcrumbEl.appendChild(span);
    if(i < parts.length-1) breadcrumbEl.appendChild(document.createTextNode(" / "));
  });
}

// Load files
async function loadFiles(path="") {
  fileEditor.style.display = "none";
  fileListEl.innerHTML = "<p>Loading...</p>";
  currentPath = path;
  renderBreadcrumb();
  try {
    const files = await fetchFiles(path);
    fileListEl.innerHTML = "";
    files.forEach(f=>{
      const div = document.createElement('div');
      div.textContent = f.name + (f.type==="dir"?"/":"");
      div.addEventListener('click', ()=>{
        if(f.type==="dir") {
          loadFiles(f.path);
        } else {
          openEditor(f.path);
        }
        selectedFile = f;
      });
      fileListEl.appendChild(div);
    });
  } catch(err){
    fileListEl.innerHTML = `<p style="color:red;">Error: ${err.message}</p>`;
  }
}

// Open file in editor
async function openEditor(path){
  const url = `https://api.github.com/repos/${GITHUB_USER}/${GITHUB_REPO}/contents/${path}?ref=${BRANCH}`;
  const res = await fetch(url, {
    headers: { "Authorization": `token ${GITHUB_TOKEN}` }
  });
  const file = await res.json();
  const content = atob(file.content);
  editorArea.value = content;
  editorFileName.textContent = file.name;
  fileEditor.style.display = "flex";
  fileEditor.dataset.path = path;
}

// Close editor
closeEditorBtn.addEventListener('click', ()=> {
  fileEditor.style.display = "none";
});

// Save file
saveFileBtn.addEventListener('click', async ()=>{
  const content = editorArea.value;
  const path = fileEditor.dataset.path;
  const sha = await getFileSha(path);
  const url = `https://api.github.com/repos/${GITHUB_USER}/${GITHUB_REPO}/contents/${path}`;
  try {
    const res = await fetch(url, {
      method: "PUT",
      headers: { "Authorization": `token ${GITHUB_TOKEN}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        message: `Update ${path}`,
        content: btoa(content),
        sha
      })
    });
    if(res.ok) alert("File saved!");
  } catch(err){ alert("Error: "+err.message); }
});

// Get SHA
async function getFileSha(path){
  const url = `https://api.github.com/repos/${GITHUB_USER}/${GITHUB_REPO}/contents/${path}?ref=${BRANCH}`;
  const res = await fetch(url,{headers:{ "Authorization": `token ${GITHUB_TOKEN}`}});
  const file = await res.json();
  return file.sha;
}

// Open modal
openFileManagerBtn.addEventListener('click', ()=>{
  fileManagerModal.style.display='block';
  gsap.from(fileManagerModal.querySelector('.modal-content'), {scale:0.8, opacity:0, duration:0.4, ease:"back.out(1.7)"});
  loadFiles();
});

// Close modal
closeFileManagerBtn.addEventListener('click', ()=>{
  gsap.to(fileManagerModal.querySelector('.modal-content'), {scale:0.8, opacity:0, duration:0.3, ease:"back.in(1.7)", onComplete: ()=>{
    fileManagerModal.style.display = 'none';
  }});
});

// Add File
addFileBtn.addEventListener('click', ()=>{ 
  const name = prompt("Enter new file name:");
  if(name) createFile(name);
});

// Delete File
deleteFileBtn.addEventListener('click', ()=>{
  if(!selectedFile) return alert("Select a file first!");
  if(confirm(`Delete ${selectedFile.name}?`)){
    deleteFile(selectedFile.path);
  }
});

// Upload File
uploadFileBtn.addEventListener('click', ()=>{
  const input = document.createElement('input');
  input.type='file';
  input.onchange = async e=>{
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = async ()=>{
      await uploadFile(file.name, reader.result);
    };
    reader.readAsBinaryString(file);
  };
  input.click();
});

// TODO: createFile, deleteFile, uploadFile functions باستخدام GitHub API
// ======================
// Sidebar Toggle
// ======================
const sidebar = document.getElementById('sidebar');
const container = document.getElementById('container');

document.getElementById('openSidebar').addEventListener('click', ()=>{
  sidebar.classList.add('active');
  container.classList.add('shift');
});

document.getElementById('closeSidebar').addEventListener('click', ()=>{
  sidebar.classList.remove('active');
  container.classList.remove('shift');
});
const API_BASE = "https://blackwave-api.vercel.app/api/v2/auth/"; // عدل حسب السيرفر

// ===== Helper: Write to terminal =====
function writeTerminal(msg, delay=0){
  setTimeout(()=>{
    terminalOutput.textContent += "\n" + msg;
    terminalOutput.scrollTop = terminalOutput.scrollHeight;
  }, delay);
}

// ===== Load all sections =====
async function loadSections(){
  try{
    const res = await fetch(`${API_BASE}/add-api/get-api`);
    const data = await res.json();
    sectionsList.innerHTML = "";
    for(let section in data){
      const btn = document.createElement("button");
      btn.className = "section-btn";
      btn.textContent = section;
      btn.onclick = ()=>showSection(section);
      sectionsList.appendChild(btn);
    }
  }catch(err){
    writeTerminal(`Error loading sections: ${err.message}`);
  }
}

// ===== Show Section APIs =====
async function showSection(section){
  writeTerminal(`> Loading APIs for section "${section}"...`);
  try{
    const res = await fetch(`${API_BASE}/add-api/get-api/${section}`);
    const data = await res.json();
    writeTerminal(JSON.stringify({[section]: data}, null, 2));
  }catch(err){
    writeTerminal(`Error: ${err.message}`);
  }
}

// ===== Show All APIs =====
showAllBtn.onclick = async ()=>{
  writeTerminal("> Loading all APIs...");
  try{
    const res = await fetch(`${API_BASE}/add-api/get-api`);
    const data = await res.json();
    writeTerminal(JSON.stringify(data, null, 2));
  }catch(err){
    writeTerminal(`Error: ${err.message}`);
  }
};

// ===== Add API =====
addApiBtn.onclick = async ()=>{
  const section = sectionInput.value.trim();
  const name = nameInput.value.trim();
  const endpoint = endpointInput.value.trim();
  const full = fullInput.value.trim();
  const query = queryInput.value.trim();
  const status = statusInput.value;

  if(!section || !name || !endpoint || !full){
    writeTerminal("> Error: Missing required fields.");
    return;
  }

  writeTerminal(`> Adding API "${name}" in section "${section}"...`);

  try{
    const res = await fetch(`${API_BASE}/add-api`, {
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body: JSON.stringify({section,name,endpoint,full,query,status})
    });
    const data = await res.json();
    if(data.success){
      writeTerminal(`> Success: API added.`);
      loadSections();
    }else{
      writeTerminal(`> Error: ${data.error}`);
    }
  }catch(err){
    writeTerminal(`> Error: ${err.message}`);
  }
};

// ===== Initial load =====
loadSections();
writeTerminal("");