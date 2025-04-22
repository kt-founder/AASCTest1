import { useState, useEffect } from "react";
import SidebarDriver from "../components/DriverComponent/SidebarDriver/SidebarDriver";
import PropTypes from 'prop-types';

const MainLayout = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleToggleSidebar = () => {
      setIsOpen(prev => !prev);
    };

    window.addEventListener('toggle-sidebar', handleToggleSidebar);
    
    return () => {
      window.removeEventListener('toggle-sidebar', handleToggleSidebar);
    };
  }, []);

  return (
    <div className="relative min-h-screen">
      {/* Sidebar */}
      <SidebarDriver isOpen={isOpen} setIsOpen={setIsOpen} />

      {/* Main Content */}
      <div className="h-full">
        {children}
      </div>
    </div>
  );
};

MainLayout.propTypes = {
  children: PropTypes.node.isRequired
};

export default MainLayout;
