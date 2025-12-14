
import { useState } from 'react';

export type SettingsTab = 'portfolio' | 'profile' | 'subscription';

export const useSettingsLogic = () => {
    const [activeTab, setActiveTab] = useState<SettingsTab>('portfolio');

    return {
        activeTab,
        setActiveTab
    };
};
