package com.softvent.finflow.items.dto;

import com.softvent.finflow.items.entity.ItemType;
import com.softvent.finflow.items.entity.Uom;

import java.math.BigDecimal;
import java.time.Instant;

public class ItemSummaryResponse {

    public String icode;
    public String name;
    public ItemType itemType;
    public Uom uom;
    public Boolean stockable;
    public BigDecimal salesRate;
    public BigDecimal gstRate;
    public Boolean isActive;
    public Instant createdAt;
}