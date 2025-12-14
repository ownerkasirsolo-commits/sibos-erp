
import { useState, useEffect } from 'react';
import { useGlobalContext } from '../../../context/GlobalContext';

interface UseLayoutManagerProps {
    onNavigate: (view: string) => void;
    currentView: string;
}

export const useLayoutManager = ({ onNavigate, currentView }: UseLayoutManagerProps) => {
    const { availableBusinesses, activeBusinessId, activeOutletId, activeBusiness, activeOutlet, switchOutlet } = useGlobalContext();

    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isOutletSwitcherOpen, setIsOutletSwitcherOpen] = useState(false);
    const [isNotificationOpen, setIsNotificationOpen] = useState(false);
    const [expandedBizId, setExpandedBizId] = useState<string | null>(null);
    const [openGroupLabel, setOpenGroupLabel] = useState<string | null>('Front Office');

    // Auto-expand current business in switcher when opened
    useEffect(() => {
        if (isOutletSwitcherOpen && activeBusiness) {
            setExpandedBizId(activeBusiness.id);
        }
    }, [isOutletSwitcherOpen, activeBusiness]);

    // Responsive sidebar
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 1024) {
                setIsMobileMenuOpen(false);
                setIsSidebarOpen(true);
            } else {
                setIsSidebarOpen(false);
            }
        };
        window.addEventListener('resize', handleResize);
        handleResize(); // initial check
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const toggleGroup = (label: string) => {
        setOpenGroupLabel(prev => prev === label ? null : label);
    };

    const handleSwitchOutlet = async (bizId: string | null, outletId: string | null) => {
        // Wait for switch to complete (including delay)
        await switchOutlet(bizId, outletId);
        setIsOutletSwitcherOpen(false);
        // Force navigate to Dashboard to ensure UI reflects new context properly
        onNavigate('dashboard');
    };

    const handleNavigation = (view: string) => {
        onNavigate(view);
        setIsMobileMenuOpen(false);
    };

    return {
        isSidebarOpen,
        setIsSidebarOpen,
        isMobileMenuOpen,
        setIsMobileMenuOpen,
        isOutletSwitcherOpen,
        setIsOutletSwitcherOpen,
        isNotificationOpen,
        setIsNotificationOpen,
        expandedBizId,
        setExpandedBizId,
        openGroupLabel,
        setOpenGroupLabel,
        toggleGroup,
        handleSwitchOutlet,
        handleNavigation,
        availableBusinesses,
        activeBusinessId,
        activeOutletId,
        activeBusiness,
        activeOutlet
    };
};
