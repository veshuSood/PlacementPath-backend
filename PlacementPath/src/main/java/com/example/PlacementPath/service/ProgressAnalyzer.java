package com.example.PlacementPath.service;

import com.example.PlacementPath.dto.ProgressUpdateRequest;
import org.springframework.stereotype.Component;

import java.util.*;

@Component
public class ProgressAnalyzer {

    public List<String> detectWeakCategories(ProgressUpdateRequest progress) {
        List<String> weakCategories = new ArrayList<>();

        Map<String, Integer> completed = progress.getCompletedPerCategory();
        Map<String, Integer> total     = progress.getTotalPerCategory();

        if (completed == null || total == null) return weakCategories;

        for (String category : total.keySet()) {
            int totalCount     = total.getOrDefault(category, 0);
            int completedCount = completed.getOrDefault(category, 0);

            if (totalCount == 0) continue;

            double completionRate = (double) completedCount / totalCount;

            // Below 50% = weak
            if (completionRate < 0.5) {
                weakCategories.add(category);
            }
        }

        return weakCategories;
    }

    public Map<String, String> getCategoryStats(ProgressUpdateRequest progress) {
        Map<String, String> stats = new LinkedHashMap<>();

        Map<String, Integer> completed = progress.getCompletedPerCategory();
        Map<String, Integer> total     = progress.getTotalPerCategory();

        if (completed == null || total == null) return stats;

        for (String category : total.keySet()) {
            int totalCount     = total.getOrDefault(category, 0);
            int completedCount = completed.getOrDefault(category, 0);

            if (totalCount == 0) continue;

            int pct = (int) ((double) completedCount / totalCount * 100);
            stats.put(category,
                    pct + "% (" + completedCount + "/" + totalCount + " topics done)"
            );
        }

        return stats;
    }
}