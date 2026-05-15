// src/modules/rag/rag.repository.js
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const RagRepository = {
  
  async findRelevantSyllabusContext(assignmentId, embeddingString) {
    // 🚀 THE VECTOR SEARCH (pgvector)
    // We look for syllabus materials that mathematically align with what the student wrote.
    // Fetching the top 3 results for broader context!
    return await prisma.$queryRaw`
      SELECT content, 1 - (embedding <=> ${embeddingString}::vector) as similarity
      FROM assignment_materials
      WHERE assignment_id = ${assignmentId}::uuid
        AND type = 'SYLLABUS'
      ORDER BY similarity DESC
      LIMIT 3;
    `;
  }
};