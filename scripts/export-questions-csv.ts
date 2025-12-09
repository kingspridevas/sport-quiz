import { db } from "../server/db.js";
import { questions } from "../shared/schema.js";
import fs from "fs";

async function exportQuestionsCsv() {
  console.log("Exporting questions to CSV...");
  
  const allQuestions = await db.select().from(questions);
  
  console.log(`Found ${allQuestions.length} questions to export`);
  
  const escapeCsv = (str: string | null | undefined) => {
    if (str === null || str === undefined) return '';
    const escaped = str.replace(/"/g, '""');
    return `"${escaped}"`;
  };
  
  const headers = [
    'question_text',
    'option_a',
    'option_b', 
    'option_c',
    'correct_answer',
    'difficulty'
  ];
  
  let csv = headers.join(',') + '\n';
  
  for (const q of allQuestions) {
    const row = [
      escapeCsv(q.questionText),
      escapeCsv(q.optionA),
      escapeCsv(q.optionB),
      escapeCsv(q.optionC),
      escapeCsv(q.correctAnswer),
      escapeCsv(q.difficulty || 'medium')
    ];
    csv += row.join(',') + '\n';
  }
  
  fs.writeFileSync('questions-export.csv', csv);
  console.log(`\nExport complete! CSV saved to questions-export.csv`);
  console.log(`You can download this file and upload via the admin portal.`);
  
  process.exit(0);
}

exportQuestionsCsv().catch(console.error);
