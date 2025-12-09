import { db } from "../server/db.js";
import { questions } from "../shared/schema.js";
import fs from "fs";

async function exportQuestions() {
  console.log("Exporting questions from database...");
  
  const allQuestions = await db.select().from(questions);
  
  console.log(`Found ${allQuestions.length} questions to export`);
  
  const escapeSql = (str: string | null | undefined) => {
    if (str === null || str === undefined) return 'NULL';
    return `'${str.replace(/'/g, "''")}'`;
  };
  
  let sql = `-- Sports Quiz Questions Export\n`;
  sql += `-- Generated on ${new Date().toISOString()}\n`;
  sql += `-- Total questions: ${allQuestions.length}\n\n`;
  
  sql += `INSERT INTO questions (question, option_a, option_b, option_c, correct_answer, difficulty, category, question_yoruba, question_hausa, question_igbo, option_a_yoruba, option_a_hausa, option_a_igbo, option_b_yoruba, option_b_hausa, option_b_igbo, option_c_yoruba, option_c_hausa, option_c_igbo) VALUES\n`;
  
  const values = allQuestions.map((q, i) => {
    const isLast = i === allQuestions.length - 1;
    return `(${escapeSql(q.question)}, ${escapeSql(q.optionA)}, ${escapeSql(q.optionB)}, ${escapeSql(q.optionC)}, ${escapeSql(q.correctAnswer)}, ${escapeSql(q.difficulty)}, ${escapeSql(q.category)}, ${escapeSql(q.questionYoruba)}, ${escapeSql(q.questionHausa)}, ${escapeSql(q.questionIgbo)}, ${escapeSql(q.optionAYoruba)}, ${escapeSql(q.optionAHausa)}, ${escapeSql(q.optionAIgbo)}, ${escapeSql(q.optionBYoruba)}, ${escapeSql(q.optionBHausa)}, ${escapeSql(q.optionBIgbo)}, ${escapeSql(q.optionCYoruba)}, ${escapeSql(q.optionCHausa)}, ${escapeSql(q.optionCIgbo)})${isLast ? ';' : ','}`;
  });
  
  sql += values.join('\n');
  
  fs.writeFileSync('questions-export.sql', sql);
  console.log(`\nExport complete! SQL saved to questions-export.sql`);
  console.log(`\nTo import into production:`);
  console.log(`1. Open the Database pane in Replit`);
  console.log(`2. Switch to Production database`);
  console.log(`3. Copy and paste the SQL from questions-export.sql`);
  
  process.exit(0);
}

exportQuestions().catch(console.error);
