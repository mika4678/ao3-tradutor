'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { usePreferences } from '@/hooks/use-preferences';
import {
  FONT_SIZE_LABELS,
  TEXT_WIDTH_LABELS,
  READING_THEME_LABELS,
  READING_MODE_LABELS,
} from '@/lib/constants';
import type { FontSize, ReadingTheme, ReadingMode, TextWidth } from '@/types';

interface ProfileViewProps {
  userEmail: string;
  hasPassword: boolean;
}

export function ProfileView({ userEmail, hasPassword }: ProfileViewProps) {
  const initials = userEmail
    .split('@')[0]
    .slice(0, 2)
    .toUpperCase();

  const { preferences, loading: prefsLoading, update } = usePreferences();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Perfil</h1>
        <p className="text-muted-foreground">
          Gerencie suas configurações e preferências.
        </p>
      </div>

      {/* Account info */}
      <Card>
        <CardHeader>
          <CardTitle>Informações da conta</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarFallback className="text-lg">{initials}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{userEmail}</p>
            <p className="text-sm text-muted-foreground">Conta ativa</p>
          </div>
        </CardContent>
      </Card>

      {/* Reading preferences */}
      <Card>
        <CardHeader>
          <CardTitle>Preferências de leitura</CardTitle>
          <CardDescription>
            Configurações padrão para o leitor de fanfics.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {prefsLoading ? (
            <p className="text-sm text-muted-foreground">Carregando...</p>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tamanho da fonte</Label>
                  <Select
                    value={preferences.font_size}
                    onValueChange={(v) => update({ font_size: v as FontSize })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(Object.entries(FONT_SIZE_LABELS) as [FontSize, string][]).map(([k, v]) => (
                        <SelectItem key={k} value={k}>{v}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Tema de leitura</Label>
                  <Select
                    value={preferences.reading_theme}
                    onValueChange={(v) => update({ reading_theme: v as ReadingTheme })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(Object.entries(READING_THEME_LABELS) as [ReadingTheme, string][]).map(([k, v]) => (
                        <SelectItem key={k} value={k}>{v}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Largura do texto</Label>
                  <Select
                    value={preferences.text_width}
                    onValueChange={(v) => update({ text_width: v as TextWidth })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(Object.entries(TEXT_WIDTH_LABELS) as [TextWidth, string][]).map(([k, v]) => (
                        <SelectItem key={k} value={k}>{v}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Modo de leitura</Label>
                  <Select
                    value={preferences.reading_mode}
                    onValueChange={(v) => update({ reading_mode: v as ReadingMode })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(Object.entries(READING_MODE_LABELS) as [ReadingMode, string][]).map(([k, v]) => (
                        <SelectItem key={k} value={k}>{v}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                As alterações são salvas automaticamente.
              </p>
            </>
          )}
        </CardContent>
      </Card>

      {/* Change password */}
      {hasPassword && <ChangePasswordCard />}
    </div>
  );
}

function ChangePasswordCard() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword.length < 6) {
      toast.error('A nova senha deve ter pelo menos 6 caracteres.');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('As senhas não conferem.');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || 'Erro ao alterar senha.');
        return;
      }

      toast.success('Senha alterada com sucesso.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch {
      toast.error('Erro ao alterar senha.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Alterar senha</CardTitle>
        <CardDescription>
          Atualize a senha da sua conta.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="current">Senha atual</Label>
            <Input
              id="current"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
          </div>
          <Separator />
          <div className="space-y-2">
            <Label htmlFor="new">Nova senha</Label>
            <Input
              id="new"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm">Confirmar nova senha</Label>
            <Input
              id="confirm"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>
          <Button type="submit" disabled={saving}>
            {saving ? 'Salvando...' : 'Alterar senha'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
