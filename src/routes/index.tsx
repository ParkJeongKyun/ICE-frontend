import MainLayout from '@/layouts';
import HomePage from '@/pages';
import About from '@/pages/About';
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
    // Not Found Page
    {
      path: '*',
      element: <Navigate to="/" />,
    },
  ]);
};

export default RouterList;
