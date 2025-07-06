import MainLayout from '@/layouts';
import HomePage from '@/pages';
import About from '@/pages/About';
import Game from '@/pages/Game';
import { Navigate, Outlet, useRoutes } from 'react-router-dom';

const RouterList = () => {
  return useRoutes([
    {
      element: <MainLayout />,
      children: [
        // 홈
        {
          path: '/',
          element: <HomePage />,
        },
      ],
    },
    {
      path: '/About',
      element: <About />,
    },
    {
      path: '/Game',
      element: <Game />,
    },
    // Not Found Page
    {
      path: '*',
      element: <Navigate to="/" />,
    },
  ]);
};

export default RouterList;
