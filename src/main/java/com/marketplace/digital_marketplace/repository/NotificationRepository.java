package com.marketplace.digital_marketplace.repository;

import com.marketplace.digital_marketplace.entity.Notification;
import com.marketplace.digital_marketplace.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    // Get all notifications for a user — newest first
    List<Notification> findByUserOrderByCreatedAtDesc(User user);

    // Get unread notifications count
    long countByUserAndReadFalse(User user);

    // Get unread notifications
    List<Notification> findByUserAndReadFalseOrderByCreatedAtDesc(User user);
}