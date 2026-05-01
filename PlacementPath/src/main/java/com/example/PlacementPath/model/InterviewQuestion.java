package com.example.PlacementPath.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "interview_questions")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class InterviewQuestion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private String category;
    private String topic;

    @Column(columnDefinition = "TEXT") // ✅ Allows long questions
    private String question;

    private String difficulty;
    private String questionType;

    @Column(columnDefinition = "TEXT") // ✅ Allows long answers/hints
    private String answer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by_user_id")
    private User createdBy;

    private LocalDateTime createdAt;
    private Boolean isPublic;
    private Integer upvotes;
}