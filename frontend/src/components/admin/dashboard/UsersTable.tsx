'use client';

import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Trash2, User as UserIcon } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { toast } from 'sonner';

export interface AdminUser {
  id: string;
  email: string;
  full_name: string | null;
  role: 'SUPERADMIN' | 'PROJECTADMIN' | 'VIEWER';
  created_at: string;
}

const roleColors: Record<AdminUser['role'], string> = {
  SUPERADMIN: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  PROJECTADMIN: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
  VIEWER: 'bg-slate-700/40 text-slate-400 border-slate-600/30',
};

interface UsersTableProps {
  users: AdminUser[];
  onUserDeleted: (id: string) => void;
}

export default function UsersTable({ users, onUserDeleted }: UsersTableProps) {
  const supabase = createClient();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (userId: string) => {
    setDeletingId(userId);
    try {
      // Delete from profiles (auth user deletion requires service role on backend)
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (error) throw error;

      onUserDeleted(userId);
      toast.success('User removed successfully.');
    } catch (err: unknown) {
      toast.error((err as Error)?.message ?? 'Failed to delete user.');
    } finally {
      setDeletingId(null);
    }
  };

  if (users.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center gap-2">
        <UserIcon className="h-6 w-6 text-slate-700" />
        <p className="text-slate-500 text-sm">No users found.</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-slate-800 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="border-slate-800 hover:bg-transparent">
            <TableHead className="text-slate-500 font-medium text-xs uppercase tracking-wider">
              User
            </TableHead>
            <TableHead className="text-slate-500 font-medium text-xs uppercase tracking-wider">
              Role
            </TableHead>
            <TableHead className="text-slate-500 font-medium text-xs uppercase tracking-wider hidden md:table-cell">
              Joined
            </TableHead>
            <TableHead className="w-12" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map(user => (
            <TableRow
              key={user.id}
              className="border-slate-800 hover:bg-slate-900/40 transition-colors"
            >
              <TableCell>
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center text-white text-xs font-semibold shrink-0">
                    {(user.full_name ?? user.email)[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-200">
                      {user.full_name ?? '—'}
                    </p>
                    <p className="text-xs text-slate-500">{user.email}</p>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Badge
                  variant="outline"
                  className={`text-[10px] font-semibold tracking-wider ${roleColors[user.role]}`}
                >
                  {user.role}
                </Badge>
              </TableCell>
              <TableCell className="text-slate-500 text-sm hidden md:table-cell">
                {new Date(user.created_at).toLocaleDateString('en-GB', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </TableCell>
              <TableCell>
                {user.role !== 'SUPERADMIN' && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        size="icon"
                        variant="ghost"
                        disabled={deletingId === user.id}
                        className="h-8 w-8 text-slate-600 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="bg-slate-900 border-slate-800">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="text-white">
                          Delete user?
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-slate-400">
                          This will permanently remove{' '}
                          <span className="text-slate-200 font-medium">
                            {user.email}
                          </span>{' '}
                          and all their data. This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="border-slate-700 text-slate-300 hover:bg-slate-800">
                          Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(user.id)}
                          className="bg-rose-600 hover:bg-rose-500 text-white"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
