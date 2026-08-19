package com.civicsense.repository;

import com.civicsense.entity.Complaint;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AdminComplaintRepository
        extends JpaRepository<Complaint, Long> {

    List<Complaint> findAllByOrderByCreatedAtDesc();

    List<Complaint> findByStatusOrderByCreatedAtDesc(
            String status);

    long countByStatus(String status);
}
