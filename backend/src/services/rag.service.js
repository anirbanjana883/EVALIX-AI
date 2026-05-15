// src/modules/rag/rag.service.js
import { generateEmbedding } from '../services/embedding.service.js';
import { RagRepository } from '../repositories/rag.repository.js';

export const RagService = {
  
  async getRelevantContext(assignmentId, studentAnswerText) {
    try {
      // 1. Embed the student's answer
      const answerEmbedding = await generateEmbedding(studentAnswerText);
      const embeddingString = `[${answerEmbedding.join(',')}]`;

      // 2. Query the database via the Repository
      const relevantMaterials = await RagRepository.findRelevantSyllabusContext(
        assignmentId, 
        embeddingString
      );

      // 3. Format and return the combined context
      if (relevantMaterials && relevantMaterials.length > 0) {
        console.log(`✅ [RAG] Top match similarity: ${Math.round(relevantMaterials[0].similarity * 100)}%`);
        // Combine the top 3 contexts into one giant knowledge block
        return relevantMaterials.map(item => item.content).join("\n\n---\n\n");
      }
      
      return null;
    } catch (error) {
      console.error("❌ [RAG] Retrieval Error:", error.message);
      return null; // Fail safely so grading continues even if search breaks
    }
  }
};