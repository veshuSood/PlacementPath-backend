package com.example.PlacementPath.controller;

import com.example.PlacementPath.dto.ProgressUpdateRequest;
import com.example.PlacementPath.model.ProgressSnapshot;
import com.example.PlacementPath.model.Roadmap;
import com.example.PlacementPath.service.AdjustmentService;
import com.example.PlacementPath.service.ProgressAnalyzer;
import com.example.PlacementPath.service.ProgressSnapshotService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/progress")
@CrossOrigin(origins = "http://localhost:5173")
public class ProgressController {

    @Autowired private AdjustmentService      adjustmentService;
    @Autowired private ProgressAnalyzer       progressAnalyzer;
    @Autowired private ProgressSnapshotService snapshotService;

    // Analyze only — no roadmap change
    @PostMapping("/analyze")
    public ResponseEntity<?> analyze(
            Authentication authentication,
            @RequestBody ProgressUpdateRequest request) {
        try {
            String username = authentication.getName();
            List<String>        weak  = progressAnalyzer.detectWeakCategories(request);
            Map<String, String> stats = progressAnalyzer.getCategoryStats(request);

            // ← Save snapshot
            snapshotService.saveSnapshot(username, request);

            return ResponseEntity.ok(Map.of(
                    "weakCategories", weak,
                    "categoryStats",  stats,
                    "message", weak.isEmpty()
                            ? "Great progress! No weak areas detected."
                            : "Weak areas found: " + String.join(", ", weak)
            ));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // Adjust — regenerates roadmap based on weak areas
    @PostMapping("/adjust")
    public ResponseEntity<?> adjust(
            Authentication authentication,
            @RequestBody ProgressUpdateRequest request) {
        try {
            String  username = authentication.getName();
            Roadmap adjusted = adjustmentService.adjustRoadmap(username, request);

            return ResponseEntity.ok(Map.of(
                    "message",   "Roadmap adjusted successfully",
                    "roadmapId", adjusted.getId(),
                    "roadmap",   adjusted.getRoadmapJson()
            ));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // Get progress history
    @GetMapping("/history")
    public ResponseEntity<?> getHistory(Authentication authentication) {
        try {
            String username = authentication.getName();
            List<ProgressSnapshot> snapshots = snapshotService.getUserSnapshots(username);

            ObjectMapper objectMapper = new ObjectMapper();

            // Convert to simple JSON for frontend
            List<Map<String, Object>> response = new ArrayList<>();
            for (ProgressSnapshot snap : snapshots) {
                Map<String, Object> data = new HashMap<>();
                data.put("snapshotId", snap.getId());
                data.put("snapshotDate", snap.getSnapshotDate().toString());
                data.put("overallCompletionPercentage", snap.getOverallCompletionPercentage());
                data.put("totalTopicsCompleted", snap.getTotalTopicsCompleted());
                data.put("totalTopics", snap.getTotalTopics());

                // Parse the JSON progress data
                try {
                    Map<String, Integer> progressData =
                            objectMapper.readValue(snap.getProgressData(), Map.class);
                    data.put("categoryProgress", progressData);
                } catch (Exception e) {
                    data.put("categoryProgress", new HashMap<>());
                }

                response.add(data);
            }

            return ResponseEntity.ok(Map.of(
                    "snapshots", response,
                    "totalSnapshots", snapshots.size()
            ));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", e.getMessage()));
        }
    }
}