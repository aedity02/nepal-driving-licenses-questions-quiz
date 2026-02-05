/**
 * Nepal Driving License Exam Simulator
 * Progressive Web App - Main Application Logic
 * @version 1.0.0
 */

(function() {
    'use strict';

    // ==========================================
    // APP STATE
    // ==========================================
    const state = {
        questions: [],
        currentQuestionIndex: 0,
        selectedAnswer: null,
        score: 0,
        timer: null,
        timeLeft: 60,
        isAnswered: false,
        stats: {
            totalAttempts: 0,
            correctAnswers: 0
        }
    };

    // Fallback questions in case JSON fails
    const fallbackQuestions = [
        {
            question: "सवारी साधन चलाउँदा अनिवार्य रूपमा के राख्नुपर्छ?",
            options: ["क) मोबाइल फोन", "ख) सवारी चालक अनुमतिपत्र", "ग) खाना", "घ) छाता"],
            correctAnswer: 1,
            explanation: "सवारी साधन चलाउँदा सवारी चालक अनुमतिपत्र (License) अनिवार्य रूपमा साथमा राख्नुपर्छ।"
        },
        {
            question: "रातो बत्तीको अर्थ के हो?",
            options: ["क) जान देऊ", "ख) रोक", "ग) सावधानी", "घ) इशारा गर"],
            correctAnswer: 1,
            explanation: "रातो बत्तीले रोक्ने संकेत गर्छ। सवारी साधन रोक्नुपर्छ।"
        },
        {
            question: "मोटरसाइकल चलाउँदा अनिवार्य के लगाउनुपर्छ?",
            options: ["क) क्याप", "ख) हेलमेट", "ग) चस्मा", "घ) मास्क"],
            correctAnswer: 1,
            explanation: "मोटरसाइकल चलाउँदा ISI मार्क भएको हेलमेट अनिवार्य रूपमा लगाउनुपर्छ।"
        },
        {
            question: "हरियो बत्तीको अर्थ के हो?",
            options: ["क) रोक", "ख) जान देऊ", "ग) सावधानी", "घ) तयारी अवस्थामा रह"],
            correctAnswer: 1,
            explanation: "हरियो बत्तीले जान दिने संकेत गर्छ। सवारी साधन अगाडि बढ्न सक्छ।"
        },
        {
            question: "पहेंलो बत्तीको अर्थ के हो?",
            options: ["क) रोक", "ख) जान देऊ", "ग) सावधानी वा तयारी अवस्थामा रह", "घ) गति बढाऊ"],
            correctAnswer: 2,
            explanation: "पहेंलो बत्तीले सावधानी वा तयारी अवस्थामा रहने संकेत गर्छ।"
        }
    ];

    // ==========================================
    // DOM ELEMENTS
    // ==========================================
    const elements = {
        homeScreen: document.getElementById('homeScreen'),
        rulesScreen: document.getElementById('rulesScreen'),
        quizScreen: document.getElementById('quizScreen'),
        resultScreen: document.getElementById('resultScreen'),
        resultInfoScreen: document.getElementById('resultInfoScreen'),
        startTestCard: document.getElementById('startTestCard'),
        rulesCard: document.getElementById('rulesCard'),
        resultInfoCard: document.getElementById('resultInfoCard'),
        totalAttempts: document.getElementById('totalAttempts'),
        correctAnswersDisplay: document.getElementById('correctAnswers'),
        accuracy: document.getElementById('accuracy'),
        rulesBackBtn: document.getElementById('rulesBackBtn'),
        startFromRules: document.getElementById('startFromRules'),
        currentQ: document.getElementById('currentQ'),
        totalQ: document.getElementById('totalQ'),
        progressFill: document.getElementById('progressFill'),
        timerContainer: document.getElementById('timerContainer'),
        timerText: document.getElementById('timerText'),
        questionText: document.getElementById('questionText'),
        optionsContainer: document.getElementById('optionsContainer'),
        submitBtn: document.getElementById('submitBtn'),
        resultIcon: document.getElementById('resultIcon'),
        resultTitle: document.getElementById('resultTitle'),
        resultSubtitle: document.getElementById('resultSubtitle'),
        userAnswer: document.getElementById('userAnswer'),
        correctAnswer: document.getElementById('correctAnswer'),
        explanationText: document.getElementById('explanationText'),
        retryBtn: document.getElementById('retryBtn'),
        homeBtn: document.getElementById('homeBtn'),
        nextBtn: document.getElementById('nextBtn'),
        resultInfoBackBtn: document.getElementById('resultInfoBackBtn'),
        offlineIndicator: document.getElementById('offlineIndicator'),
        installPrompt: document.getElementById('installPrompt'),
        installBtn: document.getElementById('installBtn'),
        installClose: document.getElementById('installClose')
    };

    // ==========================================
    // INITIALIZATION
    // ==========================================
    async function init() {
        loadStats();
        await loadQuestions();
        setupEventListeners();
        registerServiceWorker();
        setupInstallPrompt();
        updateOnlineStatus();
        updateStatsDisplay();
        
        console.log('App initialized. Questions loaded:', state.questions.length);
    }

    // ==========================================
    // LOAD QUESTIONS
    // ==========================================
    async function loadQuestions() {
        try {
            const response = await fetch('questions.json');
            console.log('Fetch response:', response.status);
            
            if (!response.ok) {
                throw new Error('Failed to load questions: ' + response.status);
            }
            
            const data = await response.json();
            console.log('Loaded data:', data);
            
            // Check if data is valid array with items
            if (Array.isArray(data) && data.length > 0) {
                state.questions = data;
                console.log('Questions loaded successfully:', state.questions.length);
            } else {
                console.warn('JSON is empty or invalid, using fallback');
                state.questions = fallbackQuestions;
            }
        } catch (error) {
            console.error('Error loading questions:', error);
            state.questions = fallbackQuestions;
            console.log('Using fallback questions:', state.questions.length);
        }
    }

    // ==========================================
    // EVENT LISTENERS
    // ==========================================
    function setupEventListeners() {
        if (elements.startTestCard) {
            elements.startTestCard.addEventListener('click', startQuiz);
            elements.startTestCard.addEventListener('keydown', handleKeyPress);
        }
        
        if (elements.rulesCard) {
            elements.rulesCard.addEventListener('click', showRulesScreen);
            elements.rulesCard.addEventListener('keydown', handleKeyPress);
        }
        
        if (elements.resultInfoCard) {
            elements.resultInfoCard.addEventListener('click', showResultInfoScreen);
            elements.resultInfoCard.addEventListener('keydown', handleKeyPress);
        }
        
        if (elements.rulesBackBtn) {
            elements.rulesBackBtn.addEventListener('click', showHomeScreen);
        }
        if (elements.startFromRules) {
            elements.startFromRules.addEventListener('click', startQuiz);
        }
        
        if (elements.submitBtn) {
            elements.submitBtn.addEventListener('click', submitAnswer);
        }
        
        if (elements.retryBtn) {
            elements.retryBtn.addEventListener('click', startQuiz);
        }
        if (elements.homeBtn) {
            elements.homeBtn.addEventListener('click', showHomeScreen);
        }
        if (elements.nextBtn) {
            elements.nextBtn.addEventListener('click', nextQuestion);
        }
        
        if (elements.resultInfoBackBtn) {
            elements.resultInfoBackBtn.addEventListener('click', showHomeScreen);
        }
        
        if (elements.installBtn) {
            elements.installBtn.addEventListener('click', installApp);
        }
        if (elements.installClose) {
            elements.installClose.addEventListener('click', hideInstallPrompt);
        }
        
        window.addEventListener('online', updateOnlineStatus);
        window.addEventListener('offline', updateOnlineStatus);
    }

    function handleKeyPress(e) {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            e.target.click();
        }
    }

    // ==========================================
    // SCREEN NAVIGATION
    // ==========================================
    function showScreen(screenToShow) {
        if (!screenToShow) return;
        
        const screens = [
            elements.homeScreen,
            elements.rulesScreen,
            elements.quizScreen,
            elements.resultScreen,
            elements.resultInfoScreen
        ];
        
        screens.forEach(screen => {
            if (screen) {
                screen.classList.remove('active');
                screen.hidden = true;
            }
        });
        
        screenToShow.classList.add('active');
        screenToShow.hidden = false;
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function showHomeScreen() {
        showScreen(elements.homeScreen);
        updateStatsDisplay();
    }

    function showRulesScreen() {
        showScreen(elements.rulesScreen);
    }

    function showResultInfoScreen() {
        showScreen(elements.resultInfoScreen);
    }

    // ==========================================
    // QUIZ LOGIC
    // ==========================================
    function startQuiz() {
        console.log('Starting quiz. Total questions:', state.questions.length);
        
        if (state.questions.length === 0) {
            alert('No questions loaded. Please check questions.json file.');
            return;
        }
        
        state.currentQuestionIndex = 0;
        state.selectedAnswer = null;
        state.score = 0;
        state.isAnswered = false;
        state.timeLeft = 60;
        
        showScreen(elements.quizScreen);
        loadQuestion();
        startTimer();
    }

    function loadQuestion() {
        const question = state.questions[state.currentQuestionIndex];
        if (!question) {
            console.error('No question found at index:', state.currentQuestionIndex);
            return;
        }
        
        console.log('Loading question:', state.currentQuestionIndex + 1, 'of', state.questions.length);
        
        if (elements.currentQ) elements.currentQ.textContent = state.currentQuestionIndex + 1;
        if (elements.totalQ) elements.totalQ.textContent = state.questions.length;
        if (elements.progressFill) {
            elements.progressFill.style.width = `${((state.currentQuestionIndex + 1) / state.questions.length) * 100}%`;
        }
        
        if (elements.questionText) elements.questionText.textContent = question.question;
        
        if (elements.optionsContainer) {
            elements.optionsContainer.innerHTML = '';
            const letters = ['क', 'ख', 'ग', 'घ', 'ङ'];
            
            question.options.forEach((option, index) => {
                const button = document.createElement('button');
                button.className = 'option-btn';
                button.innerHTML = `
                    <span class="option-letter">${letters[index]}</span>
                    <span class="option-text">${option.replace(/^[क-ङ]\)\s*/, '')}</span>
                `;
                button.addEventListener('click', () => selectOption(index, button));
                elements.optionsContainer.appendChild(button);
            });
        }
        
        if (elements.submitBtn) elements.submitBtn.disabled = true;
        state.selectedAnswer = null;
        state.isAnswered = false;
    }

    function selectOption(index, button) {
        if (state.isAnswered) return;
        
        document.querySelectorAll('.option-btn').forEach(btn => {
            btn.classList.remove('selected');
        });
        
        button.classList.add('selected');
        state.selectedAnswer = index;
        
        if (elements.submitBtn) elements.submitBtn.disabled = false;
        
        if ('vibrate' in navigator) {
            navigator.vibrate(10);
        }
    }

    function submitAnswer() {
        if (state.selectedAnswer === null || state.isAnswered) return;
        
        state.isAnswered = true;
        stopTimer();
        
        const question = state.questions[state.currentQuestionIndex];
        const isCorrect = state.selectedAnswer === question.correctAnswer;
        
        if (isCorrect) {
            state.score++;
            state.stats.correctAnswers++;
        }
        state.stats.totalAttempts++;
        
        saveStats();
        showResult(isCorrect, question);
    }

    // ==========================================
    // NEXT QUESTION LOGIC
    // ==========================================
    function nextQuestion() {
        console.log('Next question clicked. Current:', state.currentQuestionIndex, 'Total:', state.questions.length);
        
        if (state.currentQuestionIndex < state.questions.length - 1) {
            state.currentQuestionIndex++;
            state.selectedAnswer = null;
            state.isAnswered = false;
            state.timeLeft = 60;
            
            showScreen(elements.quizScreen);
            loadQuestion();
            startTimer();
        } else {
            showFinalResults();
        }
    }

    function showFinalResults() {
        const percentage = Math.round((state.score / state.questions.length) * 100);
        const passed = percentage >= 50;
        
        if (elements.resultIcon) {
            elements.resultIcon.innerHTML = passed ? '🎉' : '📚';
            elements.resultIcon.className = passed ? 'result-icon success' : 'result-icon fail';
        }
        if (elements.resultTitle) {
            elements.resultTitle.textContent = passed ? 'बधाई छ! परीक्षा उत्तीर्ण' : 'परीक्षा अनुत्तीर्ण';
            elements.resultTitle.className = passed ? 'result-title success' : 'result-title fail';
        }
        if (elements.resultSubtitle) {
            elements.resultSubtitle.textContent = passed ? 
                `You scored ${state.score}/${state.questions.length} (${percentage}%)` : 
                `You scored ${state.score}/${state.questions.length} (${percentage}%). Keep practicing!`;
        }
        
        const resultCard = document.querySelector('.result-card');
        if (resultCard) resultCard.style.display = 'none';
        
        const explanationCard = document.getElementById('explanationCard');
        if (explanationCard) explanationCard.style.display = 'none';
        
        if (elements.nextBtn) elements.nextBtn.style.display = 'none';
        if (elements.retryBtn) {
            const retrySpan = elements.retryBtn.querySelector('span');
            if (retrySpan) retrySpan.textContent = 'पुनः सुरु गर्नुहोस्';
        }
        
        if ('vibrate' in navigator) {
            navigator.vibrate(passed ? [100, 50, 100, 50, 100] : [200, 100, 200]);
        }
    }

    // ==========================================
    // TIMER
    // ==========================================
    function startTimer() {
        state.timeLeft = 60;
        updateTimerDisplay();
        
        state.timer = setInterval(() => {
            state.timeLeft--;
            updateTimerDisplay();
            
            if (state.timeLeft <= 0) {
                timeUp();
            }
        }, 1000);
    }

    function stopTimer() {
        if (state.timer) {
            clearInterval(state.timer);
            state.timer = null;
        }
    }

    function updateTimerDisplay() {
        if (elements.timerText) elements.timerText.textContent = `${state.timeLeft}s`;
        
        if (elements.timerContainer) {
            elements.timerContainer.classList.remove('warning', 'danger');
            
            if (state.timeLeft <= 10) {
                elements.timerContainer.classList.add('danger');
            } else if (state.timeLeft <= 20) {
                elements.timerContainer.classList.add('warning');
            }
        }
    }

    function timeUp() {
        stopTimer();
        state.isAnswered = true;
        state.stats.totalAttempts++;
        saveStats();
        
        const question = state.questions[state.currentQuestionIndex];
        showResult(false, question, true);
    }

    // ==========================================
    // RESULT
    // ==========================================
    function showResult(isCorrect, question, timeExpired = false) {
        showScreen(elements.resultScreen);
        
        const resultCard = document.querySelector('.result-card');
        if (resultCard) resultCard.style.display = 'flex';
        
        const explanationCard = document.getElementById('explanationCard');
        if (explanationCard) explanationCard.style.display = 'block';

        if (elements.nextBtn) {
            elements.nextBtn.style.display = 'inline-flex';
            const isLastQuestion = state.currentQuestionIndex >= state.questions.length - 1;
            elements.nextBtn.innerHTML = isLastQuestion ? `
                <span>नतिजा हेर्नुहोस्</span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
            ` : `
                <span>अर्को प्रश्न</span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
            `;
        }
        
        if (elements.retryBtn) {
            const retrySpan = elements.retryBtn.querySelector('span');
            if (retrySpan) retrySpan.textContent = 'पुनः प्रयास';
        }
        
        if (elements.resultIcon) {
            elements.resultIcon.innerHTML = isCorrect ? '✅' : '❌';
            elements.resultIcon.className = isCorrect ? 'result-icon success' : 'result-icon fail';
        }
        if (elements.resultTitle) {
            elements.resultTitle.textContent = isCorrect ? 'सही उत्तर!' : (timeExpired ? 'समय सकियो!' : 'गलत उत्तर!');
            elements.resultTitle.className = isCorrect ? 'result-title success' : 'result-title fail';
        }
        if (elements.resultSubtitle) {
            elements.resultSubtitle.textContent = isCorrect ? 'Correct Answer! Well done!' : (timeExpired ? 'Time\'s up!' : 'Wrong Answer. Try again!');
        }
        
        if (elements.userAnswer) {
            if (state.selectedAnswer !== null) {
                const userOption = question.options[state.selectedAnswer];
                elements.userAnswer.textContent = userOption.replace(/^[क-ङ]\)\s*/, '');
            } else {
                elements.userAnswer.textContent = 'कुनै उत्तर छानिएन';
            }
        }
        
        if (elements.correctAnswer) {
            const correctOption = question.options[question.correctAnswer];
            elements.correctAnswer.textContent = correctOption.replace(/^[क-ङ]\)\s*/, '');
        }
        
        if (elements.explanationText) {
            elements.explanationText.textContent = question.explanation;
        }
        
        if ('vibrate' in navigator) {
            navigator.vibrate(isCorrect ? [50] : [100, 50, 100]);
        }
    }

    // ==========================================
    // STATS MANAGEMENT
    // ==========================================
    function loadStats() {
        try {
            const saved = localStorage.getItem('drivingExamStats');
            if (saved) {
                state.stats = JSON.parse(saved);
            }
        } catch (error) {
            console.error('Error loading stats:', error);
        }
    }

    function saveStats() {
        try {
            localStorage.setItem('drivingExamStats', JSON.stringify(state.stats));
        } catch (error) {
            console.error('Error saving stats:', error);
        }
    }

    function updateStatsDisplay() {
        if (elements.totalAttempts) elements.totalAttempts.textContent = state.stats.totalAttempts;
        if (elements.correctAnswersDisplay) elements.correctAnswersDisplay.textContent = state.stats.correctAnswers;
        
        const accuracyValue = state.stats.totalAttempts > 0
            ? Math.round((state.stats.correctAnswers / state.stats.totalAttempts) * 100)
            : 0;
        if (elements.accuracy) elements.accuracy.textContent = `${accuracyValue}%`;
    }

    // ==========================================
    // PWA - SERVICE WORKER
    // ==========================================
    async function registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            try {
                const registration = await navigator.serviceWorker.register('service-worker.js');
                console.log('ServiceWorker registered:', registration.scope);
            } catch (error) {
                console.error('ServiceWorker registration failed:', error);
            }
        }
    }

    // ==========================================
    // PWA - INSTALL PROMPT
    // ==========================================
    let deferredPrompt = null;

    function setupInstallPrompt() {
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            deferredPrompt = e;
            
            const dismissed = localStorage.getItem('installPromptDismissed');
            if (!dismissed && elements.installPrompt) {
                setTimeout(() => {
                    elements.installPrompt.hidden = false;
                }, 3000);
            }
        });

        window.addEventListener('appinstalled', () => {
            deferredPrompt = null;
            if (elements.installPrompt) elements.installPrompt.hidden = true;
            console.log('App installed successfully');
        });
    }

    async function installApp() {
        if (!deferredPrompt) return;
        
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        console.log('Install prompt outcome:', outcome);
        
        deferredPrompt = null;
        if (elements.installPrompt) elements.installPrompt.hidden = true;
    }

    function hideInstallPrompt() {
        if (elements.installPrompt) elements.installPrompt.hidden = true;
        localStorage.setItem('installPromptDismissed', 'true');
    }

    // ==========================================
    // ONLINE/OFFLINE STATUS
    // ==========================================
    function updateOnlineStatus() {
        if (elements.offlineIndicator) {
            elements.offlineIndicator.hidden = navigator.onLine;
        }
    }

    // ==========================================
    // INITIALIZE APP
    // ==========================================
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
