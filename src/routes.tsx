import { Navigate } from 'react-router-dom';
import { AirdropList } from '@/components/AirdropList';
import { AirdropLookup } from '@/components/AirdropLookup';
import { AirdropDetails } from '@/components/AirdropDetails';

export const routes = [
  {
    path: '/',
    element: <AirdropList />,
  },
  {
    path: '/lookup',
    element: <AirdropLookup />,
  },
  {
    path: '/airdrop/:id',
    element: <AirdropDetails />,
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
];
