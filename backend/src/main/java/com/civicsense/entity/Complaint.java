package com.civicsense.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "complaints")
public class Complaint {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(length = 60)
    private String category;

    @Column(length = 5000)
    private String description;

    @Column(length = 300)
    private String location;

    @Column(length = 20)
    private String status;

    @Column(length = 160)
    private String title;

    @Column(name = "user_id")
    private Long userId;

    @Column(name = "image_url", length = 500)
    private String imageUrl;

    private Double latitude;

    private Double longitude;

    @Column(name = "ai_category", length = 60)
    private String aiCategory;

    @Column(name = "ai_confidence")
    private Double aiConfidence;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(length = 20)
    private String priority;

    @Column(length = 20)
    private String severity;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    private Integer upvotes;

    private Integer views;

    @Column(name = "problem_type", length = 80)
    private String problemType;

    @Column(name = "ai_problem_type", length = 80)
    private String aiProblemType;

    @Column(name = "ai_recommended_action", length = 2000)
    private String aiRecommendedAction;

    @Column(name = "ai_summary", length = 2000)
    private String aiSummary;


    public Complaint() {
    }


    @PrePersist
    protected void onCreate() {

        LocalDateTime now = LocalDateTime.now();

        if (createdAt == null) {
            createdAt = now;
        }

        if (updatedAt == null) {
            updatedAt = now;
        }

        if (status == null || status.isBlank()) {
            status = "PENDING";
        }

        if (priority == null || priority.isBlank()) {
            priority = "MEDIUM";
        }

        if (upvotes == null) {
            upvotes = 0;
        }

        if (views == null) {
            views = 0;
        }
    }


    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }


    public Long getId() {
        return id;
    }


    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }


    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }


    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }


    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }


    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }


    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }


    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }


    public Double getLatitude() {
        return latitude;
    }

    public void setLatitude(Double latitude) {
        this.latitude = latitude;
    }


    public Double getLongitude() {
        return longitude;
    }

    public void setLongitude(Double longitude) {
        this.longitude = longitude;
    }


    public String getAiCategory() {
        return aiCategory;
    }

    public void setAiCategory(String aiCategory) {
        this.aiCategory = aiCategory;
    }


    public Double getAiConfidence() {
        return aiConfidence;
    }

    public void setAiConfidence(Double aiConfidence) {
        this.aiConfidence = aiConfidence;
    }


    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }


    public String getPriority() {
        return priority;
    }

    public void setPriority(String priority) {
        this.priority = priority;
    }


    public String getSeverity() {
        return severity;
    }

    public void setSeverity(String severity) {
        this.severity = severity;
    }


    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }


    public Integer getUpvotes() {
        return upvotes;
    }

    public void setUpvotes(Integer upvotes) {
        this.upvotes = upvotes;
    }


    public Integer getViews() {
        return views;
    }

    public void setViews(Integer views) {
        this.views = views;
    }


    public String getProblemType() {
        return problemType;
    }

    public void setProblemType(String problemType) {
        this.problemType = problemType;
    }


    public String getAiProblemType() {
        return aiProblemType;
    }

    public void setAiProblemType(String aiProblemType) {
        this.aiProblemType = aiProblemType;
    }


    public String getAiRecommendedAction() {
        return aiRecommendedAction;
    }

    public void setAiRecommendedAction(String aiRecommendedAction) {
        this.aiRecommendedAction = aiRecommendedAction;
    }


    public String getAiSummary() {
        return aiSummary;
    }

    public void setAiSummary(String aiSummary) {
        this.aiSummary = aiSummary;
    }
}
