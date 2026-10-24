import { redirect } from 'next/navigation'
import { getSession } from '@/auth'
import { getProfileSettings } from '@/services/user.service'
import ProfileIdentityCard from '@/components/profile/ProfileIdentityCard'
import ProfileCard from '@/components/profile/ProfileCard'
import ExportCard from '@/components/profile/ExportCard'
import ChangePasswordCard from '@/components/profile/ChangePasswordCard'
import DeleteAccountCard from '@/components/profile/DeleteAccountCard'

export const metadata = { title: "Profile | GameShelf" }

export default async function ProfilePage() {
    const session = await getSession()

    if (!session?.user?.id) {
        redirect('/auth')
    }

    const profile = await getProfileSettings(session.user.id)
    if (!profile) redirect('/auth')

    return (
        <div className="mx-auto flex max-w-6xl animate-fade-up flex-col gap-10 px-6 py-12">
            <div className="space-y-2">
                <h1 className="font-display text-4xl font-bold uppercase tracking-wide md:text-5xl">Your Profile</h1>
                <p className="text-muted">How others see you, and your account settings.</p>
            </div>

            <ProfileIdentityCard name={profile.name} email={profile.email} image={profile.image} />

            <ProfileCard username={profile.username} isPublic={profile.isPublic} />

            <ExportCard />

            <ChangePasswordCard />

            <DeleteAccountCard />
        </div>
    )
}
