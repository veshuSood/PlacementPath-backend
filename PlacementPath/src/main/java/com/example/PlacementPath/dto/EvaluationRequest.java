package com.example.PlacementPath.dto;

import lombok.Data;

@Data
public class EvaluationRequest {
    private String question;
    private String studentAnswer;
    private String referenceAnswer;
}