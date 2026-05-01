package com.example.PlacementPath.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;

import java.util.List;
import java.util.Map;

@Service
public class GroqService {

    @Value("${groq.api.key}")
    private String apiKey;

    @Value("${groq.api.url}")
    private String apiUrl;

    @Value("${groq.model}")
    private String model;

    private final WebClient webClient;

    public GroqService(WebClient webClient) {
        this.webClient = webClient;
    }

    public String generateRoadmap(String prompt) {
        // We call askAI with 0.7 for creative roadmap generation
        return askAI(buildSystemPrompt(), prompt, 0.7);
    }

    // ✅ Flexible askAI method that accepts temperature
    public String askAI(String systemPrompt, String userPrompt, double temperature) {
        Map<String, Object> requestBody = Map.of(
                "model", model,
                "messages", List.of(
                        Map.of("role", "system", "content", systemPrompt),
                        Map.of("role", "user", "content", userPrompt)
                ),
                "temperature", temperature,
                "max_tokens", 4000
        );

        try {
            Map response = webClient.post()
                    .uri(apiUrl)
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + apiKey)
                    .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(Map.class)
                    .block();

            List<Map> choices = (List<Map>) response.get("choices");
            Map message = (Map) choices.get(0).get("message");
            String content = (String) message.get("content");
            return stripMarkdown(content);
        } catch (Exception e) {
            System.out.println("AI Call Failed: " + e.getMessage());
            return "[]";
        }
    }

    private String stripMarkdown(String content) {
        if (content == null) return "{}";
        content = content.trim();
        if (content.startsWith("```json")) {
            content = content.substring(7);
        } else if (content.startsWith("```")) {
            content = content.substring(3);
        }
        if (content.endsWith("```")) {
            content = content.substring(0, content.length() - 3);
        }
        return content.trim();
    }

    private String buildSystemPrompt() {
        return """
            You are PlacementPath AI — an expert career coach for Indian campus placements.
            
            CRITICAL: Return ONLY a valid JSON object. No markdown. No backticks.
            Start with { and end with }. Nothing before or after.
            
            For resources, you MUST use URLs ONLY from this approved list:
            
            DSA Videos (use these exact URLs):
            - https://www.youtube.com/watch?v=0IAPZzGSbME
            - https://www.youtube.com/watch?v=8hly31xKli0
            - https://www.youtube.com/watch?v=xo7XrRVxH8Y
            - https://www.youtube.com/watch?v=RBSGKlAvoiM
            - https://www.youtube.com/watch?v=pkYVOmU3MgA
            - https://www.youtube.com/watch?v=CBYHwZcbD-s
            - https://www.youtube.com/watch?v=HtSuA80QTyo
            - https://www.youtube.com/watch?v=ncpTxqK35PI
            - https://www.youtube.com/watch?v=oBt53YbR9Kk
            - https://www.youtube.com/watch?v=EAR7De6Goz4
            - https://www.youtube.com/watch?v=vVXzbL_mQMA
            - https://www.youtube.com/watch?v=Peq4GCPNC5c
            
            Java & Spring Boot Videos:
            - https://www.youtube.com/watch?v=eIrMbAQSU34
            - https://www.youtube.com/watch?v=vtPkZShrvXQ
            - https://www.youtube.com/watch?v=9SGDpanrc8U
            - https://www.youtube.com/watch?v=31KTdfRH6nY
            - https://www.youtube.com/watch?v=Nv2n6W0Mix0
            
            Core CS Videos:
            - https://www.youtube.com/watch?v=vBURTt97EkA
            - https://www.youtube.com/watch?v=xw_OuOhjauw
            - https://www.youtube.com/watch?v=QimgfyFBB9Q
            - https://www.youtube.com/watch?v=qlH4-oHnBb8
            - https://www.youtube.com/watch?v=zWnHz9ek7WA
            
            Aptitude Videos:
            - https://www.youtube.com/watch?v=_LPPMhCbOgs
            - https://www.youtube.com/watch?v=ZPkRRaqJPFk
            
            Practice Links:
            - https://leetcode.com/tag/array/
            - https://leetcode.com/tag/linked-list/
            - https://leetcode.com/tag/tree/
            - https://leetcode.com/tag/dynamic-programming/
            - https://leetcode.com/tag/graph/
            - https://leetcode.com/tag/sorting/
            - https://leetcode.com/tag/binary-search/
            - https://leetcode.com/tag/stack/
            - https://www.hackerrank.com/domains/algorithms
            - https://www.hackerrank.com/domains/data-structures
            
            Article Links:
            - https://www.geeksforgeeks.org/data-structures/
            - https://www.geeksforgeeks.org/fundamentals-of-algorithms/
            - https://www.geeksforgeeks.org/operating-systems/
            - https://www.geeksforgeeks.org/computer-network-tutorials/
            - https://www.geeksforgeeks.org/dbms/
            - https://www.geeksforgeeks.org/java/
            - https://www.geeksforgeeks.org/spring-boot/
            - https://www.geeksforgeeks.org/hr-interview-questions/
            - https://www.baeldung.com/spring-boot
            - https://www.indiabix.com/aptitude/questions-and-answers/
            - https://www.indiabix.com/hr-interview/questions-and-answers/
            
            JSON Schema:
            {
              "summary": "2-line summary",
              "targetCompany": "string",
              "targetRole": "string",
              "totalWeeks": number,
              "weeks": [
                {
                  "weekNumber": 1,
                  "theme": "string",
                  "topics": [
                    {
                      "id": "w1_t1",
                      "category": "DSA",
                      "title": "string",
                      "description": "string",
                      "estimatedHours": 2,
                      "resources": [
                        {
                          "type": "video",
                          "title": "string",
                          "url": "use only URLs from the approved list above"
                        }
                      ],
                      "completed": false
                    }
                  ]
                }
              ]
            }
            
            Rules:
            - category must be: DSA, Core CS, Full Stack, Aptitude, or HR
            - type must be: video, article, or practice
            - Every topic must have at least 2 resources
            - Every resource url must be from the approved list above
            - Return ONLY the JSON. Nothing else.
            """;
    }

    public Map<String, List<Map<String, String>>> getFallbackResources() {
        return Map.of(
                "DSA", List.of(
                        Map.of("type","practice","title","LeetCode DSA Problems",
                                "url","https://leetcode.com/tag/array/"),
                        Map.of("type","article","title","GFG Data Structures",
                                "url","https://www.geeksforgeeks.org/data-structures/"),
                        Map.of("type","video","title","DSA Full Course - Striver",
                                "url","https://www.youtube.com/playlist?list=PLgUwDviBIf0oF6QL8m22w1hIDC1vJ_BHz")
                ),
                "Core CS", List.of(
                        Map.of("type","article","title","Operating Systems - GFG",
                                "url","https://www.geeksforgeeks.org/operating-systems/"),
                        Map.of("type","article","title","DBMS - GFG",
                                "url","https://www.geeksforgeeks.org/dbms/"),
                        Map.of("type","article","title","Computer Networks - GFG",
                                "url","https://www.geeksforgeeks.org/computer-network-tutorials/")
                ),
                "Full Stack", List.of(
                        Map.of("type","article","title","Spring Boot - Baeldung",
                                "url","https://www.baeldung.com/spring-boot"),
                        Map.of("type","article","title","Java Tutorial - GFG",
                                "url","https://www.geeksforgeeks.org/java/")
                ),
                "Aptitude", List.of(
                        Map.of("type","practice","title","IndiaBix Aptitude",
                                "url","https://www.indiabix.com/aptitude/questions-and-answers/"),
                        Map.of("type","practice","title","HackerRank",
                                "url","https://www.hackerrank.com/domains/algorithms")
                ),
                "HR", List.of(
                        Map.of("type","article","title","HR Interview Questions - GFG",
                                "url","https://www.geeksforgeeks.org/hr-interview-questions/"),
                        Map.of("type","article","title","IndiaBix HR Questions",
                                "url","https://www.indiabix.com/hr-interview/questions-and-answers/")
                )
        );
    }
}