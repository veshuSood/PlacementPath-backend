package com.example.PlacementPath.service;

import com.example.PlacementPath.model.ResourceUsage;
import com.example.PlacementPath.model.User;
import com.example.PlacementPath.repository.ResourceUsageRepository;
import com.example.PlacementPath.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;

@Service
public class ResourceUsageService {

    @Autowired private ResourceUsageRepository usageRepository;
    @Autowired private UserRepository userRepository;

    // Track when user clicks a resource
    public void trackResourceClick(String username, String resourceType,
                                   String resourceTitle, String resourceUrl) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        ResourceUsage usage = new ResourceUsage();
        usage.setUser(user);
        usage.setResourceType(resourceType);
        usage.setResourceTitle(resourceTitle);
        usage.setResourceUrl(resourceUrl);
        usage.setClickedAt(LocalDateTime.now());
        usage.setHelpful(null);  // User hasn't rated yet

        usageRepository.save(usage);
    }

    // Get user's preferred resource type
    public String getPreferredResourceType(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<ResourceUsage> usages = usageRepository.findByUserOrderByClickedAtDesc(user);

        if (usages.isEmpty()) return "video";  // default

        // Count usage by type
        Map<String, Integer> typeCount = new HashMap<>();
        for (ResourceUsage usage : usages) {
            String type = usage.getResourceType();
            typeCount.put(type, typeCount.getOrDefault(type, 0) + 1);
        }

        // Return most used type
        return typeCount.entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .orElse("video");
    }

    // Get all resource types with usage percentages
    public Map<String, Integer> getResourceTypePercentages(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<ResourceUsage> usages = usageRepository.findByUserOrderByClickedAtDesc(user);
        Map<String, Integer> typeCount = new HashMap<>();

        for (ResourceUsage usage : usages) {
            String type = usage.getResourceType();
            typeCount.put(type, typeCount.getOrDefault(type, 0) + 1);
        }

        Map<String, Integer> percentages = new HashMap<>();
        int total = usages.size();
        if (total > 0) {
            for (Map.Entry<String, Integer> entry : typeCount.entrySet()) {
                percentages.put(entry.getKey(), (entry.getValue() * 100) / total);
            }
        }

        return percentages;
    }
}