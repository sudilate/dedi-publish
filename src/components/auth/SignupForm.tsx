import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/lib/auth-context';

const registrationSchema = z.object({
  email: z.string().min(1, {
    message: 'Email is required.',
  }).email({
    message: 'Please enter a valid email address.',
  }),
});

type RegistrationFormValues = z.infer<typeof registrationSchema>;

export function SignupForm() {
  const { toast } = useToast();
  const { register } = useAuth();
  const [loading, setLoading] = useState(false);

  const form = useForm<RegistrationFormValues>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      email: '',
    },
  });

  async function onSubmit(data: RegistrationFormValues) {
    setLoading(true);
    
    // Show loading toast
    const loadingToast = toast({
      title: '⏳ Registering...',
      description: 'Please wait while we process your registration.',
      duration: Infinity, // Keep it until we dismiss it
    });
    
    try {
      const success = await register(data.email);
      
      if (success) {
        // Dismiss loading toast
        loadingToast.dismiss();
        
        // Show success toast
        toast({
          title: '🎉 Registration successful!',
          description: 'A verification email has been sent to your email address',
          className: 'border-green-200 bg-green-50 text-green-900',
          duration: 5000,
        });
        
        // Reset form
        form.reset();
      } else {
        // Dismiss loading toast
        loadingToast.dismiss();
        
        toast({
          title: '❌ Registration failed',
          description: 'Something went wrong. Please try again.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      // Dismiss loading toast
      loadingToast.dismiss();
      
      // Show the API error message to the user
      const errorMessage = error instanceof Error ? error.message : 'Something went wrong. Please try again.';
      toast({
        title: '❌ Registration failed',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="Enter your email address"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="mt-6">
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Registering...
              </>
            ) : (
              'Register'
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}