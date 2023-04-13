import '../App.css';
import { Outlet, Link } from "react-router-dom";

const Layout = () => {
  return (
    <>
      <nav>
        <ul class="listMenu">
          <li>
            <Link to="/game">Play</Link>
          </li>
          <li>
            <Link to="/">Dashboard</Link>
          </li>          
          <li>
            <Link to="/">Network</Link>
          </li>
          <li>
            <Link to="/">Store</Link>
          </li>
        </ul>
      </nav>

      <Outlet />
    </>
  )
};

export default Layout;