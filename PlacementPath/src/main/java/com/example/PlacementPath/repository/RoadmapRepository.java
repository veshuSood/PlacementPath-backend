package com.example.PlacementPath.repository;

import com.example.PlacementPath.model.Roadmap;
import com.example.PlacementPath.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RoadmapRepository extends JpaRepository<Roadmap, Integer> {

    // Get all roadmaps for a user
    List<Roadmap> findByUserOrderByGeneratedAtDesc(User user);

    // Get the active roadmap for a user
    Optional<Roadmap> findByUserAndIsActiveTrue(User user);

}
