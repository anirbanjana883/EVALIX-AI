// src/modules/plagiarism/plagiarism.service.js
import { generateEmbedding } from '../services/embedding.service.js';
import { PlagiarismRepository } from '../repositories/plagiarism.repository.js';

export const PlagiarismService = {
  
  async runDetection(submissionId, questionId, studentText) {
    try {
      // 🌟 FIX: Ignore extremely short answers to prevent false positives
      if (!studentText || studentText.length < 100) {
        console.log(`⏭️ [Plagiarism] Answer too short to check (${studentText.length} chars). Skipping.`);
        return { isPlagiarized: false, score: 0 };
      }

      const embedding = await generateEmbedding(studentText);
      await PlagiarismRepository.updateAnswerEmbedding(submissionId, questionId, embedding);
      
      const embeddingString = `[${embedding.join(',')}]`;

      const match = await PlagiarismRepository.findHighlySimilarAnswer(
        questionId, 
        submissionId, 
        embeddingString
      );

      if (match) {
        // 🌟 FIX: Added the similarity logging for better demo debugging
        console.log(`🚨 [Plagiarism] Match found! Similarity: ${match.similarity}`);
        await PlagiarismRepository.createReport(submissionId, match.submission_id, match.similarity);
        return { isPlagiarized: true, score: match.similarity };
      }

      return { isPlagiarized: false, score: 0 };
    } catch (error) {
      console.error("Plagiarism Service Error:", error);
      return { isPlagiarized: false, score: 0 }; 
    }
  }
};