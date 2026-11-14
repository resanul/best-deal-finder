'use client';

import { AppProvider } from '@/context/AppContext';
import DeviceContainer from '@/components/DeviceContainer';

export default function Home() {
  return (
    <AppProvider>
      <DeviceContainer />
    </AppProvider>
  );
}
