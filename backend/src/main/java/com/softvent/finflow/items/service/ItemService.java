package com.softvent.finflow.items.service;

import com.softvent.finflow.common.BusinessException;
import com.softvent.finflow.items.dto.*;
import com.softvent.finflow.items.entity.Item;
import com.softvent.finflow.items.entity.ItemGroup;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.core.Response;

import java.util.List;
import java.util.stream.Collectors;

@ApplicationScoped
@Transactional
public class ItemService {

    // CREATE
    public ItemDetailResponse createItem(ItemCreateRequest req) {

        if (Item.find("icode", req.icode).firstResultOptional().isPresent()) {
            throw new BusinessException(
                    "Item code already exists.",
                    Response.Status.CONFLICT.getStatusCode() // 409
            );
        }

        ItemGroup group = ItemGroup.findById(req.igid);
        if (group == null) {
            throw new BusinessException(
                    "Invalid item group.",
                    Response.Status.BAD_REQUEST.getStatusCode() // 400
            );
        }

        Item item = new Item();
        mapCreateRequestToEntity(req, item, group);
        item.persist();
        return mapToDetailResponse(item);
    }

    // UPDATE
    public ItemDetailResponse updateItem(String icode, ItemUpdateRequest req) {

        Item item = Item.find("icode", icode).firstResult();
        if (item == null) {
            throw new BusinessException(
                    "Item not found.",
                    Response.Status.NOT_FOUND.getStatusCode() // 404
            );
        }

        ItemGroup group = ItemGroup.findById(req.igid);
        if (group == null) {
            throw new BusinessException(
                    "Invalid item group.",
                    Response.Status.BAD_REQUEST.getStatusCode() // 400
            );
        }

        mapUpdateRequestToEntity(req, item, group);
        return mapToDetailResponse(item);
    }
    public void deactivateItem(String icode) {
        Item item = Item.find("icode", icode).firstResult();
        if (item == null) {
            throw new BusinessException(
                    "Item not found.",
                    Response.Status.NOT_FOUND.getStatusCode() // 404
            );
        }

        item.isActive = false;
    }

    // GET
    public List<ItemSummaryResponse> getAllItems() {
        return Item.<Item>listAll().stream()
                .map(this::mapToSummaryResponse)
                .collect(Collectors.toList());
    }
    public ItemDetailResponse getItemByCode(String icode) {
        Item item = Item.find("icode", icode).firstResult();
        if (item == null) {
            throw new BusinessException(
                    "Item not found.",
                    Response.Status.NOT_FOUND.getStatusCode() // 404
            );
        }
        return mapToDetailResponse(item);
    }

    // AVAILABILITY CHECKERS
    public AvailabilityResponse isIcodeAvailable(String icode) {
        boolean exists =  Item.find("icode", icode)
                .firstResultOptional()
                .isPresent();
        return new AvailabilityResponse(!exists);
    }

    // MAPPERS
    private void mapCreateRequestToEntity(ItemCreateRequest req, Item item, ItemGroup group) {
        item.icode = req.icode;
        item.name = req.name;
        item.description = req.description;
        item.hsnSacCode = req.hsnSacCode;
        item.itemType = req.itemType;
        item.uom = req.uom;
        item.isBom = req.isBom;
        item.stockable = req.stockable;
        item.purchaseRate = req.purchaseRate;
        item.salesRate = req.salesRate;
        item.gstRate = req.gstRate;
        item.gstType = req.gstType;
        item.itemGroup = group;
    }
    private void mapUpdateRequestToEntity(ItemUpdateRequest req, Item item, ItemGroup group) {
        item.name = req.name;
        item.description = req.description;
        item.hsnSacCode = req.hsnSacCode;
        item.itemType = req.itemType;
        item.uom = req.uom;
        item.isBom = req.isBom;
        item.stockable = req.stockable;
        item.purchaseRate = req.purchaseRate;
        item.salesRate = req.salesRate;
        item.gstRate = req.gstRate;
        item.gstType = req.gstType;
        item.itemGroup = group;
    }
    private ItemSummaryResponse mapToSummaryResponse(Item item) {
        ItemSummaryResponse res = new ItemSummaryResponse();
        res.icode = item.icode;
        res.name = item.name;
        res.itemType = item.itemType;
        res.uom = item.uom;
        res.stockable = item.stockable;
        res.purchaseRate = item.purchaseRate;
        res.salesRate = item.salesRate;
        res.gstRate = item.gstRate;
        res.isActive = item.isActive;
        res.createdAt = item.createdAt;
        return res;
    }
    private ItemDetailResponse mapToDetailResponse(Item item) {
        ItemDetailResponse res = new ItemDetailResponse();
        res.iid = item.iid;
        res.icode = item.icode;
        res.name = item.name;
        res.description = item.description;
        res.hsnSacCode = item.hsnSacCode;
        res.itemType = item.itemType;
        res.uom = item.uom;
        res.isBom = item.isBom;
        res.stockable = item.stockable;
        res.purchaseRate = item.purchaseRate;
        res.salesRate = item.salesRate;
        res.gstRate = item.gstRate;
        res.gstType = item.gstType;
        res.isActive = item.isActive;
        res.igid = item.itemGroup.igid;
        res.groupName = item.itemGroup.name;
        res.createdAt = item.createdAt;
        res.lastUpdatedAt = item.lastUpdatedAt;
        return res;
    }
}
