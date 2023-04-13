import './App.css';

import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from './components/layout';
import Login from './components/login';
import Game from './components/game';
import NoPage from './components/nopage'

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Login />} />
          <Route path="game" element={<Game />} />
          <Route path="*" element={<NoPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
