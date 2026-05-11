import { Route, Routes } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { ExecutiveOverview } from '@/pages/ExecutiveOverview';
import { Acquisition } from '@/pages/Acquisition';
import { Revenue } from '@/pages/Revenue';
import { Social } from '@/pages/Social';
import { Ads } from '@/pages/Ads';
import { Notes } from '@/pages/Notes';
import { Data } from '@/pages/Data';
import { useTheme } from '@/lib/store/theme';

export default function App() {
  useTheme(); // initialize theme class on <html>

  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<ExecutiveOverview />} />
        <Route path="/acquisition" element={<Acquisition />} />
        <Route path="/revenue" element={<Revenue />} />
        <Route path="/social" element={<Social />} />
        <Route path="/ads" element={<Ads />} />
        <Route path="/notes" element={<Notes />} />
        <Route path="/data" element={<Data />} />
      </Routes>
    </AppLayout>
  );
}
