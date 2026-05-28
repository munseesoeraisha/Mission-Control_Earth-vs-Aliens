const questionElement = document.getElementById("question");

const answerButtons = document.querySelectorAll(".answer-btn");

const scoreElement = document.getElementById("score");

const healthElement = document.getElementById("health");

const alienShip = document.getElementById("alienShip");

function loadQuestion(){

    const current = questions[currentQuestion];

    questionElement.textContent = current.question;

    answerButtons.forEach((button, index) => {

        button.textContent = current.answers[index];

        button.onclick = () => checkAnswer(index);

    });

}
function checkAnswer(selectedIndex){

    const correctAnswer = questions[currentQuestion].correct;

    answerButtons.forEach(button => {
        button.disabled = true;
    });

    if(selectedIndex === correctAnswer){

        score += 100;

        alienPosition -= 40;

        alienShip.style.transform =
        `translateY(${alienPosition}px)`;

        answerButtons[selectedIndex]
        .classList.add("correct");

    }else{

        health -= 20;

        alienPosition += 40;

        alienShip.style.transform =
        `translateY(${alienPosition}px)`;

        answerButtons[selectedIndex]
        .classList.add("wrong");

        answerButtons[correctAnswer]
        .classList.add("correct");

    }

    updateHUD();

    setTimeout(() => {

        answerButtons.forEach(button => {

            button.disabled = false;

            button.classList.remove("correct");

            button.classList.remove("wrong");

        });

        currentQuestion++;

        if(currentQuestion < questions.length){

            loadQuestion();

        }else{

            endGame();

        }

    }, 1500);

}
function updateHUD(){

    scoreElement.textContent = score;

    healthElement.textContent = `${health}%`;

}

function endGame(){

    if(health <= 0){

        questionElement.textContent =
        "💀 GAME OVER - Earth Was Destroyed";

    }else{

        questionElement.textContent =
        "🚀 VICTORY - Earth Has Been Saved!";

    }

    answerButtons.forEach(button => {

        button.style.display = "none";

    });

}