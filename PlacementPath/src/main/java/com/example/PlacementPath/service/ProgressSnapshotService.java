package com.example.PlacementPath.service;

import com.example.PlacementPath.dto.ProgressUpdateRequest;
import com.example.PlacementPath.model.ProgressSnapshot;
import com.example.PlacementPath.model.Roadmap;
import com.example.PlacementPath.model.User;
import com.example.PlacementPath.repository.ProgressSnapshotRepository;
import com.example.PlacementPath.repository.RoadmapRepository;
import com.example.PlacementPath.repository.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;

@Service
public class ProgressSnapshotService {

    @Autowired private ProgressSnapshotRepository snapshotRepository;
    @Autowired private RoadmapRepository roadmapRepository;
    @Autowired private UserRepository userRepository;

    private final ObjectMapper objectMapper = new ObjectMapper();

    // Save a progress snapshot (called when student clicks Analyze)
    public ProgressSnapshot saveSnapshot(
            String username,
            ProgressUpdateRequest progress) {

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Roadmap activeRoadmap = roadmapRepository
                .findByUserAndIsActiveTrue(user)
                .orElseThrow(() -> new RuntimeException("No active roadmap"));

        // Build progress data map
        Map<String, Integer> progressMap = new HashMap<>();
        Map<String, Integer> completed = progress.getCompletedPerCategory();
        Map<String, Integer> total = progress.getTotalPerCategory();

        for (String category : total.keySet()) {
            int totalCount = total.getOrDefault(category, 0);
            int completedCount = completed.getOrDefault(category, 0);
            int pct = totalCount == 0 ? 0 : (int) ((double) completedCount / totalCount * 100);
            progressMap.put(category, pct);
        }

        // Convert to JSON string
        String progressJson;
        try {
            progressJson = objectMapper.writeValueAsString(progressMap);
        } catch (Exception e) {
            progressJson = "{}";
        }

        // Calculate overall
        int totalCompleted = completed.values().stream().mapToInt(Integer::intValue).sum();
        int totalTopics = total.values().stream().mapToInt(Integer::intValue).sum();
        int overallPct = totalTopics == 0 ? 0 : (int) ((double) totalCompleted / totalTopics * 100);

        // Save snapshot
        ProgressSnapshot snapshot = new ProgressSnapshot();
        snapshot.setUser(user);
        snapshot.setRoadmap(activeRoadmap);
        snapshot.setSnapshotDate(LocalDateTime.now());
        snapshot.setProgressData(progressJson);
        snapshot.setTotalTopicsCompleted(totalCompleted);
        snapshot.setTotalTopics(totalTopics);
        snapshot.setOverallCompletionPercentage(overallPct);

        return snapshotRepository.save(snapshot);
    }

    // Get all snapshots for a user
    public List<ProgressSnapshot> getUserSnapshots(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return snapshotRepository.findByUserOrderBySnapshotDateAsc(user);
    }
}