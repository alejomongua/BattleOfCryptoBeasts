import '../App.css';
import { Outlet, Link, useLocation  } from "react-router-dom";

const Layout = ({
  onLogout
}) => {
  const location = useLocation(); 
  return (
    <>
      <nav>
        <ul className="listMenu">
          <li>
            <Link to="/dashboard" className={`link ${"/dashboard" === location.pathname ? "active" : ""}`}>Dashboard</Link>
          </li>
          <li>
            <Link to="/game" className={`link ${"/game" === location.pathname ? "active" : ""}`}>Play</Link>
          </li>
          <li>
            <Link to="/friends" className={`link ${"/friends" === location.pathname ? "active" : ""}`}>Friends</Link>
          </li>
          <li>
            <Link to="/" className={`link`} onClick={onLogout}>Log out</Link>
          </li>
        </ul>
      </nav>

      <Outlet />
    </>
  )
};

export default Layout;