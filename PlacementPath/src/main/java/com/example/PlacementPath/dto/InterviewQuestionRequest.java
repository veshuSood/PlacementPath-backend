package com.example.PlacementPath.dto;

import lombok.Data;

@Data
public class InterviewQuestionRequest {
    private String category;        // DSA, Core CS, Full Stack, Aptitude, HR
    private String topic;           // Optional topic
    private String question;        // The question text
    private String difficulty;      // Easy, Medium, Hard
    private String questionType;    // Theory, Coding, Aptitude, Behavioral
    private String answer;          // Model answer/hint
    private Boolean isPublic;       // Should others see it?
}