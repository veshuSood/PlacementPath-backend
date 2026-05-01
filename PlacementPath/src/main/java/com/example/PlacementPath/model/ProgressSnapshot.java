package com.example.PlacementPath.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "progress_snapshots")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProgressSnapshot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "roadmap_id", nullable = false)
    private Roadmap roadmap;

    private LocalDateTime snapshotDate;

    @Column(columnDefinition = "TEXT")
    private String progressData;

    private Integer totalTopicsCompleted;
    private Integer totalTopics;
    private Integer overallCompletionPercentage;
}