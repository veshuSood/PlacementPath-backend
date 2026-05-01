package com.example.PlacementPath.dto;

import lombok.Data;

@Data
public class RoadmapRequest {
    private String username;
    private String targetCompany;    // e.g. "TCS"
    private String targetRole;       // e.g. "Java Backend Developer"
    private String currentLevel;     // e.g. "Beginner" / "Intermediate" / "Advanced"
    private Integer weeksAvailable;  // e.g. 8
}