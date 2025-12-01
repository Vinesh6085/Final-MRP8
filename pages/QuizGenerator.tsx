
import React, { useState } from 'react';
import { geminiService } from '../services/geminiService';
import { activityService } from '../services/activityService';
import { BrainCircuit, CheckCircle, XCircle, ChevronRight, RefreshCw, Award } from 'lucide-react';
import { QuizQuestion, QuizResult } from '../types';
import { authService } from '../services/authService';

const QuizGenerator = () => {
  const [topic, setTopic] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{ questionIndex: number; selectedOption: string; isCorrect: boolean }[]>([]);
  const [showResult, setShowResult] = useState(false);

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    setIsLoading(true);
    setQuestions([]);
    setAnswers([]);
    setCurrentQuestionIndex(0);
    setShowResult(false);

    const generatedQuestions = await geminiService.generateQuiz(topic);
    setQuestions(generatedQuestions);
    setIsLoading(false);
  };

  const handleAnswer = (option: string) => {
    const currentQuestion = questions[currentQuestionIndex];
    const isCorrect = option === currentQuestion.correctAnswer;
    
    setAnswers(prev => [...prev, { questionIndex: currentQuestionIndex, selectedOption: option, isCorrect }]);
  };

  const nextQuestion = async () => {
    if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
    } else {
        // Finish Quiz
        setShowResult(true);
        // LOG ACTIVITY with Topic as Category
        // Retrieve current user ID specifically for logging
        const currentUser = await authService.getCurrentUser();
        if (currentUser) {
            activityService.logActivity(currentUser.id, 'quiz', `Took a quiz on: ${topic}`, topic);
        }
    }
  };

  const resetQuiz = () => {
    setQuestions([]);
    setTopic('');
    setAnswers([]);
    setCurrentQuestionIndex(0);
    setShowResult(false);
  };

  if (showResult) {
    const score = answers.filter(a => a.isCorrect).length;
    return (
        <div className="max-w-3xl mx-auto animate-fade-in space-y-6">
             <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
                <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 mx-auto mb-6">
                    <Award size={40} />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Quiz Complete!</h1>
                <p className="text-xl text-gray-600 mb-8">You scored <span className="font-bold text-indigo-600">{score} / {questions.length}</span></p>
                
                <div className="space-y-6 text-left">
                    {questions.map((q, idx) => {
                        const userAnswer = answers.find(a => a.questionIndex === idx);
                        return (
                            <div key={idx} className={`p-4 rounded-xl border ${userAnswer?.isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                                <div className="flex gap-3">
                                    <div className="mt-1">
                                        {userAnswer?.isCorrect ? <CheckCircle size={20} className="text-green-600" /> : <XCircle size={20} className="text-red-600" />}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-900 mb-1">{q.question}</p>
                                        <p className="text-sm text-gray-600"><span className="font-medium">Your answer:</span> {userAnswer?.selectedOption}</p>
                                        {!userAnswer?.isCorrect && <p className="text-sm text-green-700 font-medium mt-1">Correct answer: {q.correctAnswer}</p>}
                                        <p className="text-xs text-gray-500 mt-2 bg-white/50 p-2 rounded italic">Note: {q.explanation}</p>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>

                <button onClick={resetQuiz} className="mt-8 bg-indigo-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors">
                    Create Another Quiz
                </button>
             </div>
        </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      {!questions.length ? (
        <div className="bg-white rounded-2xl shadow-xl p-10 text-center">
            <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 mx-auto mb-6 animate-pulse">
                <BrainCircuit size={40} />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">AI Quiz Generator</h1>
            <p className="text-gray-600 mb-8 font-medium">Enter a topic, and our AI will create a custom quiz to test your knowledge.</p>
            
            <div className="flex gap-2 max-w-md mx-auto">
                <input 
                    type="text" 
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="e.g., Quantum Physics, React Hooks, Ancient Rome..."
                    className="flex-1 bg-gray-800 text-white placeholder-gray-400 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-purple-500"
                    onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                />
                <button 
                    onClick={handleGenerate}
                    disabled={isLoading || !topic}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isLoading ? <RefreshCw className="animate-spin" /> : 'Generate'}
                </button>
            </div>

            <div className="mt-8 flex flex-wrap justify-center gap-2">
                {['JavaScript', 'World History', 'Machine Learning', 'Biology'].map(t => (
                    <button key={t} onClick={() => { setTopic(t); }} className="px-4 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-full text-sm text-gray-700 font-medium transition-colors border border-gray-200">
                        {t}
                    </button>
                ))}
            </div>
        </div>
      ) : (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                 <h2 className="text-xl font-bold text-gray-900">Topic: {topic}</h2>
                 <span className="text-sm text-gray-500">Question {currentQuestionIndex + 1} of {questions.length}</span>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                <div className="bg-purple-600 h-full transition-all duration-300" style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}></div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-8">{questions[currentQuestionIndex].question}</h3>
                
                <div className="space-y-3">
                    {questions[currentQuestionIndex].options.map((option, idx) => {
                        const isAnswered = answers.find(a => a.questionIndex === currentQuestionIndex);
                        const isSelected = isAnswered?.selectedOption === option;
                        
                        let buttonStyle = "border-gray-200 hover:border-purple-300 hover:bg-purple-50";
                        if (isSelected) {
                            buttonStyle = "border-purple-600 bg-purple-50 text-purple-700";
                        }
                        
                        return (
                            <button 
                                key={idx}
                                onClick={() => !isAnswered && handleAnswer(option)}
                                disabled={!!isAnswered}
                                className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-center gap-4 ${buttonStyle}`}
                            >
                                <div className={`w-8 h-8 rounded-full border flex items-center justify-center flex-shrink-0 font-medium ${isSelected ? 'border-purple-600 bg-purple-600 text-white' : 'border-gray-300 text-gray-500'}`}>
                                    {String.fromCharCode(65 + idx)}
                                </div>
                                <span className="text-gray-700 font-medium">{option}</span>
                            </button>
                        )
                    })}
                </div>

                <div className="mt-8 flex justify-between items-center">
                    <button 
                        className="text-gray-400 hover:text-gray-600 font-medium" 
                        disabled={currentQuestionIndex === 0}
                    >
                        Previous
                    </button>
                    {answers.find(a => a.questionIndex === currentQuestionIndex) && (
                         <button 
                            onClick={nextQuestion}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-semibold flex items-center gap-2 transition-colors"
                        >
                            {currentQuestionIndex === questions.length - 1 ? 'Finish' : 'Next'} <ChevronRight size={18} />
                        </button>
                    )}
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default QuizGenerator;
