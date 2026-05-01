package com.example.PlacementPath.controller;

import com.example.PlacementPath.dto.RoadmapRequest;
import com.example.PlacementPath.model.Roadmap;
import com.example.PlacementPath.service.RoadmapService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/roadmap")
@CrossOrigin(origins = "http://localhost:5173")
public class RoadmapController {

    @Autowired
    private RoadmapService roadmapService;

    // POST /api/roadmap/generate
    // Requires: Bearer token in header
    @PostMapping("/generate")
    public ResponseEntity<?> generate(
            Authentication authentication,
            @RequestBody RoadmapRequest request) {

        try {
            String username = authentication.getName();
            Roadmap roadmap = roadmapService.generateAndSave(username, request);

            return ResponseEntity.ok(Map.of(
                    "message", "Roadmap generated successfully",
                    "roadmapId", roadmap.getId(),
                    "roadmap", roadmap.getRoadmapJson()  // raw JSON string from AI
            ));

        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // GET /api/roadmap/active
    // Returns the current user's active roadmap
    @GetMapping("/active")
    public ResponseEntity<?> getActive(Authentication authentication) {
        String username = authentication.getName();
        Optional<Roadmap> roadmap = roadmapService.getActiveRoadmap(username);

        if (roadmap.isPresent()) {
            return ResponseEntity.ok(Map.of(
                    "roadmapId", roadmap.get().getId(),
                    "targetCompany", roadmap.get().getTargetCompany(),
                    "targetRole", roadmap.get().getTargetRole(),
                    "generatedAt", roadmap.get().getGeneratedAt().toString(),
                    "roadmap", roadmap.get().getRoadmapJson()
            ));
        } else {
            return ResponseEntity.ok(Map.of("message", "No active roadmap found"));
        }
    }
}