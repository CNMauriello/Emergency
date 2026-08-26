package com.unisannio.emergency.binder.model;

public record GeoPoint(double latitude, double longitude) {

    /**
     * Calcola la distanza in chilometri tra due GeoPoint usando la formula di Haversine.
     */
    public static double getDistance(GeoPoint p1, GeoPoint p2) {
        final int R = 6371; // Raggio medio della Terra in km

        double latDistance = Math.toRadians(p2.latitude() - p1.latitude());
        double lonDistance = Math.toRadians(p2.longitude() - p1.longitude());

        double a = Math.sin(latDistance / 2) * Math.sin(latDistance / 2)
                + Math.cos(Math.toRadians(p1.latitude())) * Math.cos(Math.toRadians(p2.latitude()))
                * Math.sin(lonDistance / 2) * Math.sin(lonDistance / 2);

        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return R * c;
    }
}