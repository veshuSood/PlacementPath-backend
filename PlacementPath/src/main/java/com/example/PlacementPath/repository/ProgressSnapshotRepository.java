package com.example.PlacementPath.repository;

import com.example.PlacementPath.model.ProgressSnapshot;
import com.example.PlacementPath.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProgressSnapshotRepository extends JpaRepository<ProgressSnapshot, Integer> {
    
    // Get all snapshots for a user, ordered by date
    List<ProgressSnapshot> findByUserOrderBySnapshotDateAsc(User user);
    
    // Get snapshots for a specific roadmap
    List<ProgressSnapshot> findByRoadmapOrderBySnapshotDateAsc(ProgressSnapshot roadmap);
}