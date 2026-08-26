package com.unisannio.emergency.binder.strategy;

import com.unisannio.emergency.binder.model.EmergencyServiceDTO;
import com.unisannio.emergency.binder.model.GeoPoint;
import java.util.List;

public interface RankingStrategy {
    List<EmergencyServiceDTO> sortCandidates(List<EmergencyServiceDTO> candidates, GeoPoint emergencyLocation);
}