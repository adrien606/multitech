import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useEffect } from 'react';
import { UserRole } from '@/utils/userRole.utils';
export default function AuthPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [loginForm, setLoginForm] = useState({
    email: '',
    pinCode: ''
  });
  const [signupForm, setSignupForm] = useState({
    email: '',
    fullName: '',
    pinCode: '',
    confirmPinCode: '',
    role: 'agent' as UserRole
  });
  const {
    signIn,
    signUp,
    user
  } = useAuth();
  const navigate = useNavigate();
  const {
    toast
  } = useToast();
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginForm.email || !loginForm.pinCode) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs",
        variant: "destructive"
      });
      return;
    }
    if (loginForm.pinCode.length !== 4) {
      toast({
        title: "Erreur",
        description: "Le code PIN doit contenir 4 chiffres",
        variant: "destructive"
      });
      return;
    }
    setIsLoading(true);
    const {
      error
    } = await signIn(loginForm.email, loginForm.pinCode);
    if (error) {
      toast({
        title: "Erreur de connexion",
        description: "Email ou code PIN incorrect",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Connexion réussie",
        description: "Bienvenue !"
      });
      navigate('/dashboard');
    }
    setIsLoading(false);
  };
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signupForm.email || !signupForm.fullName || !signupForm.pinCode || !signupForm.confirmPinCode || !signupForm.role) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs",
        variant: "destructive"
      });
      return;
    }
    if (signupForm.pinCode.length !== 4 || !/^\d{4}$/.test(signupForm.pinCode)) {
      toast({
        title: "Erreur",
        description: "Le code PIN doit contenir exactement 4 chiffres",
        variant: "destructive"
      });
      return;
    }
    if (signupForm.pinCode !== signupForm.confirmPinCode) {
      toast({
        title: "Erreur",
        description: "Les codes PIN ne correspondent pas",
        variant: "destructive"
      });
      return;
    }
    setIsLoading(true);
    const {
      error
    } = await signUp(signupForm.email, signupForm.fullName, signupForm.pinCode, signupForm.role);
    if (error) {
      toast({
        title: "Erreur d'inscription",
        description: error.message || "Une erreur est survenue",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Inscription réussie",
        description: "Votre compte a été créé avec succès"
      });
      // Reset form
      setSignupForm({
        email: '',
        fullName: '',
        pinCode: '',
        confirmPinCode: '',
        role: 'agent'
      });
    }
    setIsLoading(false);
  };
  const handlePinCodeInput = (value: string, isSignup = false) => {
    // Only allow digits and max 4 characters
    const numericValue = value.replace(/\D/g, '').slice(0, 4);
    if (isSignup) {
      setSignupForm(prev => ({
        ...prev,
        pinCode: numericValue
      }));
    } else {
      setLoginForm(prev => ({
        ...prev,
        pinCode: numericValue
      }));
    }
  };
  const handleConfirmPinCodeInput = (value: string) => {
    const numericValue = value.replace(/\D/g, '').slice(0, 4);
    setSignupForm(prev => ({
      ...prev,
      confirmPinCode: numericValue
    }));
  };
  return <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-secondary/20 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">MultiTech</CardTitle>
          <CardDescription>Système de gestion des tâches</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Connexion</TabsTrigger>
              <TabsTrigger value="signup">Inscription</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <Input id="login-email" type="email" placeholder="votre.email@exemple.com" value={loginForm.email} onChange={e => setLoginForm(prev => ({
                  ...prev,
                  email: e.target.value
                }))} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-pin">Code PIN (4 chiffres)</Label>
                  <Input id="login-pin" type="password" placeholder="••••" value={loginForm.pinCode} onChange={e => handlePinCodeInput(e.target.value)} maxLength={4} className="text-center text-2xl tracking-widest" required />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Connexion..." : "Se connecter"}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="signup">
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-name">Nom complet</Label>
                  <Input id="signup-name" type="text" placeholder="Jean Dupont" value={signupForm.fullName} onChange={e => setSignupForm(prev => ({
                  ...prev,
                  fullName: e.target.value
                }))} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input id="signup-email" type="email" placeholder="votre.email@exemple.com" value={signupForm.email} onChange={e => setSignupForm(prev => ({
                  ...prev,
                  email: e.target.value
                }))} required />
                 </div>
                 <div className="space-y-2">
                   <Label htmlFor="signup-role">Rôle</Label>
                   <Select value={signupForm.role} onValueChange={(value: UserRole) => setSignupForm(prev => ({
                  ...prev,
                  role: value
                }))}>
                     <SelectTrigger>
                       <SelectValue placeholder="Sélectionnez votre rôle" />
                     </SelectTrigger>
                     <SelectContent>
                       <SelectItem value="agent">Agent</SelectItem>
                       <SelectItem value="supervisor">Superviseur</SelectItem>
                     </SelectContent>
                   </Select>
                 </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-pin">Code PIN (4 chiffres)</Label>
                  <Input id="signup-pin" type="password" placeholder="••••" value={signupForm.pinCode} onChange={e => handlePinCodeInput(e.target.value, true)} maxLength={4} className="text-center text-2xl tracking-widest" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-pin">Confirmer le code PIN</Label>
                  <Input id="confirm-pin" type="password" placeholder="••••" value={signupForm.confirmPinCode} onChange={e => handleConfirmPinCodeInput(e.target.value)} maxLength={4} className="text-center text-2xl tracking-widest" required />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Inscription..." : "Créer un compte"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>;
}