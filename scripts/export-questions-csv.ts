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
    'question',
    'option_a',
    'option_b', 
    'option_c',
    'correct_answer',
    'difficulty',
    'category',
    'question_yoruba',
    'question_hausa',
    'question_igbo',
    'option_a_yoruba',
    'option_a_hausa',
    'option_a_igbo',
    'option_b_yoruba',
    'option_b_hausa',
    'option_b_igbo',
    'option_c_yoruba',
    'option_c_hausa',
    'option_c_igbo'
  ];
  
  let csv = headers.join(',') + '\n';
  
  for (const q of allQuestions) {
    const row = [
      escapeCsv(q.question),
      escapeCsv(q.optionA),
      escapeCsv(q.optionB),
      escapeCsv(q.optionC),
      escapeCsv(q.correctAnswer),
      escapeCsv(q.difficulty),
      escapeCsv(q.category),
      escapeCsv(q.questionYoruba),
      escapeCsv(q.questionHausa),
      escapeCsv(q.questionIgbo),
      escapeCsv(q.optionAYoruba),
      escapeCsv(q.optionAHausa),
      escapeCsv(q.optionAIgbo),
      escapeCsv(q.optionBYoruba),
      escapeCsv(q.optionBHausa),
      escapeCsv(q.optionBIgbo),
      escapeCsv(q.optionCYoruba),
      escapeCsv(q.optionCHausa),
      escapeCsv(q.optionCIgbo)
    ];
    csv += row.join(',') + '\n';
  }
  
  fs.writeFileSync('questions-export.csv', csv);
  console.log(`\nExport complete! CSV saved to questions-export.csv`);
  console.log(`You can download this file and upload via the admin portal.`);
  
  process.exit(0);
}

exportQuestionsCsv().catch(console.error);
