package com.softvent.finflow.items.dto;

import com.softvent.finflow.items.entity.ItemType;
import com.softvent.finflow.items.entity.Uom;

import java.math.BigDecimal;

public class ItemUpdateRequest {

    public String name;
    public String description;
    public String hsnSacCode;
    public ItemType itemType;
    public Uom uom;
    public Boolean isBom;
    public Boolean stockable;
    public BigDecimal purchaseRate;
    public BigDecimal salesRate;
    public BigDecimal gstRate;
    public String gstType;
    public Long igid;
    public Boolean isActive;
}