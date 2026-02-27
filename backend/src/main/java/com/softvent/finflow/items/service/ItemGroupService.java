package com.softvent.finflow.items.service;

import com.softvent.finflow.common.BusinessException;
import com.softvent.finflow.items.dto.ItemGroupResponse;
import com.softvent.finflow.items.entity.ItemGroup;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.transaction.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@ApplicationScoped
@Transactional
public class ItemGroupService {

    /* ---------------- FETCH ALL ---------------- */

    public List<ItemGroupResponse> getAllGroups() {
        return ItemGroup.<ItemGroup>listAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /* ---------------- FETCH BY ID ---------------- */

    public ItemGroupResponse getById(Long igid) {

        ItemGroup group = ItemGroup.findById(igid);
        if (group == null) {
            throw new BusinessException(
                    "Item group not found.",
                    jakarta.ws.rs.core.Response.Status.NOT_FOUND.getStatusCode()
            );
        }

        return mapToResponse(group);
    }

    /* ============================================================= */

    private ItemGroupResponse mapToResponse(ItemGroup group) {

        ItemGroupResponse res = new ItemGroupResponse();
        res.igid = group.igid;
        res.name = group.name;
        res.parentIgid = group.parent != null ? group.parent.igid : null;
        res.isActive = group.isActive;
        return res;
    }
}