package com.civicsense.service;

import com.civicsense.entity.Complaint;
import com.civicsense.repository.AdminComplaintRepository;
import org.springframework.stereotype.Service;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class AdminService {

    private final AdminComplaintRepository complaintRepository;

    public AdminService(
            AdminComplaintRepository complaintRepository) {

        this.complaintRepository =
                complaintRepository;
    }


    public List<Complaint> getAllComplaints() {

        return complaintRepository
                .findAllByOrderByCreatedAtDesc();
    }


    public List<Complaint> getComplaintsByStatus(
            String status) {

        return complaintRepository
                .findByStatusOrderByCreatedAtDesc(
                        status.toUpperCase());
    }


    public Complaint getComplaint(Long id) {

        return complaintRepository
                .findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Complaint not found"));
    }


    public Complaint updateStatus(
            Long id,
            String status) {

        Complaint complaint =
                getComplaint(id);

        complaint.setStatus(
                status.toUpperCase());

        return complaintRepository.save(
                complaint);
    }


    public Map<String, Object> getStats() {

        Map<String, Object> stats =
                new LinkedHashMap<>();

        stats.put(
                "total",
                complaintRepository.count());

        stats.put(
                "pending",
                complaintRepository
                        .countByStatus("PENDING"));

        stats.put(
                "inProgress",
                complaintRepository
                        .countByStatus("IN_PROGRESS"));

        stats.put(
                "resolved",
                complaintRepository
                        .countByStatus("RESOLVED"));

        return stats;
    }
}
