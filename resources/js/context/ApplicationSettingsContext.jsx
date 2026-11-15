import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useState,
} from 'react';

import applicationSettingService from '../services/applicationSettingService';
import { useAuth } from './AuthContext';

const ApplicationSettingsContext = createContext(null);
const defaultApplicationSettings = {
    application_name: 'Al Busat Company Portal',
    portal_header: 'Al Busat Company Portal',
    portal_sub_header: 'Internal Management System',
    portal_logo: null,
    timezone: 'Asia/Dubai',
    date_format: 'DD/MM/YYYY',
    currency: 'AED',
    validity_days: 30,
    vat_applicable: true,
    vat_rate: '5.00',
    email_notifications: true,
    quotation_alerts: true,
    system_notifications: true,
};

export function ApplicationSettingsProvider({ children }) {
    const { isAuthenticated, authLoading } = useAuth();
    const [settings, setSettings] = useState(defaultApplicationSettings);
    const [settingsLoading, setSettingsLoading] = useState(true);
    const [settingsError, setSettingsError] = useState(null);
    const refreshSettings = useCallback(async () => {
        if (!isAuthenticated) {
            return null;
        }

        setSettingsLoading(true);
        setSettingsError(null);

        try {
            const response =
                await applicationSettingService.getSettings();

            if (!response.success || !response.data) {
                throw new Error(
                    response.message || 'Unable to retrieve settings.'
                );
            }

            const updatedSettings = {
                ...defaultApplicationSettings,
                ...response.data,
            };

            setSettings(updatedSettings);

            return updatedSettings;
        } catch (error) {
            console.error(
                'Failed to load application settings:',
                error
            );

            setSettingsError(
                error.response?.data?.message ||
                error.message ||
                'Unable to load application settings.'
            );

            return null;
        } finally {
            setSettingsLoading(false);
        }
    }, [isAuthenticated]);

    useEffect(() => {
        if (authLoading) {
            return;
        }

        if (!isAuthenticated) {
            setSettings(defaultApplicationSettings);
            setSettingsError(null);
            setSettingsLoading(false);
            return;
        }

        refreshSettings();
    }, [authLoading, isAuthenticated, refreshSettings]);

    const updateSettings = async (data) => {
        const response =
            await applicationSettingService.updateSettings(data);

        if (!response.success || !response.data) {
            throw new Error(
                response.message || 'Failed to update settings.'
            );
        }

        const updatedSettings = {
            ...defaultApplicationSettings,
            ...response.data,
        };

        setSettings(updatedSettings);

        return updatedSettings;
    };

    const value = {
        settings,
        settingsLoading,
        settingsError,
        refreshSettings,
        updateSettings,

        applicationName: settings.application_name,
        portalHeader: settings.portal_header,
        portalSubHeader: settings.portal_sub_header,
        portalLogo: settings.portal_logo,
    };

    return (
        <ApplicationSettingsContext.Provider value={value}>
            {children}
        </ApplicationSettingsContext.Provider>
    );
}

export function useApplicationSettings() {
    const context = useContext(ApplicationSettingsContext);

    if (!context) {
        throw new Error(
            'useApplicationSettings must be used inside ApplicationSettingsProvider'
        );
    }

    return context;
}
