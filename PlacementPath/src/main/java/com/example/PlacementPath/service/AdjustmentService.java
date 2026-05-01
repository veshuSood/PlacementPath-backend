package com.example.PlacementPath.service;

import com.example.PlacementPath.dto.ProgressUpdateRequest;
import com.example.PlacementPath.model.Roadmap;
import com.example.PlacementPath.model.User;
import com.example.PlacementPath.repository.RoadmapRepository;
import com.example.PlacementPath.repository.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;

@Service
public class AdjustmentService {

    @Autowired private GroqService       groqService;
    @Autowired private ProgressAnalyzer  progressAnalyzer;
    @Autowired private RoadmapRepository roadmapRepository;
    @Autowired private UserRepository    userRepository;
    @Autowired private ResourceBank      resourceBank;

    private final ObjectMapper objectMapper = new ObjectMapper();


    public Roadmap adjustRoadmap(String username, ProgressUpdateRequest progress) {

        // Step 1 — Get user
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Step 2 — Get current active roadmap
        Roadmap current = roadmapRepository
                .findByUserAndIsActiveTrue(user)
                .orElseThrow(() -> new RuntimeException("No active roadmap found"));

        // Step 3 — Analyze
        List<String>        weakCategories = progressAnalyzer.detectWeakCategories(progress);
        Map<String, String> categoryStats  = progressAnalyzer.getCategoryStats(progress);

        // Step 4 — Build prompt
        String prompt = buildAdjustmentPrompt(
                current.getTargetRole(),
                current.getTargetCompany(),
                current.getCurrentLevel(),
                weakCategories,
                categoryStats,
                progress.getCompletedTopicIds()
        );

        // Step 5 — Call Groq
        String newRoadmapJson = groqService.generateRoadmap(prompt);

        // Step 6 — Inject real resources
        newRoadmapJson = injectResources(newRoadmapJson);

        // Step 7 — Deactivate old roadmap
        current.setIsActive(false);
        roadmapRepository.save(current);

        // Step 8 — Save new roadmap
        Roadmap adjusted = new Roadmap();
        adjusted.setUser(user);
        adjusted.setTargetCompany(current.getTargetCompany());
        adjusted.setTargetRole(current.getTargetRole());
        adjusted.setCurrentLevel(current.getCurrentLevel());
        adjusted.setWeeksAvailable(current.getWeeksAvailable());
        adjusted.setRoadmapJson(newRoadmapJson);
        adjusted.setGeneratedAt(LocalDateTime.now());
        adjusted.setIsActive(true);

        return roadmapRepository.save(adjusted);
    }

    private String buildAdjustmentPrompt(
            String role,
            String company,
            String level,
            List<String> weakCategories,
            Map<String, String> categoryStats,
            List<String> completedIds) {

        StringBuilder sb = new StringBuilder();
        sb.append("Generate an ADJUSTED placement preparation roadmap.\n\n");
        sb.append("Target Role: ").append(role).append("\n");
        sb.append("Target Company: ").append(company).append("\n");
        sb.append("Skill Level: ").append(level).append("\n\n");

        sb.append("CURRENT PROGRESS:\n");
        for (Map.Entry<String, String> entry : categoryStats.entrySet()) {
            sb.append("- ").append(entry.getKey())
                    .append(": ").append(entry.getValue()).append("\n");
        }

        sb.append("\nWEAK AREAS (below 50%):\n");
        if (weakCategories.isEmpty()) {
            sb.append("- None. Student is doing well.\n");
            sb.append("  Generate advanced topics.\n");
        } else {
            for (String w : weakCategories) {
                sb.append("- ").append(w).append("\n");
            }
            sb.append("\nAllocate MORE weeks to: ")
                    .append(String.join(", ", weakCategories)).append("\n");
            sb.append("Allocate FEWER weeks to strong areas.\n");
        }

        sb.append("\nStudent completed ")
                .append(completedIds != null ? completedIds.size() : 0)
                .append(" topics so far.\n");
        sb.append("Do NOT repeat already completed topics.\n");
        sb.append("Generate a fresh 4-week focused roadmap.\n");

        return sb.toString();
    }

    private String injectResources(String roadmapJson) {
        try {
            Map<String, Object> roadmap =
                    objectMapper.readValue(roadmapJson, Map.class);

            List<Map<String, Object>> weeks =
                    (List<Map<String, Object>>) roadmap.get("weeks");

            if (weeks != null) {
                for (Map<String, Object> week : weeks) {
                    List<Map<String, Object>> topics =
                            (List<Map<String, Object>>) week.get("topics");

                    if (topics != null) {
                        for (Map<String, Object> topic : topics) {
                            String category = (String) topic.get("category");
                            String title    = (String) topic.get("title");

                            List<Map<String, String>> real =
                                    resourceBank.getResources(
                                            category != null ? category : "DSA",
                                            title    != null ? title.toLowerCase() : ""
                                    );
                            topic.put("resources", real);
                        }
                    }
                }
            }
            return objectMapper.writeValueAsString(roadmap);
        } catch (Exception e) {
            System.out.println("Resource injection failed: " + e.getMessage());
            return roadmapJson;
        }
    }
}