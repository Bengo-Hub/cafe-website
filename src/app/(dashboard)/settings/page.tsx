'use client';

import { Button, Card, Input, Label, Switch } from '@/components/ui';
import {
    Bell,
    Globe,
    Lock,
    Moon,
    Save,
    User
} from 'lucide-react';
import { useState } from 'react';

export default function StaffSettings() {
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(true);

  return (
    <div className="space-y-10">
      <header>
        <h1 className="text-4xl font-black text-primary-brand tracking-tight">Settings</h1>
        <p className="text-secondary-brand font-light">Manage your account preferences and application settings.</p>
      </header>

      <div className="grid gap-10 lg:grid-cols-3">
        {/* Profile Settings */}
        <div className="lg:col-span-2 space-y-8">
          <Card className="p-8 magical-card border-none space-y-8">
            <div className="flex items-center gap-4 border-b border-brand-beige/10 pb-6">
              <div className="p-3 rounded-2xl bg-brand-orange/10 text-brand-orange">
                <User className="h-6 w-6" />
              </div>
              <h2 className="text-xl font-black text-primary-brand">Profile Information</h2>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input id="firstName" defaultValue="Alex" className="bg-brand-beige/5 border-brand-beige/10" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input id="lastName" defaultValue="Staff" className="bg-brand-beige/5 border-brand-beige/10" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" type="email" defaultValue="alex@bengobox.cafe" className="bg-brand-beige/5 border-brand-beige/10" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" type="tel" defaultValue="+254 700 000 000" className="bg-brand-beige/5 border-brand-beige/10" />
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button className="bg-brand-orange hover:bg-brand-orange/90 text-white font-black uppercase tracking-widest text-xs h-12 px-8 rounded-xl">
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </Card>

          <Card className="p-8 magical-card border-none space-y-8">
            <div className="flex items-center gap-4 border-b border-brand-beige/10 pb-6">
              <div className="p-3 rounded-2xl bg-brand-gold/10 text-brand-gold">
                <Lock className="h-6 w-6" />
              </div>
              <h2 className="text-xl font-black text-primary-brand">Security</h2>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input id="currentPassword" type="password" className="bg-brand-beige/5 border-brand-beige/10" />
              </div>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input id="newPassword" type="password" className="bg-brand-beige/5 border-brand-beige/10" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input id="confirmPassword" type="password" className="bg-brand-beige/5 border-brand-beige/10" />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button variant="outline" className="border-brand-beige/10 bg-brand-beige/5 text-primary-brand font-black uppercase tracking-widest text-xs h-12 px-8 rounded-xl">
                Update Password
              </Button>
            </div>
          </Card>
        </div>

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
              <Button className="w-full bg-brand-orange text-white font-black uppercase tracking-widest text-[10px] h-10 rounded-lg">
                Enable Now
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
