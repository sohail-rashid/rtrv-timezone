import { useState, useMemo } from 'react';
import { DateTime } from 'luxon';
import { AppProvider, useApp } from './context/AppContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import {
  Header,
  TimezoneCards,
  TimeGrid,
  TimeSlider,
  AddTimezoneModal,
  ToastContainer,
} from './components';
import { DatePickerModal, TimePickerModal } from './components/DateTimePickers';

function AppContent() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [isTimePickerOpen, setIsTimePickerOpen] = useState(false);
  const { state, setAnchorTime, getPrimaryZone } = useApp();

  const anchorTime = useMemo(() => DateTime.fromISO(state.anchorTime), [state.anchorTime]);
  const primaryZone = getPrimaryZone();
  const timeInZone = anchorTime.setZone(primaryZone.iana);

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
            <TimezoneCards onAddTimezone={() => setIsAddModalOpen(true)} />
          </section>

          {/* Time Slider */}
          <section>
            <TimeSlider
              onOpenDatePicker={() => setIsDatePickerOpen(true)}
              onOpenTimePicker={() => setIsTimePickerOpen(true)}
            />
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

      {/* Date Picker Modal */}
      <DatePickerModal
        isOpen={isDatePickerOpen}
        onClose={() => setIsDatePickerOpen(false)}
        value={timeInZone}
        onChange={(dt) => setAnchorTime(dt)}
      />

      {/* Time Picker Modal */}
      <TimePickerModal
        isOpen={isTimePickerOpen}
        onClose={() => setIsTimePickerOpen(false)}
        value={timeInZone}
        onChange={(dt) => setAnchorTime(dt)}
        format={state.settings.timeFormat}
      />

      {/* Toast Notifications */}
      <ToastContainer />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AppProvider>
          <AppContent />
        </AppProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
