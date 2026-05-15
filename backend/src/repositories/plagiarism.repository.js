import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const PlagiarismRepository = {
  
  // 🌟 The Raw SQL logic moves here
  async findHighlySimilarAnswer(questionId, submissionId, embeddingString) {
    const matches = await prisma.$queryRaw`
      SELECT 
        submission_id, 
        1 - (embedding <=> ${embeddingString}::vector) as similarity
      FROM answers
      WHERE question_id = ${questionId}::uuid 
        AND submission_id != ${submissionId}::uuid
        AND 1 - (embedding <=> ${embeddingString}::vector) > 0.85
      ORDER BY similarity DESC
      LIMIT 1;
    `;
    return matches[0] || null;
  },

  // Saves the report if a match is found
  async createReport(submissionId, matchedId, score) {
    return await prisma.plagiarismReport.create({
      data: {
        submission_id: submissionId,
        matched_submission_id: matchedId,
        similarity_score: score,
        status: 'HIGH_RISK'
      }
    });
  },

  // Updates the embedding of the answer so it can be checked by future students
  async updateAnswerEmbedding(submissionId, questionId, embedding) {
    const embeddingString = `[${embedding.join(',')}]`;
    return await prisma.$executeRaw`
      UPDATE answers 
      SET embedding = ${embeddingString}::vector 
      WHERE submission_id = ${submissionId}::uuid 
        AND question_id = ${questionId}::uuid
    `;
  }
};