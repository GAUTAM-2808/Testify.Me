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
    // 1. Try to fetch from your json-server
    const response = await fetch("http://localhost:3000/questions");
    
    if (!response.ok) {
      throw new Error("Server not responding");
    }

    // 2. Load the questions from your JSON file
    questions = await response.json();
    console.log("Success! Loaded " + questions.length + " questions from JSON.");

  } catch (error) {
    console.error("Error loading JSON file. Using fallback questions instead.", error);
    
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

document.getElementById("startBtn").addEventListener("click", () => {
  homeScreen.classList.remove("active-flex");
  homeScreen.classList.add("hidden");
  
  quizScreen.classList.remove("hidden");
  quizScreen.classList.add("active-flex");
  loadQuestion();
});

function loadQuestion() {
  const q = questions[current];
  document.getElementById("questionText").innerText = q.question;
  
  const codeDisplay = document.getElementById("codeDisplay");
  const codeSnippet = document.getElementById("codeSnippet");
  
  if (q.code) {
    codeDisplay.classList.remove("hidden");
    codeSnippet.innerText = q.code;
  } else {
    codeDisplay.classList.add("hidden");
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

document.getElementById("nextBtn").addEventListener("click", () => {
  current++;
  if (current < questions.length) {
    loadQuestion();
  } else {
    alert("System Check Complete. All sectors verified.");
    location.reload();
  }
});