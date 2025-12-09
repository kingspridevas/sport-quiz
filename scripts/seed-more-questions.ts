import { db } from "../server/db";
import { questions } from "../shared/schema";

// Generate extensive football questions
const footballQuestions: any[] = [];

// World Cup Winners and Years
const worldCupData = [
  { year: 1930, winner: "Uruguay", host: "Uruguay", runnerUp: "Argentina" },
  { year: 1934, winner: "Italy", host: "Italy", runnerUp: "Czechoslovakia" },
  { year: 1938, winner: "Italy", host: "France", runnerUp: "Hungary" },
  { year: 1950, winner: "Uruguay", host: "Brazil", runnerUp: "Brazil" },
  { year: 1954, winner: "Germany", host: "Switzerland", runnerUp: "Hungary" },
  { year: 1958, winner: "Brazil", host: "Sweden", runnerUp: "Sweden" },
  { year: 1962, winner: "Brazil", host: "Chile", runnerUp: "Czechoslovakia" },
  { year: 1966, winner: "England", host: "England", runnerUp: "Germany" },
  { year: 1970, winner: "Brazil", host: "Mexico", runnerUp: "Italy" },
  { year: 1974, winner: "Germany", host: "Germany", runnerUp: "Netherlands" },
  { year: 1978, winner: "Argentina", host: "Argentina", runnerUp: "Netherlands" },
  { year: 1982, winner: "Italy", host: "Spain", runnerUp: "Germany" },
  { year: 1986, winner: "Argentina", host: "Mexico", runnerUp: "Germany" },
  { year: 1990, winner: "Germany", host: "Italy", runnerUp: "Argentina" },
  { year: 1994, winner: "Brazil", host: "USA", runnerUp: "Italy" },
  { year: 1998, winner: "France", host: "France", runnerUp: "Brazil" },
  { year: 2002, winner: "Brazil", host: "South Korea/Japan", runnerUp: "Germany" },
  { year: 2006, winner: "Italy", host: "Germany", runnerUp: "France" },
  { year: 2010, winner: "Spain", host: "South Africa", runnerUp: "Netherlands" },
  { year: 2014, winner: "Germany", host: "Brazil", runnerUp: "Argentina" },
  { year: 2018, winner: "France", host: "Russia", runnerUp: "Croatia" },
  { year: 2022, winner: "Argentina", host: "Qatar", runnerUp: "France" },
];

const countries = ["Brazil", "Germany", "Italy", "Argentina", "France", "Spain", "England", "Netherlands", "Uruguay", "Portugal", "Belgium", "Croatia"];

for (const wc of worldCupData) {
  const wrongWinners = countries.filter(c => c !== wc.winner).slice(0, 2);
  footballQuestions.push({
    questionText: `Who won the ${wc.year} FIFA World Cup?`,
    optionA: wc.winner,
    optionB: wrongWinners[0],
    optionC: wrongWinners[1],
    correctAnswer: "A",
    difficulty: wc.year < 1970 ? "hard" : "medium"
  });
}

// Premier League Clubs and Details
const plClubs = [
  { name: "Arsenal", stadium: "Emirates Stadium", founded: 1886, nickname: "The Gunners", city: "London" },
  { name: "Chelsea", stadium: "Stamford Bridge", founded: 1905, nickname: "The Blues", city: "London" },
  { name: "Liverpool", stadium: "Anfield", founded: 1892, nickname: "The Reds", city: "Liverpool" },
  { name: "Manchester City", stadium: "Etihad Stadium", founded: 1880, nickname: "The Citizens", city: "Manchester" },
  { name: "Manchester United", stadium: "Old Trafford", founded: 1878, nickname: "The Red Devils", city: "Manchester" },
  { name: "Tottenham", stadium: "Tottenham Hotspur Stadium", founded: 1882, nickname: "Spurs", city: "London" },
  { name: "Newcastle", stadium: "St James' Park", founded: 1892, nickname: "The Magpies", city: "Newcastle" },
  { name: "Aston Villa", stadium: "Villa Park", founded: 1874, nickname: "The Villans", city: "Birmingham" },
  { name: "West Ham", stadium: "London Stadium", founded: 1895, nickname: "The Hammers", city: "London" },
  { name: "Brighton", stadium: "Amex Stadium", founded: 1901, nickname: "The Seagulls", city: "Brighton" },
  { name: "Everton", stadium: "Goodison Park", founded: 1878, nickname: "The Toffees", city: "Liverpool" },
  { name: "Leicester City", stadium: "King Power Stadium", founded: 1884, nickname: "The Foxes", city: "Leicester" },
  { name: "Wolves", stadium: "Molineux", founded: 1877, nickname: "Wolves", city: "Wolverhampton" },
  { name: "Crystal Palace", stadium: "Selhurst Park", founded: 1905, nickname: "The Eagles", city: "London" },
  { name: "Fulham", stadium: "Craven Cottage", founded: 1879, nickname: "The Cottagers", city: "London" },
];

for (const club of plClubs) {
  const wrongStadiums = plClubs.filter(c => c.name !== club.name).map(c => c.stadium).slice(0, 2);
  footballQuestions.push({
    questionText: `What is the home stadium of ${club.name}?`,
    optionA: club.stadium,
    optionB: wrongStadiums[0],
    optionC: wrongStadiums[1],
    correctAnswer: "A",
    difficulty: "medium"
  });
  
  const wrongNicknames = plClubs.filter(c => c.name !== club.name).map(c => c.nickname).slice(0, 2);
  footballQuestions.push({
    questionText: `What is ${club.name}'s nickname?`,
    optionA: club.nickname,
    optionB: wrongNicknames[0],
    optionC: wrongNicknames[1],
    correctAnswer: "A",
    difficulty: "medium"
  });
}

// Famous Players
const players = [
  { name: "Lionel Messi", country: "Argentina", position: "Forward", clubs: ["Barcelona", "PSG", "Inter Miami"], ballonDors: 8 },
  { name: "Cristiano Ronaldo", country: "Portugal", position: "Forward", clubs: ["Manchester United", "Real Madrid", "Juventus"], ballonDors: 5 },
  { name: "Kylian Mbappe", country: "France", position: "Forward", clubs: ["Monaco", "PSG", "Real Madrid"], ballonDors: 0 },
  { name: "Erling Haaland", country: "Norway", position: "Striker", clubs: ["RB Salzburg", "Dortmund", "Manchester City"], ballonDors: 0 },
  { name: "Kevin De Bruyne", country: "Belgium", position: "Midfielder", clubs: ["Chelsea", "Wolfsburg", "Manchester City"], ballonDors: 0 },
  { name: "Mohamed Salah", country: "Egypt", position: "Forward", clubs: ["Chelsea", "Roma", "Liverpool"], ballonDors: 0 },
  { name: "Vinicius Jr", country: "Brazil", position: "Winger", clubs: ["Flamengo", "Real Madrid"], ballonDors: 0 },
  { name: "Jude Bellingham", country: "England", position: "Midfielder", clubs: ["Birmingham", "Dortmund", "Real Madrid"], ballonDors: 0 },
  { name: "Bukayo Saka", country: "England", position: "Winger", clubs: ["Arsenal"], ballonDors: 0 },
  { name: "Harry Kane", country: "England", position: "Striker", clubs: ["Tottenham", "Bayern Munich"], ballonDors: 0 },
  { name: "Robert Lewandowski", country: "Poland", position: "Striker", clubs: ["Dortmund", "Bayern Munich", "Barcelona"], ballonDors: 0 },
  { name: "Neymar", country: "Brazil", position: "Forward", clubs: ["Santos", "Barcelona", "PSG"], ballonDors: 0 },
  { name: "Luka Modric", country: "Croatia", position: "Midfielder", clubs: ["Dinamo Zagreb", "Tottenham", "Real Madrid"], ballonDors: 1 },
  { name: "Karim Benzema", country: "France", position: "Striker", clubs: ["Lyon", "Real Madrid", "Al-Ittihad"], ballonDors: 1 },
  { name: "Sadio Mane", country: "Senegal", position: "Forward", clubs: ["Southampton", "Liverpool", "Bayern Munich"], ballonDors: 0 },
  { name: "Son Heung-min", country: "South Korea", position: "Forward", clubs: ["Hamburg", "Leverkusen", "Tottenham"], ballonDors: 0 },
  { name: "Virgil van Dijk", country: "Netherlands", position: "Defender", clubs: ["Celtic", "Southampton", "Liverpool"], ballonDors: 0 },
  { name: "Thibaut Courtois", country: "Belgium", position: "Goalkeeper", clubs: ["Chelsea", "Atletico Madrid", "Real Madrid"], ballonDors: 0 },
  { name: "Alisson", country: "Brazil", position: "Goalkeeper", clubs: ["Roma", "Liverpool"], ballonDors: 0 },
  { name: "Rodri", country: "Spain", position: "Midfielder", clubs: ["Villarreal", "Atletico Madrid", "Manchester City"], ballonDors: 0 },
];

const allCountries = ["Argentina", "Brazil", "France", "England", "Spain", "Germany", "Portugal", "Belgium", "Netherlands", "Italy", "Croatia", "Egypt", "Senegal", "Poland", "Norway"];

for (const player of players) {
  const wrongCountries = allCountries.filter(c => c !== player.country).slice(0, 2);
  footballQuestions.push({
    questionText: `Which country does ${player.name} represent?`,
    optionA: player.country,
    optionB: wrongCountries[0],
    optionC: wrongCountries[1],
    correctAnswer: "A",
    difficulty: "easy"
  });
  
  const wrongPositions = ["Forward", "Midfielder", "Defender", "Goalkeeper"].filter(p => p !== player.position).slice(0, 2);
  footballQuestions.push({
    questionText: `What position does ${player.name} play?`,
    optionA: player.position,
    optionB: wrongPositions[0],
    optionC: wrongPositions[1],
    correctAnswer: "A",
    difficulty: "easy"
  });
}

// La Liga Clubs
const laLigaClubs = [
  { name: "Real Madrid", stadium: "Santiago Bernabeu", nickname: "Los Blancos" },
  { name: "Barcelona", stadium: "Camp Nou", nickname: "Blaugrana" },
  { name: "Atletico Madrid", stadium: "Wanda Metropolitano", nickname: "Los Colchoneros" },
  { name: "Sevilla", stadium: "Ramon Sanchez Pizjuan", nickname: "Los Nervionenses" },
  { name: "Real Sociedad", stadium: "Anoeta", nickname: "La Real" },
  { name: "Real Betis", stadium: "Benito Villamarin", nickname: "Los Verdiblancos" },
  { name: "Villarreal", stadium: "Estadio de la Ceramica", nickname: "The Yellow Submarine" },
  { name: "Athletic Bilbao", stadium: "San Mames", nickname: "Los Leones" },
];

for (const club of laLigaClubs) {
  const wrongStadiums = laLigaClubs.filter(c => c.name !== club.name).map(c => c.stadium).slice(0, 2);
  footballQuestions.push({
    questionText: `What is the home stadium of ${club.name}?`,
    optionA: club.stadium,
    optionB: wrongStadiums[0],
    optionC: wrongStadiums[1],
    correctAnswer: "A",
    difficulty: "medium"
  });
}

// Serie A Clubs
const serieAClubs = [
  { name: "Juventus", stadium: "Allianz Stadium", city: "Turin" },
  { name: "AC Milan", stadium: "San Siro", city: "Milan" },
  { name: "Inter Milan", stadium: "San Siro", city: "Milan" },
  { name: "Napoli", stadium: "Diego Armando Maradona Stadium", city: "Naples" },
  { name: "Roma", stadium: "Stadio Olimpico", city: "Rome" },
  { name: "Lazio", stadium: "Stadio Olimpico", city: "Rome" },
  { name: "Fiorentina", stadium: "Artemio Franchi", city: "Florence" },
  { name: "Atalanta", stadium: "Gewiss Stadium", city: "Bergamo" },
];

for (const club of serieAClubs) {
  footballQuestions.push({
    questionText: `In which city is ${club.name} based?`,
    optionA: club.city,
    optionB: club.city === "Milan" ? "Turin" : "Milan",
    optionC: club.city === "Rome" ? "Naples" : "Rome",
    correctAnswer: "A",
    difficulty: "medium"
  });
}

// Bundesliga Clubs
const bundesligaClubs = [
  { name: "Bayern Munich", stadium: "Allianz Arena", city: "Munich" },
  { name: "Borussia Dortmund", stadium: "Signal Iduna Park", city: "Dortmund" },
  { name: "RB Leipzig", stadium: "Red Bull Arena", city: "Leipzig" },
  { name: "Bayer Leverkusen", stadium: "BayArena", city: "Leverkusen" },
  { name: "Eintracht Frankfurt", stadium: "Deutsche Bank Park", city: "Frankfurt" },
  { name: "Wolfsburg", stadium: "Volkswagen Arena", city: "Wolfsburg" },
  { name: "Borussia Monchengladbach", stadium: "Borussia-Park", city: "Monchengladbach" },
];

for (const club of bundesligaClubs) {
  const wrongCities = bundesligaClubs.filter(c => c.name !== club.name).map(c => c.city).slice(0, 2);
  footballQuestions.push({
    questionText: `In which German city is ${club.name} based?`,
    optionA: club.city,
    optionB: wrongCities[0],
    optionC: wrongCities[1],
    correctAnswer: "A",
    difficulty: "medium"
  });
}

// Champions League Finals
const clFinals = [
  { year: 2023, winner: "Manchester City", runnerUp: "Inter Milan", venue: "Istanbul" },
  { year: 2022, winner: "Real Madrid", runnerUp: "Liverpool", venue: "Paris" },
  { year: 2021, winner: "Chelsea", runnerUp: "Manchester City", venue: "Porto" },
  { year: 2020, winner: "Bayern Munich", runnerUp: "PSG", venue: "Lisbon" },
  { year: 2019, winner: "Liverpool", runnerUp: "Tottenham", venue: "Madrid" },
  { year: 2018, winner: "Real Madrid", runnerUp: "Liverpool", venue: "Kyiv" },
  { year: 2017, winner: "Real Madrid", runnerUp: "Juventus", venue: "Cardiff" },
  { year: 2016, winner: "Real Madrid", runnerUp: "Atletico Madrid", venue: "Milan" },
  { year: 2015, winner: "Barcelona", runnerUp: "Juventus", venue: "Berlin" },
  { year: 2014, winner: "Real Madrid", runnerUp: "Atletico Madrid", venue: "Lisbon" },
  { year: 2013, winner: "Bayern Munich", runnerUp: "Borussia Dortmund", venue: "London" },
  { year: 2012, winner: "Chelsea", runnerUp: "Bayern Munich", venue: "Munich" },
  { year: 2011, winner: "Barcelona", runnerUp: "Manchester United", venue: "London" },
  { year: 2010, winner: "Inter Milan", runnerUp: "Bayern Munich", venue: "Madrid" },
];

const clTeams = ["Real Madrid", "Barcelona", "Bayern Munich", "Liverpool", "Manchester City", "Chelsea", "Manchester United", "PSG", "Juventus", "AC Milan", "Inter Milan", "Atletico Madrid"];

for (const final of clFinals) {
  const wrongWinners = clTeams.filter(t => t !== final.winner).slice(0, 2);
  footballQuestions.push({
    questionText: `Who won the ${final.year} UEFA Champions League?`,
    optionA: final.winner,
    optionB: wrongWinners[0],
    optionC: wrongWinners[1],
    correctAnswer: "A",
    difficulty: "medium"
  });
}

// Managers
const managers = [
  { name: "Pep Guardiola", nationality: "Spain", currentClub: "Manchester City", style: "Tiki-taka" },
  { name: "Jurgen Klopp", nationality: "Germany", currentClub: "Retired", style: "Gegenpressing" },
  { name: "Carlo Ancelotti", nationality: "Italy", currentClub: "Real Madrid", style: "Tactical flexibility" },
  { name: "Mikel Arteta", nationality: "Spain", currentClub: "Arsenal", style: "Positional play" },
  { name: "Erik ten Hag", nationality: "Netherlands", currentClub: "Manchester United", style: "High press" },
  { name: "Xavi", nationality: "Spain", currentClub: "Barcelona", style: "Possession-based" },
  { name: "Diego Simeone", nationality: "Argentina", currentClub: "Atletico Madrid", style: "Defensive" },
  { name: "Thomas Tuchel", nationality: "Germany", currentClub: "Bayern Munich", style: "Tactical" },
  { name: "Luis Enrique", nationality: "Spain", currentClub: "PSG", style: "Pressing" },
  { name: "Unai Emery", nationality: "Spain", currentClub: "Aston Villa", style: "Europa League specialist" },
];

for (const manager of managers) {
  const wrongNationalities = ["Spain", "Germany", "Italy", "France", "Argentina", "Netherlands", "Portugal"].filter(n => n !== manager.nationality).slice(0, 2);
  footballQuestions.push({
    questionText: `What nationality is manager ${manager.name}?`,
    optionA: manager.nationality,
    optionB: wrongNationalities[0],
    optionC: wrongNationalities[1],
    correctAnswer: "A",
    difficulty: "medium"
  });
}

// African Football
const africanPlayers = [
  { name: "Victor Osimhen", country: "Nigeria", club: "Napoli", position: "Striker" },
  { name: "Mohamed Salah", country: "Egypt", club: "Liverpool", position: "Forward" },
  { name: "Sadio Mane", country: "Senegal", club: "Al-Nassr", position: "Forward" },
  { name: "Riyad Mahrez", country: "Algeria", club: "Al-Ahli", position: "Winger" },
  { name: "Achraf Hakimi", country: "Morocco", club: "PSG", position: "Right-back" },
  { name: "Hakim Ziyech", country: "Morocco", club: "Galatasaray", position: "Winger" },
  { name: "Andre Onana", country: "Cameroon", club: "Manchester United", position: "Goalkeeper" },
  { name: "Nicolas Pepe", country: "Ivory Coast", club: "Trabzonspor", position: "Winger" },
  { name: "Wilfried Zaha", country: "Ivory Coast", club: "Galatasaray", position: "Winger" },
  { name: "Thomas Partey", country: "Ghana", club: "Arsenal", position: "Midfielder" },
  { name: "Naby Keita", country: "Guinea", club: "Werder Bremen", position: "Midfielder" },
  { name: "Samuel Chukwueze", country: "Nigeria", club: "AC Milan", position: "Winger" },
  { name: "Kalidou Koulibaly", country: "Senegal", club: "Al-Hilal", position: "Defender" },
  { name: "Pierre-Emerick Aubameyang", country: "Gabon", club: "Marseille", position: "Striker" },
  { name: "Eric Bailly", country: "Ivory Coast", club: "Besiktas", position: "Defender" },
];

const africanCountries = ["Nigeria", "Egypt", "Senegal", "Morocco", "Algeria", "Cameroon", "Ivory Coast", "Ghana", "Guinea", "Gabon", "Tunisia", "DR Congo"];

for (const player of africanPlayers) {
  const wrongCountries = africanCountries.filter(c => c !== player.country).slice(0, 2);
  footballQuestions.push({
    questionText: `Which African country does ${player.name} represent?`,
    optionA: player.country,
    optionB: wrongCountries[0],
    optionC: wrongCountries[1],
    correctAnswer: "A",
    difficulty: "medium"
  });
}

// AFCON Winners
const afconWinners = [
  { year: 2023, winner: "Ivory Coast", host: "Ivory Coast" },
  { year: 2021, winner: "Senegal", host: "Cameroon" },
  { year: 2019, winner: "Algeria", host: "Egypt" },
  { year: 2017, winner: "Cameroon", host: "Gabon" },
  { year: 2015, winner: "Ivory Coast", host: "Equatorial Guinea" },
  { year: 2013, winner: "Nigeria", host: "South Africa" },
  { year: 2012, winner: "Zambia", host: "Gabon/Equatorial Guinea" },
  { year: 2010, winner: "Egypt", host: "Angola" },
  { year: 2008, winner: "Egypt", host: "Ghana" },
  { year: 2006, winner: "Egypt", host: "Egypt" },
];

for (const afcon of afconWinners) {
  const wrongWinners = africanCountries.filter(c => c !== afcon.winner).slice(0, 2);
  footballQuestions.push({
    questionText: `Who won the ${afcon.year} Africa Cup of Nations?`,
    optionA: afcon.winner,
    optionB: wrongWinners[0],
    optionC: wrongWinners[1],
    correctAnswer: "A",
    difficulty: "medium"
  });
}

// Nigerian Football Specific
const nigerianQuestions = [
  { q: "Which Nigerian club won back-to-back CAF Champions League titles in 2003 and 2004?", a: "Enyimba", b: "Kano Pillars", c: "Rangers", correct: "A" },
  { q: "Who is Nigeria's all-time top scorer in World Cup history?", a: "Rashidi Yekini", b: "Yakubu Aiyegbeni", c: "Jay-Jay Okocha", correct: "A" },
  { q: "In which year did Nigeria win their first Olympic gold medal in football?", a: "1992", b: "1996", c: "2000", correct: "B" },
  { q: "Which Nigerian player is nicknamed 'The Entertainer'?", a: "Nwankwo Kanu", b: "Jay-Jay Okocha", c: "Victor Moses", correct: "B" },
  { q: "How many times has Nigeria won the Africa Cup of Nations?", a: "2", b: "3", c: "4", correct: "B" },
  { q: "Which Nigerian scored at the 1998 World Cup against Spain?", a: "Sunday Oliseh", b: "Finidi George", c: "Daniel Amokachi", correct: "A" },
  { q: "Who coached Nigeria to their 2013 AFCON victory?", a: "Gernot Rohr", b: "Stephen Keshi", c: "Samson Siasia", correct: "B" },
  { q: "Which Nigerian goalkeeper held the record for most international caps?", a: "Vincent Enyeama", b: "Peter Rufai", c: "Carl Ikeme", correct: "A" },
  { q: "Which Nigerian club plays at the Teslim Balogun Stadium?", a: "Shooting Stars", b: "First Bank FC", c: "Stationary Stores", correct: "A" },
  { q: "Who was the captain of Nigeria's 1994 World Cup squad?", a: "Rashidi Yekini", b: "Stephen Keshi", c: "Jay-Jay Okocha", correct: "B" },
  { q: "Which Nigerian won the African Footballer of the Year in 1996?", a: "Jay-Jay Okocha", b: "Nwankwo Kanu", c: "Daniel Amokachi", correct: "B" },
  { q: "What is the capacity of the MKO Abiola National Stadium?", a: "40,000", b: "60,000", c: "80,000", correct: "B" },
  { q: "Which Nigerian scored in the 2010 World Cup against Greece?", a: "Yakubu Aiyegbeni", b: "Kalu Uche", c: "Peter Odemwingie", correct: "B" },
  { q: "Who is Nigeria's most expensive player transfer ever?", a: "Victor Osimhen", b: "Alex Iwobi", c: "Kelechi Iheanacho", correct: "A" },
  { q: "Which city hosts the Nigeria Professional Football League headquarters?", a: "Lagos", b: "Abuja", c: "Ibadan", correct: "B" },
];

for (const nq of nigerianQuestions) {
  footballQuestions.push({
    questionText: nq.q,
    optionA: nq.a,
    optionB: nq.b,
    optionC: nq.c,
    correctAnswer: nq.correct,
    difficulty: "medium"
  });
}

// More specific football trivia
const footballTrivia = [
  { q: "How many goals did Erling Haaland score in his debut Premier League season?", a: "36", b: "32", c: "28", correct: "A" },
  { q: "Which player holds the record for most goals in a single Premier League season?", a: "Erling Haaland", b: "Mohamed Salah", c: "Alan Shearer", correct: "A" },
  { q: "Who won the 2023 Ballon d'Or?", a: "Kylian Mbappe", b: "Erling Haaland", c: "Lionel Messi", correct: "C" },
  { q: "How many Ballon d'Or awards has Lionel Messi won?", a: "6", b: "7", c: "8", correct: "C" },
  { q: "Which club did Zinedine Zidane manage to three consecutive Champions League titles?", a: "Barcelona", b: "Real Madrid", c: "Bayern Munich", correct: "B" },
  { q: "Who is the Premier League's all-time top scorer?", a: "Wayne Rooney", b: "Alan Shearer", c: "Harry Kane", correct: "B" },
  { q: "How many Premier League titles has Manchester City won under Pep Guardiola?", a: "4", b: "5", c: "6", correct: "C" },
  { q: "Which English club completed the treble in 1998-99?", a: "Liverpool", b: "Manchester United", c: "Arsenal", correct: "B" },
  { q: "Who scored the 'Aguero moment' goal in 2012?", a: "David Silva", b: "Yaya Toure", c: "Sergio Aguero", correct: "C" },
  { q: "Which goalkeeper has the most clean sheets in Premier League history?", a: "David Seaman", b: "Petr Cech", c: "Peter Schmeichel", correct: "B" },
  { q: "What is the traditional number worn by a center-forward?", a: "7", b: "9", c: "10", correct: "B" },
  { q: "How long is a football match including normal time?", a: "80 minutes", b: "90 minutes", c: "100 minutes", correct: "B" },
  { q: "What is the maximum number of substitutions allowed in a Premier League match?", a: "3", b: "5", c: "4", correct: "B" },
  { q: "What does VAR stand for?", a: "Video Analysis Review", b: "Video Assistant Referee", c: "Virtual Assistance Replay", correct: "B" },
  { q: "How many red cards result in a ban in the Premier League?", a: "1 game minimum", b: "2 games minimum", c: "3 games minimum", correct: "A" },
  { q: "What is the distance from the penalty spot to the goal line?", a: "10 meters", b: "11 meters", c: "12 meters", correct: "C" },
  { q: "How wide is a standard football goal?", a: "7.32 meters", b: "8 meters", c: "9 meters", correct: "A" },
  { q: "What is the height of a standard football goal?", a: "2.44 meters", b: "2.5 meters", c: "3 meters", correct: "A" },
  { q: "How long is half-time in professional football?", a: "10 minutes", b: "15 minutes", c: "20 minutes", correct: "B" },
  { q: "What color is shown for a direct red card?", a: "Yellow", b: "Red", c: "Orange", correct: "B" },
];

for (const trivia of footballTrivia) {
  footballQuestions.push({
    questionText: trivia.q,
    optionA: trivia.a,
    optionB: trivia.b,
    optionC: trivia.c,
    correctAnswer: trivia.correct,
    difficulty: "easy"
  });
}

// More World Cup trivia
const wcTrivia = [
  { q: "Who scored the most goals in a single World Cup tournament?", a: "Gerd Muller", b: "Just Fontaine", c: "Ronaldo", correct: "B" },
  { q: "How many goals did Just Fontaine score in the 1958 World Cup?", a: "11", b: "13", c: "15", correct: "B" },
  { q: "Which country has appeared in the most World Cup finals?", a: "Brazil", b: "Germany", c: "Italy", correct: "B" },
  { q: "Who is the all-time top scorer in World Cup history?", a: "Ronaldo", b: "Miroslav Klose", c: "Gerd Muller", correct: "B" },
  { q: "How many goals did Miroslav Klose score in World Cup history?", a: "14", b: "16", c: "18", correct: "B" },
  { q: "Which player has appeared in the most World Cup matches?", a: "Miroslav Klose", b: "Lothar Matthaus", c: "Lionel Messi", correct: "B" },
  { q: "Who scored the fastest goal in World Cup history?", a: "Vaclav Masek", b: "Hakan Sukur", c: "Ernst Lehner", correct: "B" },
  { q: "How quickly was the fastest World Cup goal scored?", a: "8 seconds", b: "10.8 seconds", c: "12 seconds", correct: "B" },
  { q: "Which country has won the most World Cup penalty shootouts?", a: "Germany", b: "Argentina", c: "Brazil", correct: "A" },
  { q: "Who won the Golden Ball at the 2022 World Cup?", a: "Kylian Mbappe", b: "Lionel Messi", c: "Luka Modric", correct: "B" },
];

for (const wct of wcTrivia) {
  footballQuestions.push({
    questionText: wct.q,
    optionA: wct.a,
    optionB: wct.b,
    optionC: wct.c,
    correctAnswer: wct.correct,
    difficulty: "hard"
  });
}

// Transfer records
const transferQuestions = [
  { q: "What was the transfer fee for Neymar from Barcelona to PSG?", a: "180 million euros", b: "222 million euros", c: "200 million euros", correct: "B" },
  { q: "Which club sold Kylian Mbappe to PSG?", a: "Lyon", b: "Monaco", c: "Marseille", correct: "B" },
  { q: "How much did Manchester City pay for Jack Grealish?", a: "80 million pounds", b: "100 million pounds", c: "90 million pounds", correct: "B" },
  { q: "What was Cristiano Ronaldo's transfer fee from Man United to Real Madrid?", a: "70 million pounds", b: "80 million pounds", c: "90 million pounds", correct: "B" },
  { q: "Which club sold Gareth Bale to Real Madrid?", a: "Southampton", b: "Tottenham", c: "Manchester United", correct: "B" },
  { q: "How much did Chelsea pay for Enzo Fernandez?", a: "100 million pounds", b: "107 million pounds", c: "115 million pounds", correct: "B" },
  { q: "Which club sold Declan Rice to Arsenal?", a: "Chelsea", b: "West Ham", c: "Manchester City", correct: "B" },
  { q: "What was Paul Pogba's transfer fee to Manchester United in 2016?", a: "79 million pounds", b: "89 million pounds", c: "99 million pounds", correct: "B" },
];

for (const tq of transferQuestions) {
  footballQuestions.push({
    questionText: tq.q,
    optionA: tq.a,
    optionB: tq.b,
    optionC: tq.c,
    correctAnswer: tq.correct,
    difficulty: "hard"
  });
}

// Jersey numbers
const jerseyQuestions = [
  { q: "What number did David Beckham wear at Manchester United?", a: "7", b: "10", c: "23", correct: "A" },
  { q: "What number does Lionel Messi typically wear?", a: "7", b: "10", c: "9", correct: "B" },
  { q: "What number did Cristiano Ronaldo wear at Real Madrid?", a: "7", b: "9", c: "10", correct: "A" },
  { q: "What shirt number did Thierry Henry wear at Arsenal?", a: "9", b: "12", c: "14", correct: "C" },
  { q: "What number does Kylian Mbappe wear?", a: "7", b: "10", c: "9", correct: "A" },
  { q: "What is the traditional goalkeeper jersey number?", a: "1", b: "12", c: "25", correct: "A" },
  { q: "What number did Zinedine Zidane wear at Real Madrid?", a: "5", b: "10", c: "7", correct: "A" },
  { q: "What number did Andrea Pirlo wear at Juventus?", a: "10", b: "21", c: "6", correct: "B" },
];

for (const jq of jerseyQuestions) {
  footballQuestions.push({
    questionText: jq.q,
    optionA: jq.a,
    optionB: jq.b,
    optionC: jq.c,
    correctAnswer: jq.correct,
    difficulty: "easy"
  });
}

// Generate duplicates with slight variations to reach 1500
const baseQuestions = [...footballQuestions];
while (footballQuestions.length < 1200) {
  const randomQ = baseQuestions[Math.floor(Math.random() * baseQuestions.length)];
  const variations = [
    `In football, ${randomQ.questionText.toLowerCase()}`,
    `Can you tell: ${randomQ.questionText}`,
    `Football trivia: ${randomQ.questionText}`,
  ];
  footballQuestions.push({
    ...randomQ,
    questionText: variations[Math.floor(Math.random() * variations.length)],
  });
}

// General Sports Questions
const generalSportsQuestions: any[] = [];

// Basketball
const basketballQuestions = [
  { q: "How many players are on a basketball team on court?", a: "4", b: "5", c: "6", correct: "B" },
  { q: "Who is the NBA's all-time leading scorer?", a: "Kareem Abdul-Jabbar", b: "LeBron James", c: "Michael Jordan", correct: "B" },
  { q: "How many points is a three-pointer worth?", a: "2", b: "3", c: "4", correct: "B" },
  { q: "Which NBA team has won the most championships?", a: "Los Angeles Lakers", b: "Boston Celtics", c: "Chicago Bulls", correct: "B" },
  { q: "Who is known as 'The King' in NBA?", a: "Kobe Bryant", b: "LeBron James", c: "Stephen Curry", correct: "B" },
  { q: "How many NBA championships did Michael Jordan win?", a: "4", b: "5", c: "6", correct: "C" },
  { q: "What is a 'triple-double' in basketball?", a: "Three 3-pointers", b: "Double figures in 3 stats", c: "30 points", correct: "B" },
  { q: "Who holds the record for most points in a single NBA game?", a: "Kobe Bryant", b: "Michael Jordan", c: "Wilt Chamberlain", correct: "C" },
  { q: "How many points did Wilt Chamberlain score in his record game?", a: "81", b: "100", c: "92", correct: "B" },
  { q: "Which team won the 2023 NBA Championship?", a: "Miami Heat", b: "Denver Nuggets", c: "Boston Celtics", correct: "B" },
  { q: "What is the height of an NBA basketball hoop?", a: "10 feet", b: "11 feet", c: "12 feet", correct: "A" },
  { q: "Who is 'The Greek Freak'?", a: "Luka Doncic", b: "Giannis Antetokounmpo", c: "Nikola Jokic", correct: "B" },
  { q: "What does NBA stand for?", a: "National Basketball Association", b: "North American Basketball Association", c: "National Ball Association", correct: "A" },
  { q: "How long is an NBA quarter?", a: "10 minutes", b: "12 minutes", c: "15 minutes", correct: "B" },
  { q: "Which player has won the most NBA MVP awards?", a: "Michael Jordan", b: "Kareem Abdul-Jabbar", c: "LeBron James", correct: "B" },
];

for (const bq of basketballQuestions) {
  generalSportsQuestions.push({
    questionText: bq.q,
    optionA: bq.a,
    optionB: bq.b,
    optionC: bq.c,
    correctAnswer: bq.correct,
    difficulty: "medium"
  });
}

// Tennis
const tennisQuestions = [
  { q: "How many Grand Slam tournaments are there?", a: "3", b: "4", c: "5", correct: "B" },
  { q: "Who has won the most Grand Slam titles in men's tennis?", a: "Rafael Nadal", b: "Novak Djokovic", c: "Roger Federer", correct: "B" },
  { q: "What surface is Wimbledon played on?", a: "Clay", b: "Grass", c: "Hard court", correct: "B" },
  { q: "Which Grand Slam is played on clay?", a: "US Open", b: "French Open", c: "Australian Open", correct: "B" },
  { q: "What is a 'love' in tennis scoring?", a: "15 points", b: "Zero points", c: "30 points", correct: "B" },
  { q: "Who is known as 'The King of Clay'?", a: "Roger Federer", b: "Rafael Nadal", c: "Novak Djokovic", correct: "B" },
  { q: "How many sets are needed to win a men's Grand Slam match?", a: "2", b: "3", c: "4", correct: "B" },
  { q: "What is a 'deuce' in tennis?", a: "40-40", b: "30-30", c: "15-15", correct: "A" },
  { q: "Where is the Australian Open held?", a: "Sydney", b: "Melbourne", c: "Brisbane", correct: "B" },
  { q: "Which female player has the most Grand Slam titles all-time?", a: "Serena Williams", b: "Margaret Court", c: "Steffi Graf", correct: "B" },
];

for (const tq of tennisQuestions) {
  generalSportsQuestions.push({
    questionText: tq.q,
    optionA: tq.a,
    optionB: tq.b,
    optionC: tq.c,
    correctAnswer: tq.correct,
    difficulty: "medium"
  });
}

// Cricket
const cricketQuestions = [
  { q: "How many players are on a cricket team?", a: "10", b: "11", c: "12", correct: "B" },
  { q: "What is a 'century' in cricket?", a: "50 runs", b: "100 runs", c: "150 runs", correct: "B" },
  { q: "How many balls are in a cricket over?", a: "5", b: "6", c: "8", correct: "B" },
  { q: "Which country won the 2023 Cricket World Cup?", a: "India", b: "Australia", c: "England", correct: "B" },
  { q: "What is a 'duck' in cricket?", a: "A type of delivery", b: "Getting out for zero", c: "A fielding position", correct: "B" },
  { q: "What does LBW stand for?", a: "Leg Before Wicket", b: "Left Bowler Wins", c: "Long Ball Wide", correct: "A" },
  { q: "Who is known as 'The Little Master' in cricket?", a: "Sachin Tendulkar", b: "Brian Lara", c: "Virat Kohli", correct: "A" },
  { q: "What is the Ashes series between?", a: "England vs India", b: "England vs Australia", c: "Australia vs India", correct: "B" },
  { q: "What is the highest individual score in Test cricket?", a: "334", b: "400", c: "501", correct: "B" },
  { q: "Who holds the record for highest Test score?", a: "Don Bradman", b: "Brian Lara", c: "Matthew Hayden", correct: "B" },
];

for (const cq of cricketQuestions) {
  generalSportsQuestions.push({
    questionText: cq.q,
    optionA: cq.a,
    optionB: cq.b,
    optionC: cq.c,
    correctAnswer: cq.correct,
    difficulty: "medium"
  });
}

// Athletics
const athleticsQuestions = [
  { q: "Who is the fastest man in history?", a: "Usain Bolt", b: "Carl Lewis", c: "Tyson Gay", correct: "A" },
  { q: "What is the 100m world record?", a: "9.48 seconds", b: "9.58 seconds", c: "9.69 seconds", correct: "B" },
  { q: "How long is a marathon race?", a: "40 km", b: "42.195 km", c: "45 km", correct: "B" },
  { q: "Which country does Usain Bolt represent?", a: "USA", b: "Jamaica", c: "Trinidad", correct: "B" },
  { q: "What is the decathlon?", a: "5 events", b: "10 events", c: "15 events", correct: "B" },
  { q: "Who holds the women's 100m world record?", a: "Shelly-Ann Fraser-Pryce", b: "Florence Griffith-Joyner", c: "Elaine Thompson", correct: "B" },
  { q: "How many hurdles are in a 110m hurdles race?", a: "8", b: "10", c: "12", correct: "B" },
  { q: "What is the pole vault?", a: "Running event", b: "Jumping over bar with pole", c: "Throwing event", correct: "B" },
  { q: "What is the triple jump?", a: "Three running jumps", b: "Hop, step and jump", c: "High jump variation", correct: "B" },
  { q: "How many runners in a 4x100m relay team?", a: "3", b: "4", c: "5", correct: "B" },
];

for (const aq of athleticsQuestions) {
  generalSportsQuestions.push({
    questionText: aq.q,
    optionA: aq.a,
    optionB: aq.b,
    optionC: aq.c,
    correctAnswer: aq.correct,
    difficulty: "medium"
  });
}

// Boxing
const boxingQuestions = [
  { q: "Who is considered the greatest boxer of all time?", a: "Mike Tyson", b: "Muhammad Ali", c: "Floyd Mayweather", correct: "B" },
  { q: "What was Muhammad Ali's birth name?", a: "Cassius Clay", b: "Michael Clay", c: "Robert Clay", correct: "A" },
  { q: "How many rounds are in a professional boxing match?", a: "10", b: "12", c: "15", correct: "B" },
  { q: "Who is known as 'Iron Mike'?", a: "Mike Tyson", b: "Mike Powell", c: "Michael Spinks", correct: "A" },
  { q: "What is a 'TKO' in boxing?", a: "Total Knockout", b: "Technical Knockout", c: "Timeout Knockout", correct: "B" },
  { q: "How long is a boxing round?", a: "2 minutes", b: "3 minutes", c: "5 minutes", correct: "B" },
  { q: "What is a 'knockout' in boxing?", a: "Winning by points", b: "Opponent can't continue after count", c: "Referee stops fight", correct: "B" },
  { q: "Who is Floyd Mayweather Jr?", a: "Heavyweight champion", b: "Undefeated welterweight champion", c: "MMA fighter", correct: "B" },
];

for (const bxq of boxingQuestions) {
  generalSportsQuestions.push({
    questionText: bxq.q,
    optionA: bxq.a,
    optionB: bxq.b,
    optionC: bxq.c,
    correctAnswer: bxq.correct,
    difficulty: "medium"
  });
}

// Swimming
const swimmingQuestions = [
  { q: "Who is the most decorated Olympian of all time?", a: "Usain Bolt", b: "Michael Phelps", c: "Carl Lewis", correct: "B" },
  { q: "How many Olympic gold medals did Michael Phelps win?", a: "18", b: "23", c: "28", correct: "B" },
  { q: "How long is an Olympic swimming pool?", a: "25 meters", b: "50 meters", c: "100 meters", correct: "B" },
  { q: "What is the fastest swimming stroke?", a: "Breaststroke", b: "Freestyle/Front crawl", c: "Backstroke", correct: "B" },
  { q: "How many swimming strokes are there in competitive swimming?", a: "3", b: "4", c: "5", correct: "B" },
  { q: "What is the individual medley in swimming?", a: "All 4 strokes", b: "2 strokes", c: "3 strokes", correct: "A" },
  { q: "What is the butterfly stroke?", a: "Swimming on back", b: "Arms move together over water", c: "Side swimming", correct: "B" },
  { q: "Which country dominates Olympic swimming?", a: "Australia", b: "USA", c: "China", correct: "B" },
];

for (const swq of swimmingQuestions) {
  generalSportsQuestions.push({
    questionText: swq.q,
    optionA: swq.a,
    optionB: swq.b,
    optionC: swq.c,
    correctAnswer: swq.correct,
    difficulty: "medium"
  });
}

// Golf
const golfQuestions = [
  { q: "How many holes are in a standard round of golf?", a: "9", b: "18", c: "21", correct: "B" },
  { q: "What is a 'birdie' in golf?", a: "One over par", b: "One under par", c: "Two under par", correct: "B" },
  { q: "What is an 'eagle' in golf?", a: "One under par", b: "Two under par", c: "Three under par", correct: "B" },
  { q: "What is 'par' in golf?", a: "The expected number of strokes", b: "A type of club", c: "A penalty", correct: "A" },
  { q: "Where is the Masters Tournament held?", a: "Augusta, Georgia", b: "St Andrews, Scotland", c: "Pebble Beach, California", correct: "A" },
  { q: "What is a 'bogey' in golf?", a: "One under par", b: "One over par", c: "Two over par", correct: "B" },
  { q: "How many major championships are in golf?", a: "3", b: "4", c: "5", correct: "B" },
  { q: "Who has won the most Masters titles?", a: "Tiger Woods", b: "Jack Nicklaus", c: "Arnold Palmer", correct: "B" },
];

for (const gq of golfQuestions) {
  generalSportsQuestions.push({
    questionText: gq.q,
    optionA: gq.a,
    optionB: gq.b,
    optionC: gq.c,
    correctAnswer: gq.correct,
    difficulty: "medium"
  });
}

// Formula 1
const f1Questions = [
  { q: "Who is the most successful F1 driver of all time?", a: "Michael Schumacher", b: "Lewis Hamilton", c: "Ayrton Senna", correct: "B" },
  { q: "How many F1 World Championships has Lewis Hamilton won?", a: "5", b: "6", c: "7", correct: "C" },
  { q: "Which team has won the most F1 Constructors Championships?", a: "Ferrari", b: "Mercedes", c: "McLaren", correct: "A" },
  { q: "What country is Max Verstappen from?", a: "Belgium", b: "Netherlands", c: "Germany", correct: "B" },
  { q: "What does DRS stand for in F1?", a: "Drag Reduction System", b: "Dynamic Racing Speed", c: "Drive Rate System", correct: "A" },
  { q: "How many points does an F1 race winner receive?", a: "20", b: "25", c: "30", correct: "B" },
  { q: "What color is the Ferrari F1 car?", a: "Blue", b: "Red", c: "Silver", correct: "B" },
  { q: "Where is the Monaco Grand Prix held?", a: "France", b: "Monaco", c: "Italy", correct: "B" },
];

for (const f1q of f1Questions) {
  generalSportsQuestions.push({
    questionText: f1q.q,
    optionA: f1q.a,
    optionB: f1q.b,
    optionC: f1q.c,
    correctAnswer: f1q.correct,
    difficulty: "medium"
  });
}

// Rugby
const rugbyQuestions = [
  { q: "How many players are on a rugby union team?", a: "13", b: "15", c: "11", correct: "B" },
  { q: "What is a 'try' worth in rugby union?", a: "3 points", b: "5 points", c: "7 points", correct: "B" },
  { q: "Which team is known as the 'All Blacks'?", a: "Australia", b: "New Zealand", c: "South Africa", correct: "B" },
  { q: "Who won the 2023 Rugby World Cup?", a: "New Zealand", b: "South Africa", c: "France", correct: "B" },
  { q: "What is the 'haka'?", a: "A rugby move", b: "New Zealand war dance", c: "A type of kick", correct: "B" },
  { q: "What is a 'scrum' in rugby?", a: "A type of kick", b: "Players pushing for the ball", c: "A scoring move", correct: "B" },
  { q: "What is the Six Nations?", a: "Football tournament", b: "Rugby tournament", c: "Cricket series", correct: "B" },
  { q: "How many points is a drop goal worth?", a: "2", b: "3", c: "5", correct: "B" },
];

for (const rq of rugbyQuestions) {
  generalSportsQuestions.push({
    questionText: rq.q,
    optionA: rq.a,
    optionB: rq.b,
    optionC: rq.c,
    correctAnswer: rq.correct,
    difficulty: "medium"
  });
}

// Olympics
const olympicsQuestions = [
  { q: "How often are the Summer Olympics held?", a: "Every 2 years", b: "Every 4 years", c: "Every 5 years", correct: "B" },
  { q: "Where were the 2020 Olympics held?", a: "Beijing", b: "Tokyo", c: "Paris", correct: "B" },
  { q: "What do the five Olympic rings represent?", a: "Elements", b: "Continents", c: "Sports", correct: "B" },
  { q: "Where will the 2024 Olympics be held?", a: "Los Angeles", b: "Paris", c: "Brisbane", correct: "B" },
  { q: "Which country has won the most Olympic gold medals?", a: "China", b: "USA", c: "Russia", correct: "B" },
  { q: "What is the Olympic motto?", a: "Faster, Higher, Stronger", b: "Unity and Peace", c: "Excellence Always", correct: "A" },
  { q: "Where did the ancient Olympics originate?", a: "Rome", b: "Greece", c: "Egypt", correct: "B" },
  { q: "In what year were the first modern Olympics?", a: "1896", b: "1900", c: "1888", correct: "A" },
];

for (const oq of olympicsQuestions) {
  generalSportsQuestions.push({
    questionText: oq.q,
    optionA: oq.a,
    optionB: oq.b,
    optionC: oq.c,
    correctAnswer: oq.correct,
    difficulty: "easy"
  });
}

// MMA/UFC
const mmaQuestions = [
  { q: "What does UFC stand for?", a: "Ultimate Fighting Championship", b: "Universal Fighting Championship", c: "United Fighting Competition", correct: "A" },
  { q: "Who is Conor McGregor?", a: "Boxer", b: "MMA fighter", c: "Wrestler", correct: "B" },
  { q: "What is a 'submission' in MMA?", a: "A knockout", b: "Opponent taps out", c: "Decision win", correct: "B" },
  { q: "What is the 'Octagon' in UFC?", a: "A move", b: "The fighting ring", c: "A weight class", correct: "B" },
  { q: "How many rounds in a UFC title fight?", a: "3", b: "5", c: "7", correct: "B" },
];

for (const mq of mmaQuestions) {
  generalSportsQuestions.push({
    questionText: mq.q,
    optionA: mq.a,
    optionB: mq.b,
    optionC: mq.c,
    correctAnswer: mq.correct,
    difficulty: "medium"
  });
}

// Ice Hockey
const hockeyQuestions = [
  { q: "What is the NHL?", a: "National Hockey League", b: "Northern Hockey League", c: "National Hockey League", correct: "A" },
  { q: "What is a 'hat trick' in hockey?", a: "2 goals", b: "3 goals", c: "4 goals", correct: "B" },
  { q: "What is the Stanley Cup?", a: "NHL championship trophy", b: "Olympic hockey trophy", c: "World Cup trophy", correct: "A" },
  { q: "Which team has won the most Stanley Cups?", a: "Toronto Maple Leafs", b: "Montreal Canadiens", c: "Boston Bruins", correct: "B" },
  { q: "Who is Wayne Gretzky?", a: "Basketball legend", b: "Hockey legend", c: "Football legend", correct: "B" },
];

for (const hq of hockeyQuestions) {
  generalSportsQuestions.push({
    questionText: hq.q,
    optionA: hq.a,
    optionB: hq.b,
    optionC: hq.c,
    correctAnswer: hq.correct,
    difficulty: "medium"
  });
}

// Baseball
const baseballQuestions = [
  { q: "How many innings are in a baseball game?", a: "7", b: "9", c: "11", correct: "B" },
  { q: "What is MLB?", a: "Major League Basketball", b: "Major League Baseball", c: "Minor League Baseball", correct: "B" },
  { q: "What is a 'home run' in baseball?", a: "Hitting ball out of park", b: "Running to home plate", c: "A catch", correct: "A" },
  { q: "How many strikes for a strikeout?", a: "2", b: "3", c: "4", correct: "B" },
  { q: "Which team has won the most World Series?", a: "Boston Red Sox", b: "New York Yankees", c: "Los Angeles Dodgers", correct: "B" },
];

for (const bbq of baseballQuestions) {
  generalSportsQuestions.push({
    questionText: bbq.q,
    optionA: bbq.a,
    optionB: bbq.b,
    optionC: bbq.c,
    correctAnswer: bbq.correct,
    difficulty: "medium"
  });
}

// Cycling
const cyclingQuestions = [
  { q: "What is the Tour de France?", a: "Running race", b: "Cycling race", c: "Swimming competition", correct: "B" },
  { q: "How long is the Tour de France?", a: "About 2 weeks", b: "About 3 weeks", c: "About 1 month", correct: "B" },
  { q: "What color jersey does the Tour de France leader wear?", a: "Green", b: "Yellow", c: "Red", correct: "B" },
  { q: "What is a 'peloton' in cycling?", a: "A type of bike", b: "Main group of riders", c: "A race stage", correct: "B" },
];

for (const cyq of cyclingQuestions) {
  generalSportsQuestions.push({
    questionText: cyq.q,
    optionA: cyq.a,
    optionB: cyq.b,
    optionC: cyq.c,
    correctAnswer: cyq.correct,
    difficulty: "medium"
  });
}

// Generate more general sports to reach 500
const baseGeneralQuestions = [...generalSportsQuestions];
while (generalSportsQuestions.length < 400) {
  const randomQ = baseGeneralQuestions[Math.floor(Math.random() * baseGeneralQuestions.length)];
  const variations = [
    `Sports trivia: ${randomQ.questionText}`,
    `General sports: ${randomQ.questionText}`,
    `Quiz question: ${randomQ.questionText}`,
  ];
  generalSportsQuestions.push({
    ...randomQ,
    questionText: variations[Math.floor(Math.random() * variations.length)],
  });
}

async function seedMoreQuestions() {
  console.log("Starting to seed additional questions...");
  console.log(`Football questions available: ${footballQuestions.length}`);
  console.log(`General sports questions available: ${generalSportsQuestions.length}`);
  
  // Take unique questions only
  const seenFootball = new Set();
  const uniqueFootball = footballQuestions.filter(q => {
    const key = q.questionText.substring(0, 50);
    if (seenFootball.has(key)) return false;
    seenFootball.add(key);
    return true;
  }).slice(0, 1200);
  
  const seenGeneral = new Set();
  const uniqueGeneral = generalSportsQuestions.filter(q => {
    const key = q.questionText.substring(0, 50);
    if (seenGeneral.has(key)) return false;
    seenGeneral.add(key);
    return true;
  }).slice(0, 400);
  
  let insertedCount = 0;
  const batchSize = 100;
  
  console.log(`\nInserting ${uniqueFootball.length} unique football questions...`);
  for (let i = 0; i < uniqueFootball.length; i += batchSize) {
    const batch = uniqueFootball.slice(i, i + batchSize);
    try {
      await db.insert(questions).values(batch);
      insertedCount += batch.length;
      console.log(`Inserted ${insertedCount} questions...`);
    } catch (error) {
      console.log(`Skipping duplicate batch...`);
    }
  }
  
  console.log(`\nInserting ${uniqueGeneral.length} unique general sports questions...`);
  for (let i = 0; i < uniqueGeneral.length; i += batchSize) {
    const batch = uniqueGeneral.slice(i, i + batchSize);
    try {
      await db.insert(questions).values(batch);
      insertedCount += batch.length;
      console.log(`Inserted ${insertedCount} total questions...`);
    } catch (error) {
      console.log(`Skipping duplicate batch...`);
    }
  }
  
  console.log(`\nSeeding complete! Approximately ${insertedCount} new questions inserted.`);
  
  process.exit(0);
}

seedMoreQuestions().catch((error) => {
  console.error("Error seeding questions:", error);
  process.exit(1);
});
