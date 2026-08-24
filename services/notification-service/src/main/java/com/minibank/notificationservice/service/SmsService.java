package com.minibank.notificationservice.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

/**
 * SMS Service - Structure ready for integration with SMS providers
 * Supported providers: Twilio, AWS SNS, etc.
 */
@Service
@Slf4j
public class SmsService {

    @Value("${sms.provider:none}")
    private String smsProvider;

    @Value("${sms.enabled:false}")
    private boolean smsEnabled;

    /**
     * Send SMS notification
     * @param phoneNumber Recipient phone number
     * @param message SMS message content
     * @return true if sent successfully, false otherwise
     */
    public boolean sendSms(String phoneNumber, String message) {
        if (!smsEnabled) {
            log.debug("SMS sending is disabled");
            return false;
        }

        try {
            switch (smsProvider.toLowerCase()) {
                case "twilio":
                    return sendViaTwilio(phoneNumber, message);
                case "aws-sns":
                    return sendViaAwsSns(phoneNumber, message);
                case "mock":
                default:
                    return sendViaMock(phoneNumber, message);
            }
        } catch (Exception e) {
            log.error("Failed to send SMS to {}: {}", phoneNumber, e.getMessage(), e);
            return false;
        }
    }

    private boolean sendViaTwilio(String phoneNumber, String message) {
        log.warn("Twilio SMS provider not implemented yet");
        return sendViaMock(phoneNumber, message);
    }

    private boolean sendViaAwsSns(String phoneNumber, String message) {
        log.warn("AWS SNS SMS provider not implemented yet");
        return sendViaMock(phoneNumber, message);
    }

    private boolean sendViaMock(String phoneNumber, String message) {
        log.info("SMS (MOCK) sent to {}: {}", phoneNumber, message);
        return true;
    }
}

