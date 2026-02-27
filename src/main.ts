// Application state
let appState: {
  mode: 'select' | 'settings' | 'practice' | 'guess' | 'results';
  currentRound: number;
  totalRounds: number;
  numbers: number[];
  guess: number;
  correctAnswer: number;
  correctAnswers: number;
  rounds: number;
  numberCount: number;
  digitCount: number;
  allowNegative: boolean;
  allowDecimals: boolean;
  displayTime: number;
  practiceNumbers: number[];
  currentNumberIndex: number;
  timer: any;
} = {
  mode: 'select',
  currentRound: 0,
  totalRounds: 10,
  numbers: [],
  guess: 0,
  correctAnswer: 0,
  correctAnswers: 0,
  rounds: 10,
  numberCount: 5,
  digitCount: 2,
  allowNegative: true,
  allowDecimals: true,
  displayTime: 1,
  practiceNumbers: [],
  currentNumberIndex: 0,
  timer: null
};

// UI Elements
const modeSelection = document.getElementById('mode-selection')!;
const settingsScreen = document.getElementById('settings-screen')!;
const practiceScreen = document.getElementById('practice-screen')!;
const guessScreen = document.getElementById('guess-screen')!;
const resultsScreen = document.getElementById('results-screen')!;
const flashModeButton = document.getElementById('flash-mode-button')!;
const listeningModeButton = document.getElementById('listening-mode-button')!;
const startPracticeButton = document.getElementById('start-practice-button')!;
const nextNumberButton = document.getElementById('next-number-button')!;
const showAnswerButton = document.getElementById('show-answer-button')!;
const submitGuessButton = document.getElementById('submit-guess-button')!;
const restartButton = document.getElementById('restart-button')!;
const currentNumberElement = document.getElementById('current-number')!;
const roundNumberElement = document.getElementById('round-number')!;
const roundProgressElement = document.getElementById('round-progress')!;
const guessInputElement = document.getElementById('guess-input')! as HTMLInputElement;
const guessFeedbackElement = document.getElementById('guess-feedback')!;
const accuracyResultElement = document.getElementById('accuracy-result')!;
const performanceResultElement = document.getElementById('performance-result')!;

// Event Listeners
flashModeButton.addEventListener('click', () => startMode('flash'));
listeningModeButton.addEventListener('click', () => startMode('listening'));
startPracticeButton.addEventListener('click', startPractice);
nextNumberButton.addEventListener('click', showNextNumber);
showAnswerButton.addEventListener('click', showAnswer);
submitGuessButton.addEventListener('click', submitGuess);
restartButton.addEventListener('click', restartApp);

// Start the app in mode selection
window.addEventListener("DOMContentLoaded", () => {
  modeSelection.style.display = 'block';
});

function startMode(_mode: string) {
  appState.mode = 'settings';
  modeSelection.style.display = 'none';
  settingsScreen.style.display = 'block';
}

function startPractice() {
  // Read settings
  appState.rounds = parseInt((document.getElementById('rounds') as HTMLSelectElement).value);
  appState.numberCount = parseInt((document.getElementById('number-count') as HTMLInputElement).value);
  appState.digitCount = parseInt((document.getElementById('digit-count') as HTMLInputElement).value);
  appState.allowNegative = (document.getElementById('allow-negative') as HTMLInputElement).checked;
  appState.allowDecimals = (document.getElementById('allow-decimals') as HTMLInputElement).checked;
  appState.displayTime = parseFloat((document.getElementById('display-time') as HTMLInputElement).value);
  
  appState.mode = 'practice';
  settingsScreen.style.display = 'none';
  practiceScreen.style.display = 'block';
  appState.currentRound = 0;
  appState.correctAnswers = 0;
  startRound();
}

function startRound() {
  appState.currentRound++;
  appState.currentNumberIndex = 0;
  appState.practiceNumbers = generateNumbers();
  appState.correctAnswer = appState.practiceNumbers.reduce((sum, num) => sum + num, 0);
  
  updateRoundInfo();
  showNextNumber();
}

function generateNumbers(): number[] {
  const numbers: number[] = [];
  for (let i = 0; i < appState.numberCount; i++) {
    let number = 0;
    
    // Generate a random number with specified digit count
    if (appState.digitCount === 1) {
      number = Math.floor(Math.random() * 10);
    } else if (appState.digitCount === 2) {
      number = Math.floor(Math.random() * 90) + 10;
    } else {
      number = Math.floor(Math.random() * 900) + 100;
    }

    // Apply negative sign if allowed
    if (appState.allowNegative && Math.random() > 0.5) {
      number = -number;
    }
    
    // Apply decimals if allowed
    if (appState.allowDecimals && Math.random() > 0.5) {
      const decimal = Math.random();
      number += Math.round(decimal * 100) / 100;
    }
    
    numbers.push(number);
  }
  
  // Ensure the sum is positive
  const sum = numbers.reduce((acc, num) => acc + num, 0);
  if (sum <= 0) {
    // Add a positive value to make the sum positive
    const positiveValue = Math.abs(sum) + 1;
    numbers[numbers.length - 1] += positiveValue;
  }
  
  return numbers;
}

function updateRoundInfo() {
  if (roundNumberElement) {
    roundNumberElement.textContent = `Round ${appState.currentRound} of ${appState.rounds}`;
  }
  if (roundProgressElement) {
    roundProgressElement.textContent = `Progress: ${appState.currentRound}/${appState.rounds}`;
  }
}

function showNextNumber() {
  if (appState.currentNumberIndex >= appState.practiceNumbers.length) {
    // All numbers shown, show answer button
    showAnswerButton.style.display = 'inline-block';
    nextNumberButton.style.display = 'none';
    return;
  }
  
  if (currentNumberElement) {
    currentNumberElement.textContent = appState.practiceNumbers[appState.currentNumberIndex].toString();
    currentNumberElement.style.display = 'block';
  }
  
  const displayTime = appState.displayTime * 1000; // Convert to milliseconds
  
  // Clear existing timer
  if (appState.timer) {
    clearTimeout(appState.timer);
  }
  
  // Set timer to hide the number and show next
  appState.timer = setTimeout(() => {
    if (currentNumberElement) {
      currentNumberElement.style.display = 'none';
    }
    appState.currentNumberIndex++;
    showNextNumber();
  }, displayTime);
}

function showAnswer() {
  if (appState.timer) {
    clearTimeout(appState.timer);
  }
  
  practiceScreen.style.display = 'none';
  guessScreen.style.display = 'block';
  if (guessInputElement) {
    guessInputElement.focus();
  }
}

function submitGuess() {
  if (guessInputElement && guessInputElement.value) {
    const userGuess = parseFloat(guessInputElement.value);
    
    if (Math.abs(userGuess - appState.correctAnswer) < 0.01) { // Allow for floating point precision
      appState.correctAnswers++;
      if (guessFeedbackElement) {
        guessFeedbackElement.textContent = 'Correct! 🎉';
        guessFeedbackElement.style.color = 'green';
      }
    } else {
      if (guessFeedbackElement) {
        guessFeedbackElement.textContent = `Incorrect. The answer was ${appState.correctAnswer}`;
        guessFeedbackElement.style.color = 'red';
      }
    }
    
    // Go to next round or show results
    if (appState.currentRound < appState.rounds) {
      setTimeout(() => {
        guessScreen.style.display = 'none';
        startRound();
      }, 2000);
    } else {
      showResults();
    }
  }
}

function showResults() {
  const accuracy = Math.round((appState.correctAnswers / appState.rounds) * 100);
  
  if (accuracyResultElement) {
    accuracyResultElement.textContent = `Final Accuracy: ${accuracy}%`;
  }
  
  if (performanceResultElement) {
    if (accuracy >= 90) {
      performanceResultElement.textContent = 'Excellent! 🏆';
    } else if (accuracy >= 70) {
      performanceResultElement.textContent = 'Good job! 👍';
    } else if (accuracy >= 50) {
      performanceResultElement.textContent = 'Keep practicing! 💪';
    } else {
      performanceResultElement.textContent = 'Need more practice! 📚';
    }
  }
  
  guessScreen.style.display = 'none';
  resultsScreen.style.display = 'block';
}

function restartApp() {
  appState = {
    mode: 'select',
    currentRound: 0,
    totalRounds: 10,
    numbers: [],
    guess: 0,
    correctAnswer: 0,
    correctAnswers: 0,
    rounds: 10,
    numberCount: 5,
    digitCount: 2,
    allowNegative: true,
    allowDecimals: true,
    displayTime: 1,
    practiceNumbers: [],
    currentNumberIndex: 0,
    timer: null
  };
  
  resultsScreen.style.display = 'none';
  modeSelection.style.display = 'block';
}
