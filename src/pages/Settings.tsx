import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { LogOut, AlertCircle } from 'lucide-react';

export default function Settings() {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [isUpdatingEmail, setIsUpdatingEmail] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
      toast({
        title: t('loggedOut'),
        description: t('loggedOutSuccessfully'),
      });
    } catch (error) {
      toast({
        title: t('error'),
        description: t('failedToLogout'),
        variant: 'destructive',
      });
    }
  };

  const handleUpdateEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newEmail || !newEmail.includes('@')) {
      toast({
        title: t('error'),
        description: t('validEmailRequired'),
        variant: 'destructive',
      });
      return;
    }

    setIsUpdatingEmail(true);
    try {
      const { data, error } = await supabase.functions.invoke('update-email', {
        body: { newEmail },
      });

      if (error) throw error;

      toast({
        title: t('success'),
        description: t('emailUpdatedSuccessfully'),
      });
      setNewEmail('');

      // Refresh the session to get updated user data
      await supabase.auth.refreshSession();
    } catch (error: any) {
      toast({
        title: t('error'),
        description: error.message || t('failedToUpdateEmail'),
        variant: 'destructive',
      });
    } finally {
      setIsUpdatingEmail(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newPassword || newPassword.length < 6) {
      toast({
        title: t('error'),
        description: t('passwordMinLength'),
        variant: 'destructive',
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: t('error'),
        description: t('passwordsDoNotMatch'),
        variant: 'destructive',
      });
      return;
    }

    setIsUpdatingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      
      if (error) throw error;
      
      toast({
        title: t('success'),
        description: t('passwordUpdatedSuccessfully'),
      });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      toast({
        title: t('error'),
        description: error.message || t('failedToUpdatePassword'),
        variant: 'destructive',
      });
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">{t('settings')}</h1>
      
      <div className="space-y-6">
        {/* Current Email Display */}
        <Card>
          <CardHeader>
            <CardTitle>{t('accountInformation')}</CardTitle>
            <CardDescription>{t('currentAccountDetails')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label>{t('currentEmail')}</Label>
              <Input value={user?.email || ''} disabled className="bg-gray-50" />
            </div>
          </CardContent>
        </Card>

        {/* Update Email */}
        <Card>
          <CardHeader>
            <CardTitle>{t('updateEmail')}</CardTitle>
            <CardDescription>
              {t('updateEmailDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdateEmail} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new-email">{t('newEmailAddress')}</Label>
                <Input
                  id="new-email"
                  type="email"
                  placeholder={t('enterNewEmail')}
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" disabled={isUpdatingEmail}>
                {isUpdatingEmail ? t('updating') : t('updateEmailButton')}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Update Password */}
        <Card>
          <CardHeader>
            <CardTitle>{t('updatePassword')}</CardTitle>
            <CardDescription>
              {t('updatePasswordDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new-password">{t('newPassword')}</Label>
                <Input
                  id="new-password"
                  type="password"
                  placeholder={t('enterNewPassword')}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">{t('confirmNewPassword')}</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  placeholder={t('confirmPasswordPlaceholder')}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" disabled={isUpdatingPassword}>
                {isUpdatingPassword ? t('updating') : t('updatePasswordButton')}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Logout Section */}
        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle className="text-destructive">{t('dangerZone')}</CardTitle>
            <CardDescription>
              {t('logoutDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              variant="destructive" 
              onClick={handleLogout}
              className="gap-2"
            >
              <LogOut className="h-4 w-4" />
              {t('logoutButton')}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
