import { createClient } from '@/lib/supabase/server'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-slate-400 text-sm mt-1">Manage your account and profile preferences.</p>
      </div>

      <div className="max-w-2xl space-y-6">
        <Card title="Account Profile">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Email Address</label>
              <input
                type="email"
                disabled
                value={user.email}
                className="w-full px-4 py-2.5 rounded-lg bg-slate-900/50 border border-slate-700 text-slate-300 cursor-not-allowed text-sm"
              />
              <p className="text-xs text-slate-500 mt-2">Your email address is managed by your authentication provider and cannot be changed here.</p>
            </div>

            <div className="pt-4 border-t border-slate-700/60 flex justify-end">
              <Button variant="secondary" disabled>Save Changes</Button>
            </div>
          </div>
        </Card>

        <Card title="Danger Zone">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-slate-200">Delete Account</h4>
              <p className="text-xs text-slate-400 mt-1">Permanently delete your account and all associated assets and violations.</p>
            </div>
            <Button variant="danger">Delete Account</Button>
          </div>
        </Card>
      </div>
    </div>
  )
}
