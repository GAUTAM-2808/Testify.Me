// --- 1. Screen & Form Elements ---
const authScreen = document.getElementById("auth-screen");
const homeScreen = document.getElementById("home");
const quizScreen = document.getElementById("quiz");
const signupFields = document.getElementById("signup-fields");
const authForm = document.getElementById("auth-form");

// --- 2. Tab & Auth Logic ---
const loginTab = document.getElementById("loginTab");
const signupTab = document.getElementById("signupTab");
const authSubmitBtn = authForm.querySelector(".main-btn");

// Toggle to Login Mode
loginTab.addEventListener("click", () => {
    loginTab.classList.add("active");
    signupTab.classList.remove("active");
    signupFields.classList.add("hidden");
    authSubmitBtn.innerText = "Enter Arena";
});

// Toggle to Signup Mode
signupTab.addEventListener("click", () => {
    signupTab.classList.add("active");
    loginTab.classList.remove("active");
    signupFields.classList.remove("hidden");
    authSubmitBtn.innerText = "Create Account";
});

// Handle Login/Signup Form Submission
authForm.addEventListener("submit", (e) => {
    e.preventDefault();
    
    // Transition from Auth to Home
    authScreen.classList.remove("active-flex");
    authScreen.classList.add("hidden");
    
    homeScreen.classList.remove("hidden");
    homeScreen.classList.add("active-flex");
});

// --- 3. Quiz Logic ---
let current = 0;
let questions = [];

async function fetchQuestions() {
  try {
    // 1. Try to fetch from your json-server (use relative path when UI+API are same origin)
    const url = "http://localhost:3001/questions";
    console.log("Fetching questions from", url);
    const response = await fetch(url, { cache: 'no-store' });

    if (!response.ok) {
      const text = await response.text().catch(() => '');
      throw new Error(`Server responded ${response.status}: ${text}`);
    }

    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      const text = await response.text().catch(() => '');
      throw new Error('API did not return JSON. Received: ' + text);
    }

    // 2. Load the questions from your JSON file
    const data = await response.json();
    // json-server returns an array at /questions; some setups may return { questions: [...] }
    if (Array.isArray(data)) {
      questions = data;
    } else if (data && Array.isArray(data.questions)) {
      questions = data.questions;
    } else {
      throw new Error('Unexpected JSON structure from API');
    }

    console.log('Success! Loaded', questions.length, 'questions from JSON.');

  } catch (error) {
    console.error("Error loading JSON file.", error);
    // expose error to the user in UI
    try {
      document.getElementById('questionText').innerText = 'Error loading questions: ' + error.message;
    } catch (e) {
      // ignore
    }
    
    // 3. Fallback (This only runs if your json-server is OFF)
    questions = [
      {
        question: "Analyze the following Python code. What is the output?",
        code: "x = [1, 2, 3]\ny = x\ny.append(4)\nprint(x)",
        answer: "[1, 2, 3, 4]"
      }
    ];
  }
}

// Preload questions when the page loads so UI can use them immediately
document.addEventListener('DOMContentLoaded', () => {
  fetchQuestions();
});

document.getElementById("startBtn").addEventListener("click", async () => {
  // ensure questions loaded before entering quiz
  if (questions.length === 0) await fetchQuestions();
  current = 0;

  homeScreen.classList.remove("active-flex");
  homeScreen.classList.add("hidden");
  
  quizScreen.classList.remove("hidden");
  quizScreen.classList.add("active-flex");
  loadQuestion();
});

function loadQuestion() {
  if (!questions || questions.length === 0) {
    document.getElementById("questionText").innerText = "No questions available.";
    document.getElementById("codeDisplay").classList.add("hidden");
    document.getElementById("codeRunner").classList.add("hidden");
    document.getElementById("answerBox").value = "";
    return;
  }

  const q = questions[current];
  document.getElementById("questionText").innerText = q.question;
  
  const codeDisplay = document.getElementById("codeDisplay");
  const codeSnippet = document.getElementById("codeSnippet");
  const codeRunner = document.getElementById("codeRunner");
  const codeOutput = document.getElementById("codeOutput");
  
  if (q.code) {
    codeDisplay.classList.remove("hidden");
    codeSnippet.innerText = q.code;
    codeRunner.classList.remove("hidden");
    codeOutput.classList.add("hidden");
    codeOutput.innerText = "";
  } else {
    codeDisplay.classList.add("hidden");
    codeRunner.classList.add("hidden");
  }

  const progress = ((current + 1) / questions.length) * 100;
  document.getElementById("progressBar").style.width = progress + "%";
  document.getElementById("questionNumber").innerText = `Step ${current + 1}`;
  
  document.getElementById("answerBox").value = "";
  document.getElementById("correctAnswer").classList.add("hidden");
}

document.getElementById("doneBtn").addEventListener("click", () => {
  const ans = document.getElementById("correctAnswer");
  ans.innerText = "Target Output: " + questions[current].answer;
  ans.classList.remove("hidden");
  ans.style.display = "block";
});

document.getElementById("runCodeBtn").addEventListener("click", () => {
  const codeOutput = document.getElementById("codeOutput");
  const runBtn = document.getElementById("runCodeBtn");
  
  // Show loading state
  runBtn.innerText = "⚡ Running...";
  runBtn.disabled = true;
  
  // Get the code from the current question
  const code = questions[current].code;
  
  // Simulate code execution (in a real app, you'd call an API)
  setTimeout(() => {
    try {
      const output = executePythonCode(code);
      codeOutput.innerText = output;
      codeOutput.classList.remove("error");
      codeOutput.classList.remove("hidden");
    } catch (error) {
      codeOutput.innerText = `Error: ${error.message}`;
      codeOutput.classList.add("error");
      codeOutput.classList.remove("hidden");
    }
    
    // Reset button
    runBtn.innerText = "🚀 Run Code";
    runBtn.disabled = false;
  }, 1000); // Simulate 1 second execution time
});

// Simple Python code execution simulator
function executePythonCode(code) {
  // This is a very basic simulator for demonstration
  // In a real application, use an API like JDoodle, Sphere Engine, or Pyodide
  
  const lines = code.split('\n');
  let output = '';
  let variables = {};
  let indentLevel = 0;
  
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i].trim();
    
    if (line.startsWith('print(')) {
      // Handle print statements
      const content = line.slice(6, -1); // Remove print( and )
      if (content.startsWith('"') || content.startsWith("'")) {
        // String literal
        output += content.slice(1, -1) + '\n';
      } else if (!isNaN(content)) {
        // Number
        output += content + '\n';
      } else if (variables[content] !== undefined) {
        // Variable
        output += variables[content] + '\n';
      } else {
        output += content + '\n';
      }
    } else if (line.includes('=')) {
      // Variable assignment (very basic)
      const [varName, value] = line.split('=').map(s => s.trim());
      if (value.startsWith('"') || value.startsWith("'")) {
        variables[varName] = value.slice(1, -1);
      } else if (!isNaN(value)) {
        variables[varName] = parseFloat(value);
      } else if (value.startsWith('[') && value.endsWith(']')) {
        // Simple list parsing
        variables[varName] = value.slice(1, -1).split(',').map(s => s.trim());
      }
    } else if (line.startsWith('for ')) {
      // Handle basic for loops
      const match = line.match(/for (\w+) in range\((\d+)\):/);
      if (match) {
        const varName = match[1];
        const rangeNum = parseInt(match[2]);
        indentLevel = 1;
        
        // Process indented block
        for (let j = 0; j < rangeNum; j++) {
          variables[varName] = j;
          
          // Look for the next indented line
          if (i + 1 < lines.length) {
            const nextLine = lines[i + 1];
            const nextIndent = nextLine.length - nextLine.trimStart().length;
            
            if (nextIndent >= 2) { // Assuming 2 spaces indentation
              const indentedLine = nextLine.trim();
              if (indentedLine.startsWith('print(')) {
                const content = indentedLine.slice(6, -1);
                if (content === varName) {
                  output += j + '\n';
                }
              }
            }
          }
        }
        indentLevel = 0;
      }
    }
  }
  
  return output.trim() || 'Code executed successfully (no output)';
}

document.getElementById("nextBtn").addEventListener("click", () => {
  current++;
  if (current < questions.length) {
    loadQuestion();
  } else {
    alert("System Check Complete. Returning to dashboard.");
    // Reset quiz state and return to home screen without reloading
    current = 0;
    quizScreen.classList.remove("active-flex");
    quizScreen.classList.add("hidden");

    homeScreen.classList.remove("hidden");
    homeScreen.classList.add("active-flex");
  }
});