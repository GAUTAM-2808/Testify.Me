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
    const url = "http://localhost:3000/questions";
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
      console.log(e);
    }

    // 3. Fallback (This only runs if your json-server is OFF)
    questions = [
      {
        question: "Analyze the following Python code. What is the output?",
        promptCode: "x = [1, 2, 3]\ny = x\ny.append(4)\nprint(x)",
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

  // Show the read-only snippet ONLY if the question provides code to analyze
  if (q.promptCode) {
    codeDisplay.classList.remove("hidden");
    codeSnippet.innerText = q.promptCode;
  } else {
    codeDisplay.classList.add("hidden");
  }

  // Show the code runner section if there are ANY coding aspects
  if (q.promptCode || q.solutionCode) {
    codeRunner.classList.remove("hidden");
    codeOutput.classList.add("hidden");
    codeOutput.innerText = "";
  } else {
    codeRunner.classList.add("hidden");
  }

  const progress = ((current + 1) / questions.length) * 100;
  document.getElementById("progressBar").style.width = progress + "%";
  document.getElementById("questionNumber").innerText = `Question ${current + 1}`;

  document.getElementById("answerBox").value = "";
  document.getElementById("correctAnswer").classList.add("hidden");
}

document.getElementById("doneBtn").addEventListener("click", () => {
  const ans = document.getElementById("correctAnswer");
  let revealText = "Target Output: " + questions[current].answer;
  if (questions[current].solutionCode) {
    revealText += "\n\nActual Code Solution:\n" + questions[current].solutionCode;
  }
  ans.innerText = revealText;
  ans.classList.remove("hidden");
  ans.style.display = "block";
});

document.getElementById("runCodeBtn").addEventListener("click", () => {
  const codeOutput = document.getElementById("codeOutput");
  const runBtn = document.getElementById("runCodeBtn");

  // Show loading state
  runBtn.innerText = "⚡ Running...";
  runBtn.disabled = true;

  // Get the code from the user's input, NOT the preset question code
  const code = document.getElementById("answerBox").value;

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
    let line = lines[i];

    // Skip empty lines purely
    if (line.trim().length === 0) continue;

    // Remove comments
    if (line.includes('#')) {
      line = line.split('#')[0];
    }
    line = line.trim();

    if (line.startsWith('print(')) {
      // Handle print statements
      const content = line.slice(6, -1).trim(); // Remove print( and )

      // Handle simple list outputs like print(x) where x = [1, 2, 3, 4]
      if (variables[content] !== undefined) {
        if (Array.isArray(variables[content])) {
          output += '[' + variables[content].join(', ') + ']\n';
        } else {
          output += variables[content] + '\n';
        }
      }
      else if (content.startsWith('"') || content.startsWith("'")) {
        // String literal
        output += content.slice(1, -1) + '\n';
      } else if (!isNaN(content)) {
        // Number
        output += content + '\n';
      } else {
        // Handle array index access like fruits[1] before math
        const arrayMatch = content.match(/^(\w+)\[(\d+)\]$/);
        if (arrayMatch) {
          const arrName = arrayMatch[1];
          const arrIdx = parseInt(arrayMatch[2]);
          if (Array.isArray(variables[arrName]) && variables[arrName].length > arrIdx) {
            let val = variables[arrName][arrIdx];
            // Strip literal quotes if they got kept in the array list
            if (typeof val === 'string') {
              if (val.startsWith("'") && val.endsWith("'")) val = val.slice(1, -1);
              if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
            }
            output += val + '\n';
            continue;
          }
        }

        // If it's a math expression like x + y, evaluate it
        let expr = content;

        // Replace known variables in the expression with their actual values
        for (const [key, val] of Object.entries(variables)) {
          // Use regex to match whole words only to avoid partial matches
          const regex = new RegExp(`\\b${key}\\b`, 'g');

          let replacementVal = val;
          if (Array.isArray(val)) {
            replacementVal = JSON.stringify(val);
          } else if (typeof val === 'string') {
            replacementVal = `"${val}"`;
          }

          expr = expr.replace(regex, replacementVal);
        }

        try {
          // WARNING: eval is used here ONLY for this local simple mock execution
          // In a real app never use eval like this.
          const res = eval(expr);
          output += res + '\n';
        } catch (e) {
          // Fallback if not an expression and not a known variable
          output += content + '\n'; // fallback to just printing the raw content
        }
      }
    } else if (line.includes('=')) {
      // Variable assignment (very basic)
      const [varName, ...valueParts] = line.split('=').map(s => s.trim());
      const value = valueParts.join('=').trim();

      if (value.startsWith('"') || value.startsWith("'")) {
        variables[varName] = value.slice(1, -1);
      } else if (!isNaN(value)) {
        variables[varName] = parseFloat(value);
      } else if (value.startsWith('[') && value.endsWith(']')) {
        // Simple list parsing
        variables[varName] = value.slice(1, -1).split(',').map(s => s.trim());
      } else {
        const otherVar = variables[value];
        if (otherVar !== undefined) {
          // array clone vs primitive copy
          variables[varName] = Array.isArray(otherVar) ? [...otherVar] : otherVar;
        }
      }
    } else if (line.includes('.append(')) {
      // Handle basic list appends like y.append(4)
      const match = line.match(/(\w+)\.append\((.*?)\)/);
      if (match) {
        const varName = match[1];
        let val = match[2];
        if (val.startsWith('"') || val.startsWith("'")) {
          val = val.slice(1, -1);
        } else if (!isNaN(val)) {
          val = parseFloat(val);
        }

        if (Array.isArray(variables[varName])) {
          variables[varName].push(val);
        }
      }
    } else if (line.startsWith('for ')) {
      // Handle basic for loops
      const match = line.match(/for (\w+) in range\((\d+)\):/);
      if (match) {
        const varName = match[1];
        const rangeNum = parseInt(match[2]);

        // Find indented block
        const blockStart = i + 1;
        let blockEnd = blockStart;
        for (let k = blockStart; k < lines.length; k++) {
          const nextLine = lines[k];
          if (nextLine.trim() === '') continue; // Skip empty lines inside the block

          const nextIndent = nextLine.length - nextLine.trimStart().length;
          // If indentation drops back to 0 (and it's not empty), the block is over
          if (nextIndent === 0) {
            break;
          }
          blockEnd = k;
        }

        const blockLines = lines.slice(blockStart, blockEnd + 1).map(l => l.trim());

        // Process indented block multiple times
        for (let j = 0; j < rangeNum; j++) {
          variables[varName] = j;

          for (const blockLine of blockLines) {
            if (blockLine.startsWith('print(')) {
              const content = blockLine.slice(6, -1).trim();
              let expr = content;

              for (const [key, val] of Object.entries(variables)) {
                const regex = new RegExp(`\\b${key}\\b`, 'g');
                expr = expr.replace(regex, typeof val === 'string' ? `"${val}"` : val);
              }

              try {
                const res = eval(expr);
                output += res + '\n';
              } catch (e) {
                output += content + '\n';
              }
            }
          }
        }

        // Advance the outer loop iterator `i` past the processed block
        i = blockEnd;
      }
    }
  }

  return output.trim() || 'Code executed successfully (no output)';
}

document.getElementById("nextBtn").addEventListener("click", () => {
  const answerValue = document.getElementById("answerBox").value.trim();
  if (answerValue === "") {
    alert("Please type at least one word in the answer box before proceeding.");
    return;
  }

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