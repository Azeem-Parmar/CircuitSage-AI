
import { useState } from 'react';
import {
  BookOpen,
  Zap,
  Calculator,
  Layers,
  GitBranch,
  Lightbulb,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Clock,
  GraduationCap,
} from 'lucide-react';

const lessons = [
  {
    id: 'fundamentals',
    title: 'Electrical Fundamentals',
    category: 'Basics',
    duration: '5 min',
    level: 'Beginner',
    icon: Zap,
    description: 'Understand voltage, current, resistance and electrical power.',
    introduction:
      'Electricity involves the movement of electric charge through a circuit. Four fundamental quantities help us understand and analyze electrical systems.',
    concepts: [
      {
        name: 'Voltage (V)',
        symbol: 'V',
        formula: 'V = W / Q',
        explanation:
          'Voltage is the electric potential difference between two points. It represents the energy transferred per unit charge.',
        unit: 'Volt (V)',
      },
      {
        name: 'Current (I)',
        symbol: 'I',
        formula: 'I = Q / t',
        explanation:
          'Electric current is the rate at which electric charge flows through a conductor.',
        unit: 'Ampere (A)',
      },
      {
        name: 'Resistance (R)',
        symbol: 'R',
        formula: 'R = V / I',
        explanation:
          'Resistance is the opposition offered by a material or component to electric current.',
        unit: 'Ohm (Ω)',
      },
      {
        name: 'Power (P)',
        symbol: 'P',
        formula: 'P = V × I',
        explanation:
          'Electrical power is the rate at which electrical energy is transferred or consumed.',
        unit: 'Watt (W)',
      },
    ],
    example: 'A circuit operates at 12 V and draws 2 A. Its power consumption is P = 12 × 2 = 24 W.',
    question: 'Which unit is used to measure electric current?',
    options: ['Volt', 'Ampere', 'Ohm', 'Watt'],
    answer: 'Ampere',
    explanation: 'Electric current is measured in amperes (A).',
  },
  {
    id: 'ohms-law',
    title: "Ohm's Law",
    category: 'Fundamentals',
    duration: '6 min',
    level: 'Beginner',
    icon: Calculator,
    description: 'Explore the relationship between voltage, current and resistance.',
    introduction:
      "Ohm's Law describes the relationship between voltage, current and resistance in an ohmic conductor under constant physical conditions.",
    concepts: [
      {
        name: 'Voltage',
        symbol: 'V',
        formula: 'V = I × R',
        explanation: 'Voltage equals current multiplied by resistance.',
        unit: 'Volt (V)',
      },
      {
        name: 'Current',
        symbol: 'I',
        formula: 'I = V / R',
        explanation: 'Current equals voltage divided by resistance.',
        unit: 'Ampere (A)',
      },
      {
        name: 'Resistance',
        symbol: 'R',
        formula: 'R = V / I',
        explanation: 'Resistance equals voltage divided by current.',
        unit: 'Ohm (Ω)',
      },
      {
        name: 'Power',
        symbol: 'P',
        formula: 'P = V × I',
        explanation: 'Electrical power can also be calculated using P = I²R or P = V²/R.',
        unit: 'Watt (W)',
      },
    ],
    example: 'Given V = 12 V and R = 100 Ω, current I = 12 / 100 = 0.12 A.',
    question: 'A 12 V source is connected across a 6 Ω resistor. What is the current?',
    options: ['0.5 A', '2 A', '6 A', '72 A'],
    answer: '2 A',
    explanation: 'Using I = V/R = 12/6 = 2 A.',
  },
  {
    id: 'series',
    title: 'Series Circuits',
    category: 'Circuit Analysis',
    duration: '7 min',
    level: 'Beginner',
    icon: Layers,
    description: 'Learn equivalent resistance and voltage distribution in series circuits.',
    introduction:
      'A series circuit has components connected along a single current path. The same current flows through every component.',
    concepts: [
      {
        name: 'Equivalent Resistance',
        symbol: 'Rₜ',
        formula: 'Rₜ = R₁ + R₂ + R₃',
        explanation: 'The total resistance is the sum of all individual resistances.',
        unit: 'Ohm (Ω)',
      },
      {
        name: 'Current',
        symbol: 'I',
        formula: 'I₁ = I₂ = I₃',
        explanation: 'Current remains the same through every series component.',
        unit: 'Ampere (A)',
      },
      {
        name: 'Voltage',
        symbol: 'Vₜ',
        formula: 'Vₜ = V₁ + V₂ + V₃',
        explanation: 'The supply voltage equals the sum of individual voltage drops.',
        unit: 'Volt (V)',
      },
    ],
    example: 'Three resistors of 10 Ω, 20 Ω and 30 Ω in series have an equivalent resistance of 60 Ω.',
    question: 'What is the equivalent resistance of 10 Ω and 20 Ω in series?',
    options: ['5 Ω', '10 Ω', '20 Ω', '30 Ω'],
    answer: '30 Ω',
    explanation: 'For series resistors, Rₜ = 10 + 20 = 30 Ω.',
  },
  {
    id: 'parallel',
    title: 'Parallel Circuits',
    category: 'Circuit Analysis',
    duration: '7 min',
    level: 'Beginner',
    icon: GitBranch,
    description: 'Understand parallel branches, current division and equivalent resistance.',
    introduction:
      'In a parallel circuit, components are connected across the same two electrical nodes. Each branch has the same voltage.',
    concepts: [
      {
        name: 'Equivalent Resistance',
        symbol: 'Rₜ',
        formula: '1/Rₜ = 1/R₁ + 1/R₂',
        explanation: 'The reciprocal of equivalent resistance equals the sum of the reciprocals of branch resistances.',
        unit: 'Ohm (Ω)',
      },
      {
        name: 'Voltage',
        symbol: 'V',
        formula: 'V₁ = V₂ = V₃',
        explanation: 'Every parallel branch has the same voltage.',
        unit: 'Volt (V)',
      },
      {
        name: 'Current',
        symbol: 'Iₜ',
        formula: 'Iₜ = I₁ + I₂ + I₃',
        explanation: 'Total current equals the sum of currents in all branches.',
        unit: 'Ampere (A)',
      },
    ],
    example: 'Two resistors of 6 Ω and 3 Ω in parallel have Rₜ = (6 × 3)/(6 + 3) = 2 Ω.',
    question: 'In a parallel circuit, which quantity is the same across every branch?',
    options: ['Current', 'Resistance', 'Voltage', 'Power'],
    answer: 'Voltage',
    explanation: 'All parallel branches are connected across the same two nodes, so their voltage is equal.',
  },
  {
    id: 'kirchhoff',
    title: "Kirchhoff's Laws",
    category: 'Circuit Analysis',
    duration: '8 min',
    level: 'Intermediate',
    icon: GraduationCap,
    description: 'Learn Kirchhoff’s Current Law and Voltage Law for circuit analysis.',
    introduction:
      "Kirchhoff's Laws are fundamental tools for analyzing electrical networks, especially circuits with multiple branches and loops.",
    concepts: [
      {
        name: "Kirchhoff's Current Law (KCL)",
        symbol: 'KCL',
        formula: 'Σ I entering = Σ I leaving',
        explanation: 'The total current entering a node equals the total current leaving that node.',
        unit: 'Ampere (A)',
      },
      {
        name: "Kirchhoff's Voltage Law (KVL)",
        symbol: 'KVL',
        formula: 'Σ V = 0',
        explanation: 'The algebraic sum of all voltage changes around a closed loop is zero.',
        unit: 'Volt (V)',
      },
    ],
    example: 'If 5 A enters a node and 2 A leaves through one branch, the remaining outgoing current is 3 A.',
    question: 'Which Kirchhoff law is based on conservation of charge?',
    options: ['KVL', 'KCL', "Ohm's Law", 'Power Law'],
    answer: 'KCL',
    explanation: 'KCL follows from conservation of electric charge at a circuit node.',
  },
];

function LearningCenter() {
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);

  const openLesson = (lesson) => {
    setSelectedLesson(lesson);
    setSelectedAnswer('');
    setShowFeedback(false);
  };

  const backToLessons = () => {
    setSelectedLesson(null);
    setSelectedAnswer('');
    setShowFeedback(false);
  };

  const submitAnswer = () => {
    if (!selectedAnswer) return;
    setShowFeedback(true);
  };

  if (selectedLesson) {
    const LessonIcon = selectedLesson.icon;
    const isCorrect = selectedAnswer === selectedLesson.answer;

    return (
      <div className="page-content learning-page">
        <button className="learning-back" onClick={backToLessons}>
          <ArrowRight size={16} className="back-arrow" />
          Back to Learning Center
        </button>

        <div className="learning-detail-header">
          <div className="learning-icon"><LessonIcon size={25} /></div>
          <div>
            <div className="eyebrow">ENGINEERING LEARNING / {selectedLesson.category.toUpperCase()}</div>
            <h1>{selectedLesson.title}</h1>
            <p>{selectedLesson.description}</p>
          </div>
        </div>

        <section className="panel learning-intro">
          <h2>Lesson Overview</h2>
          <p>{selectedLesson.introduction}</p>
        </section>

        <section className="learning-concepts">
          <div className="learning-section-heading">
            <div>
              <h2>Key Concepts & Formulas</h2>
              <p>Understand the important quantities and equations.</p>
            </div>
          </div>

          <div className="learning-concept-grid">
            {selectedLesson.concepts.map((concept) => (
              <article className="learning-concept-card" key={concept.name}>
                <span className="learning-concept-symbol">{concept.symbol}</span>
                <h3>{concept.name}</h3>
                <div className="learning-formula">{concept.formula}</div>
                <p>{concept.explanation}</p>
                <span className="learning-unit">Unit: {concept.unit}</span>
              </article>
            ))}
          </div>
        </section>

        <section className="panel learning-example">
          <div className="learning-example-title">
            <Lightbulb size={20} />
            <h2>Worked Example</h2>
          </div>
          <p>{selectedLesson.example}</p>
        </section>

        <section className="panel learning-quiz">
          <div className="learning-quiz-heading">
            <div>
              <span className="learning-quiz-label">KNOWLEDGE CHECK</span>
              <h2>Test Your Understanding</h2>
              <p>Choose the correct answer.</p>
            </div>
            <BookOpen size={25} />
          </div>

          <h3>{selectedLesson.question}</h3>

          <div className="learning-options">
            {selectedLesson.options.map((option) => (
              <button
                key={option}
                className={`learning-option ${
                  selectedAnswer === option ? 'selected' : ''
                } ${
                  showFeedback && option === selectedLesson.answer
                    ? 'correct'
                    : ''
                } ${
                  showFeedback &&
                  selectedAnswer === option &&
                  !isCorrect
                    ? 'incorrect'
                    : ''
                }`}
                onClick={() => {
                  if (!showFeedback) setSelectedAnswer(option);
                }}
                disabled={showFeedback}
              >
                {option}
                {showFeedback && option === selectedLesson.answer && (
                  <CheckCircle2 size={17} />
                )}
                {showFeedback && selectedAnswer === option && !isCorrect && (
                  <XCircle size={17} />
                )}
              </button>
            ))}
          </div>

          {!showFeedback ? (
            <button
              className="primary-button learning-submit"
              onClick={submitAnswer}
              disabled={!selectedAnswer}
            >
              Check Answer <ArrowRight size={16} />
            </button>
          ) : (
            <div className={`learning-feedback ${isCorrect ? 'correct' : 'incorrect'}`}>
              {isCorrect ? <CheckCircle2 size={19} /> : <XCircle size={19} />}
              <div>
                <strong>{isCorrect ? 'Correct answer!' : 'Not quite. Keep learning!'}</strong>
                <p>{selectedLesson.explanation}</p>
              </div>
            </div>
          )}
        </section>
      </div>
    );
  }

  return (
    <div className="page-content learning-page">
      <div className="page-title">
        <div className="eyebrow">CIRCUITSAGE AI / ENGINEERING EDUCATION</div>
        <h1>Engineering Learning Center</h1>
        <p>Build your electronics knowledge, one concept at a time.</p>
      </div>

      <section className="learning-hero">
        <div className="learning-hero-content">
          <span className="learning-hero-tag">
            <GraduationCap size={15} /> YOUR KNOWLEDGE HUB
          </span>
          <h2>Learn. Understand. Engineer.</h2>
          <p>
            Explore essential electrical engineering concepts with clear
            explanations, important formulas and practical examples.
          </p>
          <span className="learning-hero-meta">
            <BookOpen size={15} /> {lessons.length} learning modules
            <span>•</span>
            <Clock size={15} /> Self-paced learning
          </span>
        </div>
        <div className="learning-hero-art">
          <div className="learning-art-circle">
            <Zap size={54} />
          </div>
        </div>
      </section>

      <div className="learning-section-heading">
        <div>
          <h2>Explore Learning Modules</h2>
          <p>Select a topic to open its lesson and knowledge check.</p>
        </div>
        <span className="learning-count">{lessons.length} modules</span>
      </div>

      <div className="learning-module-grid">
        {lessons.map((lesson, index) => {
          const LessonIcon = lesson.icon;

          return (
            <button
              className="learning-module-card"
              key={lesson.id}
              onClick={() => openLesson(lesson)}
            >
              <div className="learning-module-top">
                <div className="learning-module-icon">
                  <LessonIcon size={22} />
                </div>
                <span className="learning-module-number">
                  {String(index + 1).padStart(2, '0')}
                </span>
              </div>

              <span className="learning-category">{lesson.category}</span>
              <h3>{lesson.title}</h3>
              <p>{lesson.description}</p>

              <div className="learning-module-footer">
                <span><Clock size={14} /> {lesson.duration}</span>
                <span>{lesson.level}</span>
                <ArrowRight size={17} />
              </div>
            </button>
          );
        })}
      </div>

      <div className="learning-note">
        <Lightbulb size={20} />
        <p>
          <strong>Learning tip:</strong> Study the concepts and worked examples
          before attempting each knowledge check.
        </p>
      </div>
    </div>
  );
}

export default LearningCenter;
