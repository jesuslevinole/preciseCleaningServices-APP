import { useState } from 'react';
import Sidebar from './components/Sidebar';
import HousesView from './views/HousesView';
import CustomersView from './views/CustomersView';
import SettingsView from './views/SettingsView';
import './App.css';

export default function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<'houses' | 'customers' | 'settings'>('houses');
  const [currentSettingView, setCurrentSettingView] = useState<string>('menu');

  const handleSettingsClick = () => {
    setActiveTab('settings');
    setCurrentSettingView('menu');
  }; 

  return (
    <div className="app-container">
      <Sidebar 
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onSettingsClick={handleSettingsClick}
      />

      <main className="main-content">
        {activeTab === 'houses' && <HousesView />}
        {activeTab === 'customers' && <CustomersView />}
        {activeTab === 'settings' && (
          <SettingsView 
            currentSettingView={currentSettingView}
            setCurrentSettingView={setCurrentSettingView}
          />
        )}
      </main>
    </div>
  );
}