package com.example.PlacementPath.service;

import com.example.PlacementPath.dto.RoadmapRequest;
import com.example.PlacementPath.model.Roadmap;
import com.example.PlacementPath.model.User;
import com.example.PlacementPath.repository.RoadmapRepository;
import com.example.PlacementPath.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class RoadmapService {

    @Autowired
    private GroqService groqService;

    @Autowired
    private RoadmapRepository roadmapRepository;

    @Autowired
    private UserRepository userRepository;

    public Roadmap generateAndSave(String username, RoadmapRequest request) {

        // 1. Find the user
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // 2. Deactivate any existing active roadmap
        Optional<Roadmap> existing = roadmapRepository.findByUserAndIsActiveTrue(user);
        existing.ifPresent(r -> {
            r.setIsActive(false);
            roadmapRepository.save(r);
        });

        // 3. Build the prompt
        String prompt = buildPrompt(request);

        // 4. Call Groq API
        String roadmapJson = groqService.generateRoadmap(prompt);

        // 5. Save to DB
        Roadmap roadmap = new Roadmap();
        roadmap.setUser(user);
        roadmap.setTargetCompany(request.getTargetCompany());
        roadmap.setTargetRole(request.getTargetRole());
        roadmap.setCurrentLevel(request.getCurrentLevel());
        roadmap.setWeeksAvailable(request.getWeeksAvailable());
        roadmap.setRoadmapJson(roadmapJson);
        roadmap.setGeneratedAt(LocalDateTime.now());
        roadmap.setIsActive(true);

        return roadmapRepository.save(roadmap);
    }

    public Optional<Roadmap> getActiveRoadmap(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return roadmapRepository.findByUserAndIsActiveTrue(user);
    }

    private String buildPrompt(RoadmapRequest request) {
        return String.format("""
                Generate a placement preparation roadmap with these details:
                
                Target Company: %s
                Target Role: %s
                Current Skill Level: %s
                Weeks Available: %d
                
                Cover all 5 areas: DSA, Core CS, Full Stack, Aptitude, HR.
                Adjust depth based on skill level — Beginner gets more fundamentals,
                Advanced gets more problem-solving and system design.
                """,
                request.getTargetCompany(),
                request.getTargetRole(),
                request.getCurrentLevel(),
                request.getWeeksAvailable()
        );
    }
}