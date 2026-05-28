'use client';

import { Button, Card, Label, Switch } from '@/components/ui';
import { Bell, Globe, Moon } from 'lucide-react';
import { useState } from 'react';

export default function StaffSettings() {
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(true);

  return (
    <div className="space-y-10">
      <header>
        <h1 className="text-4xl font-black text-primary-brand tracking-tight">Settings</h1>
        <p className="text-secondary-brand font-light">Manage your application preferences.</p>
      </header>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Preferences */}
        <div className="space-y-8">
          <Card className="p-8 magical-card border-none space-y-8">
            <div className="flex items-center gap-4 border-b border-brand-beige/10 pb-6">
              <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-500">
                <Bell className="h-6 w-6" />
              </div>
              <h2 className="text-xl font-black text-primary-brand">Preferences</h2>
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Notifications</Label>
                  <p className="text-sm text-secondary-brand opacity-60">Receive alerts for new orders.</p>
                </div>
                <Switch checked={notifications} onCheckedChange={setNotifications} />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Dark Mode</Label>
                  <p className="text-sm text-secondary-brand opacity-60">Toggle between light and dark themes.</p>
                </div>
                <Switch checked={darkMode} onCheckedChange={setDarkMode} />
              </div>

              <div className="pt-4 space-y-4">
                <Label className="text-base">Language</Label>
                <div className="flex items-center gap-3 p-4 rounded-xl bg-brand-beige/5 border border-brand-beige/10 text-primary-brand">
                  <Globe className="h-4 w-4 opacity-40" />
                  <span className="text-sm font-bold">English (US)</span>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-8 magical-card border-none bg-brand-orange/5 border border-brand-orange/10">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="p-4 rounded-full bg-brand-orange/20 text-brand-orange">
                <Moon className="h-8 w-8" />
              </div>
              <div>
                <h3 className="text-lg font-black text-primary-brand">Night Shift Mode</h3>
                <p className="text-sm text-secondary-brand mt-1">Automatically switch to dark mode during night shifts.</p>
              </div>
              <Button
                onClick={() => setDarkMode(true)}
                className="w-full bg-brand-orange text-white font-black uppercase tracking-widest text-[10px] h-10 rounded-lg"
              >
                Enable Now
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
