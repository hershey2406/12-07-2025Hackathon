import { useState, useEffect } from 'react';
import { Settings } from '../App';
import { CheckCircle, XCircle, Lightbulb, Trophy } from 'lucide-react';

interface GamesPageProps {
  settings: Settings;
}

interface CrosswordCell {
  letter: string;
  number?: number;
  isBlack: boolean;
}

interface Clue {
  number: number;
  clue: string;
  answer: string;
  startRow: number;
  startCol: number;
  direction: 'across' | 'down';
}

// Daily crossword puzzles (changes based on day of year)
const crosswordPuzzles = [
  {
    size: 7,
    grid: [
      [{ letter: 'C', number: 1 }, { letter: 'O' }, { letter: 'L' }, { letter: 'D' }, { isBlack: true }, { letter: 'S', number: 2 }, { letter: 'U' }],
      [{ letter: 'A' }, { isBlack: true }, { isBlack: true }, { isBlack: true }, { isBlack: true }, { letter: 'U' }, { letter: 'N' }],
      [{ letter: 'T', number: 3 }, { letter: 'R' }, { letter: 'E' }, { letter: 'E' }, { isBlack: true }, { isBlack: true }, { isBlack: true }],
      [{ isBlack: true }, { letter: 'E' }, { isBlack: true }, { isBlack: true }, { letter: 'B', number: 4 }, { letter: 'I' }, { letter: 'R' }],
      [{ letter: 'D', number: 5 }, { letter: 'O' }, { letter: 'G' }, { isBlack: true }, { letter: 'A' }, { isBlack: true }, { letter: 'D' }],
      [{ letter: 'A' }, { isBlack: true }, { isBlack: true }, { letter: 'M', number: 6 }, { letter: 'K' }, { letter: 'E' }, { isBlack: true }],
      [{ letter: 'Y' }, { isBlack: true }, { isBlack: true }, { letter: 'O' }, { isBlack: true }, { isBlack: true }, { isBlack: true }],
    ],
    clues: {
      across: [
        { number: 1, clue: 'Opposite of hot', answer: 'COLD', startRow: 0, startCol: 0, direction: 'across' as const },
        { number: 2, clue: 'Bright star in the sky', answer: 'SUN', startRow: 0, startCol: 5, direction: 'across' as const },
        { number: 3, clue: 'Large plant with trunk', answer: 'TREE', startRow: 2, startCol: 0, direction: 'across' as const },
        { number: 4, clue: 'Flying animal', answer: 'BIRD', startRow: 3, startCol: 4, direction: 'across' as const },
        { number: 5, clue: 'Common pet that barks', answer: 'DOG', startRow: 4, startCol: 0, direction: 'across' as const },
        { number: 6, clue: 'To create or build', answer: 'MAKE', startRow: 5, startCol: 3, direction: 'across' as const },
      ],
      down: [
        { number: 1, clue: 'Feline pet', answer: 'CAT', startRow: 0, startCol: 0, direction: 'down' as const },
        { number: 2, clue: 'Bright yellow color', answer: 'SUNNY', startRow: 0, startCol: 5, direction: 'down' as const },
        { number: 4, clue: 'Loaf of ___', answer: 'BREAD', startRow: 3, startCol: 4, direction: 'down' as const },
        { number: 5, clue: '24 hours', answer: 'DAY', startRow: 4, startCol: 0, direction: 'down' as const },
      ],
    },
  },
  {
    size: 8,
    grid: [
      [{ letter: 'B', number: 1 }, { letter: 'O' }, { letter: 'O' }, { letter: 'K' }, { isBlack: true }, { letter: 'H', number: 2 }, { letter: 'A' }, { letter: 'T' }],
      [{ letter: 'A' }, { isBlack: true }, { isBlack: true }, { isBlack: true }, { isBlack: true }, { letter: 'O' }, { isBlack: true }, { letter: 'E' }],
      [{ letter: 'L', number: 3 }, { letter: 'A' }, { letter: 'K' }, { letter: 'E' }, { isBlack: true }, { letter: 'M', number: 4 }, { letter: 'O' }, { letter: 'O' }],
      [{ letter: 'L' }, { isBlack: true }, { isBlack: true }, { isBlack: true }, { letter: 'F', number: 5 }, { letter: 'I' }, { letter: 'S' }, { letter: 'H' }],
      [{ isBlack: true }, { letter: 'C', number: 6 }, { letter: 'A' }, { letter: 'R' }, { isBlack: true }, { letter: 'E' }, { isBlack: true }, { isBlack: true }],
      [{ letter: 'R', number: 7 }, { letter: 'O' }, { letter: 'S' }, { letter: 'E' }, { isBlack: true }, { isBlack: true }, { isBlack: true }, { isBlack: true }],
      [{ letter: 'A' }, { isBlack: true }, { isBlack: true }, { isBlack: true }, { letter: 'S', number: 8 }, { letter: 'T' }, { letter: 'A' }, { letter: 'R' }],
      [{ letter: 'T' }, { isBlack: true }, { isBlack: true }, { isBlack: true }, { letter: 'K' }, { isBlack: true }, { isBlack: true }, { isBlack: true }],
    ],
    clues: {
      across: [
        { number: 1, clue: 'Reading material', answer: 'BOOK', startRow: 0, startCol: 0, direction: 'across' as const },
        { number: 2, clue: 'Wear on your head', answer: 'HAT', startRow: 0, startCol: 5, direction: 'across' as const },
        { number: 3, clue: 'Body of water', answer: 'LAKE', startRow: 2, startCol: 0, direction: 'across' as const },
        { number: 4, clue: 'Sound a cow makes', answer: 'MOO', startRow: 2, startCol: 5, direction: 'across' as const },
        { number: 5, clue: 'Swims in water', answer: 'FISH', startRow: 3, startCol: 4, direction: 'across' as const },
        { number: 6, clue: 'Automobile', answer: 'CAR', startRow: 4, startCol: 1, direction: 'across' as const },
        { number: 7, clue: 'Flower with thorns', answer: 'ROSE', startRow: 5, startCol: 0, direction: 'across' as const },
        { number: 8, clue: 'Twinkles at night', answer: 'STAR', startRow: 6, startCol: 4, direction: 'across' as const },
      ],
      down: [
        { number: 1, clue: 'Round toy', answer: 'BALL', startRow: 0, startCol: 0, direction: 'down' as const },
        { number: 2, clue: 'Place to live', answer: 'HOME', startRow: 0, startCol: 5, direction: 'down' as const },
        { number: 4, clue: 'Opposite of less', answer: 'MORE', startRow: 2, startCol: 5, direction: 'down' as const },
        { number: 6, clue: 'Rodent animal', answer: 'RAT', startRow: 4, startCol: 1, direction: 'down' as const },
        { number: 8, clue: 'Ship sinks when it ___', answer: 'SANK', startRow: 6, startCol: 4, direction: 'down' as const },
      ],
    },
  },
  {
    size: 7,
    grid: [
      [{ letter: 'R', number: 1 }, { letter: 'A' }, { letter: 'I' }, { letter: 'N' }, { isBlack: true }, { letter: 'P', number: 2 }, { letter: 'I' }],
      [{ letter: 'O' }, { isBlack: true }, { isBlack: true }, { isBlack: true }, { isBlack: true }, { letter: 'E' }, { letter: 'G' }],
      [{ letter: 'A', number: 3 }, { letter: 'P' }, { letter: 'P' }, { letter: 'L' }, { letter: 'E' }, { isBlack: true }, { isBlack: true }],
      [{ letter: 'D' }, { isBlack: true }, { isBlack: true }, { isBlack: true }, { letter: 'G', number: 4 }, { letter: 'A' }, { letter: 'T' }],
      [{ isBlack: true }, { letter: 'S', number: 5 }, { letter: 'N' }, { letter: 'O' }, { letter: 'W' }, { isBlack: true }, { letter: 'E' }],
      [{ letter: 'C', number: 6 }, { letter: 'A' }, { letter: 'K' }, { letter: 'E' }, { isBlack: true }, { isBlack: true }, { isBlack: true }],
      [{ letter: 'R' }, { isBlack: true }, { isBlack: true }, { isBlack: true }, { isBlack: true }, { isBlack: true }, { isBlack: true }],
    ],
    clues: {
      across: [
        { number: 1, clue: 'Water from clouds', answer: 'RAIN', startRow: 0, startCol: 0, direction: 'across' as const },
        { number: 2, clue: 'Farm animal (oink)', answer: 'PIG', startRow: 0, startCol: 5, direction: 'across' as const },
        { number: 3, clue: 'Red or green fruit', answer: 'APPLE', startRow: 2, startCol: 0, direction: 'across' as const },
        { number: 4, clue: 'Entrance barrier', answer: 'GATE', startRow: 3, startCol: 4, direction: 'across' as const },
        { number: 5, clue: 'White and cold', answer: 'SNOW', startRow: 4, startCol: 1, direction: 'across' as const },
        { number: 6, clue: 'Birthday dessert', answer: 'CAKE', startRow: 5, startCol: 0, direction: 'across' as const },
      ],
      down: [
        { number: 1, clue: 'Street or path', answer: 'ROAD', startRow: 0, startCol: 0, direction: 'down' as const },
        { number: 2, clue: 'Companion or buddy', answer: 'PAL', startRow: 0, startCol: 5, direction: 'down' as const },
        { number: 4, clue: 'Obtain or receive', answer: 'GET', startRow: 3, startCol: 4, direction: 'down' as const },
        { number: 5, clue: 'Vehicle you drive', answer: 'CAR', startRow: 4, startCol: 1, direction: 'down' as const },
      ],
    },
  },
];

// Daily trivia questions (changes based on day of year)
const triviaQuestions = [
  [
    {
      question: 'What is the capital of France?',
      options: ['London', 'Paris', 'Berlin', 'Madrid'],
      correctAnswer: 1
    },
    {
      question: 'How many days are in a week?',
      options: ['5', '6', '7', '8'],
      correctAnswer: 2
    },
    {
      question: 'What color do you get when you mix blue and yellow?',
      options: ['Purple', 'Orange', 'Green', 'Brown'],
      correctAnswer: 2
    },
    {
      question: 'What is the largest ocean on Earth?',
      options: ['Atlantic', 'Indian', 'Arctic', 'Pacific'],
      correctAnswer: 3
    },
    {
      question: 'How many seasons are in a year?',
      options: ['2', '3', '4', '5'],
      correctAnswer: 2
    }
  ],
  [
    {
      question: 'What is the closest planet to the Sun?',
      options: ['Venus', 'Earth', 'Mercury', 'Mars'],
      correctAnswer: 2
    },
    {
      question: 'How many hours are in a day?',
      options: ['12', '20', '24', '36'],
      correctAnswer: 2
    },
    {
      question: 'What do bees make?',
      options: ['Milk', 'Honey', 'Butter', 'Cheese'],
      correctAnswer: 1
    },
    {
      question: 'Which animal is known as the King of the Jungle?',
      options: ['Tiger', 'Elephant', 'Lion', 'Bear'],
      correctAnswer: 2
    },
    {
      question: 'How many wheels does a bicycle have?',
      options: ['1', '2', '3', '4'],
      correctAnswer: 1
    }
  ],
  [
    {
      question: 'What is the largest land animal?',
      options: ['Lion', 'Elephant', 'Giraffe', 'Bear'],
      correctAnswer: 1
    },
    {
      question: 'How many letters are in the English alphabet?',
      options: ['24', '25', '26', '27'],
      correctAnswer: 2
    },
    {
      question: 'What is the color of grass?',
      options: ['Blue', 'Green', 'Yellow', 'Red'],
      correctAnswer: 1
    },
    {
      question: 'Which season comes after winter?',
      options: ['Summer', 'Fall', 'Spring', 'Autumn'],
      correctAnswer: 2
    },
    {
      question: 'How many sides does a triangle have?',
      options: ['2', '3', '4', '5'],
      correctAnswer: 1
    }
  ]
];

export function GamesPage({ settings }: GamesPageProps) {
  const isDark = settings.darkMode;
  const [activeGame, setActiveGame] = useState<'crossword' | 'trivia'>('crossword');
  
  // Get day of year to determine daily puzzle
  const getDayOfYear = () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const diff = now.getTime() - start.getTime();
    const oneDay = 1000 * 60 * 60 * 24;
    return Math.floor(diff / oneDay);
  };

  const dayIndex = getDayOfYear() % 3; // Cycle through 3 puzzles
  const currentCrossword = crosswordPuzzles[dayIndex];
  const currentTrivia = triviaQuestions[dayIndex];

  // Crossword state
  const [gridInput, setGridInput] = useState<string[][]>(
    Array(currentCrossword.size).fill(null).map(() => Array(currentCrossword.size).fill(''))
  );
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null);
  const [selectedDirection, setSelectedDirection] = useState<'across' | 'down'>('across');
  const [crosswordComplete, setCrosswordComplete] = useState(false);
  const [cellStatus, setCellStatus] = useState<('correct' | 'incorrect' | null)[][]>(
    Array(currentCrossword.size).fill(null).map(() => Array(currentCrossword.size).fill(null))
  );
  const [showResult, setShowResult] = useState(false);

  // Handle crossword input
  const handleCrosswordInput = (row: number, col: number, value: string) => {
    if (value.length > 1) return; // Only allow single character
    
    const newGrid = gridInput.map(r => [...r]);
    newGrid[row][col] = value.toUpperCase();
    setGridInput(newGrid);

    // Auto-advance to next cell
    if (value) {
      moveToNextCell(row, col);
    }
  };

  // Move to next cell based on direction
  const moveToNextCell = (row: number, col: number) => {
    if (selectedDirection === 'across') {
      // Move right
      for (let c = col + 1; c < currentCrossword.size; c++) {
        if (!currentCrossword.grid[row][c].isBlack) {
          setSelectedCell({ row, col: c });
          return;
        }
      }
    } else {
      // Move down
      for (let r = row + 1; r < currentCrossword.size; r++) {
        if (!currentCrossword.grid[r][col].isBlack) {
          setSelectedCell({ row: r, col });
          return;
        }
      }
    }
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent, row: number, col: number) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      for (let c = col + 1; c < currentCrossword.size; c++) {
        if (!currentCrossword.grid[row][c].isBlack) {
          setSelectedCell({ row, col: c });
          return;
        }
      }
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      for (let c = col - 1; c >= 0; c--) {
        if (!currentCrossword.grid[row][c].isBlack) {
          setSelectedCell({ row, col: c });
          return;
        }
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      for (let r = row + 1; r < currentCrossword.size; r++) {
        if (!currentCrossword.grid[r][col].isBlack) {
          setSelectedCell({ row: r, col });
          return;
        }
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      for (let r = row - 1; r >= 0; r--) {
        if (!currentCrossword.grid[r][col].isBlack) {
          setSelectedCell({ row: r, col });
          return;
        }
      }
    } else if (e.key === 'Backspace' && !gridInput[row][col]) {
      e.preventDefault();
      // Move to previous cell if current cell is empty
      if (selectedDirection === 'across') {
        for (let c = col - 1; c >= 0; c--) {
          if (!currentCrossword.grid[row][c].isBlack) {
            setSelectedCell({ row, col: c });
            return;
          }
        }
      } else {
        for (let r = row - 1; r >= 0; r--) {
          if (!currentCrossword.grid[r][col].isBlack) {
            setSelectedCell({ row: r, col });
            return;
          }
        }
      }
    }
  };

  // Check crossword answers
  const checkCrossword = () => {
    let allCorrect = true;
    const newCellStatus: ('correct' | 'incorrect' | null)[][] = Array(currentCrossword.size).fill(null).map(() => Array(currentCrossword.size).fill(null));
    
    for (let row = 0; row < currentCrossword.size; row++) {
      for (let col = 0; col < currentCrossword.size; col++) {
        const cell = currentCrossword.grid[row][col];
        if (!cell.isBlack) {
          if (gridInput[row][col] !== cell.letter) {
            allCorrect = false;
            newCellStatus[row][col] = 'incorrect';
          } else {
            newCellStatus[row][col] = 'correct';
          }
        }
      }
    }
    
    setCellStatus(newCellStatus);
    setShowResult(true);
    
    if (allCorrect) {
      setCrosswordComplete(true);
    }
  };

  // Trivia state
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [triviaScore, setTriviaScore] = useState(0);
  const [answeredQuestions, setAnsweredQuestions] = useState<boolean[]>(new Array(currentTrivia.length).fill(false));
  const [triviaComplete, setTriviaComplete] = useState(false);

  const handleTriviaAnswer = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
    const newAnswered = [...answeredQuestions];
    newAnswered[currentQuestion] = true;
    setAnsweredQuestions(newAnswered);

    if (answerIndex === currentTrivia[currentQuestion].correctAnswer) {
      setTriviaScore(triviaScore + 1);
    }

    // Move to next question after a delay
    setTimeout(() => {
      if (currentQuestion < currentTrivia.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setSelectedAnswer(null);
      } else {
        setTriviaComplete(true);
      }
    }, 1500);
  };

  const resetTrivia = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setTriviaScore(0);
    setAnsweredQuestions(new Array(currentTrivia.length).fill(false));
    setTriviaComplete(false);
  };

  return (
    <div className={`min-h-screen flex flex-col items-center p-6 pt-20 ${isDark ? 'bg-slate-900' : 'bg-gradient-to-br from-blue-50 to-green-50'}`}>
      <div className="w-full max-w-4xl space-y-8">
        {/* Header */}
        <div className="text-center space-y-4 animate-fadeIn">
          <div className="flex justify-center mb-4">
            <div className={`p-6 rounded-full ${isDark ? 'bg-green-600' : 'bg-green-500'} transform hover:scale-110 hover:rotate-6`}>
              <Trophy className="w-16 h-16 text-white" strokeWidth={2.5} />
            </div>
          </div>
          <h1 className={isDark ? 'text-white' : 'text-slate-800'} style={{ fontSize: '3em' }}>
            Daily Games
          </h1>
          <p className={`${isDark ? 'text-slate-300' : 'text-slate-600'}`} style={{ fontSize: '1.5em' }}>
            Challenge your mind with today's puzzles
          </p>
        </div>

        {/* Game Selection */}
        <div id="games-tabs" className="flex gap-4 justify-center animate-scaleIn">
          <button
            onClick={() => setActiveGame('crossword')}
            className={`px-8 py-4 rounded-2xl transition-all transform hover:scale-105 ${
              activeGame === 'crossword'
                ? isDark
                  ? 'bg-blue-600 text-white'
                  : 'bg-blue-500 text-white'
                : isDark
                  ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  : 'bg-white text-slate-700 hover:bg-slate-100'
            } shadow-lg`}
            style={{ fontSize: '1.5em' }}
          >
            Crossword
          </button>
          <button
            onClick={() => setActiveGame('trivia')}
            className={`px-8 py-4 rounded-2xl transition-all transform hover:scale-105 ${
              activeGame === 'trivia'
                ? isDark
                  ? 'bg-blue-600 text-white'
                  : 'bg-blue-500 text-white'
                : isDark
                  ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  : 'bg-white text-slate-700 hover:bg-slate-100'
            } shadow-lg`}
            style={{ fontSize: '1.5em' }}
          >
            Trivia Quiz
          </button>
        </div>

        {/* Crossword Game */}
        {activeGame === 'crossword' && (
          <div id="crossword-game" className={`${isDark ? 'bg-slate-800' : 'bg-white'} p-10 rounded-3xl shadow-xl animate-scaleIn ${settings.highContrast ? 'ring-4 ring-yellow-400' : ''}`}>
            <h2 className={`mb-6 text-center ${isDark ? 'text-white' : 'text-slate-800'}`} style={{ fontSize: '2em' }}>
              Today's Crossword
            </h2>
            
            {!crosswordComplete ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Crossword Grid */}
                <div className="flex justify-center">
                  <div className="inline-block">
                    {currentCrossword.grid.map((row, rowIndex) => (
                      <div key={rowIndex} className="flex">
                        {row.map((cell, colIndex) => {
                          const status = cellStatus[rowIndex][colIndex];
                          const bgColor = status === 'correct' 
                            ? 'bg-green-200' 
                            : status === 'incorrect' 
                              ? 'bg-red-200' 
                              : isDark 
                                ? 'bg-slate-700' 
                                : 'bg-white';
                          
                          return (
                            <div
                              key={colIndex}
                              className={`relative w-12 h-12 border transition-all ${
                                cell.isBlack
                                  ? isDark ? 'bg-slate-900' : 'bg-slate-800'
                                  : `${bgColor} ${isDark ? 'border-slate-600' : 'border-slate-400'}`
                              } ${!cell.isBlack ? 'cursor-pointer hover:bg-blue-100' : ''}`}
                              onClick={() => !cell.isBlack && setSelectedCell({ row: rowIndex, col: colIndex })}
                            >
                              {!cell.isBlack && (
                                <>
                                  {cell.number && (
                                    <span className={`absolute top-0.5 left-0.5 text-xs ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                                      {cell.number}
                                    </span>
                                  )}
                                  <input
                                    type="text"
                                    maxLength={1}
                                    value={gridInput[rowIndex][colIndex] || ''}
                                    onChange={(e) => handleCrosswordInput(rowIndex, colIndex, e.target.value)}
                                    onKeyDown={(e) => handleKeyDown(e, rowIndex, colIndex)}
                                    className={`w-full h-full text-center bg-transparent border-none outline-none ${
                                      isDark ? 'text-white' : 'text-slate-900'
                                    }`}
                                    style={{ fontSize: '1.5em', textTransform: 'uppercase' }}
                                  />
                                  {status === 'correct' && (
                                    <CheckCircle className="absolute bottom-0 right-0 w-4 h-4 text-green-600" />
                                  )}
                                  {status === 'incorrect' && (
                                    <XCircle className="absolute bottom-0 right-0 w-4 h-4 text-red-600" />
                                  )}
                                </>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Clues */}
                <div className="space-y-6">
                  <div>
                    <h3 className={`mb-4 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} style={{ fontSize: '1.5em' }}>
                      Across
                    </h3>
                    <div className="space-y-3">
                      {currentCrossword.clues.across.map((clue) => (
                        <div key={clue.number} className={`${isDark ? 'bg-slate-700' : 'bg-blue-50'} p-4 rounded-xl`}>
                          <p className={isDark ? 'text-slate-200' : 'text-slate-700'} style={{ fontSize: '1.1em' }}>
                            <span className={isDark ? 'text-blue-400' : 'text-blue-600'}>{clue.number}.</span> {clue.clue}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className={`mb-4 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} style={{ fontSize: '1.5em' }}>
                      Down
                    </h3>
                    <div className="space-y-3">
                      {currentCrossword.clues.down.map((clue) => (
                        <div key={clue.number} className={`${isDark ? 'bg-slate-700' : 'bg-blue-50'} p-4 rounded-xl`}>
                          <p className={isDark ? 'text-slate-200' : 'text-slate-700'} style={{ fontSize: '1.1em' }}>
                            <span className={isDark ? 'text-blue-400' : 'text-blue-600'}>{clue.number}.</span> {clue.clue}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center space-y-6">
                <CheckCircle className={`w-24 h-24 mx-auto ${isDark ? 'text-green-400' : 'text-green-500'}`} />
                <h3 className={`${isDark ? 'text-white' : 'text-slate-800'}`} style={{ fontSize: '2em' }}>
                  Congratulations!
                </h3>
                <p className={`${isDark ? 'text-slate-300' : 'text-slate-600'}`} style={{ fontSize: '1.5em' }}>
                  You completed today's crossword puzzle!
                </p>
              </div>
            )}
            
            {!crosswordComplete && (
              <>
                {showResult && !crosswordComplete && (
                  <div className={`mt-6 p-6 rounded-2xl animate-scaleIn ${
                    isDark ? 'bg-red-900 border-4 border-red-500' : 'bg-red-100 border-4 border-red-500'
                  }`}>
                    <div className="flex items-center justify-center gap-4">
                      <XCircle className="w-12 h-12 text-red-600" />
                      <div>
                        <h3 className={`${isDark ? 'text-white' : 'text-slate-800'}`} style={{ fontSize: '1.8em' }}>
                          Not Quite Right!
                        </h3>
                        <p className={`${isDark ? 'text-red-200' : 'text-red-700'}`} style={{ fontSize: '1.2em' }}>
                          Some answers are incorrect. Keep trying!
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                
                <button
                  onClick={checkCrossword}
                  className={`w-full mt-8 py-4 rounded-2xl ${
                    isDark ? 'bg-green-600 hover:bg-green-700' : 'bg-green-500 hover:bg-green-600'
                  } text-white transition-all transform hover:scale-105 shadow-lg`}
                  style={{ fontSize: '1.5em' }}
                >
                  Check Answers
                </button>
              </>
            )}
          </div>
        )}

        {/* Trivia Game */}
        {activeGame === 'trivia' && (
          <div id="trivia-game" className={`${isDark ? 'bg-slate-800' : 'bg-white'} p-10 rounded-3xl shadow-xl animate-scaleIn ${settings.highContrast ? 'ring-4 ring-yellow-400' : ''}`}>
            <h2 className={`mb-6 text-center ${isDark ? 'text-white' : 'text-slate-800'}`} style={{ fontSize: '2em' }}>
              Today's Trivia Quiz
            </h2>

            {!triviaComplete ? (
              <>
                {/* Progress */}
                <div className="mb-8">
                  <div className="flex justify-between items-center mb-3">
                    <span className={`${isDark ? 'text-slate-300' : 'text-slate-600'}`} style={{ fontSize: '1.2em' }}>
                      Question {currentQuestion + 1} of {currentTrivia.length}
                    </span>
                    <span className={`${isDark ? 'text-blue-400' : 'text-blue-600'}`} style={{ fontSize: '1.2em' }}>
                      Score: {triviaScore}
                    </span>
                  </div>
                  <div className={`h-3 ${isDark ? 'bg-slate-700' : 'bg-slate-200'} rounded-full overflow-hidden`}>
                    <div
                      className={`h-full ${isDark ? 'bg-blue-600' : 'bg-blue-500'} transition-all`}
                      style={{ width: `${((currentQuestion + 1) / currentTrivia.length) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Question */}
                <div className={`${isDark ? 'bg-slate-700' : 'bg-blue-50'} p-8 rounded-2xl mb-6`}>
                  <p className={`${isDark ? 'text-white' : 'text-slate-800'} text-center`} style={{ fontSize: '1.5em', lineHeight: '1.6' }}>
                    {currentTrivia[currentQuestion].question}
                  </p>
                </div>

                {/* Options */}
                <div className="grid grid-cols-1 gap-4">
                  {currentTrivia[currentQuestion].options.map((option, index) => {
                    const isSelected = selectedAnswer === index;
                    const isCorrect = index === currentTrivia[currentQuestion].correctAnswer;
                    const showResult = selectedAnswer !== null;

                    return (
                      <button
                        key={index}
                        onClick={() => handleTriviaAnswer(index)}
                        disabled={selectedAnswer !== null}
                        className={`p-6 rounded-2xl transition-all transform hover:scale-102 flex items-center gap-4 ${
                          showResult
                            ? isCorrect
                              ? isDark
                                ? 'bg-green-900 border-4 border-green-500'
                                : 'bg-green-100 border-4 border-green-500'
                              : isSelected
                                ? isDark
                                  ? 'bg-red-900 border-4 border-red-500'
                                  : 'bg-red-100 border-4 border-red-500'
                                : isDark
                                  ? 'bg-slate-700'
                                  : 'bg-slate-100'
                            : isDark
                              ? 'bg-slate-700 hover:bg-slate-600'
                              : 'bg-slate-100 hover:bg-slate-200'
                        } ${selectedAnswer !== null ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                        style={{ fontSize: '1.3em' }}
                      >
                        <span className={`${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                          {option}
                        </span>
                        {showResult && isCorrect && (
                          <CheckCircle className="w-8 h-8 text-green-500 ml-auto" />
                        )}
                        {showResult && isSelected && !isCorrect && (
                          <XCircle className="w-8 h-8 text-red-500 ml-auto" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </>
            ) : (
              <div className="text-center space-y-6">
                <Trophy className={`w-24 h-24 mx-auto ${isDark ? 'text-yellow-400' : 'text-yellow-500'}`} />
                <h3 className={`${isDark ? 'text-white' : 'text-slate-800'}`} style={{ fontSize: '2em' }}>
                  Quiz Complete!
                </h3>
                <p className={`${isDark ? 'text-slate-300' : 'text-slate-600'}`} style={{ fontSize: '1.8em' }}>
                  Your Score: {triviaScore} out of {currentTrivia.length}
                </p>
                <button
                  onClick={resetTrivia}
                  className={`px-8 py-4 rounded-2xl ${
                    isDark ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'
                  } text-white transition-all transform hover:scale-105 shadow-lg`}
                  style={{ fontSize: '1.5em' }}
                >
                  Play Again
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}