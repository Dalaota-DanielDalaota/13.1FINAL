
   //SUPABASE CONNECTION


const SUPABASE_URL =
"https://jvoqbmkcnvsctalenabh.supabase.co";

const SUPABASE_KEY =
"YOUR_SUPABASE_KEY_HERE";

const supabaseClient =
supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);



const phrases = [

    { phrase: "NO GUTS NO GLORY", points: 3 },

    { phrase: "TIME IS GOLD", points: 3 },

    { phrase: "NEVER GIVE UP", points: 3 },

    { phrase: "DREAM BIG ALWAYS", points: 3 },

    { phrase: "PRACTICE MAKES PERFECT", points: 3 },

    { phrase: "SUCCESS COMES THROUGH HARD WORK", points: 4 },

    { phrase: "FAILURE BUILDS STRONG CHARACTER", points: 4 },

    { phrase: "DISCIPLINE LEADS TO GREAT RESULTS", points: 4 },

    { phrase: "CONFIDENCE STARTS WITH PREPARATION", points: 4 },

    { phrase: "SMALL STEPS CREATE BIG CHANGES", points: 4 },

    {
        phrase:
        "SUCCESS DOES NOT COME EASY WITHOUT HARD WORK AND SACRIFICE",
        points: 10
    }

];

let currentRound = 0;
let score = 0;
let timer;
let timeLeft = 15;
let playerName = "";

const homeScreen = document.getElementById("homeScreen");
const gameScreen = document.getElementById("gameScreen");

const roundText = document.getElementById("round");
const timeText = document.getElementById("time");
const scoreText = document.getElementById("score");

const jumbledWords = document.getElementById("jumbledWords");
const answerArea = document.getElementById("answerArea");

const message = document.getElementById("message");
const breakScreen = document.getElementById("breakScreen");

const timerBar = document.getElementById("timerBar");

const attemptList = document.getElementById("attemptList");

loadAttempts();

document
.getElementById("checkBtn")
.addEventListener("click", checkAnswer);

function startGame(){

    playerName =
    document
    .getElementById("playerName")
    .value
    .trim();

    if(playerName === ""){

        alert("Please enter your name.");

        return;
    }

    homeScreen.style.display = "none";

    gameScreen.style.display = "block";

    document
    .getElementById("displayName")
    .textContent = playerName;

    currentRound = 0;

    score = 0;

    scoreText.textContent = score;

    loadRound();
}

function loadRound(){

    clearInterval(timer);

    if(currentRound >= phrases.length){

        endGame();

        return;
    }

    roundText.textContent = currentRound + 1;

    message.textContent = "";

    jumbledWords.innerHTML = "";

    answerArea.innerHTML = "";

    breakScreen.style.display = "none";

    timeLeft = 15;

    timeText.textContent = timeLeft;

    timerBar.style.width = "100%";

    const words =
    phrases[currentRound]
    .phrase
    .split(" ");

    const shuffled =
    [...words]
    .sort(() => Math.random() - 0.5);

    shuffled.forEach(word => {

        const div = document.createElement("div");

        div.classList.add("word");

        div.textContent = word;

        div.addEventListener("click", () => {

            if(div.parentElement.id === "jumbledWords"){

                answerArea.appendChild(div);
            }
            else{

                jumbledWords.appendChild(div);
            }

        });

        jumbledWords.appendChild(div);

    });

    timer = setInterval(() => {

        timeLeft--;

        timeText.textContent = timeLeft;

        let percentage = (timeLeft / 15) * 100;

        timerBar.style.width = percentage + "%";

        if(timeLeft <= 0){

            clearInterval(timer);

            message.className = "message wrong";

            message.textContent = "⏰ TIME'S UP!";

            currentRound++;

            checkBreaks();
        }

    },1000);
}

function checkAnswer(){

    const arrangedWords =
    [...answerArea.children]
    .map(word => word.textContent)
    .join(" ");

    if(arrangedWords === phrases[currentRound].phrase){

        clearInterval(timer);

        score += phrases[currentRound].points;

        scoreText.textContent = score;

        message.className = "message correct";

        message.textContent = "✅ CORRECT!";

        currentRound++;

        checkBreaks();
    }
    else{

        message.className = "message wrong";

        message.textContent = "❌ WRONG ANSWER!";
    }
}

function checkBreaks(){

    if(currentRound === 5){

        showBreak(
        "🎉 EASY ROUND COMPLETED!<br><br>Prepare for MEDIUM difficulty!"
        );

        return;
    }

    if(currentRound === 10){

        showBreak(
        "🔥 MEDIUM ROUND COMPLETED!<br><br>FINAL HARD ROUND Incoming!"
        );

        return;
    }

    setTimeout(loadRound,1500);
}

function showBreak(text){

    jumbledWords.innerHTML = "";

    answerArea.innerHTML = "";

    breakScreen.style.display = "block";

    breakScreen.innerHTML = text;

    setTimeout(() => {

        breakScreen.style.display = "none";

        loadRound();

    },4000);
}

async function endGame(){

    jumbledWords.innerHTML = "";

    answerArea.innerHTML = "";

    await saveAttempt(playerName, score);

    let rank = "";

    if(score >= 40){
        rank = "🏆 WORD MASTER";
    }
    else if(score >= 30){
        rank = "🔥 PRO PLAYER";
    }
    else if(score >= 20){
        rank = "⭐ RISING STAR";
    }
    else{
        rank = "🎮 BEGINNER";
    }

    message.className = "message";

    message.innerHTML = `

        🎉 GAME OVER <br><br>

        ${playerName},
        your final score is
        ${score} / 45

        <div class="rank">
            ${rank}
        </div>

        <br>

        <button onclick="goHome()">
            BACK TO HOME
        </button>

    `;

    loadAttempts();
}

async function saveAttempt(name, score){

    const { error } =
    await supabaseClient
    .from("leaderboard")
    .insert([
        {
            player_name: name,
            score: score
        }
    ]);

    if(error){

        console.log(error);

        alert(
        "Supabase Insert Error:\n" +
        error.message
        );
    }
}

async function loadAttempts(){

    const { data, error } =
    await supabaseClient
    .from("leaderboard")
    .select("*")
    .order("score",
    { ascending:false })
    .limit(10);

    if(error){

        console.log(error);

        return;
    }

    attemptList.innerHTML = "";

    data.forEach((attempt,index) => {

        const li =
        document.createElement("li");

        li.textContent =
        `${index + 1}. ${attempt.player_name} - Score: ${attempt.score}`;

        attemptList.appendChild(li);

    });
}

function goHome(){

    gameScreen.style.display = "none";

    homeScreen.style.display = "block";

    loadAttempts();
}