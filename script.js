const roles = {
  "Frontend Developer": ["html","css","javascript","react"],
  "Backend Developer": ["node","express","mongodb","api"],
  "Data Analyst": ["python","sql","excel","power bi"]
};

const skillsList = ["html","css","javascript","react","node","express","mongodb","python","sql","excel","power bi","api"];

let extractedText = "";

// PDF Reader
document.getElementById("pdfUpload")?.addEventListener("change", async function(e){
  const file = e.target.files[0];
  const reader = new FileReader();

  reader.onload = async function(){
    const pdf = await pdfjsLib.getDocument(new Uint8Array(this.result)).promise;
    let text = "";

    for(let i=1;i<=pdf.numPages;i++){
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      content.items.forEach(item => text += item.str + " ");
    }

    extractedText = text.toLowerCase();
    alert("PDF Loaded");
  };

  reader.readAsArrayBuffer(file);
});

// Extract Skills
function extractSkills(text){
  return skillsList.filter(skill => text.includes(skill));
}

// Score
function calculateScore(profile, matched, missing){
  let score = (matched.length/(matched.length+missing.length))*60;
  if(profile.name) score+=10;
  if(profile.email) score+=10;
  if(profile.phone) score+=10;
  if(profile.education) score+=10;
  return Math.round(score);
}

// Navigation
function goToResult(){
  const profile = {
    name: document.getElementById("name").value,
    email: document.getElementById("email").value,
    phone: document.getElementById("phone").value,
    education: document.getElementById("education").value,
    resume: (document.getElementById("resume").value + " " + extractedText).toLowerCase(),
    role: document.getElementById("role").value
  };

  localStorage.setItem("profile", JSON.stringify(profile));
  window.location.href="result.html";
}

function goBack(){
  window.location.href="index.html";
}

// Result Page
if(window.location.pathname.includes("result.html")){
  const profile = JSON.parse(localStorage.getItem("profile"));
  const required = roles[profile.role];
  const userSkills = extractSkills(profile.resume);

  let matched=[], missing=[];

  required.forEach(skill=>{
    if(userSkills.includes(skill)) matched.push(skill);
    else missing.push(skill);
  });

  const percent = Math.round((matched.length/required.length)*100);
  const score = calculateScore(profile, matched, missing);

  document.getElementById("userInfo").innerHTML = `<b>${profile.name}</b><br>${profile.role}`;
  document.getElementById("score").innerText = "Score: "+score+"/100";
  document.getElementById("progress").style.width = percent+"%";
  document.getElementById("percent").innerText = percent+"% Ready";

  matched.forEach(s=>document.getElementById("matched").innerHTML+=`<li>✅ ${s}</li>`);
  missing.forEach(s=>document.getElementById("missing").innerHTML+=`<li>❌ ${s}</li>`);

  // Feedback
  document.getElementById("feedbackBox").innerText =
    "Improve missing skills: "+missing.join(", ");

  // Personalized
  document.getElementById("personalizedBox").innerText =
    "Focus on "+profile.role+" skills and build projects.";

  // Chart
  const ctx = document.getElementById("skillChart").getContext("2d");
  ctx.fillStyle="#00ffcc";
  ctx.fillRect(80,300-matched.length*40,100,matched.length*40);
  ctx.fillStyle="#ff6b6b";
  ctx.fillRect(220,300-missing.length*40,100,missing.length*40);

}

// Chatbot
function sendMessage(){
  const input=document.getElementById("userInput");
  const msg=input.value.toLowerCase();
  if(!msg) return;

  addMessage(msg,"user");
  addMessage(generateResponse(msg),"bot");
  input.value="";
}

function addMessage(text,type){
  const box=document.getElementById("chatBox");
  const div=document.createElement("div");
  div.className=type;
  div.innerText=text;
  box.appendChild(div);
}

function generateResponse(msg){
  if(msg.includes("resume")) return "Add projects and skills.";
  if(msg.includes("job")) return "Apply with strong portfolio.";
  if(msg.includes("skills")) return "Focus on trending tech.";
  return "Ask about resume, jobs or skills 😊";
}