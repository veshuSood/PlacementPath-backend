package com.example.PlacementPath.repository;

import com.example.PlacementPath.model.InterviewQuestion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InterviewQuestionRepository extends JpaRepository<InterviewQuestion, Integer> {
    List<InterviewQuestion> findByCategory(String category);
    List<InterviewQuestion> findByTopic(String topic);
    List<InterviewQuestion> findByDifficulty(String difficulty);
    
    @Query(value = "SELECT * FROM interview_questions WHERE category = ?1 ORDER BY RANDOM() LIMIT ?2",
           nativeQuery = true)
    List<InterviewQuestion> findRandomByCategory(String category, int limit);
}