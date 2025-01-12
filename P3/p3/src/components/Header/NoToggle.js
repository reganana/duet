import React from 'react';
import { useNavigate } from 'react-router-dom';
// import { useSidebarVisibility } from '../../context/SidebarContext';
// import controlIcon from '../../assets/images/controls.png';
import { Link } from 'react-router-dom';

function HeaderNoToggle() {
    // const { toggleSidebar } = useSidebarVisibility();
    const navigate = useNavigate();

    const handleLogout = (e) => {
        e.preventDefault();

        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
    
        // Redirect to the login page
        navigate('/login');
    };

    return (
        <header>
            {/* <div className="control-icon-container">
                <img src={controlIcon} id="toggle-icon" onClick={toggleSidebar} />
            </div> */}
            <nav>
                <ul>
                <li>
                    <Link to={`/`} className="active">Home</Link>
                </li>
                <li><Link to={`/contact`} className="active">Contact List</Link></li>
             
                </ul>
            </nav>
            <div className="logout">
                <a href="/logout" onClick={handleLogout}>Log Out</a>
            </div>
        </header>
    );
}

export default HeaderNoToggle;
