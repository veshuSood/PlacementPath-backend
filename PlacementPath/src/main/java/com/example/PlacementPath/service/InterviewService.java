package com.example.PlacementPath.service;

import com.example.PlacementPath.dto.InterviewQuestionRequest;
import com.example.PlacementPath.model.InterviewQuestion;
import com.example.PlacementPath.model.User;
import com.example.PlacementPath.repository.InterviewQuestionRepository;
import com.example.PlacementPath.repository.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class InterviewService {

    @Autowired private InterviewQuestionRepository questionRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private GroqService groqService;

    private final ObjectMapper objectMapper = new ObjectMapper();

    public List<InterviewQuestion> getRandomQuestions(String category, int limit, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<InterviewQuestion> dbQuestions = questionRepository.findByCategory(category);

        // If DB has fewer questions than requested, generate via AI
        if (dbQuestions.size() < limit) {
            generateAIQuestions(category);
            dbQuestions = questionRepository.findByCategory(category);
        }

        Collections.shuffle(dbQuestions);
        return dbQuestions.stream().limit(limit).collect(Collectors.toList());
    }

    public void generateAIQuestions(String category) {
        String systemMsg = "You are a technical interviewer. Return ONLY a JSON array of 5 objects. No markdown.";
        String userMsg = String.format("Generate 5 unique interview questions for: %s. " +
                        "Schema: [{\"question\": \"\", \"topic\": \"\", \"difficulty\": \"Easy/Medium/Hard\", \"answer\": \"\", \"questionType\": \"Theory\"}]",
                category);

        try {
            // ✅ Updated to include temperature (0.7 for variety)
            String rawJson = groqService.askAI(systemMsg, userMsg, 0.7);

            List<Map<String, String>> tasks = objectMapper.readValue(rawJson, List.class);

            for (Map<String, String> task : tasks) {
                InterviewQuestion q = new InterviewQuestion();
                q.setCategory(category);
                q.setTopic(task.getOrDefault("topic", "General"));
                q.setQuestion(task.get("question"));
                q.setDifficulty(task.getOrDefault("difficulty", "Medium"));
                q.setQuestionType(task.getOrDefault("questionType", "Theory"));
                q.setAnswer(task.get("answer"));
                q.setIsPublic(true);
                q.setCreatedAt(LocalDateTime.now());
                q.setUpvotes(0);
                questionRepository.save(q);
            }
            System.out.println("AI successfully generated 5 questions for: " + category);
        } catch (Exception e) {
            System.out.println("AI Generation Failed: " + e.getMessage());
        }
    }

    public InterviewQuestion addQuestion(String username, InterviewQuestionRequest request) {
        User user = userRepository.findByUsername(username).orElseThrow(() -> new RuntimeException("User not found"));
        InterviewQuestion question = new InterviewQuestion();
        question.setCategory(request.getCategory());
        question.setTopic(request.getTopic());
        question.setQuestion(request.getQuestion());
        question.setDifficulty(request.getDifficulty());
        question.setQuestionType(request.getQuestionType());
        question.setAnswer(request.getAnswer());
        question.setCreatedBy(user);
        question.setCreatedAt(LocalDateTime.now());
        question.setIsPublic(request.getIsPublic());
        question.setUpvotes(0);
        return questionRepository.save(question);
    }

    public InterviewQuestion upvoteQuestion(Integer id) {
        InterviewQuestion q = questionRepository.findById(id).orElseThrow(() -> new RuntimeException("Not found"));
        q.setUpvotes(q.getUpvotes() + 1);
        return questionRepository.save(q);
    }

    public List<InterviewQuestion> getUserQuestions(String username) {
        User user = userRepository.findByUsername(username).orElseThrow(() -> new RuntimeException("User not found"));
        return questionRepository.findAll().stream()
                .filter(q -> q.getCreatedBy() != null && q.getCreatedBy().getId().equals(user.getId()))
                .collect(Collectors.toList());
    }

    public Map<String, Long> getCategoriesWithCount() {
        return questionRepository.findAll().stream()
                .filter(q -> q.getIsPublic() == Boolean.TRUE)
                .collect(Collectors.groupingBy(InterviewQuestion::getCategory, Collectors.counting()));
    }
    public Map<String, Object> evaluateAnswer(String question, String studentAnswer, String referenceAnswer) {
        String systemMsg = "You are a technical interviewer. Evaluate the student's answer. Return ONLY JSON.";
        String userMsg = String.format("Question: %s\nReference: %s\nStudent Answer: %s",
                question, referenceAnswer, studentAnswer);

        try {
            // ✅ Use 0.2 here for consistent, strict grading
            String rawJson = groqService.askAI(systemMsg, userMsg, 0.2);
            return objectMapper.readValue(rawJson, Map.class);
        } catch (Exception e) {
            return Map.of("score", 0, "feedback", "Evaluation error.");
        }
    }
}