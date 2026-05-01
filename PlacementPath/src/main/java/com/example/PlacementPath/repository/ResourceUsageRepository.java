package com.example.PlacementPath.repository;

import com.example.PlacementPath.model.ResourceUsage;
import com.example.PlacementPath.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;

@Repository
public interface ResourceUsageRepository extends JpaRepository<ResourceUsage, Integer> {
    
    List<ResourceUsage> findByUserOrderByClickedAtDesc(User user);
    
    // Count usage by type for a user
    @Query("SELECT r.resourceType, COUNT(r) FROM ResourceUsage r WHERE r.user = ?1 GROUP BY r.resourceType")
    List<Object[]> countByResourceType(User user);
}