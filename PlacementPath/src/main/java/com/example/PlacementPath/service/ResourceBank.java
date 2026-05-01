package com.example.PlacementPath.service;

import org.springframework.stereotype.Component;
import java.util.*;

@Component
public class ResourceBank {

    // Generic resource templates by category
    private static final Map<String, List<ResourceTemplate>> CATEGORY_TEMPLATES = Map.ofEntries(
            Map.entry("DSA", Arrays.asList(
                    new ResourceTemplate("video", "Abdul Bari - {topic}", "https://www.youtube.com/results?search_query={topic}+abdul+bari"),
                    new ResourceTemplate("video", "Striver - {topic}", "https://www.youtube.com/results?search_query={topic}+striver"),
                    new ResourceTemplate("practice", "LeetCode - {topic}", "https://leetcode.com/tag/{topic_slug}/"),
                    new ResourceTemplate("practice", "HackerRank - {topic}", "https://www.hackerrank.com/domains/algorithms"),
                    new ResourceTemplate("article", "GeeksForGeeks - {topic}", "https://www.geeksforgeeks.org/search/?q={topic}")
            )),

            Map.entry("Core CS", Arrays.asList(
                    new ResourceTemplate("video", "Gate Smashers - {topic}", "https://www.youtube.com/results?search_query={topic}+gate+smashers"),
                    new ResourceTemplate("video", "neso Academy - {topic}", "https://www.youtube.com/results?search_query={topic}+neso+academy"),
                    new ResourceTemplate("article", "GeeksForGeeks - {topic}", "https://www.geeksforgeeks.org/search/?q={topic}"),
                    new ResourceTemplate("article", "TutorialsPoint - {topic}", "https://www.tutorialspoint.com/search/"),
                    new ResourceTemplate("practice", "GATE Mock Tests", "https://www.geeksforgeeks.org/gate-cs-mock-tests/")
            )),

            Map.entry("Full Stack", Arrays.asList(
                    new ResourceTemplate("video", "freeCodeCamp - {topic}", "https://www.youtube.com/results?search_query={topic}+freecodecamp"),
                    new ResourceTemplate("video", "Traversy Media - {topic}", "https://www.youtube.com/results?search_query={topic}+traversy+media"),
                    new ResourceTemplate("article", "MDN Docs - {topic}", "https://developer.mozilla.org/search?q={topic}"),
                    new ResourceTemplate("article", "Baeldung - {topic}", "https://www.baeldung.com/search/?q={topic}"),
                    new ResourceTemplate("practice", "HackerRank Challenges", "https://www.hackerrank.com/domains/tutorials")
            )),

            Map.entry("Aptitude", Arrays.asList(
                    new ResourceTemplate("practice", "IndiaBix", "https://www.indiabix.com/aptitude/questions-and-answers/"),
                    new ResourceTemplate("practice", "HackerRank", "https://www.hackerrank.com/domains/algorithms"),
                    new ResourceTemplate("video", "{topic} Tutorial", "https://www.youtube.com/results?search_query={topic}+tutorial"),
                    new ResourceTemplate("article", "Unacademy - {topic}", "https://www.youtube.com/results?search_query={topic}+unacademy")
            )),

            Map.entry("HR", Arrays.asList(
                    new ResourceTemplate("article", "GeeksForGeeks - {topic}", "https://www.geeksforgeeks.org/search/?q={topic}"),
                    new ResourceTemplate("article", "IndiaBix - {topic}", "https://www.indiabix.com/hr-interview/questions-and-answers/"),
                    new ResourceTemplate("video", "Interview Tips", "https://www.youtube.com/results?search_query=interview+tips"),
                    new ResourceTemplate("article", "Glassdoor Tips", "https://www.glassdoor.com/blog/interview-tips/")
            ))
    );

    // Map topics to common search terms
    private static final Map<String, String> TOPIC_ALIASES = Map.ofEntries(
            Map.entry("arrays", "array"),
            Map.entry("linked lists", "linked-list"),
            Map.entry("trees", "tree"),
            Map.entry("graphs", "graph"),
            Map.entry("dynamic programming", "dynamic-programming"),
            Map.entry("sorting", "sort"),
            Map.entry("searching", "search"),
            Map.entry("operating systems", "operating-system"),
            Map.entry("dbms", "database"),
            Map.entry("networks", "network"),
            Map.entry("oops", "object-oriented"),
            Map.entry("spring boot", "spring"),
            Map.entry("rest api", "rest"),
            Map.entry("sql", "sql"),
            Map.entry("java", "java"),
            Map.entry("python", "python"),
            Map.entry("javascript", "javascript"),
            Map.entry("react", "react"),
            Map.entry("node.js", "nodejs")
    );

    /**
     * Get resources for any topic in any category
     * @param category DSA, Core CS, Full Stack, Aptitude, HR
     * @param topicTitle The topic name
     * @return List of resources with dynamically generated URLs
     */
    public List<Map<String, String>> getResources(String category, String topicTitle) {
        String normalizedCategory = normalizeCategory(category);
        String topicSlug = generateTopicSlug(topicTitle);

        List<Map<String, String>> resources = new ArrayList<>();

        // Get templates for this category
        List<ResourceTemplate> templates = CATEGORY_TEMPLATES.getOrDefault(
                normalizedCategory,
                CATEGORY_TEMPLATES.get("DSA")  // fallback
        );

        // Generate resources from templates
        for (ResourceTemplate template : templates) {
            Map<String, String> resource = new HashMap<>();
            resource.put("type",  template.type);
            resource.put("title", template.title
                    .replace("{topic}", topicTitle)
                    .replace("{topic_slug}", topicSlug));
            resource.put("url",   template.url
                    .replace("{topic}", topicSlug)
                    .replace("{topic_slug}", topicSlug));

            resources.add(resource);
        }

        return resources;
    }

    /**
     * Normalize category name to match our templates
     */
    private String normalizeCategory(String category) {
        if (category == null) return "DSA";

        String c = category.toLowerCase();

        if (c.contains("dsa") || c.contains("coding") || c.contains("algorithm")) {
            return "DSA";
        } else if (c.contains("core") || c.contains("cs")) {
            return "Core CS";
        } else if (c.contains("full") || c.contains("stack") || c.contains("web")) {
            return "Full Stack";
        } else if (c.contains("aptitude") || c.contains("quantitative")) {
            return "Aptitude";
        } else if (c.contains("hr") || c.contains("behavioral")) {
            return "HR";
        }

        return "DSA";
    }

    /**
     * Convert topic title to slug for URLs
     * E.g. "Arrays and Strings" → "array-string"
     */
    private String generateTopicSlug(String topic) {
        if (topic == null) return "general";

        String slug = topic.toLowerCase()
                .replaceAll("[^a-z0-9\\s]", "")
                .trim()
                .replaceAll("\\s+", "-");

        // Check if we have an alias for this
        for (Map.Entry<String, String> entry : TOPIC_ALIASES.entrySet()) {
            if (slug.contains(entry.getKey())) {
                return entry.getValue();
            }
        }

        return slug;
    }

    /**
     * Add custom resource for a specific topic
     * Call this to override defaults
     */
    public void addCustomResource(String category, String topicTitle,
                                  String resourceType, String title, String url) {
        // This would require database storage
        // For now, users can override getResources() method
    }

    /**
     * Resource template class
     */
    private static class ResourceTemplate {
        String type;    // video, article, practice
        String title;   // Title with {topic} placeholder
        String url;     // URL with {topic} and {topic_slug} placeholders

        ResourceTemplate(String type, String title, String url) {
            this.type = type;
            this.title = title;
            this.url = url;
        }
    }

    /**
     * Get all available categories
     */
    public List<String> getCategories() {
        return new ArrayList<>(CATEGORY_TEMPLATES.keySet());
    }

    /**
     * Get default resource types
     */
    public List<String> getResourceTypes() {
        return Arrays.asList("video", "article", "practice");
    }
}