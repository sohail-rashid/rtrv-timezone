import { useState } from 'react';
import { AppProvider } from './context/AppContext';
import { ThemeProvider } from './context/ThemeContext';
import {
  Header,
  TimezoneCards,
  TimeGrid,
  TimeSlider,
  AddTimezoneModal,
} from './components';

function AppContent() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  return (
    <div className="min-h-screen" style={{ color: 'var(--text)' }}>
      {/* Background layers */}
      <div className="bg-mesh" />
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      
      {/* Content */}
      <div className="relative z-10">
        <Header onAddTimezone={() => setIsAddModalOpen(true)} />

        <main className="max-w-[1100px] mx-auto px-6 py-8 space-y-7">
          {/* Timezone Cards */}
          <section>
            <h2 className="text-[10px] font-medium uppercase tracking-[2px] mb-4" style={{ color: 'var(--text-muted)' }}>
              My Timezones
            </h2>
            <TimezoneCards />
          </section>

          {/* Time Slider */}
          <section>
            <TimeSlider />
          </section>

          {/* Time Comparison Grid */}
          <section>
            <TimeGrid />
          </section>
        </main>
      </div>

      {/* Add Timezone Modal */}
      <AddTimezoneModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </ThemeProvider>
  );
}
