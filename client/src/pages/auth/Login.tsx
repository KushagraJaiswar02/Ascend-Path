import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { apiClient } from '../../services/apiClient';
import { useAuthStore } from '../../store/useAuthStore';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export const Login: React.FC = () => {
  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const loginMutation = useMutation({
    mutationFn: async () => {
      const { data } = await apiClient.post('/auth/login', { email, password });
      return data;
    },
    onSuccess: (responseBody) => {
      const { user, accessToken } = responseBody.data;
      login(user, accessToken);
      navigate(learnerRoles.includes(user.role) && !user.onboardingCompleted ? '/onboarding' : '/dashboard');
    },
    onError: (error: any) => {
      setErrorMsg(error.response?.data?.error || 'Login failed. Please try again.');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    loginMutation.mutate();
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-background px-4 py-xl">
      <Card className="w-full max-w-md shadow-medium">
        <CardHeader className="text-center pb-md">
          <CardTitle className="text-heading-sm font-bold text-foreground">Login to AscendPath</CardTitle>
          <CardDescription className="text-body-xs text-muted-foreground mt-xs">
            Welcome back! Please enter your details
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-md">
          {errorMsg && (
            <div className="bg-destructive/10 text-destructive border border-destructive/20 p-sm rounded-md text-body-xs leading-normal">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-md">
            <div className="space-y-xs">
              <label className="text-body-xs font-semibold text-foreground">Email</label>
              <Input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full"
              />
            </div>
            <div className="space-y-xs">
              <label className="text-body-xs font-semibold text-foreground">Password</label>
              <Input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full"
              />
            </div>
            
            <Button 
              type="submit"
              variant="primary"
              size="md"
              disabled={loginMutation.isPending}
              className="w-full mt-md"
            >
              {loginMutation.isPending ? 'Logging in...' : 'Login'}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex flex-col gap-sm items-center justify-center border-t border-border pt-md mt-md">
          <p className="text-body-xs text-muted-foreground">
            Don't have an account?{' '}
            <Link to="/auth/register" className="text-primary hover:underline font-semibold transition-colors">
              Register here
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};


  const learnerRoles = ['user', 'explorer', 'pathfinder'];
