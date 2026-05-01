package com.example.PlacementPath.controller;

import com.example.PlacementPath.dto.InterviewQuestionRequest;
import com.example.PlacementPath.model.InterviewQuestion;
import com.example.PlacementPath.service.InterviewService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/interview")
@CrossOrigin(origins = "http://localhost:5173")
public class InterviewController {

    @Autowired private InterviewService interviewService;

    @PostMapping("/init")
    public ResponseEntity<?> initQuestions() {
        try {
            String[] categories = {"DSA", "Core CS", "Full Stack", "Aptitude", "HR"};
            for(String cat : categories) { interviewService.generateAIQuestions(cat); }
            return ResponseEntity.ok(Map.of("message", "AI generated initial questions"));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/questions")
    public ResponseEntity<?> getQuestions(Authentication auth, @RequestParam String category, @RequestParam(defaultValue = "5") int limit) {
        try {
            List<InterviewQuestion> questions = interviewService.getRandomQuestions(category, limit, auth.getName());
            return ResponseEntity.ok(Map.of("category", category, "questions", questions));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/categories")
    public ResponseEntity<?> getCategories() {
        try {
            return ResponseEntity.ok(Map.of("categories", interviewService.getCategoriesWithCount(),
                    "defaultCategories", new String[]{"DSA", "Core CS", "Full Stack", "Aptitude", "HR"}));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }


    @PostMapping("/questions")
    public ResponseEntity<?> addQuestion(Authentication auth, @RequestBody InterviewQuestionRequest request) {
        try {
            return ResponseEntity.ok(interviewService.addQuestion(auth.getName(), request));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/my-questions")
    public ResponseEntity<?> getMyQuestions(Authentication auth) {
        try {
            return ResponseEntity.ok(interviewService.getUserQuestions(auth.getName()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/questions/{id}/upvote")
    public ResponseEntity<?> upvoteQuestion(@PathVariable Integer id) {
        try {
            return ResponseEntity.ok(interviewService.upvoteQuestion(id));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }
    @PostMapping("/evaluate")
    public ResponseEntity<?> evaluate(@RequestBody com.example.PlacementPath.dto.EvaluationRequest request) {
        try {
            Map<String, Object> result = interviewService.evaluateAnswer(
                    request.getQuestion(),
                    request.getStudentAnswer(),
                    request.getReferenceAnswer()
            );
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }
}