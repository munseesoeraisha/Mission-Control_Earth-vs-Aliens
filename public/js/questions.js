const questions = [
    // EASY
    { question: "Which planet is known as the Red Planet?", answers: ["Mars", "Venus", "Jupiter", "Mercury"], correct: 0, difficulty: "easy" },
    { question: "How many planets are in our solar system?", answers: ["7", "8", "9", "10"], correct: 1, difficulty: "easy" },
    { question: "What is the closest star to Earth?", answers: ["Sirius", "Alpha Centauri", "The Sun", "Betelgeuse"], correct: 2, difficulty: "easy" },
    { question: "Which planet has rings around it?", answers: ["Jupiter", "Mars", "Saturn", "Neptune"], correct: 2, difficulty: "easy" },
    { question: "What do we call a shooting star?", answers: ["Comet", "Asteroid", "Meteor", "Nebula"], correct: 2, difficulty: "easy" },
    { question: "Which planet is the largest?", answers: ["Saturn", "Jupiter", "Uranus", "Neptune"], correct: 1, difficulty: "easy" },
    { question: "What is the name of Earth's moon?", answers: ["Luna", "Titan", "Europa", "Phobos"], correct: 0, difficulty: "easy" },
    { question: "Which planet is closest to the Sun?", answers: ["Venus", "Earth", "Mercury", "Mars"], correct: 2, difficulty: "easy" },
    { question: "Which planet is known for having the longest day in the solar system?", answers: ["Mars", "Venus", "Mercury", "Saturn"], correct: 1, difficulty: "easy" },
    { question: "What causes day and night on Earth?", answers: ["Earth's rotation", "The Moon's orbit", "Earth's revolution", "Solar flares"], correct: 0, difficulty: "easy" },
    { question: "Which planet is often called the Morning Star?", answers: ["Mercury", "Venus", "Mars", "Jupiter"], correct: 1, difficulty: "easy" },
    { question: "What is the name of the galaxy that contains our solar system?", answers: ["Andromeda", "Milky Way", "Whirlpool", "Sombrero"], correct: 1, difficulty: "easy" },
    { question: "Which planet has the strongest winds in the solar system?", answers: ["Saturn", "Neptune", "Jupiter", "Uranus"], correct: 1, difficulty: "easy" },
    // MEDIUM
    { question: "Who was the first human to walk on the Moon?", answers: ["Buzz Aldrin", "Neil Armstrong", "Yuri Gagarin", "John Glenn"], correct: 1, difficulty: "medium" },
    { question: "What is the speed of light?", answers: ["300,000 km/s", "150,000 km/s", "500,000 km/s", "1,000,000 km/s"], correct: 0, difficulty: "medium" },
    { question: "Which planet has the most moons?", answers: ["Jupiter", "Saturn", "Uranus", "Neptune"], correct: 1, difficulty: "medium" },
    { question: "What is a light-year?", answers: ["A unit of time", "A unit of distance", "A unit of speed", "A unit of mass"], correct: 1, difficulty: "medium" },
    { question: "What was the first satellite launched into space?", answers: ["Explorer 1", "Sputnik 1", "Vostok 1", "Luna 1"], correct: 1, difficulty: "medium" },
    { question: "Which planet rotates on its side?", answers: ["Neptune", "Saturn", "Uranus", "Jupiter"], correct: 2, difficulty: "medium" },
    { question: "What is the Milky Way?", answers: ["A planet", "A star", "Our galaxy", "A nebula"], correct: 2, difficulty: "medium" },
    { question: "How long does light from the Sun take to reach Earth?", answers: ["8 minutes", "1 minute", "1 hour", "8 hours"], correct: 0, difficulty: "medium" },
    { question: "Which planet has the largest volcano in the solar system?", answers: ["Earth", "Venus", "Mars", "Mercury"], correct: 2, difficulty: "medium" },
    { question: "What is the name of Jupiter's largest moon?", answers: ["Europa", "Io", "Callisto", "Ganymede"], correct: 3, difficulty: "medium" },
    { question: "What is the boundary around a black hole beyond which nothing can escape called?", answers: ["Photon Sphere", "Event Horizon", "Accretion Disk", "Singularity"], correct: 1, difficulty: "medium" },
    { question: "Which spacecraft carried the first humans to the Moon?", answers: ["Apollo 11", "Gemini 4", "Mercury 7", "Voyager 1"], correct: 0, difficulty: "medium" },
    { question: "What is the most abundant element in the universe?", answers: ["Helium", "Oxygen", "Hydrogen", "Carbon"], correct: 2, difficulty: "medium" },
    // HARD
    { question: "What is the name of the supermassive black hole in our galaxy?", answers: ["Cygnus X-1", "Sagittarius A*", "M87*", "NGC 1277"], correct: 1, difficulty: "hard" },
    { question: "What is the Chandrasekhar limit?", answers: ["Max mass of a white dwarf", "Min mass of a neutron star", "Max size of a black hole", "Speed of a quasar"], correct: 0, difficulty: "hard" },
    { question: "Which space telescope was launched in 1990?", answers: ["James Webb", "Spitzer", "Hubble", "Chandra"], correct: 2, difficulty: "hard" },
    { question: "What is the approximate age of the universe?", answers: ["4.5 billion years", "13.8 billion years", "100 billion years", "1 trillion years"], correct: 1, difficulty: "hard" },
    { question: "What phenomenon causes time to slow near a black hole?", answers: ["Special relativity", "Gravitational time dilation", "Dark energy", "Quantum tunneling"], correct: 1, difficulty: "hard" },
    { question: "What is the Oort Cloud?", answers: ["A nebula near Earth", "A distant shell of icy bodies", "A type of galaxy", "A cluster of asteroids"], correct: 1, difficulty: "hard" },
    { question: "What is the nearest galaxy expected to collide with the Milky Way?", answers: ["Triangulum Galaxy", "Andromeda Galaxy", "Large Magellanic Cloud", "Whirlpool Galaxy"], correct: 1, difficulty: "hard" },
{ question: "What type of star will our Sun become after exhausting its nuclear fuel?", answers: ["Neutron Star", "Black Hole", "White Dwarf", "Red Supergiant"], correct: 2, difficulty: "hard" },
{ question: "Which law describes the relationship between a galaxy's distance and its recessional velocity?", answers: ["Kepler's Third Law", "Hubble's Law", "Newton's Law", "Planck's Law"], correct: 1, difficulty: "hard" },
{ question: "What is the estimated temperature at the surface of the Sun?", answers: ["1,000°C", "5,500°C", "50,000°C", "500,000°C"], correct: 1, difficulty: "hard" },
{ question: "What is the name of the theoretical boundary surrounding a black hole?", answers: ["Event Horizon", "Schwarzschild Ring", "Gravity Shell", "Photon Belt"], correct: 0, difficulty: "hard" },
    // NEW QUESTIONS
    { question: "What is the smallest planet in our solar system?", answers: ["Mercury", "Mars", "Venus", "Pluto"], correct: 0, difficulty: "easy" },
    { question: "Which planet is known for its prominent red spot?", answers: ["Jupiter", "Saturn", "Mars", "Neptune"], correct: 0, difficulty: "easy" },
    { question: "What gas makes up most of Earth's atmosphere?", answers: ["Oxygen", "Nitrogen", "Carbon Dioxide", "Helium"], correct: 1, difficulty: "easy" },

    { question: "What is the name of the first space station launched by the United States?", answers: ["Skylab", "Mir", "ISS", "Tiangong"], correct: 0, difficulty: "medium" },
    { question: "Which planet has a day longer than its year?", answers: ["Venus", "Mars", "Mercury", "Jupiter"], correct: 0, difficulty: "medium" },
    { question: "What is the name of the telescope that discovered the first exoplanets?", answers: ["Kepler", "Hubble", "Spitzer", "Gaia"], correct: 0, difficulty: "medium" },

    { question: "What is the term for a region of space where gravity is so strong that nothing, not even light, can escape?", answers: ["Event Horizon", "Singularity", "Black Hole", "Dark Matter"], correct: 0, difficulty: "hard" },
    { question: "Which element is the most abundant in the universe by mass?", answers: ["Hydrogen", "Helium", "Oxygen", "Carbon"], correct: 0, difficulty: "hard" },
    { question: "What is the name of the theoretical particle that mediates the force of gravity?", answers: ["Graviton", "Photon", "Gluon", "W boson"], correct: 0, difficulty: "hard" },
    { question: "What is the name given to the hypothetical end state of the universe where it reaches maximum entropy?", answers: ["Heat Death", "Big Crunch", "Big Rip", "Steady State"], correct: 0, difficulty: "hard" },
];

let selectedQuestions = [];

function initQuestions(difficulty) {
    const filtered = questions.filter(q => q.difficulty === difficulty);
    // Shuffle and pick 8
    selectedQuestions = filtered.sort(() => Math.random() - 0.5).slice(0, Math.min(8, filtered.length));
    return selectedQuestions;
}
