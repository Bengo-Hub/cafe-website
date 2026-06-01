'use client';

import { Button, Card, Input, Label, Switch } from '@/components/ui';
import { Bell, CreditCard, Globe, Loader2, Moon, Save } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { usePosSettings, useUpdatePosSettings } from '@/hooks/use-pos-settings';

export default function StaffSettings() {
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(true);

  const { data: settings, isLoading: settingsLoading } = usePosSettings();
  const updateSettings = useUpdatePosSettings();

  const [mpesaPaybill, setMpesaPaybill] = useState('');
  const [mpesaAccountRef, setMpesaAccountRef] = useState('');
  const [airtelNumber, setAirtelNumber] = useState('');
  const [bankName, setBankName] = useState('');
  const [bankAccountNumber, setBankAccountNumber] = useState('');
  const [bankAccountName, setBankAccountName] = useState('');
  const [showOnReceipt, setShowOnReceipt] = useState(false);

  useEffect(() => {
    if (settings) {
      setMpesaPaybill(settings.mpesa_paybill ?? '');
      setMpesaAccountRef(settings.mpesa_account_reference ?? '');
      setAirtelNumber(settings.airtel_money_number ?? '');
      setBankName(settings.bank_name ?? '');
      setBankAccountNumber(settings.bank_account_number ?? '');
      setBankAccountName(settings.bank_account_name ?? '');
      setShowOnReceipt(settings.show_payment_info_on_receipt ?? false);
    }
  }, [settings]);

  const handleSavePayment = async () => {
    try {
      await updateSettings.mutateAsync({
        mpesa_paybill: mpesaPaybill || null,
        mpesa_account_reference: mpesaAccountRef || null,
        airtel_money_number: airtelNumber || null,
        bank_name: bankName || null,
        bank_account_number: bankAccountNumber || null,
        bank_account_name: bankAccountName || null,
        show_payment_info_on_receipt: showOnReceipt,
      });
      toast.success('Payment display settings saved');
    } catch (err: any) {
      toast.error(err?.message ?? 'Failed to save payment settings');
    }
  };

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

        {/* Payment Display Settings */}
        <div className="lg:col-span-2">
          <Card className="p-8 magical-card border-none space-y-8">
            <div className="flex items-center gap-4 border-b border-brand-beige/10 pb-6">
              <div className="p-3 rounded-2xl bg-green-500/10 text-green-500">
                <CreditCard className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-black text-primary-brand">Payment Display</h2>
                <p className="text-sm text-secondary-brand opacity-70">
                  Configure how customers pay — shown on printed receipts.
                </p>
              </div>
            </div>

            {settingsLoading ? (
              <div className="flex items-center gap-3 text-secondary-brand">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Loading settings…</span>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>M-PESA Paybill</Label>
                    <Input
                      value={mpesaPaybill}
                      onChange={(e) => setMpesaPaybill(e.target.value)}
                      placeholder="e.g. 522533"
                      className="bg-brand-beige/5 border-brand-beige/10"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Account Number</Label>
                    <Input
                      value={mpesaAccountRef}
                      onChange={(e) => setMpesaAccountRef(e.target.value)}
                      placeholder="e.g. 79319044"
                      className="bg-brand-beige/5 border-brand-beige/10"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Airtel Money Number</Label>
                    <Input
                      value={airtelNumber}
                      onChange={(e) => setAirtelNumber(e.target.value)}
                      placeholder="e.g. 522533"
                      className="bg-brand-beige/5 border-brand-beige/10"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Bank Name</Label>
                    <Input
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      placeholder="e.g. KCB"
                      className="bg-brand-beige/5 border-brand-beige/10"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Bank Account Number</Label>
                    <Input
                      value={bankAccountNumber}
                      onChange={(e) => setBankAccountNumber(e.target.value)}
                      placeholder="Bank account number"
                      className="bg-brand-beige/5 border-brand-beige/10"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Account Name</Label>
                    <Input
                      value={bankAccountName}
                      onChange={(e) => setBankAccountName(e.target.value)}
                      placeholder="e.g. THE URBAN LOFT CAFE LIMITED"
                      className="bg-brand-beige/5 border-brand-beige/10"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div className="space-y-0.5">
                    <Label className="text-base">Show on Receipt</Label>
                    <p className="text-sm text-secondary-brand opacity-60">
                      Print payment methods on customer receipts.
                    </p>
                  </div>
                  <Switch checked={showOnReceipt} onCheckedChange={setShowOnReceipt} />
                </div>

                <div className="pt-2">
                  <Button
                    onClick={handleSavePayment}
                    disabled={updateSettings.isPending}
                    className="bg-brand-orange text-white font-black uppercase tracking-widest text-[10px] h-10 rounded-lg px-8"
                  >
                    {updateSettings.isPending ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="mr-2 h-4 w-4" />
                    )}
                    Save Payment Settings
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
