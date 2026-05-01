package com.example.PlacementPath.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "resource_usage")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ResourceUsage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    private String resourceType;  // "video", "article", "practice"
    private String resourceTitle;
    private String resourceUrl;
    private LocalDateTime clickedAt;
    private Boolean helpful;      // User marks if helpful or not
}