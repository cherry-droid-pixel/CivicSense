package com.civicsense.service;

import com.civicsense.dto.ComplaintRequest;
import com.civicsense.entity.Complaint;
import com.civicsense.repository.ComplaintRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ComplaintService {

    private final ComplaintRepository complaintRepository;


    public ComplaintService(
            ComplaintRepository complaintRepository) {

        this.complaintRepository =
                complaintRepository;
    }


    public Complaint createComplaint(
            ComplaintRequest request,
            Long userId) {

        if (request.getTitle() == null ||
                request.getTitle().isBlank()) {

            throw new RuntimeException(
                    "Complaint title is required");
        }


        if (request.getDescription() == null ||
                request.getDescription().isBlank()) {

            throw new RuntimeException(
                    "Complaint description is required");
        }


        if (request.getLocation() == null ||
                request.getLocation().isBlank()) {

            throw new RuntimeException(
                    "Complaint location is required");
        }


        Complaint complaint =
                new Complaint();


        complaint.setTitle(
                request.getTitle().trim());


        complaint.setCategory(
                request.getCategory());


        complaint.setDescription(
                request.getDescription().trim());


        complaint.setLocation(
                request.getLocation().trim());


        complaint.setPriority(
                request.getPriority());


        complaint.setLatitude(
                request.getLatitude());


        complaint.setLongitude(
                request.getLongitude());


        complaint.setImageUrl(
                request.getImageUrl());


        complaint.setUserId(userId);


        complaint.setStatus("PENDING");


        return complaintRepository.save(
                complaint);
    }


    public List<Complaint> getMyComplaints(
            Long userId) {

        return complaintRepository
                .findByUserIdOrderByCreatedAtDesc(
                        userId);
    }
    public List<Complaint> getCommunityComplaints() {

    return complaintRepository.findAll();
}


    public Complaint getComplaint(
            Long id,
            Long userId) {

        Complaint complaint =
                complaintRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Complaint not found"));


        if (!complaint.getUserId()
                .equals(userId)) {

            throw new RuntimeException(
                    "You are not allowed to view this complaint");
        }


        return complaint;
    }


    public long getTotal(Long userId) {

        return complaintRepository
                .countByUserId(userId);
    }


    public long getPending(Long userId) {

        return complaintRepository
                .countByUserIdAndStatus(
                        userId,
                        "PENDING");
    }


    public long getInProgress(Long userId) {

        return complaintRepository
                .countByUserIdAndStatus(
                        userId,
                        "IN_PROGRESS");
    }


    public long getResolved(Long userId) {

        return complaintRepository
                .countByUserIdAndStatus(
                        userId,
                        "RESOLVED");
    }
}
