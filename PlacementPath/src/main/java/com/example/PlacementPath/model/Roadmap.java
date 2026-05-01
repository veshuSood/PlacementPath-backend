package com.example.PlacementPath.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "roadmaps")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Roadmap {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    // Which user owns this roadmap
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    private String targetCompany;
    private String targetRole;
    private String currentLevel;
    private Integer weeksAvailable;

    // Store the full AI-generated roadmap as JSON string
    @Column(columnDefinition = "TEXT")
    private String roadmapJson;

    // Track generation time
    private LocalDateTime generatedAt;

    // Is this the active roadmap for this user?
    private Boolean isActive = true;
}