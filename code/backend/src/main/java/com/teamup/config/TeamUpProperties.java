package com.teamup.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Operational policy values live in configuration so they can change without
 * a database migration. Persistent facts and integrity rules remain in PostgreSQL.
 */
@ConfigurationProperties(prefix = "teamup")
public class TeamUpProperties {
    private String frontendOrigin = "http://localhost:5173";
    private String jwtSecret = "local-development-secret-key-change-this-32bytes-minimum";
    private boolean cookieSecure;
    private String refreshCookieName = "teamup_refresh";
    private long accessTokenMinutes = 15;
    private long refreshInactivityDays = 7;
    private long absoluteSessionDays = 30;
    private int defaultPageSize = 20;
    private int maxPageSize = 100;
    private int notificationLimit = 100;
    private String defaultRole = "STUDENT";
    private int optionalSkillBonusMax = 10;

    public String getFrontendOrigin() { return frontendOrigin; }
    public void setFrontendOrigin(String value) { this.frontendOrigin = value; }
    public String getJwtSecret() { return jwtSecret; }
    public void setJwtSecret(String value) { this.jwtSecret = value; }
    public boolean isCookieSecure() { return cookieSecure; }
    public void setCookieSecure(boolean value) { this.cookieSecure = value; }
    public String getRefreshCookieName() { return refreshCookieName; }
    public void setRefreshCookieName(String value) { this.refreshCookieName = value; }
    public long getAccessTokenMinutes() { return accessTokenMinutes; }
    public void setAccessTokenMinutes(long value) { this.accessTokenMinutes = value; }
    public long getRefreshInactivityDays() { return refreshInactivityDays; }
    public void setRefreshInactivityDays(long value) { this.refreshInactivityDays = value; }
    public long getAbsoluteSessionDays() { return absoluteSessionDays; }
    public void setAbsoluteSessionDays(long value) { this.absoluteSessionDays = value; }
    public int getDefaultPageSize() { return defaultPageSize; }
    public void setDefaultPageSize(int value) { this.defaultPageSize = value; }
    public int getMaxPageSize() { return maxPageSize; }
    public void setMaxPageSize(int value) { this.maxPageSize = value; }
    public int getNotificationLimit() { return notificationLimit; }
    public void setNotificationLimit(int value) { this.notificationLimit = value; }
    public String getDefaultRole() { return defaultRole; }
    public void setDefaultRole(String value) { this.defaultRole = value; }
    public int getOptionalSkillBonusMax() { return optionalSkillBonusMax; }
    public void setOptionalSkillBonusMax(int value) { this.optionalSkillBonusMax = value; }
}
