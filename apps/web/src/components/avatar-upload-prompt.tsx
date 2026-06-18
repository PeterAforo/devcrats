'use client';

import { Camera, Upload, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuthStore } from '@/store/auth-store';

interface AvatarUploadPromptProps {
  open: boolean;
  onClose: () => void;
}

export function AvatarUploadPrompt({ open, onClose }: AvatarUploadPromptProps) {
  const { user } = useAuthStore();

  const handleFileSelect = () => {
    // In production, this would upload to the server
    onClose();
  };

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5 text-gold" />
            Profile Photo Required
          </DialogTitle>
          <DialogDescription>
            All users must upload a profile photo for identification purposes.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center gap-4 py-4">
          <Avatar className="h-24 w-24">
            <AvatarImage src={user.avatarUrl || ''} />
            <AvatarFallback className="bg-navy-500 text-white text-2xl font-bold">
              {user.firstName?.[0]}{user.lastName?.[0]}
            </AvatarFallback>
          </Avatar>
          <div className="text-center">
            <p className="font-medium">{user.firstName} {user.lastName}</p>
            <p className="text-sm text-muted-foreground">{user.role?.replace('_', ' ')}</p>
          </div>
          <Button className="bg-gold hover:bg-gold/90 text-navy-900 w-full" onClick={handleFileSelect}>
            <Upload className="mr-2 h-4 w-4" />
            Upload Photo
          </Button>
          <p className="text-xs text-muted-foreground text-center">
            Accepted formats: JPG, PNG. Max size: 5MB.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
