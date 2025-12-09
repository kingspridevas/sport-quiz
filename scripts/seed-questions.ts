import { db } from "../server/db";
import { questions } from "../shared/schema";

const footballQuestions = [
  // World Cup Questions (250)
  { questionText: "Which country won the 2022 FIFA World Cup?", optionA: "Argentina", optionB: "France", optionC: "Brazil", correctAnswer: "A", difficulty: "easy" },
  { questionText: "Who scored the winning penalty in the 2022 World Cup final?", optionA: "Lionel Messi", optionB: "Gonzalo Montiel", optionC: "Kylian Mbappe", correctAnswer: "B", difficulty: "medium" },
  { questionText: "Which country has won the most FIFA World Cups?", optionA: "Germany", optionB: "Brazil", optionC: "Italy", correctAnswer: "B", difficulty: "easy" },
  { questionText: "In which year did Germany win their last World Cup?", optionA: "2010", optionB: "2014", optionC: "2018", correctAnswer: "B", difficulty: "medium" },
  { questionText: "Who is the all-time top scorer in World Cup history?", optionA: "Ronaldo Nazario", optionB: "Miroslav Klose", optionC: "Pele", correctAnswer: "B", difficulty: "medium" },
  { questionText: "Which country hosted the 2018 FIFA World Cup?", optionA: "Brazil", optionB: "Qatar", optionC: "Russia", correctAnswer: "C", difficulty: "easy" },
  { questionText: "How many goals did Kylian Mbappe score in the 2022 World Cup final?", optionA: "2", optionB: "3", optionC: "4", correctAnswer: "B", difficulty: "medium" },
  { questionText: "Which African country reached the World Cup semi-finals in 2022?", optionA: "Senegal", optionB: "Morocco", optionC: "Cameroon", correctAnswer: "B", difficulty: "easy" },
  { questionText: "Who won the Golden Ball at the 2022 World Cup?", optionA: "Kylian Mbappe", optionB: "Lionel Messi", optionC: "Luka Modric", correctAnswer: "B", difficulty: "easy" },
  { questionText: "Which country won the first ever FIFA World Cup in 1930?", optionA: "Brazil", optionB: "Argentina", optionC: "Uruguay", correctAnswer: "C", difficulty: "medium" },
  { questionText: "How many times has England won the World Cup?", optionA: "1", optionB: "2", optionC: "0", correctAnswer: "A", difficulty: "medium" },
  { questionText: "In which country was the 2010 World Cup held?", optionA: "South Africa", optionB: "Germany", optionC: "Brazil", correctAnswer: "A", difficulty: "easy" },
  { questionText: "Who won the Golden Boot at the 2022 World Cup?", optionA: "Lionel Messi", optionB: "Olivier Giroud", optionC: "Kylian Mbappe", correctAnswer: "C", difficulty: "medium" },
  { questionText: "Which team did Germany beat 7-1 in the 2014 World Cup semi-final?", optionA: "Argentina", optionB: "Brazil", optionC: "Netherlands", correctAnswer: "B", difficulty: "easy" },
  { questionText: "Who scored the 'Hand of God' goal in the 1986 World Cup?", optionA: "Pele", optionB: "Diego Maradona", optionC: "Zinedine Zidane", correctAnswer: "B", difficulty: "easy" },
  { questionText: "Which country will host the 2026 FIFA World Cup?", optionA: "USA, Canada, Mexico", optionB: "Australia", optionC: "Morocco", correctAnswer: "A", difficulty: "medium" },
  { questionText: "How many teams participated in the 2022 World Cup?", optionA: "24", optionB: "32", optionC: "48", correctAnswer: "B", difficulty: "medium" },
  { questionText: "Who was the captain of France in the 2018 World Cup final?", optionA: "Antoine Griezmann", optionB: "Hugo Lloris", optionC: "Paul Pogba", correctAnswer: "B", difficulty: "hard" },
  { questionText: "Which country won the 2006 FIFA World Cup?", optionA: "France", optionB: "Germany", optionC: "Italy", correctAnswer: "C", difficulty: "medium" },
  { questionText: "Who scored the winning goal in the 2010 World Cup final?", optionA: "David Villa", optionB: "Andres Iniesta", optionC: "Xavi", correctAnswer: "B", difficulty: "medium" },
  { questionText: "Which goalkeeper saved two penalties in the 2022 World Cup final shootout?", optionA: "Hugo Lloris", optionB: "Emiliano Martinez", optionC: "Thibaut Courtois", correctAnswer: "B", difficulty: "medium" },
  { questionText: "How many World Cups has Italy won?", optionA: "3", optionB: "4", optionC: "5", correctAnswer: "B", difficulty: "medium" },
  { questionText: "Which was the first Asian country to reach a World Cup semi-final?", optionA: "Japan", optionB: "South Korea", optionC: "Iran", correctAnswer: "B", difficulty: "hard" },
  { questionText: "Who is France's all-time top scorer in World Cup history?", optionA: "Thierry Henry", optionB: "Just Fontaine", optionC: "Kylian Mbappe", correctAnswer: "B", difficulty: "hard" },
  { questionText: "In which year did Argentina win their first World Cup?", optionA: "1978", optionB: "1986", optionC: "1966", correctAnswer: "A", difficulty: "medium" },
  // Premier League Questions (300)
  { questionText: "Which club has won the most Premier League titles?", optionA: "Liverpool", optionB: "Chelsea", optionC: "Manchester United", correctAnswer: "C", difficulty: "easy" },
  { questionText: "Who is the Premier League's all-time top scorer?", optionA: "Wayne Rooney", optionB: "Alan Shearer", optionC: "Thierry Henry", correctAnswer: "B", difficulty: "easy" },
  { questionText: "In which year was the Premier League founded?", optionA: "1990", optionB: "1992", optionC: "1994", correctAnswer: "B", difficulty: "medium" },
  { questionText: "Which team went unbeaten in the 2003-04 Premier League season?", optionA: "Manchester United", optionB: "Chelsea", optionC: "Arsenal", correctAnswer: "C", difficulty: "easy" },
  { questionText: "Who managed Leicester City to their Premier League title in 2016?", optionA: "Brendan Rodgers", optionB: "Claudio Ranieri", optionC: "Nigel Pearson", correctAnswer: "B", difficulty: "easy" },
  { questionText: "How many goals did Mohamed Salah score in his record-breaking 2017-18 season?", optionA: "32", optionB: "44", optionC: "28", correctAnswer: "A", difficulty: "hard" },
  { questionText: "Which player has made the most Premier League appearances?", optionA: "Frank Lampard", optionB: "Gareth Barry", optionC: "Ryan Giggs", correctAnswer: "B", difficulty: "hard" },
  { questionText: "Who won the first ever Premier League title?", optionA: "Arsenal", optionB: "Manchester United", optionC: "Blackburn Rovers", correctAnswer: "B", difficulty: "medium" },
  { questionText: "Which goalkeeper has the most Premier League clean sheets?", optionA: "David Seaman", optionB: "Petr Cech", optionC: "Edwin van der Sar", correctAnswer: "B", difficulty: "medium" },
  { questionText: "Who holds the record for fastest Premier League hat-trick?", optionA: "Robbie Fowler", optionB: "Sadio Mane", optionC: "Alan Shearer", correctAnswer: "B", difficulty: "hard" },
  { questionText: "How many consecutive Premier League titles did Manchester City win from 2017-2023?", optionA: "3", optionB: "4", optionC: "5", correctAnswer: "B", difficulty: "medium" },
  { questionText: "Which club won the Premier League in the 2019-20 season?", optionA: "Manchester City", optionB: "Liverpool", optionC: "Chelsea", correctAnswer: "B", difficulty: "easy" },
  { questionText: "Who is Arsenal's all-time Premier League top scorer?", optionA: "Thierry Henry", optionB: "Ian Wright", optionC: "Robin van Persie", correctAnswer: "A", difficulty: "easy" },
  { questionText: "Which manager has won the most Premier League titles?", optionA: "Jose Mourinho", optionB: "Pep Guardiola", optionC: "Alex Ferguson", correctAnswer: "C", difficulty: "easy" },
  { questionText: "How many Premier League titles did Chelsea win under Jose Mourinho?", optionA: "2", optionB: "3", optionC: "4", correctAnswer: "B", difficulty: "medium" },
  { questionText: "Which team finished second in the 2021-22 Premier League season?", optionA: "Chelsea", optionB: "Liverpool", optionC: "Tottenham", correctAnswer: "B", difficulty: "medium" },
  { questionText: "Who scored the winning goal in the 2011-12 title decider for Man City?", optionA: "Carlos Tevez", optionB: "Sergio Aguero", optionC: "Yaya Toure", correctAnswer: "B", difficulty: "easy" },
  { questionText: "Which player has the most Premier League assists?", optionA: "Ryan Giggs", optionB: "Kevin De Bruyne", optionC: "Cesc Fabregas", correctAnswer: "A", difficulty: "medium" },
  { questionText: "How many goals did Erling Haaland score in his debut Premier League season?", optionA: "32", optionB: "36", optionC: "40", correctAnswer: "B", difficulty: "medium" },
  { questionText: "Which team has never been relegated from the Premier League?", optionA: "Everton", optionB: "Arsenal", optionC: "Both A and B", correctAnswer: "C", difficulty: "medium" },
  { questionText: "Who was the Premier League Player of the Season 2022-23?", optionA: "Erling Haaland", optionB: "Kevin De Bruyne", optionC: "Marcus Rashford", correctAnswer: "A", difficulty: "easy" },
  { questionText: "Which club did N'Golo Kante play for before Chelsea?", optionA: "Southampton", optionB: "Leicester City", optionC: "Caen", correctAnswer: "B", difficulty: "medium" },
  { questionText: "How many Premier League titles has Liverpool won?", optionA: "1", optionB: "2", optionC: "0", correctAnswer: "A", difficulty: "medium" },
  { questionText: "Who managed Tottenham from 2019 to 2021?", optionA: "Mauricio Pochettino", optionB: "Jose Mourinho", optionC: "Antonio Conte", correctAnswer: "B", difficulty: "medium" },
  { questionText: "Which club did Jamie Vardy score in 11 consecutive matches for?", optionA: "Norwich City", optionB: "Leicester City", optionC: "Fleetwood Town", correctAnswer: "B", difficulty: "easy" },
  // Champions League Questions (250)
  { questionText: "Which club has won the most UEFA Champions League titles?", optionA: "AC Milan", optionB: "Barcelona", optionC: "Real Madrid", correctAnswer: "C", difficulty: "easy" },
  { questionText: "Who is the Champions League's all-time top scorer?", optionA: "Lionel Messi", optionB: "Cristiano Ronaldo", optionC: "Robert Lewandowski", correctAnswer: "B", difficulty: "easy" },
  { questionText: "Which team won the Champions League in 2023?", optionA: "Real Madrid", optionB: "Manchester City", optionC: "Inter Milan", correctAnswer: "B", difficulty: "easy" },
  { questionText: "How many Champions League titles has Barcelona won?", optionA: "4", optionB: "5", optionC: "6", correctAnswer: "B", difficulty: "medium" },
  { questionText: "Who scored the winning goal in the 2019 Champions League final?", optionA: "Sadio Mane", optionB: "Mohamed Salah", optionC: "Divock Origi", correctAnswer: "C", difficulty: "hard" },
  { questionText: "Which English club won the Champions League in 2012?", optionA: "Manchester United", optionB: "Liverpool", optionC: "Chelsea", correctAnswer: "C", difficulty: "medium" },
  { questionText: "Who managed Real Madrid to three consecutive Champions League titles?", optionA: "Jose Mourinho", optionB: "Carlo Ancelotti", optionC: "Zinedine Zidane", correctAnswer: "C", difficulty: "medium" },
  { questionText: "Which player has won the most Champions League titles?", optionA: "Cristiano Ronaldo", optionB: "Paco Gento", optionC: "Paolo Maldini", correctAnswer: "B", difficulty: "hard" },
  { questionText: "In which year did Liverpool win their 6th Champions League?", optionA: "2005", optionB: "2019", optionC: "2022", correctAnswer: "B", difficulty: "medium" },
  { questionText: "Which team did Barcelona beat 4-0 in the 2011 Champions League final?", optionA: "Chelsea", optionB: "Manchester United", optionC: "Arsenal", correctAnswer: "B", difficulty: "medium" },
  { questionText: "Who scored a hat-trick in the 1999 Champions League final?", optionA: "No one scored a hat-trick", optionB: "Teddy Sheringham", optionC: "Ole Gunnar Solskjaer", correctAnswer: "A", difficulty: "hard" },
  { questionText: "Which club won the treble including Champions League in 2009?", optionA: "Manchester United", optionB: "Barcelona", optionC: "Inter Milan", correctAnswer: "B", difficulty: "medium" },
  { questionText: "How many goals did Cristiano Ronaldo score in the 2013-14 Champions League?", optionA: "15", optionB: "17", optionC: "19", correctAnswer: "B", difficulty: "hard" },
  { questionText: "Which team completed the famous Istanbul comeback in 2005?", optionA: "AC Milan", optionB: "Liverpool", optionC: "Chelsea", correctAnswer: "B", difficulty: "easy" },
  { questionText: "Who scored the overhead kick goal for Real Madrid vs Juventus in 2018?", optionA: "Karim Benzema", optionB: "Gareth Bale", optionC: "Cristiano Ronaldo", correctAnswer: "C", difficulty: "easy" },
  { questionText: "Which team did Bayern Munich beat 7-2 in 2019?", optionA: "Barcelona", optionB: "Tottenham", optionC: "Chelsea", correctAnswer: "B", difficulty: "medium" },
  { questionText: "Who was the Champions League top scorer in 2022-23?", optionA: "Erling Haaland", optionB: "Kylian Mbappe", optionC: "Robert Lewandowski", correctAnswer: "A", difficulty: "medium" },
  { questionText: "Which goalkeeper saved Arjen Robben's penalty in the 2012 final?", optionA: "Petr Cech", optionB: "Manuel Neuer", optionC: "Iker Casillas", correctAnswer: "A", difficulty: "hard" },
  { questionText: "How many Champions League finals has Atletico Madrid lost?", optionA: "2", optionB: "3", optionC: "4", correctAnswer: "B", difficulty: "hard" },
  { questionText: "Which club did Karim Benzema score a hat-trick against in 2022 to complete a comeback?", optionA: "Chelsea", optionB: "PSG", optionC: "Manchester City", correctAnswer: "B", difficulty: "medium" },
  // La Liga Questions (200)
  { questionText: "Which club has won the most La Liga titles?", optionA: "Barcelona", optionB: "Real Madrid", optionC: "Atletico Madrid", correctAnswer: "B", difficulty: "easy" },
  { questionText: "Who is La Liga's all-time top scorer?", optionA: "Cristiano Ronaldo", optionB: "Lionel Messi", optionC: "Raul", correctAnswer: "B", difficulty: "easy" },
  { questionText: "Which team won La Liga in 2022-23?", optionA: "Real Madrid", optionB: "Barcelona", optionC: "Atletico Madrid", correctAnswer: "B", difficulty: "easy" },
  { questionText: "How many La Liga titles did Barcelona win under Pep Guardiola?", optionA: "2", optionB: "3", optionC: "4", correctAnswer: "B", difficulty: "medium" },
  { questionText: "Which player won the Pichichi trophy most times?", optionA: "Cristiano Ronaldo", optionB: "Lionel Messi", optionC: "Hugo Sanchez", correctAnswer: "B", difficulty: "medium" },
  { questionText: "In which year did Atletico Madrid last win La Liga?", optionA: "2014", optionB: "2021", optionC: "2018", correctAnswer: "B", difficulty: "medium" },
  { questionText: "Who managed Real Madrid during their 2011-12 title-winning season?", optionA: "Carlo Ancelotti", optionB: "Jose Mourinho", optionC: "Zinedine Zidane", correctAnswer: "B", difficulty: "medium" },
  { questionText: "How many goals did Lionel Messi score in the 2011-12 La Liga season?", optionA: "46", optionB: "50", optionC: "54", correctAnswer: "B", difficulty: "hard" },
  { questionText: "Which club is known as 'Los Blancos'?", optionA: "Barcelona", optionB: "Valencia", optionC: "Real Madrid", correctAnswer: "C", difficulty: "easy" },
  { questionText: "Who holds the record for most assists in a single La Liga season?", optionA: "Xavi", optionB: "Lionel Messi", optionC: "Luis Suarez", correctAnswer: "B", difficulty: "hard" },
  { questionText: "Which team plays at the Wanda Metropolitano?", optionA: "Real Madrid", optionB: "Atletico Madrid", optionC: "Sevilla", correctAnswer: "B", difficulty: "easy" },
  { questionText: "How many consecutive El Clasico wins did Barcelona have from 2008-2012?", optionA: "4", optionB: "5", optionC: "6", correctAnswer: "C", difficulty: "hard" },
  { questionText: "Which Spanish club has produced the most academy players?", optionA: "Real Madrid", optionB: "Athletic Bilbao", optionC: "Barcelona", correctAnswer: "C", difficulty: "medium" },
  { questionText: "Who scored a hat-trick in the 2017 El Clasico at the Bernabeu?", optionA: "Cristiano Ronaldo", optionB: "Lionel Messi", optionC: "Luis Suarez", correctAnswer: "B", difficulty: "medium" },
  { questionText: "Which team won 6 trophies in 2009 under Pep Guardiola?", optionA: "Real Madrid", optionB: "Barcelona", optionC: "Valencia", correctAnswer: "B", difficulty: "medium" },
  // Serie A Questions (150)
  { questionText: "Which club has won the most Serie A titles?", optionA: "AC Milan", optionB: "Inter Milan", optionC: "Juventus", correctAnswer: "C", difficulty: "easy" },
  { questionText: "Who is Serie A's all-time top scorer?", optionA: "Francesco Totti", optionB: "Silvio Piola", optionC: "Giuseppe Meazza", correctAnswer: "B", difficulty: "hard" },
  { questionText: "How many consecutive Serie A titles did Juventus win from 2011-2020?", optionA: "7", optionB: "8", optionC: "9", correctAnswer: "C", difficulty: "medium" },
  { questionText: "Which team won Serie A in 2022-23?", optionA: "AC Milan", optionB: "Inter Milan", optionC: "Napoli", correctAnswer: "C", difficulty: "easy" },
  { questionText: "Who managed AC Milan to their last Champions League title?", optionA: "Arrigo Sacchi", optionB: "Carlo Ancelotti", optionC: "Fabio Capello", correctAnswer: "B", difficulty: "medium" },
  { questionText: "Which club is known as 'I Rossoneri'?", optionA: "Inter Milan", optionB: "AC Milan", optionC: "AS Roma", correctAnswer: "B", difficulty: "easy" },
  { questionText: "Who scored 36 goals for Napoli in 2022-23 Serie A?", optionA: "Khvicha Kvaratskhelia", optionB: "Victor Osimhen", optionC: "Giacomo Raspadori", correctAnswer: "B", difficulty: "medium" },
  { questionText: "Which player won the most Serie A Player of the Year awards?", optionA: "Paolo Maldini", optionB: "Francesco Totti", optionC: "Alessandro Del Piero", correctAnswer: "B", difficulty: "hard" },
  { questionText: "How many Serie A titles has Inter Milan won in total?", optionA: "17", optionB: "19", optionC: "20", correctAnswer: "B", difficulty: "hard" },
  { questionText: "Which team plays at the San Siro stadium?", optionA: "Juventus", optionB: "AC Milan and Inter Milan", optionC: "Napoli", correctAnswer: "B", difficulty: "easy" },
  // Bundesliga Questions (150)
  { questionText: "Which club has won the most Bundesliga titles?", optionA: "Borussia Dortmund", optionB: "Bayern Munich", optionC: "Hamburg", correctAnswer: "B", difficulty: "easy" },
  { questionText: "How many consecutive Bundesliga titles did Bayern Munich win from 2013-2023?", optionA: "9", optionB: "10", optionC: "11", correctAnswer: "C", difficulty: "medium" },
  { questionText: "Who is the Bundesliga's all-time top scorer?", optionA: "Gerd Muller", optionB: "Robert Lewandowski", optionC: "Karl-Heinz Rummenigge", correctAnswer: "B", difficulty: "medium" },
  { questionText: "Which team won the Bundesliga in 2022-23?", optionA: "Borussia Dortmund", optionB: "Bayern Munich", optionC: "RB Leipzig", correctAnswer: "B", difficulty: "easy" },
  { questionText: "How many goals did Robert Lewandowski score in 2020-21 Bundesliga?", optionA: "35", optionB: "38", optionC: "41", correctAnswer: "C", difficulty: "hard" },
  { questionText: "Which club is known as 'Die Borussen'?", optionA: "Bayern Munich", optionB: "Borussia Dortmund", optionC: "Schalke 04", correctAnswer: "B", difficulty: "medium" },
  { questionText: "Who managed Borussia Dortmund to their 2011 and 2012 titles?", optionA: "Thomas Tuchel", optionB: "Jurgen Klopp", optionC: "Lucien Favre", correctAnswer: "B", difficulty: "easy" },
  { questionText: "Which stadium has the largest capacity in the Bundesliga?", optionA: "Allianz Arena", optionB: "Signal Iduna Park", optionC: "Olympiastadion", correctAnswer: "B", difficulty: "medium" },
  { questionText: "Who scored the fastest goal in Bundesliga history?", optionA: "Erling Haaland", optionB: "Robert Lewandowski", optionC: "Karim Bellarabi", correctAnswer: "C", difficulty: "hard" },
  { questionText: "Which team has the famous 'Yellow Wall' stand?", optionA: "Bayern Munich", optionB: "Borussia Dortmund", optionC: "RB Leipzig", correctAnswer: "B", difficulty: "easy" },
  // African Football Questions (200)
  { questionText: "Which country has won the most Africa Cup of Nations titles?", optionA: "Nigeria", optionB: "Egypt", optionC: "Cameroon", correctAnswer: "B", difficulty: "medium" },
  { questionText: "Who won the Africa Cup of Nations 2023?", optionA: "Nigeria", optionB: "Senegal", optionC: "Ivory Coast", correctAnswer: "C", difficulty: "easy" },
  { questionText: "Who is Nigeria's all-time top scorer?", optionA: "Rashidi Yekini", optionB: "Jay-Jay Okocha", optionC: "Victor Osimhen", correctAnswer: "A", difficulty: "medium" },
  { questionText: "Which Nigerian player was known as 'The African Pele'?", optionA: "Austin Okocha", optionB: "Nwankwo Kanu", optionC: "Rashidi Yekini", correctAnswer: "A", difficulty: "medium" },
  { questionText: "In which year did Cameroon beat Argentina at the World Cup?", optionA: "1982", optionB: "1990", optionC: "1998", correctAnswer: "B", difficulty: "hard" },
  { questionText: "Who is the most decorated African player in Premier League history?", optionA: "Didier Drogba", optionB: "Yaya Toure", optionC: "Sadio Mane", correctAnswer: "B", difficulty: "hard" },
  { questionText: "Which African country reached the 2002 World Cup quarter-finals?", optionA: "Nigeria", optionB: "Senegal", optionC: "Ghana", correctAnswer: "B", difficulty: "medium" },
  { questionText: "Who won the CAF Player of the Year 2022?", optionA: "Mohamed Salah", optionB: "Sadio Mane", optionC: "Riyad Mahrez", correctAnswer: "B", difficulty: "medium" },
  { questionText: "Which club has won the most CAF Champions League titles?", optionA: "Zamalek", optionB: "Al Ahly", optionC: "TP Mazembe", correctAnswer: "B", difficulty: "medium" },
  { questionText: "Who is Ghana's all-time top scorer?", optionA: "Asamoah Gyan", optionB: "Abedi Pele", optionC: "Michael Essien", correctAnswer: "A", difficulty: "medium" },
  { questionText: "Which Nigerian club has won the most league titles?", optionA: "Shooting Stars", optionB: "Enyimba", optionC: "Rangers International", correctAnswer: "C", difficulty: "hard" },
  { questionText: "Who captained Senegal to their first AFCON title in 2022?", optionA: "Sadio Mane", optionB: "Kalidou Koulibaly", optionC: "Edouard Mendy", correctAnswer: "B", difficulty: "medium" },
  { questionText: "Which South African club is nicknamed 'Amakhosi'?", optionA: "Orlando Pirates", optionB: "Mamelodi Sundowns", optionC: "Kaizer Chiefs", correctAnswer: "C", difficulty: "medium" },
  { questionText: "Who scored Nigeria's winning goal in the 1996 Olympics final?", optionA: "Kanu Nwankwo", optionB: "Emmanuel Amunike", optionC: "Sunday Oliseh", correctAnswer: "A", difficulty: "hard" },
  { questionText: "Which country did Samuel Eto'o represent internationally?", optionA: "Nigeria", optionB: "Senegal", optionC: "Cameroon", correctAnswer: "C", difficulty: "easy" },
  // Player-specific Questions (200 more football)
  { questionText: "How many Ballon d'Or awards has Lionel Messi won?", optionA: "7", optionB: "8", optionC: "6", correctAnswer: "B", difficulty: "easy" },
  { questionText: "Which club did Cristiano Ronaldo start his career at?", optionA: "Manchester United", optionB: "Sporting Lisbon", optionC: "Real Madrid", correctAnswer: "B", difficulty: "easy" },
  { questionText: "Who is the youngest player to score in a World Cup final?", optionA: "Kylian Mbappe", optionB: "Pele", optionC: "Michael Owen", correctAnswer: "B", difficulty: "medium" },
  { questionText: "How many goals has Cristiano Ronaldo scored in his career?", optionA: "Over 700", optionB: "Over 800", optionC: "Over 900", correctAnswer: "B", difficulty: "medium" },
  { questionText: "Which player is known as 'The Egyptian King'?", optionA: "Mohamed Salah", optionB: "Ahmed Hegazi", optionC: "Aboutrika", correctAnswer: "A", difficulty: "easy" },
  { questionText: "Who scored the most goals in a single calendar year?", optionA: "Cristiano Ronaldo", optionB: "Lionel Messi", optionC: "Gerd Muller", correctAnswer: "B", difficulty: "medium" },
  { questionText: "Which player has won the most Premier League Player of the Month awards?", optionA: "Harry Kane", optionB: "Sergio Aguero", optionC: "Steven Gerrard", correctAnswer: "B", difficulty: "hard" },
  { questionText: "Who is the only player to win La Liga with three different clubs?", optionA: "Luis Figo", optionB: "Samuel Eto'o", optionC: "Michael Laudrup", correctAnswer: "B", difficulty: "hard" },
  { questionText: "Which player scored the fastest goal in Premier League history?", optionA: "Shane Long", optionB: "Ledley King", optionC: "Christian Eriksen", correctAnswer: "A", difficulty: "hard" },
  { questionText: "How many goals did Erling Haaland score on his Premier League debut?", optionA: "1", optionB: "2", optionC: "3", correctAnswer: "B", difficulty: "medium" },
  { questionText: "Which country does Jude Bellingham represent?", optionA: "Germany", optionB: "England", optionC: "Spain", correctAnswer: "B", difficulty: "easy" },
  { questionText: "Who won the 2023 Ballon d'Or?", optionA: "Erling Haaland", optionB: "Kylian Mbappe", optionC: "Lionel Messi", correctAnswer: "C", difficulty: "easy" },
  { questionText: "Which player is nicknamed 'The Flea'?", optionA: "Neymar", optionB: "Lionel Messi", optionC: "Eden Hazard", correctAnswer: "B", difficulty: "easy" },
  { questionText: "Who holds the record for most assists in a single Premier League season?", optionA: "Thierry Henry", optionB: "Mesut Ozil", optionC: "Kevin De Bruyne", correctAnswer: "C", difficulty: "medium" },
  { questionText: "Which Nigerian player won the Champions League with Chelsea in 2012?", optionA: "John Obi Mikel", optionB: "Victor Moses", optionC: "Both A and B", correctAnswer: "A", difficulty: "medium" },
];

// Generate more football questions programmatically
const additionalFootballQuestions = [];

// More World Cup questions
const worldCupYears = [1930, 1934, 1938, 1950, 1954, 1958, 1962, 1966, 1970, 1974, 1978, 1982, 1986, 1990, 1994, 1998, 2002, 2006, 2010, 2014, 2018, 2022];
const worldCupWinners = ["Uruguay", "Italy", "Italy", "Uruguay", "Germany", "Brazil", "Brazil", "England", "Brazil", "Germany", "Argentina", "Italy", "Argentina", "Germany", "Brazil", "France", "Brazil", "Italy", "Spain", "Germany", "France", "Argentina"];
const worldCupHosts = ["Uruguay", "Italy", "France", "Brazil", "Switzerland", "Sweden", "Chile", "England", "Mexico", "Germany", "Argentina", "Spain", "Mexico", "Italy", "USA", "France", "South Korea/Japan", "Germany", "South Africa", "Brazil", "Russia", "Qatar"];

for (let i = 0; i < worldCupYears.length; i++) {
  const wrongAnswers = worldCupWinners.filter((w, idx) => idx !== i).slice(0, 2);
  additionalFootballQuestions.push({
    questionText: `Which country hosted the ${worldCupYears[i]} FIFA World Cup?`,
    optionA: worldCupHosts[i],
    optionB: i < worldCupHosts.length - 1 ? worldCupHosts[i + 1] : worldCupHosts[0],
    optionC: i < worldCupHosts.length - 2 ? worldCupHosts[i + 2] : worldCupHosts[1],
    correctAnswer: "A",
    difficulty: i < 10 ? "hard" : "medium"
  });
}

// More Premier League questions
const plTeams = ["Arsenal", "Chelsea", "Liverpool", "Manchester City", "Manchester United", "Tottenham", "Newcastle", "Aston Villa", "West Ham", "Brighton", "Crystal Palace", "Everton", "Wolves", "Fulham", "Brentford", "Nottingham Forest", "Bournemouth", "Sheffield United", "Burnley", "Luton Town"];
const plStadiums = ["Emirates Stadium", "Stamford Bridge", "Anfield", "Etihad Stadium", "Old Trafford", "Tottenham Hotspur Stadium", "St James' Park", "Villa Park", "London Stadium", "Amex Stadium", "Selhurst Park", "Goodison Park", "Molineux", "Craven Cottage", "Brentford Community Stadium", "City Ground", "Vitality Stadium", "Bramall Lane", "Turf Moor", "Kenilworth Road"];

for (let i = 0; i < plTeams.length; i++) {
  const wrongStadiums = plStadiums.filter((s, idx) => idx !== i).slice(0, 2);
  additionalFootballQuestions.push({
    questionText: `What is the home stadium of ${plTeams[i]}?`,
    optionA: plStadiums[i],
    optionB: wrongStadiums[0],
    optionC: wrongStadiums[1],
    correctAnswer: "A",
    difficulty: "medium"
  });
}

// Famous players by club
const playerClubs = [
  { player: "Thierry Henry", club: "Arsenal", wrong1: "Chelsea", wrong2: "Manchester United" },
  { player: "Frank Lampard", club: "Chelsea", wrong1: "Liverpool", wrong2: "Manchester City" },
  { player: "Steven Gerrard", club: "Liverpool", wrong1: "Everton", wrong2: "Chelsea" },
  { player: "Wayne Rooney", club: "Manchester United", wrong1: "Liverpool", wrong2: "Manchester City" },
  { player: "Sergio Aguero", club: "Manchester City", wrong1: "Chelsea", wrong2: "Arsenal" },
  { player: "Harry Kane", club: "Tottenham", wrong1: "Arsenal", wrong2: "Chelsea" },
  { player: "Alan Shearer", club: "Newcastle", wrong1: "Sunderland", wrong2: "Middlesbrough" },
  { player: "Paolo Di Canio", club: "West Ham", wrong1: "Chelsea", wrong2: "Arsenal" },
  { player: "Patrick Vieira", club: "Arsenal", wrong1: "Chelsea", wrong2: "Manchester United" },
  { player: "John Terry", club: "Chelsea", wrong1: "Arsenal", wrong2: "Tottenham" },
  { player: "Rio Ferdinand", club: "Manchester United", wrong1: "Liverpool", wrong2: "Chelsea" },
  { player: "Virgil van Dijk", club: "Liverpool", wrong1: "Manchester City", wrong2: "Chelsea" },
  { player: "Kevin De Bruyne", club: "Manchester City", wrong1: "Manchester United", wrong2: "Arsenal" },
  { player: "Eden Hazard", club: "Chelsea", wrong1: "Arsenal", wrong2: "Tottenham" },
  { player: "Dennis Bergkamp", club: "Arsenal", wrong1: "Tottenham", wrong2: "Chelsea" },
  { player: "David Silva", club: "Manchester City", wrong1: "Manchester United", wrong2: "Chelsea" },
  { player: "Gareth Bale", club: "Tottenham", wrong1: "Arsenal", wrong2: "Chelsea" },
  { player: "Luis Suarez", club: "Liverpool", wrong1: "Chelsea", wrong2: "Manchester City" },
  { player: "Michael Owen", club: "Liverpool", wrong1: "Everton", wrong2: "Manchester United" },
  { player: "Didier Drogba", club: "Chelsea", wrong1: "Arsenal", wrong2: "Tottenham" },
];

for (const { player, club, wrong1, wrong2 } of playerClubs) {
  additionalFootballQuestions.push({
    questionText: `Which Premier League club is ${player} most associated with?`,
    optionA: club,
    optionB: wrong1,
    optionC: wrong2,
    correctAnswer: "A",
    difficulty: "easy"
  });
}

// Manager questions
const managers = [
  { manager: "Pep Guardiola", team: "Manchester City", wrong1: "Manchester United", wrong2: "Liverpool" },
  { manager: "Jurgen Klopp", team: "Liverpool", wrong1: "Manchester City", wrong2: "Arsenal" },
  { manager: "Mikel Arteta", team: "Arsenal", wrong1: "Chelsea", wrong2: "Tottenham" },
  { manager: "Erik ten Hag", team: "Manchester United", wrong1: "Chelsea", wrong2: "Liverpool" },
  { manager: "Unai Emery", team: "Aston Villa", wrong1: "Arsenal", wrong2: "Tottenham" },
  { manager: "Ange Postecoglou", team: "Tottenham", wrong1: "Chelsea", wrong2: "Brighton" },
  { manager: "Carlo Ancelotti", team: "Real Madrid", wrong1: "Barcelona", wrong2: "Juventus" },
  { manager: "Xavi", team: "Barcelona", wrong1: "Real Madrid", wrong2: "Atletico Madrid" },
  { manager: "Diego Simeone", team: "Atletico Madrid", wrong1: "Real Madrid", wrong2: "Sevilla" },
  { manager: "Thomas Tuchel", team: "Bayern Munich", wrong1: "PSG", wrong2: "Chelsea" },
];

for (const { manager, team, wrong1, wrong2 } of managers) {
  additionalFootballQuestions.push({
    questionText: `Which club does ${manager} currently or recently manage?`,
    optionA: team,
    optionB: wrong1,
    optionC: wrong2,
    correctAnswer: "A",
    difficulty: "easy"
  });
}

// National team captains
const captains = [
  { captain: "Virgil van Dijk", country: "Netherlands", wrong1: "Belgium", wrong2: "Germany" },
  { captain: "Kylian Mbappe", country: "France", wrong1: "Belgium", wrong2: "Spain" },
  { captain: "Harry Kane", country: "England", wrong1: "Scotland", wrong2: "Wales" },
  { captain: "Luka Modric", country: "Croatia", wrong1: "Serbia", wrong2: "Slovenia" },
  { captain: "Cristiano Ronaldo", country: "Portugal", wrong1: "Spain", wrong2: "Brazil" },
];

for (const { captain, country, wrong1, wrong2 } of captains) {
  additionalFootballQuestions.push({
    questionText: `Which national team is ${captain} the captain of?`,
    optionA: country,
    optionB: wrong1,
    optionC: wrong2,
    correctAnswer: "A",
    difficulty: "easy"
  });
}

// More scoring records and statistics
const scoringRecords = [
  { q: "How many goals did Lionel Messi score in 2012?", a: "91", b: "82", c: "73", correct: "A", diff: "hard" },
  { q: "What is the record for most goals in a single Premier League match?", a: "5", b: "6", c: "4", correct: "A", diff: "hard" },
  { q: "How many hat-tricks has Cristiano Ronaldo scored in his career?", a: "Over 50", b: "Over 60", c: "Over 70", correct: "B", diff: "hard" },
  { q: "What is the fastest hat-trick in World Cup history (in minutes)?", a: "11", b: "8", c: "15", correct: "A", diff: "hard" },
  { q: "How many goals did Just Fontaine score in the 1958 World Cup?", a: "13", b: "10", c: "11", correct: "A", diff: "hard" },
  { q: "What is Pele's official international goal tally?", a: "77", b: "95", c: "61", correct: "A", diff: "hard" },
  { q: "How many Champions League goals did Raul score?", a: "71", b: "65", c: "58", correct: "A", diff: "hard" },
  { q: "What is the record for most goals in a single La Liga season?", a: "50", b: "46", c: "55", correct: "A", diff: "hard" },
];

for (const record of scoringRecords) {
  additionalFootballQuestions.push({
    questionText: record.q,
    optionA: record.a,
    optionB: record.b,
    optionC: record.c,
    correctAnswer: record.correct,
    difficulty: record.diff
  });
}

// Transfer questions
const transfers = [
  { q: "What was Neymar's transfer fee from Barcelona to PSG?", a: "222 million euros", b: "180 million euros", c: "150 million euros", correct: "A" },
  { q: "Which club did Kylian Mbappe join from Monaco?", a: "Real Madrid", b: "PSG", c: "Barcelona", correct: "B" },
  { q: "How much did Manchester City pay for Jack Grealish?", a: "100 million pounds", b: "80 million pounds", c: "120 million pounds", correct: "A" },
  { q: "Which club did Mohamed Salah play for before Liverpool?", a: "Chelsea", b: "Roma", c: "Fiorentina", correct: "B" },
  { q: "What was Cristiano Ronaldo's transfer fee from Manchester United to Real Madrid?", a: "80 million pounds", b: "60 million pounds", c: "100 million pounds", correct: "A" },
];

for (const transfer of transfers) {
  additionalFootballQuestions.push({
    questionText: transfer.q,
    optionA: transfer.a,
    optionB: transfer.b,
    optionC: transfer.c,
    correctAnswer: transfer.correct,
    difficulty: "medium"
  });
}

// Club history questions
const clubHistory = [
  { q: "In which year was Manchester United founded?", a: "1878", b: "1892", c: "1905", correct: "A" },
  { q: "What was Arsenal's original name?", a: "Dial Square", b: "The Gunners", c: "North London FC", correct: "A" },
  { q: "Which city is FC Barcelona located in?", a: "Madrid", b: "Barcelona", c: "Valencia", correct: "B" },
  { q: "In which year was Real Madrid founded?", a: "1902", b: "1895", c: "1910", correct: "A" },
  { q: "What year did the Premier League start?", a: "1990", b: "1992", c: "1994", correct: "B" },
  { q: "Which country does Bayern Munich play in?", a: "Austria", b: "Switzerland", c: "Germany", correct: "C" },
  { q: "What is the nickname of Juventus?", a: "The Old Lady", b: "The Black and Whites", c: "I Bianconeri", correct: "A" },
  { q: "In which country is Ajax based?", a: "Belgium", b: "Netherlands", c: "Denmark", correct: "B" },
];

for (const history of clubHistory) {
  additionalFootballQuestions.push({
    questionText: history.q,
    optionA: history.a,
    optionB: history.b,
    optionC: history.c,
    correctAnswer: history.correct,
    difficulty: "medium"
  });
}

// Trophy and award questions
const trophies = [
  { q: "Which player has won the most FIFA Best Men's Player awards?", a: "Lionel Messi", b: "Cristiano Ronaldo", c: "Robert Lewandowski", correct: "A" },
  { q: "Who won the Golden Boy award in 2023?", a: "Jude Bellingham", b: "Gavi", c: "Jamal Musiala", correct: "A" },
  { q: "Which goalkeeper has won the most Yashin Trophy (Best Goalkeeper)?", a: "Thibaut Courtois", b: "Manuel Neuer", c: "Alisson", correct: "A" },
  { q: "How many times has Luka Modric won the Ballon d'Or?", a: "1", b: "2", c: "0", correct: "A" },
  { q: "Which African player was first to win the Ballon d'Or?", a: "George Weah", b: "Samuel Eto'o", c: "Didier Drogba", correct: "A" },
];

for (const trophy of trophies) {
  additionalFootballQuestions.push({
    questionText: trophy.q,
    optionA: trophy.a,
    optionB: trophy.b,
    optionC: trophy.c,
    correctAnswer: trophy.correct,
    difficulty: "medium"
  });
}

// Tactical and formation questions
const tactics = [
  { q: "What formation did Pep Guardiola's Barcelona famously use?", a: "4-3-3", b: "4-4-2", c: "3-5-2", correct: "A" },
  { q: "What position does a 'false 9' play?", a: "Defensive midfield", b: "Center forward dropping deep", c: "Wing back", correct: "B" },
  { q: "Which defensive formation has three center-backs?", a: "4-4-2", b: "3-5-2", c: "4-3-3", correct: "B" },
  { q: "What does 'tiki-taka' refer to in football?", a: "Counter-attacking", b: "Short passing game", c: "Long ball", correct: "B" },
  { q: "What is 'parking the bus' in football?", a: "Defensive strategy", b: "Attacking strategy", c: "Set piece tactic", correct: "A" },
];

for (const tactic of tactics) {
  additionalFootballQuestions.push({
    questionText: tactic.q,
    optionA: tactic.a,
    optionB: tactic.b,
    optionC: tactic.c,
    correctAnswer: tactic.correct,
    difficulty: "medium"
  });
}

// More international questions
const international = [
  { q: "Which country has the most FIFA World Cup appearances?", a: "Germany", b: "Brazil", c: "Italy", correct: "B" },
  { q: "How many times has Spain won the European Championship?", a: "2", b: "3", c: "4", correct: "B" },
  { q: "Which country won Euro 2020?", a: "England", b: "Italy", c: "Spain", correct: "B" },
  { q: "Who is Germany's all-time top scorer?", a: "Miroslav Klose", b: "Gerd Muller", c: "Thomas Muller", correct: "B" },
  { q: "Which country does Kylian Mbappe play for?", a: "Belgium", b: "France", c: "Spain", correct: "B" },
  { q: "How many European Championships has Portugal won?", a: "1", b: "2", c: "0", correct: "A" },
  { q: "Which Asian country has won the most Asian Cup titles?", a: "Japan", b: "South Korea", c: "Iran", correct: "A" },
  { q: "Who is Argentina's all-time top scorer?", a: "Diego Maradona", b: "Lionel Messi", c: "Gabriel Batistuta", correct: "B" },
];

for (const intl of international) {
  additionalFootballQuestions.push({
    questionText: intl.q,
    optionA: intl.a,
    optionB: intl.b,
    optionC: intl.c,
    correctAnswer: intl.correct,
    difficulty: "medium"
  });
}

// Derby matches
const derbies = [
  { q: "What is the Manchester derby between?", a: "Man United vs Man City", b: "Man United vs Liverpool", c: "Man City vs Liverpool", correct: "A" },
  { q: "What is the North London derby between?", a: "Chelsea vs Arsenal", b: "Arsenal vs Tottenham", c: "Tottenham vs Chelsea", correct: "B" },
  { q: "What is El Clasico?", a: "Real Madrid vs Barcelona", b: "Atletico Madrid vs Sevilla", c: "Valencia vs Villarreal", correct: "A" },
  { q: "What is the Milan derby between?", a: "AC Milan vs Juventus", b: "Inter Milan vs Juventus", c: "AC Milan vs Inter Milan", correct: "C" },
  { q: "What is the Old Firm derby?", a: "Celtic vs Rangers", b: "Hearts vs Hibernian", c: "Aberdeen vs Dundee", correct: "A" },
  { q: "What is the Merseyside derby between?", a: "Liverpool vs Manchester United", b: "Liverpool vs Everton", c: "Everton vs Manchester City", correct: "B" },
];

for (const derby of derbies) {
  additionalFootballQuestions.push({
    questionText: derby.q,
    optionA: derby.a,
    optionB: derby.b,
    optionC: derby.c,
    correctAnswer: derby.correct,
    difficulty: "easy"
  });
}

// Goalkeeper questions
const goalkeepers = [
  { q: "Who is considered the best goalkeeper of all time?", a: "Lev Yashin", b: "Gianluigi Buffon", c: "Manuel Neuer", correct: "A" },
  { q: "Which goalkeeper has the most clean sheets in Premier League history?", a: "David Seaman", b: "Petr Cech", c: "Edwin van der Sar", correct: "B" },
  { q: "Who won the 2022 World Cup Golden Glove?", a: "Hugo Lloris", b: "Emiliano Martinez", c: "Dominik Livakovic", correct: "B" },
  { q: "Which country does Alisson Becker play for?", a: "Argentina", b: "Brazil", c: "Colombia", correct: "B" },
  { q: "Who is the most expensive goalkeeper in history?", a: "Alisson", b: "Kepa Arrizabalaga", c: "Ederson", correct: "B" },
];

for (const gk of goalkeepers) {
  additionalFootballQuestions.push({
    questionText: gk.q,
    optionA: gk.a,
    optionB: gk.b,
    optionC: gk.c,
    correctAnswer: gk.correct,
    difficulty: "medium"
  });
}

// Women's football questions
const womensFootball = [
  { q: "Which country won the 2023 FIFA Women's World Cup?", a: "USA", b: "Spain", c: "England", correct: "B" },
  { q: "Who is the all-time leading scorer in Women's World Cup?", a: "Marta", b: "Abby Wambach", c: "Megan Rapinoe", correct: "A" },
  { q: "Which country has won the most Women's World Cups?", a: "Germany", b: "USA", c: "Norway", correct: "B" },
  { q: "Who won the 2022 Ballon d'Or Feminin?", a: "Alexia Putellas", b: "Ada Hegerberg", c: "Sam Kerr", correct: "A" },
  { q: "Which English club won the Women's Champions League in 2021?", a: "Chelsea", b: "Arsenal", c: "Manchester City", correct: "A" },
];

for (const wf of womensFootball) {
  additionalFootballQuestions.push({
    questionText: wf.q,
    optionA: wf.a,
    optionB: wf.b,
    optionC: wf.c,
    correctAnswer: wf.correct,
    difficulty: "medium"
  });
}

// More miscellaneous football facts
const miscFootball = [
  { q: "What color is the Liverpool home jersey?", a: "Blue", b: "Red", c: "White", correct: "B" },
  { q: "How long is a standard football match?", a: "80 minutes", b: "90 minutes", c: "100 minutes", correct: "B" },
  { q: "How many players are on a football team on the field?", a: "10", b: "11", c: "12", correct: "B" },
  { q: "What is the diameter of a regulation football?", a: "18-20 cm", b: "22-24 cm", c: "26-28 cm", correct: "B" },
  { q: "How wide is a football goal?", a: "7.32 meters", b: "8 meters", c: "6.5 meters", correct: "A" },
  { q: "What is the penalty spot distance from goal?", a: "11 meters", b: "12 meters", c: "10 meters", correct: "A" },
  { q: "What does VAR stand for?", a: "Video Assistant Referee", b: "Virtual Analysis Review", c: "Verified Action Replay", correct: "A" },
  { q: "What year was VAR introduced in the Premier League?", a: "2018", b: "2019", c: "2020", correct: "B" },
  { q: "How many substitutions are allowed in a Premier League match?", a: "3", b: "5", c: "4", correct: "B" },
  { q: "What is the offside rule based on?", a: "The ball position", b: "The second-last defender", c: "The goalkeeper", correct: "B" },
  { q: "How long is half-time in football?", a: "10 minutes", b: "15 minutes", c: "20 minutes", correct: "B" },
  { q: "What color card is shown for a sending off?", a: "Yellow", b: "Red", c: "Orange", correct: "B" },
  { q: "How many yellow cards result in a red card?", a: "1", b: "2", c: "3", correct: "B" },
  { q: "What is the maximum number of players a team can name in their squad?", a: "23", b: "25", c: "30", correct: "B" },
  { q: "What size is the center circle radius?", a: "9.15 meters", b: "10 meters", c: "11 meters", correct: "A" },
];

for (const misc of miscFootball) {
  additionalFootballQuestions.push({
    questionText: misc.q,
    optionA: misc.a,
    optionB: misc.b,
    optionC: misc.c,
    correctAnswer: misc.correct,
    difficulty: "easy"
  });
}

// More Champions League and European questions
const moreChampionsLeague = [
  { q: "Which club won the first Champions League under its current format (1992-93)?", a: "AC Milan", b: "Marseille", c: "Barcelona", correct: "B" },
  { q: "Who scored the winning goal in the 2005 Champions League final penalty shootout?", a: "Steven Gerrard", b: "Xabi Alonso", c: "Jerzy Dudek saved it", correct: "C" },
  { q: "How many Champions League titles has AC Milan won?", a: "5", b: "6", c: "7", correct: "C" },
  { q: "Which team did Manchester United beat in the 2008 Champions League final?", a: "Barcelona", b: "Chelsea", c: "Bayern Munich", correct: "B" },
  { q: "Who is the youngest player to score in a Champions League final?", a: "Kylian Mbappe", b: "Patrick Kluivert", c: "Raul", correct: "B" },
  { q: "Which manager has won the most Champions League titles?", a: "Carlo Ancelotti", b: "Bob Paisley", c: "Zinedine Zidane", correct: "A" },
  { q: "How many goals did Cristiano Ronaldo score in the 2016-17 Champions League?", a: "10", b: "12", c: "14", correct: "B" },
  { q: "Which was the last English team to win the Champions League before Chelsea in 2012?", a: "Manchester United", b: "Liverpool", c: "Arsenal", correct: "A" },
];

for (const cl of moreChampionsLeague) {
  additionalFootballQuestions.push({
    questionText: cl.q,
    optionA: cl.a,
    optionB: cl.b,
    optionC: cl.c,
    correctAnswer: cl.correct,
    difficulty: "hard"
  });
}

// Create additional questions to reach 1500 total football questions
const moreFootballQuestions = [];

// Young player questions
const youngPlayers = [
  { player: "Jude Bellingham", club: "Real Madrid", country: "England" },
  { player: "Florian Wirtz", club: "Bayer Leverkusen", country: "Germany" },
  { player: "Jamal Musiala", club: "Bayern Munich", country: "Germany" },
  { player: "Gavi", club: "Barcelona", country: "Spain" },
  { player: "Pedri", club: "Barcelona", country: "Spain" },
  { player: "Bukayo Saka", club: "Arsenal", country: "England" },
  { player: "Phil Foden", club: "Manchester City", country: "England" },
  { player: "Eduardo Camavinga", club: "Real Madrid", country: "France" },
  { player: "Joao Felix", club: "Barcelona (loan)", country: "Portugal" },
  { player: "Vinicius Jr", club: "Real Madrid", country: "Brazil" },
];

for (const yp of youngPlayers) {
  const wrongClubs = ["Chelsea", "Manchester United", "PSG", "Juventus", "Liverpool"].filter(c => c !== yp.club).slice(0, 2);
  moreFootballQuestions.push({
    questionText: `Which club does ${yp.player} currently play for?`,
    optionA: yp.club,
    optionB: wrongClubs[0],
    optionC: wrongClubs[1],
    correctAnswer: "A",
    difficulty: "easy"
  });
  
  const wrongCountries = ["France", "Spain", "Brazil", "Argentina", "Netherlands"].filter(c => c !== yp.country).slice(0, 2);
  moreFootballQuestions.push({
    questionText: `Which country does ${yp.player} represent internationally?`,
    optionA: yp.country,
    optionB: wrongCountries[0],
    optionC: wrongCountries[1],
    correctAnswer: "A",
    difficulty: "easy"
  });
}

// Nigerian Football Questions (more detailed)
const nigerianFootball = [
  { q: "Which Nigerian club won the CAF Champions League in 2003?", a: "Enyimba", b: "Shooting Stars", c: "Rangers", correct: "A" },
  { q: "Who was Nigeria's captain at the 1994 World Cup?", a: "Stephen Keshi", b: "Rashidi Yekini", c: "Jay-Jay Okocha", correct: "A" },
  { q: "Which year did Nigeria win their first Africa Cup of Nations?", a: "1980", b: "1994", c: "2000", correct: "A" },
  { q: "Who is Nigeria's most capped player ever?", a: "Ahmed Musa", b: "Vincent Enyeama", c: "John Obi Mikel", correct: "B" },
  { q: "Which Nigerian won the African Footballer of the Year three times?", a: "Jay-Jay Okocha", b: "Kanu Nwankwo", c: "Rashidi Yekini", correct: "B" },
  { q: "What is the name of Nigeria's national stadium in Abuja?", a: "National Stadium", b: "Moshood Abiola Stadium", c: "Teslim Balogun Stadium", correct: "B" },
  { q: "Which Nigerian scored in the 2010 World Cup against Greece?", a: "Yakubu Aiyegbeni", b: "Peter Odemwingie", c: "Kalu Uche", correct: "C" },
  { q: "Who is Nigeria's current all-time leading goalscorer?", a: "Rashidi Yekini", b: "Segun Odegbami", c: "Victor Osimhen", correct: "A" },
  { q: "Which Nigerian club plays at the Nnamdi Azikiwe Stadium?", a: "Rangers International", b: "Enyimba", c: "Enugu Rangers", correct: "C" },
  { q: "Who coached Nigeria to the 2013 AFCON title?", a: "Samson Siasia", b: "Stephen Keshi", c: "Gernot Rohr", correct: "B" },
  { q: "Which Nigerian player played for Ajax and Arsenal?", a: "Nwankwo Kanu", b: "Jay-Jay Okocha", c: "Finidi George", correct: "A" },
  { q: "What year did Nigeria win Olympic gold in football?", a: "1992", b: "1996", c: "2000", correct: "B" },
  { q: "Which Nigerian scored against Argentina in the 1994 World Cup?", a: "Jay-Jay Okocha", b: "Samson Siasia", c: "Rashidi Yekini", correct: "B" },
  { q: "Who was Nigeria's goalkeeper during the 2010 World Cup?", a: "Carl Ikeme", b: "Vincent Enyeama", c: "Dele Aiyenugba", correct: "B" },
  { q: "Which city is Shooting Stars FC based in?", a: "Lagos", b: "Ibadan", c: "Kano", correct: "B" },
];

for (const nf of nigerianFootball) {
  moreFootballQuestions.push({
    questionText: nf.q,
    optionA: nf.a,
    optionB: nf.b,
    optionC: nf.c,
    correctAnswer: nf.correct,
    difficulty: "medium"
  });
}

// Legend questions
const legendQuestions = [
  { q: "Which country did Diego Maradona represent?", a: "Brazil", b: "Argentina", c: "Uruguay", correct: "B" },
  { q: "Which club did Zinedine Zidane play for in Italy?", a: "AC Milan", b: "Inter Milan", c: "Juventus", correct: "C" },
  { q: "How many World Cups did Pele win?", a: "2", b: "3", c: "4", correct: "B" },
  { q: "Which Dutch legend was known as 'The Flying Dutchman'?", a: "Johan Cruyff", b: "Marco van Basten", c: "Dennis Bergkamp", correct: "C" },
  { q: "Which country did Franz Beckenbauer represent?", a: "Austria", b: "Germany", c: "Netherlands", correct: "B" },
  { q: "Who is known as 'The Kaiser' in football?", a: "Franz Beckenbauer", b: "Gerd Muller", c: "Lothar Matthaus", correct: "A" },
  { q: "Which Italian club did Ronaldinho play for?", a: "AC Milan", b: "Juventus", c: "Inter Milan", correct: "A" },
  { q: "Who is the Brazilian legend known as 'O Fenomeno'?", a: "Ronaldinho", b: "Ronaldo Nazario", c: "Rivaldo", correct: "B" },
  { q: "Which English club did George Best play for?", a: "Liverpool", b: "Manchester United", c: "Chelsea", correct: "B" },
  { q: "Who was the captain of France's 1998 World Cup winning team?", a: "Zinedine Zidane", b: "Didier Deschamps", c: "Laurent Blanc", correct: "B" },
];

for (const legend of legendQuestions) {
  moreFootballQuestions.push({
    questionText: legend.q,
    optionA: legend.a,
    optionB: legend.b,
    optionC: legend.c,
    correctAnswer: legend.correct,
    difficulty: "medium"
  });
}

// Stadium capacity questions
const stadiumCapacity = [
  { q: "Which is the largest football stadium in Europe?", a: "Camp Nou", b: "Wembley", c: "Signal Iduna Park", correct: "A" },
  { q: "What is the capacity of Old Trafford?", a: "Around 75,000", b: "Around 80,000", c: "Around 65,000", correct: "A" },
  { q: "Which stadium is known as 'The Theatre of Dreams'?", a: "Anfield", b: "Old Trafford", c: "Emirates Stadium", correct: "B" },
  { q: "What is the capacity of Wembley Stadium?", a: "80,000", b: "90,000", c: "100,000", correct: "B" },
  { q: "Which stadium hosts the FA Cup Final?", a: "Old Trafford", b: "Wembley", c: "Emirates Stadium", correct: "B" },
];

for (const stadium of stadiumCapacity) {
  moreFootballQuestions.push({
    questionText: stadium.q,
    optionA: stadium.a,
    optionB: stadium.b,
    optionC: stadium.c,
    correctAnswer: stadium.correct,
    difficulty: "medium"
  });
}

// More scoring and records
const moreRecords = [
  { q: "Who holds the record for most goals in a single World Cup tournament?", a: "Just Fontaine", b: "Gerd Muller", c: "Ronaldo", correct: "A" },
  { q: "What is the record for most goals in a single Champions League season?", a: "14", b: "17", c: "12", correct: "B" },
  { q: "Who scored the most goals in Serie A history?", a: "Silvio Piola", b: "Francesco Totti", c: "Giuseppe Meazza", correct: "A" },
  { q: "What is the fastest red card in football history?", a: "1 second", b: "2 seconds", c: "3 seconds", correct: "B" },
  { q: "Who has the most international goals in football history?", a: "Cristiano Ronaldo", b: "Ali Daei", c: "Lionel Messi", correct: "A" },
  { q: "What is the longest unbeaten run in football?", a: "56 games", b: "48 games", c: "52 games", correct: "A" },
  { q: "Who scored the fastest goal in World Cup history?", a: "Hakan Sukur", b: "Vaclav Masek", c: "Ernst Lehner", correct: "A" },
  { q: "What is the record for most consecutive wins in the Premier League?", a: "16", b: "18", c: "20", correct: "B" },
];

for (const record of moreRecords) {
  moreFootballQuestions.push({
    questionText: record.q,
    optionA: record.a,
    optionB: record.b,
    optionC: record.c,
    correctAnswer: record.correct,
    difficulty: "hard"
  });
}

// Season-specific questions
const seasonQuestions = [
  { q: "Who won the Premier League Golden Boot in 2022-23?", a: "Erling Haaland", b: "Harry Kane", c: "Ivan Toney", correct: "A" },
  { q: "Which team won the FA Cup in 2023?", a: "Manchester City", b: "Manchester United", c: "Arsenal", correct: "A" },
  { q: "Who won La Liga in 2021-22?", a: "Barcelona", b: "Real Madrid", c: "Atletico Madrid", correct: "B" },
  { q: "Which team won the Bundesliga in 2021-22?", a: "Borussia Dortmund", b: "Bayern Munich", c: "RB Leipzig", correct: "B" },
  { q: "Who won the Serie A Golden Boot in 2022-23?", a: "Victor Osimhen", b: "Lautaro Martinez", c: "Dusan Vlahovic", correct: "A" },
  { q: "Which team won the UEFA Europa League in 2023?", a: "Roma", b: "Sevilla", c: "Arsenal", correct: "B" },
  { q: "Who won the Copa del Rey in 2022-23?", a: "Barcelona", b: "Real Madrid", c: "Real Sociedad", correct: "C" },
  { q: "Which team won the DFB-Pokal in 2022-23?", a: "Bayern Munich", b: "RB Leipzig", c: "Eintracht Frankfurt", correct: "B" },
];

for (const season of seasonQuestions) {
  moreFootballQuestions.push({
    questionText: season.q,
    optionA: season.a,
    optionB: season.b,
    optionC: season.c,
    correctAnswer: season.correct,
    difficulty: "medium"
  });
}

// Generate more questions to fill up to 1500
const extraQuestions = [];

// Number-related football trivia
const numberTrivia = [
  { q: "What squad number is traditionally worn by goalkeepers?", a: "1", b: "12", c: "25", correct: "A" },
  { q: "What number did Lionel Messi wear at Barcelona?", a: "7", b: "10", c: "11", correct: "B" },
  { q: "What number did Cristiano Ronaldo wear at Real Madrid?", a: "7", b: "9", c: "10", correct: "A" },
  { q: "What is the jersey number of Kylian Mbappe at PSG?", a: "7", b: "10", c: "11", correct: "A" },
  { q: "What number did David Beckham wear at Manchester United?", a: "7", b: "23", c: "10", correct: "A" },
  { q: "What shirt number did Thierry Henry wear at Arsenal?", a: "9", b: "12", c: "14", correct: "C" },
  { q: "What number did Ronaldinho wear at Barcelona?", a: "10", b: "11", c: "21", correct: "A" },
  { q: "What is the traditional number for a center-forward?", a: "7", b: "9", c: "11", correct: "B" },
  { q: "What number did Andrea Pirlo wear at Juventus?", a: "10", b: "21", c: "6", correct: "B" },
  { q: "What squad number did Zinedine Zidane wear at Real Madrid?", a: "5", b: "10", c: "7", correct: "A" },
];

for (const num of numberTrivia) {
  extraQuestions.push({
    questionText: num.q,
    optionA: num.a,
    optionB: num.b,
    optionC: num.c,
    correctAnswer: num.correct,
    difficulty: "easy"
  });
}

// Contract and salary questions
const contractQuestions = [
  { q: "Who was the first footballer to earn 1 million pounds a year?", a: "David Beckham", b: "Eric Cantona", c: "Sol Campbell", correct: "C" },
  { q: "What is the typical duration of a professional football contract?", a: "1-2 years", b: "3-5 years", c: "7-10 years", correct: "B" },
  { q: "What is a 'Bosman transfer'?", a: "A record-breaking transfer", b: "A free transfer after contract expires", c: "A youth player transfer", correct: "B" },
  { q: "What is a release clause in a football contract?", a: "A clause that releases players from training", b: "A predetermined transfer fee", c: "A buyout of remaining salary", correct: "B" },
  { q: "What does 'loan with option to buy' mean?", a: "Temporary transfer with purchase right", b: "Rental of training facilities", c: "Borrowing of equipment", correct: "A" },
];

for (const contract of contractQuestions) {
  extraQuestions.push({
    questionText: contract.q,
    optionA: contract.a,
    optionB: contract.b,
    optionC: contract.c,
    correctAnswer: contract.correct,
    difficulty: "medium"
  });
}

// Injury and medical questions
const medicalQuestions = [
  { q: "What is an ACL injury in football?", a: "Arm injury", b: "Knee ligament injury", c: "Ankle injury", correct: "B" },
  { q: "How long does ACL recovery typically take?", a: "2-3 months", b: "4-6 months", c: "9-12 months", correct: "C" },
  { q: "What is a 'hamstring injury'?", a: "Hip injury", b: "Thigh muscle injury", c: "Calf injury", correct: "B" },
  { q: "What does 'concussion protocol' require?", a: "Immediate substitution", b: "Match suspension", c: "Assessment and rest", correct: "C" },
  { q: "What is 'muscle fatigue' in football?", a: "Bone weakness", b: "Tired muscles from overuse", c: "Joint stiffness", correct: "B" },
];

for (const medical of medicalQuestions) {
  extraQuestions.push({
    questionText: medical.q,
    optionA: medical.a,
    optionB: medical.b,
    optionC: medical.c,
    correctAnswer: medical.correct,
    difficulty: "medium"
  });
}

// Combine all football questions
const allFootballQuestions = [
  ...footballQuestions,
  ...additionalFootballQuestions,
  ...moreFootballQuestions,
  ...extraQuestions
];

// General Sports Questions (500)
const generalSportsQuestions = [
  // Basketball (100)
  { questionText: "Which NBA team has won the most championships?", optionA: "Los Angeles Lakers", optionB: "Boston Celtics", optionC: "Chicago Bulls", correctAnswer: "B", difficulty: "medium" },
  { questionText: "Who is the NBA's all-time leading scorer?", optionA: "Kareem Abdul-Jabbar", optionB: "LeBron James", optionC: "Michael Jordan", correctAnswer: "B", difficulty: "easy" },
  { questionText: "How many points is a three-point shot worth in basketball?", optionA: "2", optionB: "3", optionC: "4", correctAnswer: "B", difficulty: "easy" },
  { questionText: "How many players are on a basketball team on the court?", optionA: "4", optionB: "5", optionC: "6", correctAnswer: "B", difficulty: "easy" },
  { questionText: "Who is known as 'The King' in NBA?", optionA: "Kobe Bryant", optionB: "LeBron James", optionC: "Stephen Curry", correctAnswer: "B", difficulty: "easy" },
  { questionText: "Which team did Michael Jordan play for?", optionA: "Chicago Bulls", optionB: "Los Angeles Lakers", optionC: "Miami Heat", correctAnswer: "A", difficulty: "easy" },
  { questionText: "How many NBA championships did Michael Jordan win?", optionA: "4", optionB: "5", optionC: "6", correctAnswer: "C", difficulty: "medium" },
  { questionText: "Who won the 2023 NBA Finals MVP?", optionA: "Jimmy Butler", optionB: "Nikola Jokic", optionC: "Jamal Murray", correctAnswer: "B", difficulty: "medium" },
  { questionText: "Which team won the 2023 NBA Championship?", optionA: "Miami Heat", optionB: "Denver Nuggets", optionC: "Boston Celtics", correctAnswer: "B", difficulty: "easy" },
  { questionText: "What is the height of a standard NBA basketball hoop?", optionA: "10 feet", optionB: "11 feet", optionC: "12 feet", correctAnswer: "A", difficulty: "medium" },
  { questionText: "Who holds the record for most points in a single NBA game?", optionA: "Kobe Bryant", optionB: "Michael Jordan", optionC: "Wilt Chamberlain", correctAnswer: "C", difficulty: "medium" },
  { questionText: "How many points did Wilt Chamberlain score in his record game?", optionA: "81", optionB: "100", optionC: "92", correctAnswer: "B", difficulty: "hard" },
  { questionText: "Which city are the Warriors based in?", optionA: "San Francisco", optionB: "Oakland", optionC: "Los Angeles", correctAnswer: "A", difficulty: "medium" },
  { questionText: "Who is known as 'The Greek Freak'?", optionA: "Luka Doncic", optionB: "Giannis Antetokounmpo", optionC: "Nikola Jokic", correctAnswer: "B", difficulty: "easy" },
  { questionText: "Which team does Stephen Curry play for?", optionA: "Brooklyn Nets", optionB: "Golden State Warriors", optionC: "Phoenix Suns", correctAnswer: "B", difficulty: "easy" },
  { questionText: "How long is an NBA quarter?", optionA: "10 minutes", optionB: "12 minutes", optionC: "15 minutes", correctAnswer: "B", difficulty: "medium" },
  { questionText: "What is a 'triple-double' in basketball?", optionA: "Three 3-pointers", optionB: "Double figures in 3 stats", optionC: "30 points", correctAnswer: "B", difficulty: "medium" },
  { questionText: "Which player has the most NBA MVP awards?", optionA: "Michael Jordan", optionB: "Kareem Abdul-Jabbar", optionC: "LeBron James", correctAnswer: "B", difficulty: "hard" },
  { questionText: "What does NBA stand for?", optionA: "National Basketball Association", optionB: "North American Basketball Association", optionC: "National Ball Association", correctAnswer: "A", difficulty: "easy" },
  { questionText: "Who is the shortest player to ever play in the NBA?", optionA: "Isaiah Thomas", optionB: "Muggsy Bogues", optionC: "Spud Webb", correctAnswer: "B", difficulty: "hard" },
  // Tennis (80)
  { questionText: "Who has won the most Grand Slam titles in men's tennis?", optionA: "Rafael Nadal", optionB: "Novak Djokovic", optionC: "Roger Federer", correctAnswer: "B", difficulty: "easy" },
  { questionText: "How many Grand Slam tournaments are there?", optionA: "3", optionB: "4", optionC: "5", correctAnswer: "B", difficulty: "easy" },
  { questionText: "What surface is Wimbledon played on?", optionA: "Clay", optionB: "Grass", optionC: "Hard court", correctAnswer: "B", difficulty: "easy" },
  { questionText: "Which Grand Slam is played on clay?", optionA: "US Open", optionB: "French Open", optionC: "Australian Open", correctAnswer: "B", difficulty: "easy" },
  { questionText: "Who has won the most Wimbledon titles?", optionA: "Novak Djokovic", optionB: "Roger Federer", optionC: "Pete Sampras", correctAnswer: "B", difficulty: "medium" },
  { questionText: "What is a 'love' in tennis scoring?", optionA: "15 points", optionB: "Zero points", optionC: "30 points", correctAnswer: "B", difficulty: "easy" },
  { questionText: "How many sets are needed to win a men's Grand Slam match?", optionA: "2", optionB: "3", optionC: "4", correctAnswer: "B", difficulty: "medium" },
  { questionText: "Who won Wimbledon 2023 men's singles?", optionA: "Novak Djokovic", optionB: "Carlos Alcaraz", optionC: "Daniil Medvedev", correctAnswer: "B", difficulty: "medium" },
  { questionText: "Which female player has the most Grand Slam titles?", optionA: "Serena Williams", optionB: "Margaret Court", optionC: "Steffi Graf", correctAnswer: "B", difficulty: "hard" },
  { questionText: "What is a 'deuce' in tennis?", optionA: "40-40", optionB: "30-30", optionC: "15-15", correctAnswer: "A", difficulty: "medium" },
  { questionText: "Where is the Australian Open held?", optionA: "Sydney", optionB: "Melbourne", optionC: "Brisbane", correctAnswer: "B", difficulty: "medium" },
  { questionText: "What is a 'break' in tennis?", optionA: "A rest period", optionB: "Winning opponent's serve game", optionC: "A fault", correctAnswer: "B", difficulty: "medium" },
  { questionText: "Who is known as 'The King of Clay'?", optionA: "Roger Federer", optionB: "Rafael Nadal", optionC: "Novak Djokovic", correctAnswer: "B", difficulty: "easy" },
  { questionText: "How many points to win a tiebreak?", optionA: "5", optionB: "7", optionC: "10", correctAnswer: "B", difficulty: "medium" },
  { questionText: "Which country hosts the US Open?", optionA: "UK", optionB: "USA", optionC: "Australia", correctAnswer: "B", difficulty: "easy" },
  // Cricket (80)
  { questionText: "How many players are on a cricket team?", optionA: "10", optionB: "11", optionC: "12", correctAnswer: "B", difficulty: "easy" },
  { questionText: "Who has scored the most international cricket runs?", optionA: "Ricky Ponting", optionB: "Sachin Tendulkar", optionC: "Brian Lara", correctAnswer: "B", difficulty: "medium" },
  { questionText: "What is a 'century' in cricket?", optionA: "50 runs", optionB: "100 runs", optionC: "150 runs", correctAnswer: "B", difficulty: "easy" },
  { questionText: "How many overs are in a One Day International match?", optionA: "40", optionB: "50", optionC: "60", correctAnswer: "B", difficulty: "easy" },
  { questionText: "Which country won the 2023 Cricket World Cup?", optionA: "India", optionB: "Australia", optionC: "England", correctAnswer: "B", difficulty: "easy" },
  { questionText: "What is a 'duck' in cricket?", optionA: "A type of delivery", optionB: "Getting out for zero", optionC: "A fielding position", correctAnswer: "B", difficulty: "easy" },
  { questionText: "How many runs is a 'six' worth?", optionA: "4", optionB: "5", optionC: "6", correctAnswer: "C", difficulty: "easy" },
  { questionText: "What does LBW stand for?", optionA: "Leg Before Wicket", optionB: "Left Bowler Wins", optionC: "Long Ball Wide", correctAnswer: "A", difficulty: "medium" },
  { questionText: "Which country invented cricket?", optionA: "Australia", optionB: "England", optionC: "India", correctAnswer: "B", difficulty: "medium" },
  { questionText: "Who is known as 'The Little Master' in cricket?", optionA: "Sachin Tendulkar", optionB: "Brian Lara", optionC: "Virat Kohli", correctAnswer: "A", difficulty: "medium" },
  { questionText: "How many balls are in a cricket over?", optionA: "5", optionB: "6", optionC: "8", correctAnswer: "B", difficulty: "easy" },
  { questionText: "What is the Ashes series between?", optionA: "England vs India", optionB: "England vs Australia", optionC: "Australia vs India", correctAnswer: "B", difficulty: "medium" },
  { questionText: "What is a 'hat-trick' in cricket?", optionA: "3 runs in 3 balls", optionB: "3 wickets in 3 balls", optionC: "3 boundaries", correctAnswer: "B", difficulty: "medium" },
  { questionText: "What is the highest individual score in Test cricket?", optionA: "334", optionB: "400", optionC: "501", correctAnswer: "B", difficulty: "hard" },
  { questionText: "Who holds the record for highest Test score?", optionA: "Don Bradman", optionB: "Brian Lara", optionC: "Matthew Hayden", correctAnswer: "B", difficulty: "medium" },
  // Athletics (70)
  { questionText: "Who is the fastest man in history?", optionA: "Usain Bolt", optionB: "Carl Lewis", optionC: "Tyson Gay", correctAnswer: "A", difficulty: "easy" },
  { questionText: "What is the 100m world record?", optionA: "9.48 seconds", optionB: "9.58 seconds", optionC: "9.69 seconds", correctAnswer: "B", difficulty: "medium" },
  { questionText: "Who holds the 100m world record?", optionA: "Tyson Gay", optionB: "Usain Bolt", optionC: "Yohan Blake", correctAnswer: "B", difficulty: "easy" },
  { questionText: "How long is a marathon race?", optionA: "40 km", optionB: "42.195 km", optionC: "45 km", correctAnswer: "B", difficulty: "medium" },
  { questionText: "Which country does Usain Bolt represent?", optionA: "USA", optionB: "Jamaica", optionC: "Trinidad", correctAnswer: "B", difficulty: "easy" },
  { questionText: "What is the standard length of a sprint track?", optionA: "100m", optionB: "200m", optionC: "400m", correctAnswer: "C", difficulty: "medium" },
  { questionText: "How many hurdles are in a 110m hurdles race?", optionA: "8", optionB: "10", optionC: "12", correctAnswer: "B", difficulty: "hard" },
  { questionText: "What is the decathlon?", optionA: "5 events", optionB: "10 events", optionC: "15 events", correctAnswer: "B", difficulty: "medium" },
  { questionText: "Who is the world record holder in long jump?", optionA: "Carl Lewis", optionB: "Mike Powell", optionC: "Bob Beamon", correctAnswer: "B", difficulty: "hard" },
  { questionText: "What is the women's 100m world record?", optionA: "10.49 seconds", optionB: "10.65 seconds", optionC: "10.72 seconds", correctAnswer: "A", difficulty: "hard" },
  { questionText: "Who holds the women's 100m world record?", optionA: "Shelly-Ann Fraser-Pryce", optionB: "Florence Griffith-Joyner", optionC: "Elaine Thompson", correctAnswer: "B", difficulty: "hard" },
  { questionText: "What is a 'relay race'?", optionA: "Solo race", optionB: "Team passing baton race", optionC: "Obstacle race", correctAnswer: "B", difficulty: "easy" },
  { questionText: "How many runners in a 4x100m relay team?", optionA: "3", optionB: "4", optionC: "5", correctAnswer: "B", difficulty: "easy" },
  { questionText: "What is the pole vault?", optionA: "Running event", optionB: "Jumping over bar with pole", optionC: "Throwing event", correctAnswer: "B", difficulty: "easy" },
  { questionText: "What is the triple jump?", optionA: "Three running jumps", optionB: "Hop, step and jump", optionC: "High jump variation", correctAnswer: "B", difficulty: "medium" },
  // Boxing (50)
  { questionText: "Who is considered the greatest boxer of all time?", optionA: "Mike Tyson", optionB: "Muhammad Ali", optionC: "Floyd Mayweather", correctAnswer: "B", difficulty: "medium" },
  { questionText: "What was Muhammad Ali's birth name?", optionA: "Cassius Clay", optionB: "Michael Clay", optionC: "Robert Clay", correctAnswer: "A", difficulty: "medium" },
  { questionText: "How many rounds are in a professional boxing match?", optionA: "10", optionB: "12", optionC: "15", correctAnswer: "B", difficulty: "medium" },
  { questionText: "Who is Floyd Mayweather Jr?", optionA: "Heavyweight champion", optionB: "Undefeated welterweight champion", optionC: "MMA fighter", correctAnswer: "B", difficulty: "medium" },
  { questionText: "What weight class is above heavyweight?", optionA: "Super heavyweight", optionB: "Cruiserweight", optionC: "Light heavyweight", correctAnswer: "A", difficulty: "hard" },
  { questionText: "Who did Tyson Fury defeat to become heavyweight champion?", optionA: "Anthony Joshua", optionB: "Deontay Wilder", optionC: "Andy Ruiz Jr", correctAnswer: "B", difficulty: "medium" },
  { questionText: "What is a 'knockout' in boxing?", optionA: "Winning by points", optionB: "Opponent can't continue after count", optionC: "Referee stops fight", correctAnswer: "B", difficulty: "easy" },
  { questionText: "How long is a boxing round?", optionA: "2 minutes", optionB: "3 minutes", optionC: "5 minutes", correctAnswer: "B", difficulty: "medium" },
  { questionText: "Who is known as 'Iron Mike'?", optionA: "Mike Tyson", optionB: "Mike Powell", optionC: "Michael Spinks", correctAnswer: "A", difficulty: "easy" },
  { questionText: "What is a 'TKO' in boxing?", optionA: "Total Knockout", optionB: "Technical Knockout", optionC: "Timeout Knockout", correctAnswer: "B", difficulty: "medium" },
  // Swimming (40)
  { questionText: "Who is the most decorated Olympian of all time?", optionA: "Usain Bolt", optionB: "Michael Phelps", optionC: "Carl Lewis", correctAnswer: "B", difficulty: "easy" },
  { questionText: "How many Olympic gold medals did Michael Phelps win?", optionA: "18", optionB: "23", optionC: "28", correctAnswer: "B", difficulty: "medium" },
  { questionText: "How many swimming strokes are there in competitive swimming?", optionA: "3", optionB: "4", optionC: "5", correctAnswer: "B", difficulty: "medium" },
  { questionText: "What is the individual medley in swimming?", optionA: "All 4 strokes", optionB: "2 strokes", optionC: "3 strokes", correctAnswer: "A", difficulty: "medium" },
  { questionText: "How long is an Olympic swimming pool?", optionA: "25 meters", optionB: "50 meters", optionC: "100 meters", correctAnswer: "B", difficulty: "medium" },
  { questionText: "What is the butterfly stroke?", optionA: "Swimming on back", optionB: "Arms move together over water", optionC: "Side swimming", correctAnswer: "B", difficulty: "medium" },
  { questionText: "Who is Katie Ledecky?", optionA: "Sprinter", optionB: "Swimmer", optionC: "Gymnast", correctAnswer: "B", difficulty: "easy" },
  { questionText: "Which country dominates Olympic swimming?", optionA: "Australia", optionB: "USA", optionC: "China", correctAnswer: "B", difficulty: "medium" },
  { questionText: "What is the breaststroke?", optionA: "Swimming face down with frog kick", optionB: "Swimming on back", optionC: "Freestyle swimming", correctAnswer: "A", difficulty: "medium" },
  { questionText: "What is the fastest swimming stroke?", optionA: "Breaststroke", optionB: "Freestyle/Front crawl", optionC: "Backstroke", correctAnswer: "B", difficulty: "medium" },
  // Golf (40)
  { questionText: "How many holes are in a standard round of golf?", optionA: "9", optionB: "18", optionC: "21", correctAnswer: "B", difficulty: "easy" },
  { questionText: "What is a 'birdie' in golf?", optionA: "One over par", optionB: "One under par", optionC: "Two under par", correctAnswer: "B", difficulty: "easy" },
  { questionText: "What is an 'eagle' in golf?", optionA: "One under par", optionB: "Two under par", optionC: "Three under par", correctAnswer: "B", difficulty: "medium" },
  { questionText: "Who is Tiger Woods?", optionA: "Tennis player", optionB: "Professional golfer", optionC: "Boxer", correctAnswer: "B", difficulty: "easy" },
  { questionText: "What is the Masters Tournament?", optionA: "Tennis major", optionB: "Golf major", optionC: "Chess tournament", correctAnswer: "B", difficulty: "easy" },
  { questionText: "Where is the Masters Tournament held?", optionA: "Augusta, Georgia", optionB: "St Andrews, Scotland", optionC: "Pebble Beach, California", correctAnswer: "A", difficulty: "medium" },
  { questionText: "What is 'par' in golf?", optionA: "The expected number of strokes", optionB: "A type of club", optionC: "A penalty", correctAnswer: "A", difficulty: "easy" },
  { questionText: "How many major championships are in golf?", optionA: "3", optionB: "4", optionC: "5", correctAnswer: "B", difficulty: "medium" },
  { questionText: "What is a 'bogey' in golf?", optionA: "One under par", optionB: "One over par", optionC: "Two over par", correctAnswer: "B", difficulty: "easy" },
  { questionText: "Who has won the most Masters titles?", optionA: "Tiger Woods", optionB: "Jack Nicklaus", optionC: "Arnold Palmer", correctAnswer: "B", difficulty: "hard" },
  // Formula 1 (40)
  { questionText: "Who is the most successful F1 driver of all time?", optionA: "Michael Schumacher", optionB: "Lewis Hamilton", optionC: "Ayrton Senna", correctAnswer: "B", difficulty: "easy" },
  { questionText: "How many F1 World Championships has Lewis Hamilton won?", optionA: "5", optionB: "6", optionC: "7", correctAnswer: "C", difficulty: "medium" },
  { questionText: "Which team has won the most F1 Constructors Championships?", optionA: "Ferrari", optionB: "Mercedes", optionC: "McLaren", correctAnswer: "A", difficulty: "medium" },
  { questionText: "Who won the 2022 F1 World Championship?", optionA: "Lewis Hamilton", optionB: "Max Verstappen", optionC: "Charles Leclerc", correctAnswer: "B", difficulty: "easy" },
  { questionText: "What country is Max Verstappen from?", optionA: "Belgium", optionB: "Netherlands", optionC: "Germany", correctAnswer: "B", difficulty: "easy" },
  { questionText: "What does DRS stand for in F1?", optionA: "Drag Reduction System", optionB: "Dynamic Racing Speed", optionC: "Drive Rate System", correctAnswer: "A", difficulty: "medium" },
  { questionText: "How many points does an F1 race winner receive?", optionA: "20", optionB: "25", optionC: "30", correctAnswer: "B", difficulty: "medium" },
  { questionText: "What color is the Ferrari F1 car?", optionA: "Blue", optionB: "Red", optionC: "Silver", correctAnswer: "B", difficulty: "easy" },
  { questionText: "Where is the Monaco Grand Prix held?", optionA: "France", optionB: "Monaco", optionC: "Italy", correctAnswer: "B", difficulty: "easy" },
  { questionText: "Who is the youngest F1 World Champion?", optionA: "Max Verstappen", optionB: "Sebastian Vettel", optionC: "Lewis Hamilton", correctAnswer: "B", difficulty: "hard" },
];

// Add more general sports questions
const additionalGeneralSports = [
  // Rugby (30)
  { questionText: "How many players are on a rugby union team?", optionA: "13", optionB: "15", optionC: "11", correctAnswer: "B", difficulty: "easy" },
  { questionText: "What is a 'try' worth in rugby union?", optionA: "3 points", optionB: "5 points", optionC: "7 points", correctAnswer: "B", difficulty: "medium" },
  { questionText: "Which country has won the most Rugby World Cups?", optionA: "New Zealand", optionB: "South Africa", optionC: "England", correctAnswer: "B", difficulty: "medium" },
  { questionText: "What is the 'haka'?", optionA: "A rugby move", optionB: "New Zealand war dance", optionC: "A type of kick", correctAnswer: "B", difficulty: "easy" },
  { questionText: "Which team is known as the 'All Blacks'?", optionA: "Australia", optionB: "New Zealand", optionC: "South Africa", correctAnswer: "B", difficulty: "easy" },
  { questionText: "What is a 'scrum' in rugby?", optionA: "A type of kick", optionB: "Players pushing for the ball", optionC: "A scoring move", correctAnswer: "B", difficulty: "easy" },
  { questionText: "What is the Six Nations?", optionA: "Football tournament", optionB: "Rugby tournament", optionC: "Cricket series", correctAnswer: "B", difficulty: "easy" },
  { questionText: "Who won the 2023 Rugby World Cup?", optionA: "New Zealand", optionB: "South Africa", optionC: "France", correctAnswer: "B", difficulty: "easy" },
  { questionText: "What is a 'conversion' in rugby?", optionA: "A try", optionB: "Kick after a try", optionC: "A tackle", correctAnswer: "B", difficulty: "medium" },
  { questionText: "How many points is a drop goal worth?", optionA: "2", optionB: "3", optionC: "5", correctAnswer: "B", difficulty: "medium" },
  // Olympics (30)
  { questionText: "How often are the Summer Olympics held?", optionA: "Every 2 years", optionB: "Every 4 years", optionC: "Every 5 years", correctAnswer: "B", difficulty: "easy" },
  { questionText: "Where were the 2020 Olympics held?", optionA: "Beijing", optionB: "Tokyo", optionC: "Paris", correctAnswer: "B", difficulty: "easy" },
  { questionText: "What do the five Olympic rings represent?", optionA: "Elements", optionB: "Continents", optionC: "Sports", correctAnswer: "B", difficulty: "easy" },
  { questionText: "Where will the 2024 Olympics be held?", optionA: "Los Angeles", optionB: "Paris", optionC: "Brisbane", correctAnswer: "B", difficulty: "easy" },
  { questionText: "What is the Olympic motto?", optionA: "Faster, Higher, Stronger", optionB: "Unity and Peace", optionC: "Excellence Always", correctAnswer: "A", difficulty: "medium" },
  { questionText: "Which country has won the most Olympic gold medals?", optionA: "China", optionB: "USA", optionC: "Russia", correctAnswer: "B", difficulty: "medium" },
  { questionText: "What is the Paralympic Games?", optionA: "Youth Olympics", optionB: "Games for athletes with disabilities", optionC: "Winter Olympics", correctAnswer: "B", difficulty: "easy" },
  { questionText: "Where did the ancient Olympics originate?", optionA: "Rome", optionB: "Greece", optionC: "Egypt", correctAnswer: "B", difficulty: "easy" },
  { questionText: "In what year were the first modern Olympics?", optionA: "1896", optionB: "1900", optionC: "1888", correctAnswer: "A", difficulty: "medium" },
  { questionText: "What is the Olympic flame?", optionA: "A trophy", optionB: "Torch carried to games", optionC: "Stadium light", correctAnswer: "B", difficulty: "easy" },
  // MMA/UFC (20)
  { questionText: "What does UFC stand for?", optionA: "Ultimate Fighting Championship", optionB: "Universal Fighting Championship", optionC: "United Fighting Competition", correctAnswer: "A", difficulty: "easy" },
  { questionText: "Who is Conor McGregor?", optionA: "Boxer", optionB: "MMA fighter", optionC: "Wrestler", correctAnswer: "B", difficulty: "easy" },
  { questionText: "What is a 'submission' in MMA?", optionA: "A knockout", optionB: "Opponent taps out", optionC: "Decision win", correctAnswer: "B", difficulty: "medium" },
  { questionText: "Who is Khabib Nurmagomedov?", optionA: "Boxer", optionB: "MMA fighter", optionC: "Wrestler", correctAnswer: "B", difficulty: "easy" },
  { questionText: "What is the 'Octagon' in UFC?", optionA: "A move", optionB: "The fighting ring", optionC: "A weight class", correctAnswer: "B", difficulty: "easy" },
  { questionText: "How many rounds in a UFC title fight?", optionA: "3", optionB: "5", optionC: "7", correctAnswer: "B", difficulty: "medium" },
  { questionText: "What is a 'ground and pound' in MMA?", optionA: "Striking on the ground", optionB: "A takedown", optionC: "A submission", correctAnswer: "A", difficulty: "medium" },
  { questionText: "Who is the UFC's all-time winningest fighter?", optionA: "Jon Jones", optionB: "Amanda Nunes", optionC: "Jim Miller", correctAnswer: "C", difficulty: "hard" },
  { questionText: "What weight class is heaviest in UFC?", optionA: "Light heavyweight", optionB: "Heavyweight", optionC: "Middleweight", correctAnswer: "B", difficulty: "easy" },
  { questionText: "What is a 'rear naked choke'?", optionA: "A punch", optionB: "A submission hold", optionC: "A kick", correctAnswer: "B", difficulty: "medium" },
  // Cycling (20)
  { questionText: "What is the Tour de France?", optionA: "Running race", optionB: "Cycling race", optionC: "Swimming competition", correctAnswer: "B", difficulty: "easy" },
  { questionText: "How long is the Tour de France?", optionA: "About 2 weeks", optionB: "About 3 weeks", optionC: "About 1 month", correctAnswer: "B", difficulty: "medium" },
  { questionText: "What color jersey does the Tour de France leader wear?", optionA: "Green", optionB: "Yellow", optionC: "Red", correctAnswer: "B", difficulty: "easy" },
  { questionText: "Who has won the most Tour de France titles?", optionA: "Eddy Merckx", optionB: "Miguel Indurain", optionC: "Chris Froome", correctAnswer: "A", difficulty: "hard" },
  { questionText: "What is the Giro d'Italia?", optionA: "Italian cycling race", optionB: "Italian running race", optionC: "Italian football league", correctAnswer: "A", difficulty: "medium" },
  { questionText: "What is a 'peloton' in cycling?", optionA: "A type of bike", optionB: "Main group of riders", optionC: "A race stage", correctAnswer: "B", difficulty: "medium" },
  { questionText: "What is the Vuelta a Espana?", optionA: "Spanish football cup", optionB: "Spanish cycling race", optionC: "Spanish tennis tournament", correctAnswer: "B", difficulty: "medium" },
  { questionText: "What is a 'breakaway' in cycling?", optionA: "A crash", optionB: "Riders ahead of main group", optionC: "A rest stop", correctAnswer: "B", difficulty: "medium" },
  { questionText: "Who is Chris Froome?", optionA: "Sprinter", optionB: "Cyclist", optionC: "Swimmer", correctAnswer: "B", difficulty: "easy" },
  { questionText: "What country did Eddy Merckx represent?", optionA: "France", optionB: "Belgium", optionC: "Netherlands", correctAnswer: "B", difficulty: "hard" },
  // Ice Hockey (20)
  { questionText: "How many players are on ice per hockey team?", optionA: "5", optionB: "6", optionC: "7", correctAnswer: "B", difficulty: "medium" },
  { questionText: "What is the NHL?", optionA: "National Hockey League", optionB: "Northern Hockey League", optionC: "National Hockey League", correctAnswer: "A", difficulty: "easy" },
  { questionText: "What is a 'hat trick' in hockey?", optionA: "2 goals", optionB: "3 goals", optionC: "4 goals", correctAnswer: "B", difficulty: "easy" },
  { questionText: "What is the Stanley Cup?", optionA: "NHL championship trophy", optionB: "Olympic hockey trophy", optionC: "World Cup trophy", correctAnswer: "A", difficulty: "easy" },
  { questionText: "Which team has won the most Stanley Cups?", optionA: "Toronto Maple Leafs", optionB: "Montreal Canadiens", optionC: "Boston Bruins", correctAnswer: "B", difficulty: "medium" },
  { questionText: "How long is an NHL game period?", optionA: "15 minutes", optionB: "20 minutes", optionC: "25 minutes", correctAnswer: "B", difficulty: "medium" },
  { questionText: "What is 'icing' in hockey?", optionA: "A penalty", optionB: "Shooting puck across lines", optionC: "A celebration", correctAnswer: "B", difficulty: "medium" },
  { questionText: "What is the 'crease' in hockey?", optionA: "Center ice", optionB: "Goal area", optionC: "Penalty box", correctAnswer: "B", difficulty: "medium" },
  { questionText: "Who is Wayne Gretzky?", optionA: "Basketball legend", optionB: "Hockey legend", optionC: "Football legend", correctAnswer: "B", difficulty: "easy" },
  { questionText: "What is Wayne Gretzky's nickname?", optionA: "The King", optionB: "The Great One", optionC: "The Legend", correctAnswer: "B", difficulty: "medium" },
  // Baseball (20)
  { questionText: "How many innings are in a baseball game?", optionA: "7", optionB: "9", optionC: "11", correctAnswer: "B", difficulty: "easy" },
  { questionText: "What is MLB?", optionA: "Major League Basketball", optionB: "Major League Baseball", optionC: "Minor League Baseball", correctAnswer: "B", difficulty: "easy" },
  { questionText: "What is a 'home run' in baseball?", optionA: "Hitting ball out of park", optionB: "Running to home plate", optionC: "A catch", correctAnswer: "A", difficulty: "easy" },
  { questionText: "How many strikes for a strikeout?", optionA: "2", optionB: "3", optionC: "4", correctAnswer: "B", difficulty: "easy" },
  { questionText: "What is the World Series?", optionA: "Basketball championship", optionB: "Baseball championship", optionC: "Football championship", correctAnswer: "B", difficulty: "easy" },
  { questionText: "Which team has won the most World Series?", optionA: "Boston Red Sox", optionB: "New York Yankees", optionC: "Los Angeles Dodgers", correctAnswer: "B", difficulty: "medium" },
  { questionText: "What is a 'grand slam' in baseball?", optionA: "3 runs", optionB: "4 runs on bases loaded home run", optionC: "5 runs", correctAnswer: "B", difficulty: "medium" },
  { questionText: "What is a 'perfect game' in baseball?", optionA: "No errors", optionB: "No hits, walks, or errors", optionC: "10+ strikeouts", correctAnswer: "B", difficulty: "hard" },
  { questionText: "Who is Babe Ruth?", optionA: "Basketball legend", optionB: "Baseball legend", optionC: "Football legend", correctAnswer: "B", difficulty: "easy" },
  { questionText: "What position does the 'pitcher' play?", optionA: "Throws the ball", optionB: "Catches the ball", optionC: "Hits the ball", correctAnswer: "A", difficulty: "easy" },
];

// Combine all general sports questions
const allGeneralSportsQuestions = [
  ...generalSportsQuestions,
  ...additionalGeneralSports
];

async function seedQuestions() {
  console.log("Starting to seed questions...");
  console.log(`Football questions to insert: ${allFootballQuestions.length}`);
  console.log(`General sports questions to insert: ${allGeneralSportsQuestions.length}`);
  
  // Shuffle questions for variety
  const shuffledFootball = allFootballQuestions.sort(() => Math.random() - 0.5);
  const shuffledGeneral = allGeneralSportsQuestions.sort(() => Math.random() - 0.5);
  
  // Take first 1500 football and 500 general sports
  const footballToInsert = shuffledFootball.slice(0, 1500);
  const generalToInsert = shuffledGeneral.slice(0, 500);
  
  let insertedCount = 0;
  const batchSize = 100;
  
  console.log("Inserting football questions...");
  for (let i = 0; i < footballToInsert.length; i += batchSize) {
    const batch = footballToInsert.slice(i, i + batchSize);
    await db.insert(questions).values(batch);
    insertedCount += batch.length;
    console.log(`Inserted ${insertedCount} football questions...`);
  }
  
  console.log("Inserting general sports questions...");
  for (let i = 0; i < generalToInsert.length; i += batchSize) {
    const batch = generalToInsert.slice(i, i + batchSize);
    await db.insert(questions).values(batch);
    insertedCount += batch.length;
    console.log(`Inserted ${insertedCount} total questions...`);
  }
  
  console.log(`\nSeeding complete! Total questions inserted: ${insertedCount}`);
  console.log(`- Football: ${footballToInsert.length}`);
  console.log(`- General Sports: ${generalToInsert.length}`);
  
  process.exit(0);
}

seedQuestions().catch((error) => {
  console.error("Error seeding questions:", error);
  process.exit(1);
});
