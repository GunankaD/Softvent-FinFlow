package com.softvent.finflow.items.entity;

import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;

import java.time.Instant;

@Entity
@Table(name = "item_groups")
public class ItemGroup extends PanacheEntityBase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long igid;

    @Column(name="name", nullable = false, unique = true, length = 100)
    public String name;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_igid")
    public ItemGroup parent;

    @Column(name="is_active", nullable = false)
    public Boolean isActive = true;

    @Column(name="created_at", nullable = false)
    public Instant createdAt;

    @Column(name="last_updated_at", nullable = true)
    public Instant lastUpdatedAt;

    @PrePersist
    public void prePersist() {
        this.createdAt = Instant.now();
    }

    @PreUpdate
    public void preUpdate() {
        this.lastUpdatedAt = Instant.now();
    }
}