package com.example.PlacementPath.dto;

import lombok.Data;
import java.util.List;
import java.util.Map;

@Data
public class ProgressUpdateRequest {
    private List<String>         completedTopicIds;
    private Map<String, Integer> completedPerCategory;
    private Map<String, Integer> totalPerCategory;
}