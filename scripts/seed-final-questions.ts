import { db } from "../server/db";
import { questions } from "../shared/schema";

// Final batch of questions to reach 2000 total
const finalQuestions = [
  // More football legends
  { questionText: "Which legendary striker is nicknamed 'The Phenomenon'?", optionA: "Ronaldo Nazario", optionB: "Ronaldinho", optionC: "Rivaldo", correctAnswer: "A", difficulty: "medium" },
  { questionText: "Who was the first African player to win the Ballon d'Or?", optionA: "Samuel Eto'o", optionB: "George Weah", optionC: "Didier Drogba", correctAnswer: "B", difficulty: "medium" },
  { questionText: "Which goalkeeper is known as 'The Black Spider'?", optionA: "Gianluigi Buffon", optionB: "Lev Yashin", optionC: "Peter Schmeichel", correctAnswer: "B", difficulty: "hard" },
  { questionText: "Who scored the 'Goal of the Century' in the 1986 World Cup?", optionA: "Pele", optionB: "Diego Maradona", optionC: "Michel Platini", correctAnswer: "B", difficulty: "easy" },
  { questionText: "Which Dutch player is known for inventing 'Total Football'?", optionA: "Marco van Basten", optionB: "Johan Cruyff", optionC: "Ruud Gullit", correctAnswer: "B", difficulty: "medium" },
  { questionText: "Who is the top scorer in Champions League history?", optionA: "Lionel Messi", optionB: "Cristiano Ronaldo", optionC: "Robert Lewandowski", correctAnswer: "B", difficulty: "easy" },
  { questionText: "Which club did Zlatan Ibrahimovic never play for?", optionA: "Barcelona", optionB: "Real Madrid", optionC: "AC Milan", correctAnswer: "B", difficulty: "medium" },
  { questionText: "Who managed Barcelona's Dream Team in the 1990s?", optionA: "Louis van Gaal", optionB: "Johan Cruyff", optionC: "Frank Rijkaard", correctAnswer: "B", difficulty: "medium" },
  { questionText: "Which English player is known as 'Golden Balls'?", optionA: "Wayne Rooney", optionB: "David Beckham", optionC: "Michael Owen", correctAnswer: "B", difficulty: "easy" },
  { questionText: "Who holds the record for most hat-tricks in La Liga?", optionA: "Cristiano Ronaldo", optionB: "Lionel Messi", optionC: "Karim Benzema", correctAnswer: "B", difficulty: "medium" },
  
  // More Premier League history
  { questionText: "Which club did Arsene Wenger manage for 22 years?", optionA: "Chelsea", optionB: "Arsenal", optionC: "Manchester United", correctAnswer: "B", difficulty: "easy" },
  { questionText: "Who is known as 'The Special One'?", optionA: "Pep Guardiola", optionB: "Jose Mourinho", optionC: "Carlo Ancelotti", correctAnswer: "B", difficulty: "easy" },
  { questionText: "Which team won the Premier League in 2015-16 as 5000-1 outsiders?", optionA: "Burnley", optionB: "Leicester City", optionC: "Watford", correctAnswer: "B", difficulty: "easy" },
  { questionText: "Who scored 4 goals in a Premier League match for Southampton against Aston Villa in 2016?", optionA: "Sadio Mane", optionB: "Charlie Austin", optionC: "Shane Long", correctAnswer: "A", difficulty: "hard" },
  { questionText: "Which club has the most consecutive Premier League appearances?", optionA: "Manchester United", optionB: "Arsenal", optionC: "Liverpool", correctAnswer: "B", difficulty: "medium" },
  { questionText: "Who is the youngest player to score in the Premier League?", optionA: "Wayne Rooney", optionB: "James Vaughan", optionC: "Theo Walcott", correctAnswer: "B", difficulty: "hard" },
  { questionText: "Which player has made the most tackles in Premier League history?", optionA: "N'Golo Kante", optionB: "Gareth Barry", optionC: "Sol Campbell", correctAnswer: "B", difficulty: "hard" },
  { questionText: "Who is the only player to score 5 goals in a single Premier League game?", optionA: "Sergio Aguero", optionB: "Andy Cole", optionC: "Both A and B", correctAnswer: "C", difficulty: "hard" },
  { questionText: "Which club did Eric Cantona famously play for?", optionA: "Liverpool", optionB: "Manchester United", optionC: "Arsenal", correctAnswer: "B", difficulty: "easy" },
  { questionText: "Who scored the last goal at Highbury for Arsenal?", optionA: "Dennis Bergkamp", optionB: "Thierry Henry", optionC: "Robert Pires", correctAnswer: "B", difficulty: "hard" },
  
  // More World Cup trivia
  { questionText: "Which country has hosted the World Cup the most times?", optionA: "Brazil", optionB: "Germany", optionC: "Mexico", correctAnswer: "C", difficulty: "hard" },
  { questionText: "Who is the youngest player to appear in a World Cup final?", optionA: "Pele", optionB: "Kylian Mbappe", optionC: "Michael Owen", correctAnswer: "A", difficulty: "medium" },
  { questionText: "Which team conceded the most goals in a single World Cup?", optionA: "South Korea 1954", optionB: "El Salvador 1982", optionC: "Saudi Arabia 2002", correctAnswer: "A", difficulty: "hard" },
  { questionText: "Who scored the opening goal of the 2022 World Cup?", optionA: "Enner Valencia", optionB: "Richarlison", optionC: "Cody Gakpo", correctAnswer: "A", difficulty: "hard" },
  { questionText: "Which African country reached the World Cup quarter-finals in 2010?", optionA: "Nigeria", optionB: "Ghana", optionC: "Cameroon", correctAnswer: "B", difficulty: "medium" },
  { questionText: "Who is the only player to score in two different World Cup finals?", optionA: "Pele", optionB: "Kylian Mbappe", optionC: "Zinedine Zidane", correctAnswer: "B", difficulty: "medium" },
  { questionText: "Which goalkeeper saved the most penalties in World Cup history?", optionA: "Manuel Neuer", optionB: "Harald Schumacher", optionC: "Sergio Goycochea", correctAnswer: "C", difficulty: "hard" },
  { questionText: "What was the score in Brazil vs Germany in the 2014 World Cup semi-final?", optionA: "7-1", optionB: "5-0", optionC: "6-1", correctAnswer: "A", difficulty: "easy" },
  { questionText: "Who captained Italy to World Cup glory in 2006?", optionA: "Paolo Maldini", optionB: "Fabio Cannavaro", optionC: "Gianluigi Buffon", correctAnswer: "B", difficulty: "medium" },
  { questionText: "Which country was disqualified from the 2010 World Cup for cheating?", optionA: "None", optionB: "France", optionC: "Ireland", correctAnswer: "A", difficulty: "hard" },
  
  // More Champions League moments
  { questionText: "Who scored the winning goal in the 2017 Champions League final?", optionA: "Cristiano Ronaldo", optionB: "Gareth Bale", optionC: "Karim Benzema", correctAnswer: "A", difficulty: "medium" },
  { questionText: "Which team completed an unprecedented sextuple in 2009?", optionA: "Real Madrid", optionB: "Barcelona", optionC: "Manchester United", correctAnswer: "B", difficulty: "medium" },
  { questionText: "Who managed Chelsea to their first Champions League title?", optionA: "Jose Mourinho", optionB: "Roberto Di Matteo", optionC: "Carlo Ancelotti", correctAnswer: "B", difficulty: "medium" },
  { questionText: "What was the score in the 2005 Champions League final at half-time?", optionA: "0-3", optionB: "0-2", optionC: "0-1", correctAnswer: "A", difficulty: "medium" },
  { questionText: "Who scored a hat-trick in 11 minutes for Real Madrid against Atletico?", optionA: "Cristiano Ronaldo", optionB: "Gareth Bale", optionC: "Karim Benzema", correctAnswer: "A", difficulty: "hard" },
  { questionText: "Which club has lost the most Champions League finals?", optionA: "Bayern Munich", optionB: "Juventus", optionC: "Atletico Madrid", correctAnswer: "B", difficulty: "hard" },
  { questionText: "Who scored the latest goal in Champions League final history?", optionA: "Sergio Ramos", optionB: "Didier Drogba", optionC: "Ole Gunnar Solskjaer", correctAnswer: "A", difficulty: "hard" },
  { questionText: "Which English team won the Champions League in 2005?", optionA: "Chelsea", optionB: "Liverpool", optionC: "Manchester United", correctAnswer: "B", difficulty: "easy" },
  { questionText: "Who managed Inter Milan to Champions League glory in 2010?", optionA: "Roberto Mancini", optionB: "Jose Mourinho", optionC: "Rafael Benitez", correctAnswer: "B", difficulty: "medium" },
  { questionText: "Which player has scored in the most Champions League finals?", optionA: "Cristiano Ronaldo", optionB: "Lionel Messi", optionC: "Sergio Ramos", correctAnswer: "A", difficulty: "medium" },
  
  // More African football
  { questionText: "Which Nigerian scored at four World Cups?", optionA: "Rashidi Yekini", optionB: "Victor Moses", optionC: "None", correctAnswer: "C", difficulty: "hard" },
  { questionText: "Who is Ghana's most capped player?", optionA: "Asamoah Gyan", optionB: "Andre Ayew", optionC: "Michael Essien", correctAnswer: "A", difficulty: "hard" },
  { questionText: "Which African team has appeared in the most World Cups?", optionA: "Nigeria", optionB: "Cameroon", optionC: "Egypt", correctAnswer: "B", difficulty: "medium" },
  { questionText: "Who scored the winner for Zambia in the 2012 AFCON final?", optionA: "Emmanuel Mayuka", optionB: "Stoppila Sunzu", optionC: "Christopher Katongo", correctAnswer: "B", difficulty: "hard" },
  { questionText: "Which Moroccan player plays for Paris Saint-Germain?", optionA: "Hakim Ziyech", optionB: "Achraf Hakimi", optionC: "Sofyan Amrabat", correctAnswer: "B", difficulty: "easy" },
  { questionText: "Who was Nigeria's coach at the 2018 World Cup?", optionA: "Stephen Keshi", optionB: "Gernot Rohr", optionC: "Jose Peseiro", correctAnswer: "B", difficulty: "medium" },
  { questionText: "Which Senegalese player was top scorer at the 2019 AFCON?", optionA: "Sadio Mane", optionB: "Ismaila Sarr", optionC: "Neither", correctAnswer: "C", difficulty: "hard" },
  { questionText: "Which Egyptian club is nicknamed 'The Red Devils'?", optionA: "Zamalek", optionB: "Al Ahly", optionC: "Ismaily", correctAnswer: "B", difficulty: "medium" },
  { questionText: "Who is the most expensive African player in history?", optionA: "Victor Osimhen", optionB: "Mohamed Salah", optionC: "Nicolas Pepe", correctAnswer: "A", difficulty: "medium" },
  { questionText: "Which Algerian won the Champions League with Chelsea?", optionA: "Riyad Mahrez", optionB: "Said Benrahma", optionC: "None", correctAnswer: "C", difficulty: "hard" },
  
  // More European leagues
  { questionText: "Which club has won the most Ligue 1 titles?", optionA: "Lyon", optionB: "Marseille", optionC: "Paris Saint-Germain", correctAnswer: "C", difficulty: "easy" },
  { questionText: "Who is Juventus' all-time top scorer?", optionA: "Alessandro Del Piero", optionB: "Giampiero Boniperti", optionC: "Roberto Baggio", correctAnswer: "A", difficulty: "medium" },
  { questionText: "Which Dutch club has won the most Eredivisie titles?", optionA: "PSV", optionB: "Ajax", optionC: "Feyenoord", correctAnswer: "B", difficulty: "easy" },
  { questionText: "Who won the Portuguese league in 2022-23?", optionA: "Porto", optionB: "Benfica", optionC: "Sporting", correctAnswer: "B", difficulty: "medium" },
  { questionText: "Which club is known as 'Die Werkself'?", optionA: "Schalke 04", optionB: "Bayer Leverkusen", optionC: "Wolfsburg", correctAnswer: "B", difficulty: "hard" },
  { questionText: "Who is the top scorer in Bundesliga history?", optionA: "Gerd Muller", optionB: "Robert Lewandowski", optionC: "Karl-Heinz Rummenigge", correctAnswer: "B", difficulty: "medium" },
  { questionText: "Which Italian club has the most Serie A titles?", optionA: "Inter Milan", optionB: "AC Milan", optionC: "Juventus", correctAnswer: "C", difficulty: "easy" },
  { questionText: "Who won La Liga in 2020-21?", optionA: "Barcelona", optionB: "Real Madrid", optionC: "Atletico Madrid", correctAnswer: "C", difficulty: "medium" },
  { questionText: "Which French club did Kylian Mbappe join from Monaco?", optionA: "Lyon", optionB: "Paris Saint-Germain", optionC: "Marseille", correctAnswer: "B", difficulty: "easy" },
  { questionText: "Who is the all-time top scorer in Spanish football?", optionA: "Cristiano Ronaldo", optionB: "Lionel Messi", optionC: "Raul", correctAnswer: "B", difficulty: "easy" },
  
  // More tactics and rules
  { questionText: "What formation is known as 'The Christmas Tree'?", optionA: "4-4-2", optionB: "4-3-2-1", optionC: "3-5-2", correctAnswer: "B", difficulty: "hard" },
  { questionText: "What is 'catenaccio' in football?", optionA: "Attacking style", optionB: "Defensive system", optionC: "Corner kick routine", correctAnswer: "B", difficulty: "medium" },
  { questionText: "What does 'sweeper' mean in football?", optionA: "Goalkeeper", optionB: "Defender behind the back line", optionC: "Midfielder", correctAnswer: "B", difficulty: "medium" },
  { questionText: "What is a 'false 9' in football?", optionA: "Defensive midfielder", optionB: "Striker who drops deep", optionC: "Wing-back", correctAnswer: "B", difficulty: "medium" },
  { questionText: "What is 'gegenpressing'?", optionA: "Immediate counter-pressing", optionB: "Low block defense", optionC: "Possession football", correctAnswer: "A", difficulty: "medium" },
  { questionText: "What is a 'box-to-box' midfielder?", optionA: "Plays in penalty areas only", optionB: "Covers the whole pitch", optionC: "Defensive midfielder", correctAnswer: "B", difficulty: "easy" },
  { questionText: "What does 'parking the bus' mean?", optionA: "Attacking strategy", optionB: "Defensive strategy", optionC: "Set piece routine", correctAnswer: "B", difficulty: "easy" },
  { questionText: "What is the 'regista' role?", optionA: "Striker", optionB: "Playmaking deep midfielder", optionC: "Goalkeeper", correctAnswer: "B", difficulty: "hard" },
  { questionText: "What is a 'trequartista'?", optionA: "Defender", optionB: "Attacking midfielder", optionC: "Goalkeeper", correctAnswer: "B", difficulty: "hard" },
  { questionText: "What is 'total football'?", optionA: "Dutch tactical system", optionB: "Italian defensive style", optionC: "English direct play", correctAnswer: "A", difficulty: "medium" },
  
  // More current season questions
  { questionText: "Who won the 2022-23 FA Cup?", optionA: "Chelsea", optionB: "Manchester City", optionC: "Manchester United", correctAnswer: "B", difficulty: "easy" },
  { questionText: "Which team won the treble in 2022-23?", optionA: "Bayern Munich", optionB: "Manchester City", optionC: "Real Madrid", correctAnswer: "B", difficulty: "easy" },
  { questionText: "Who was the Premier League top scorer in 2022-23?", optionA: "Harry Kane", optionB: "Erling Haaland", optionC: "Ivan Toney", correctAnswer: "B", difficulty: "easy" },
  { questionText: "Which team won the Europa League in 2022-23?", optionA: "Roma", optionB: "Sevilla", optionC: "Juventus", correctAnswer: "B", difficulty: "medium" },
  { questionText: "Who won the Conference League in 2022-23?", optionA: "Fiorentina", optionB: "West Ham", optionC: "Villarreal", correctAnswer: "B", difficulty: "medium" },
  { questionText: "Which manager won the UEFA Manager of the Year 2023?", optionA: "Pep Guardiola", optionB: "Carlo Ancelotti", optionC: "Jurgen Klopp", correctAnswer: "A", difficulty: "medium" },
  { questionText: "Who won the Golden Shoe in 2022-23?", optionA: "Kylian Mbappe", optionB: "Erling Haaland", optionC: "Robert Lewandowski", correctAnswer: "B", difficulty: "medium" },
  { questionText: "Which Serie A team finished second in 2022-23?", optionA: "Inter Milan", optionB: "Lazio", optionC: "AC Milan", correctAnswer: "B", difficulty: "hard" },
  { questionText: "Who won the Bundesliga in 2022-23?", optionA: "Borussia Dortmund", optionB: "Bayern Munich", optionC: "RB Leipzig", correctAnswer: "B", difficulty: "easy" },
  { questionText: "Which team won Ligue 1 in 2022-23?", optionA: "Marseille", optionB: "Paris Saint-Germain", optionC: "Monaco", correctAnswer: "B", difficulty: "easy" },
  
  // More general sports
  { questionText: "What is the world record for the 200m sprint?", optionA: "19.19 seconds", optionB: "19.32 seconds", optionC: "19.58 seconds", correctAnswer: "A", difficulty: "hard" },
  { questionText: "Who holds the 200m world record?", optionA: "Tyson Gay", optionB: "Usain Bolt", optionC: "Yohan Blake", correctAnswer: "B", difficulty: "easy" },
  { questionText: "What is the highest break in snooker?", optionA: "147", optionB: "155", optionC: "160", correctAnswer: "A", difficulty: "medium" },
  { questionText: "How many frames are in a World Snooker Championship final?", optionA: "25", optionB: "35", optionC: "33", correctAnswer: "B", difficulty: "hard" },
  { questionText: "Who has won the most F1 races in a single season?", optionA: "Sebastian Vettel", optionB: "Max Verstappen", optionC: "Michael Schumacher", correctAnswer: "B", difficulty: "medium" },
  { questionText: "What is the distance of an Olympic triathlon swim?", optionA: "1.5km", optionB: "2km", optionC: "1km", correctAnswer: "A", difficulty: "hard" },
  { questionText: "How many players are on an American football team on the field?", optionA: "9", optionB: "11", optionC: "13", correctAnswer: "B", difficulty: "easy" },
  { questionText: "What is the Super Bowl?", optionA: "NBA finals", optionB: "NFL championship", optionC: "MLB finals", correctAnswer: "B", difficulty: "easy" },
  { questionText: "Which sport uses a shuttlecock?", optionA: "Tennis", optionB: "Badminton", optionC: "Squash", correctAnswer: "B", difficulty: "easy" },
  { questionText: "What is the maximum break in darts?", optionA: "180", optionB: "200", optionC: "170", correctAnswer: "A", difficulty: "medium" },
  { questionText: "What is a 'nine-dart finish' in darts?", optionA: "Scoring 501 in 9 darts", optionB: "Hitting 9 bullseyes", optionC: "9 consecutive 180s", correctAnswer: "A", difficulty: "medium" },
  { questionText: "How many holes in a standard round of golf?", optionA: "9", optionB: "18", optionC: "21", correctAnswer: "B", difficulty: "easy" },
  { questionText: "What is the longest tennis match in history?", optionA: "5 hours", optionB: "8 hours", optionC: "11 hours 5 minutes", correctAnswer: "C", difficulty: "hard" },
  { questionText: "Who played in the longest tennis match ever?", optionA: "Djokovic vs Nadal", optionB: "Isner vs Mahut", optionC: "Federer vs Murray", correctAnswer: "B", difficulty: "hard" },
  { questionText: "What is a 'perfect game' in ten-pin bowling?", optionA: "200 points", optionB: "250 points", optionC: "300 points", correctAnswer: "C", difficulty: "medium" },
  { questionText: "How many pins are in ten-pin bowling?", optionA: "8", optionB: "10", optionC: "12", correctAnswer: "B", difficulty: "easy" },
  { questionText: "What sport is played at Wimbledon?", optionA: "Golf", optionB: "Tennis", optionC: "Cricket", correctAnswer: "B", difficulty: "easy" },
  { questionText: "What is the length of a cricket pitch?", optionA: "20 meters", optionB: "22 yards", optionC: "25 meters", correctAnswer: "B", difficulty: "medium" },
  { questionText: "How many runs is a 'boundary' worth in cricket?", optionA: "4", optionB: "5", optionC: "6", correctAnswer: "A", difficulty: "easy" },
  { questionText: "What is a 'yorker' in cricket?", optionA: "A type of catch", optionB: "Ball aimed at batsman's feet", optionC: "Spin delivery", correctAnswer: "B", difficulty: "medium" },
  
  // More World Cup history
  { questionText: "Which team won the first ever penalty shootout in World Cup history?", optionA: "Germany", optionB: "Brazil", optionC: "Argentina", correctAnswer: "A", difficulty: "hard" },
  { questionText: "Who is England's all-time World Cup top scorer?", optionA: "Gary Lineker", optionB: "Harry Kane", optionC: "Wayne Rooney", correctAnswer: "B", difficulty: "medium" },
  { questionText: "Which country won the 2002 World Cup?", optionA: "Germany", optionB: "Brazil", optionC: "South Korea", correctAnswer: "B", difficulty: "easy" },
  { questionText: "Who scored the winning goal in the 2014 World Cup final?", optionA: "Lionel Messi", optionB: "Mario Gotze", optionC: "Thomas Muller", correctAnswer: "B", difficulty: "medium" },
  { questionText: "Which World Cup had the most goals scored?", optionA: "1998 France", optionB: "2014 Brazil", optionC: "1954 Switzerland", correctAnswer: "C", difficulty: "hard" },
  { questionText: "Who is the oldest player to score in a World Cup?", optionA: "Roger Milla", optionB: "Miroslav Klose", optionC: "Didier Drogba", correctAnswer: "A", difficulty: "hard" },
  { questionText: "Which African country beat defending champions France in 2002?", optionA: "Nigeria", optionB: "Senegal", optionC: "Cameroon", correctAnswer: "B", difficulty: "medium" },
  { questionText: "Who won the Golden Boot at the 2018 World Cup?", optionA: "Kylian Mbappe", optionB: "Harry Kane", optionC: "Romelu Lukaku", correctAnswer: "B", difficulty: "medium" },
  { questionText: "Which stadium hosted the 2022 World Cup final?", optionA: "Al Bayt Stadium", optionB: "Lusail Stadium", optionC: "Khalifa International", correctAnswer: "B", difficulty: "medium" },
  { questionText: "How many goals were scored in the 2022 World Cup final?", optionA: "4", optionB: "5", optionC: "6", correctAnswer: "C", difficulty: "medium" },
  
  // More club history
  { questionText: "Which club is nicknamed 'The Old Lady'?", optionA: "AC Milan", optionB: "Juventus", optionC: "Inter Milan", correctAnswer: "B", difficulty: "easy" },
  { questionText: "What is FC Barcelona's official motto?", optionA: "More than a club", optionB: "We are the best", optionC: "Forever Barca", correctAnswer: "A", difficulty: "easy" },
  { questionText: "Which English club is known as 'The Canaries'?", optionA: "Southampton", optionB: "Norwich City", optionC: "Watford", correctAnswer: "B", difficulty: "medium" },
  { questionText: "Which club has the most European trophies?", optionA: "Real Madrid", optionB: "AC Milan", optionC: "Barcelona", correctAnswer: "A", difficulty: "medium" },
  { questionText: "Which Scottish club has won the most league titles?", optionA: "Celtic", optionB: "Rangers", optionC: "Aberdeen", correctAnswer: "B", difficulty: "medium" },
  { questionText: "What is Real Madrid's home stadium called?", optionA: "Camp Nou", optionB: "Santiago Bernabeu", optionC: "Wanda Metropolitano", correctAnswer: "B", difficulty: "easy" },
  { questionText: "Which German club plays at Signal Iduna Park?", optionA: "Bayern Munich", optionB: "Borussia Dortmund", optionC: "Schalke 04", correctAnswer: "B", difficulty: "easy" },
  { questionText: "What year was Liverpool FC founded?", optionA: "1878", optionB: "1892", optionC: "1901", correctAnswer: "B", difficulty: "hard" },
  { questionText: "Which Italian club is known as 'I Nerazzurri'?", optionA: "Juventus", optionB: "Inter Milan", optionC: "AC Milan", correctAnswer: "B", difficulty: "medium" },
  { questionText: "What is Manchester United's nickname?", optionA: "The Blues", optionB: "The Red Devils", optionC: "The Citizens", correctAnswer: "B", difficulty: "easy" },
  
  // More individual awards
  { questionText: "Who won the first ever Ballon d'Or?", optionA: "Alfredo Di Stefano", optionB: "Stanley Matthews", optionC: "Bobby Charlton", correctAnswer: "B", difficulty: "hard" },
  { questionText: "How many times has Robert Lewandowski won FIFA Best Men's Player?", optionA: "1", optionB: "2", optionC: "3", correctAnswer: "A", difficulty: "medium" },
  { questionText: "Who won the World Cup Golden Ball in 2018?", optionA: "Kylian Mbappe", optionB: "Luka Modric", optionC: "Antoine Griezmann", correctAnswer: "B", difficulty: "medium" },
  { questionText: "Which goalkeeper has won the Ballon d'Or?", optionA: "Gianluigi Buffon", optionB: "Lev Yashin", optionC: "Manuel Neuer", correctAnswer: "B", difficulty: "hard" },
  { questionText: "Who won the PFA Player of the Year in 2022-23?", optionA: "Erling Haaland", optionB: "Kevin De Bruyne", optionC: "Bukayo Saka", correctAnswer: "A", difficulty: "medium" },
  { questionText: "Which player has won the most UEFA Best Player in Europe awards?", optionA: "Lionel Messi", optionB: "Cristiano Ronaldo", optionC: "Michel Platini", correctAnswer: "A", difficulty: "hard" },
  { questionText: "Who was the first English player to win the Ballon d'Or?", optionA: "Bobby Charlton", optionB: "Stanley Matthews", optionC: "Bobby Moore", correctAnswer: "B", difficulty: "hard" },
  { questionText: "Which African has been nominated most for Ballon d'Or?", optionA: "Samuel Eto'o", optionB: "Didier Drogba", optionC: "Mohamed Salah", correctAnswer: "C", difficulty: "hard" },
  { questionText: "Who won the Women's Ballon d'Or in 2022?", optionA: "Alexia Putellas", optionB: "Sam Kerr", optionC: "Ada Hegerberg", correctAnswer: "A", difficulty: "medium" },
  { questionText: "Which goalkeeper won the Yashin Trophy in 2022?", optionA: "Alisson", optionB: "Thibaut Courtois", optionC: "Ederson", correctAnswer: "B", difficulty: "medium" },
  
  // More Nigerian questions
  { questionText: "Who scored Nigeria's first ever World Cup goal?", optionA: "Rashidi Yekini", optionB: "Samson Siasia", optionC: "Emmanuel Amunike", correctAnswer: "A", difficulty: "medium" },
  { questionText: "Which Nigerian club won the CAF Cup Winners' Cup in 1977?", optionA: "Shooting Stars", optionB: "Rangers", optionC: "Enugu Rangers", correctAnswer: "C", difficulty: "hard" },
  { questionText: "Who is Nigeria's most capped outfield player?", optionA: "Joseph Yobo", optionB: "Nwankwo Kanu", optionC: "Ahmed Musa", correctAnswer: "C", difficulty: "medium" },
  { questionText: "Which Nigerian player moved to Manchester United in 2024?", optionA: "Taiwo Awoniyi", optionB: "Victor Boniface", optionC: "None", correctAnswer: "C", difficulty: "hard" },
  { questionText: "Who is the current Nigeria national team captain?", optionA: "Ahmed Musa", optionB: "William Troost-Ekong", optionC: "Alex Iwobi", correctAnswer: "B", difficulty: "medium" },
  { questionText: "Which Nigerian scored in the 2022 World Cup qualifiers?", optionA: "Victor Osimhen", optionB: "Kelechi Iheanacho", optionC: "Both", correctAnswer: "C", difficulty: "medium" },
  { questionText: "Who is Nigeria's all-time leading goalscorer?", optionA: "Rashidi Yekini", optionB: "Segun Odegbami", optionC: "Ahmed Musa", correctAnswer: "A", difficulty: "easy" },
  { questionText: "Which Premier League club did Victor Moses win a title with?", optionA: "Liverpool", optionB: "Chelsea", optionC: "Manchester City", correctAnswer: "B", difficulty: "easy" },
  { questionText: "How many goals did Kanu score at the 1996 Olympics?", optionA: "3", optionB: "5", optionC: "7", correctAnswer: "B", difficulty: "hard" },
  { questionText: "Which Nigerian goalkeeper played for Lille?", optionA: "Vincent Enyeama", optionB: "Carl Ikeme", optionC: "Maduka Okoye", correctAnswer: "A", difficulty: "medium" },
  
  // More modern football questions
  { questionText: "Who is the most followed footballer on Instagram?", optionA: "Lionel Messi", optionB: "Cristiano Ronaldo", optionC: "Neymar", correctAnswer: "B", difficulty: "easy" },
  { questionText: "Which club did Mbappe join in summer 2024?", optionA: "Manchester City", optionB: "Real Madrid", optionC: "Liverpool", correctAnswer: "B", difficulty: "easy" },
  { questionText: "Who is the current record signing for Manchester United?", optionA: "Antony", optionB: "Jadon Sancho", optionC: "Paul Pogba", correctAnswer: "A", difficulty: "hard" },
  { questionText: "Which Saudi club signed Cristiano Ronaldo?", optionA: "Al-Hilal", optionB: "Al-Nassr", optionC: "Al-Ahli", correctAnswer: "B", difficulty: "easy" },
  { questionText: "Who won the first Nations League trophy?", optionA: "France", optionB: "Portugal", optionC: "Spain", correctAnswer: "B", difficulty: "hard" },
  { questionText: "Which manager has the most Champions League titles?", optionA: "Zinedine Zidane", optionB: "Carlo Ancelotti", optionC: "Bob Paisley", correctAnswer: "B", difficulty: "medium" },
  { questionText: "Who is known as 'Mr. Champions League'?", optionA: "Cristiano Ronaldo", optionB: "Sergio Ramos", optionC: "Luka Modric", correctAnswer: "A", difficulty: "easy" },
  { questionText: "Which city will host the 2024 Champions League final?", optionA: "Madrid", optionB: "London", optionC: "Paris", correctAnswer: "B", difficulty: "medium" },
  { questionText: "How many clubs has Zlatan Ibrahimovic played for?", optionA: "8", optionB: "10", optionC: "12", correctAnswer: "B", difficulty: "hard" },
  { questionText: "Who is the most expensive defender in history?", optionA: "Virgil van Dijk", optionB: "Harry Maguire", optionC: "Wesley Fofana", correctAnswer: "C", difficulty: "hard" },
];

async function seedFinalQuestions() {
  console.log("Starting to seed final batch of questions...");
  console.log(`Questions to insert: ${finalQuestions.length}`);
  
  let insertedCount = 0;
  const batchSize = 50;
  
  for (let i = 0; i < finalQuestions.length; i += batchSize) {
    const batch = finalQuestions.slice(i, i + batchSize);
    try {
      await db.insert(questions).values(batch);
      insertedCount += batch.length;
      console.log(`Inserted ${insertedCount} questions...`);
    } catch (error) {
      console.log(`Error inserting batch, skipping...`);
    }
  }
  
  console.log(`\nFinal seeding complete! ${insertedCount} questions inserted.`);
  
  process.exit(0);
}

seedFinalQuestions().catch((error) => {
  console.error("Error seeding questions:", error);
  process.exit(1);
});
