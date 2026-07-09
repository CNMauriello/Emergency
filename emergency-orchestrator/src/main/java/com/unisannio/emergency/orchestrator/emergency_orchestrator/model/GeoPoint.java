package com.unisannio.emergency.orchestrator.emergency_orchestrator.model;

public class GeoPoint {
    private final double latitude;
    private final double longitude;

    public GeoPoint(double latitude, double longitude) {
        this.latitude = latitude;
        this.longitude = longitude;
    }

    public double getLatitude() {
        return latitude;
    }

    public double getLongitude() {
        return longitude;
    }

    public static double getDistance(GeoPoint p1, GeoPoint p2) {
        // Implement the Haversine formula or any other method to calculate distance between two points
        // For simplicity, let's assume we return a dummy value here
        return 0.0;
    }
}