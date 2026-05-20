import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { apiClient } from '../../services/apiClient';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export const Register: React.FC = () => {
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const registerMutation = useMutation({
    mutationFn: async () => {
      const { data } = await apiClient.post('/auth/register', { name, email, password });
      return data;
    },
    onSuccess: () => {
      setSuccessMsg('Account created successfully! Redirecting to login...');
      setTimeout(() => {
        navigate('/auth/login');
      }, 2000);
    },
    onError: (error: any) => {
      setErrorMsg(error.response?.data?.error || 'Registration failed. Please try again.');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    registerMutation.mutate();
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-background px-4 py-xl">
      <Card className="w-full max-w-md shadow-medium">
        <CardHeader className="text-center pb-md">
          <CardTitle className="text-heading-sm font-bold text-foreground">Create an Account</CardTitle>
          <CardDescription className="text-body-xs text-muted-foreground mt-xs">
            Join AscendPath to elevate your career journey
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-md">
          {errorMsg && (
            <div className="bg-destructive/10 text-destructive border border-destructive/20 p-sm rounded-md text-body-xs leading-normal">
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="bg-success/10 text-success border border-success/20 p-sm rounded-md text-body-xs leading-normal">
              {successMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-md">
            <div className="space-y-xs">
              <label className="text-body-xs font-semibold text-foreground">Name</label>
              <Input 
                type="text" 
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your Full Name"
                className="w-full"
              />
            </div>
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
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full"
              />
              <p className="text-[10px] text-muted-foreground mt-xs">Must be at least 8 characters long.</p>
            </div>
            
            <Button 
              type="submit"
              variant="primary"
              size="md"
              disabled={registerMutation.isPending || !!successMsg}
              className="w-full mt-md"
            >
              {registerMutation.isPending ? 'Registering...' : 'Register'}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex justify-center border-t border-border pt-md mt-md">
          <p className="text-body-xs text-muted-foreground">
            Already have an account?{' '}
            <Link to="/auth/login" className="text-primary hover:underline font-semibold transition-colors">
              Log in here
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

