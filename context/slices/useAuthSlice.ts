
import { useState, useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../services/db';
import { BusinessType } from '../../types';

export const useAuthSlice = () => {
    // --- LOCAL STATE ---
    const [currentUserId, setCurrentUserId] = useState<string | null>(() => sessionStorage.getItem('sibos_user_id'));
    const [isLoadingContext, setIsLoadingContext] = useState(false); // New Loading State
    
    // --- DB QUERIES ---
    const currentUser = useLiveQuery(() => currentUserId ? db.employees.get(currentUserId) : Promise.resolve(null), [currentUserId]) || null;
    const activeBusinessId = useLiveQuery(() => db.config.get('activeBusinessId').then(c => c?.value), []);
    const activeOutletId = useLiveQuery(() => db.config.get('activeOutletId').then(c => c?.value), []);
    const businessConfig = useLiveQuery(() => db.config.get('businessConfig').then(c => c?.value), []) || null;
    
    const allEmployees = useLiveQuery(() => db.employees.toArray(), []) || [];
    const availableBusinesses = useLiveQuery(() => db.businessEntities.toArray(), []) || [];

    // --- DERIVED STATE ---
    const activeBusiness = useMemo(() => availableBusinesses.find(b => b.id === activeBusinessId), [availableBusinesses, activeBusinessId]);
    const activeOutlet = useMemo(() => activeBusiness?.outlets.find(o => o.id === activeOutletId), [activeBusiness, activeOutletId]);

    // Helper: Determine effective scope (HQ vs Outlet)
    const targetOutletIds = useMemo(() => {
        if (activeOutletId) return [activeOutletId]; // Specific outlet selected
        if (activeBusiness) return activeBusiness.outlets.map(o => o.id); // HQ Mode: Return all outlet IDs
        return []; // No business selected
    }, [activeOutletId, activeBusiness]);

    // --- ACTIONS ---
    const login = async (employeeId: string, pin: string): Promise<boolean> => {
        const emp = await db.employees.get(employeeId);
        if (emp && emp.pin === pin) {
            sessionStorage.setItem('sibos_user_id', emp.id);
            setCurrentUserId(emp.id);
            
            // If Staff, force switch to their outlet
            if (emp.role !== 'Owner' && emp.role !== 'Manager' && emp.outletId) {
                const parentBiz = availableBusinesses.find(b => b.outlets.some(o => o.id === emp.outletId));
                if (parentBiz) {
                    await switchOutlet(parentBiz.id, emp.outletId);
                }
            } else if (emp.role === 'Owner' || emp.role === 'Manager') {
                // If Owner/Manager, ensure business is selected but allow outlet to be null (HQ View)
                if (!activeBusinessId && availableBusinesses.length > 0) {
                    await switchOutlet(availableBusinesses[0].id, null);
                }
            }
            return true;
        }
        return false;
    };

    const logout = async () => { 
        sessionStorage.removeItem('sibos_user_id'); 
        setCurrentUserId(null); 
    };

    const setBusinessInfo = async (name: string, type: BusinessType) => { 
        await db.config.put({ key: 'businessConfig', value: { name, type, currency: 'IDR' } }); 
    };

    const switchOutlet = async (businessId: string | null, outletId: string | null) => { 
        setIsLoadingContext(true);
        
        // Artificial delay for smooth transition feel
        await new Promise(resolve => setTimeout(resolve, 800));

        await db.config.put({ key: 'activeBusinessId', value: businessId }); 
        await db.config.put({ key: 'activeOutletId', value: outletId }); 
        
        setIsLoadingContext(false);
    };

    return {
        currentUser,
        activeBusinessId,
        activeOutletId,
        businessConfig,
        availableBusinesses,
        activeBusiness,
        activeOutlet,
        targetOutletIds, // Exported for other slices to use
        allEmployees, // Raw employees list
        login,
        logout,
        setBusinessInfo,
        switchOutlet,
        isLoadingContext // Exposed
    };
};
