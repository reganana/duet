import React, { createContext, useContext, useState } from 'react';

const SidebarVisibilityContext = createContext();

export function useSidebarVisibility() {
    return useContext(SidebarVisibilityContext);
}

export const SidebarProvider = ({ children, initialVisibility = false }) => {
    const [isVisible, setIsVisible] = useState(initialVisibility);

    const toggleSidebar = () => {
        setIsVisible(!isVisible);
    };

    return (
        <SidebarVisibilityContext.Provider value={{ isVisible, toggleSidebar }}>
            {children}
        </SidebarVisibilityContext.Provider>
    );
};
