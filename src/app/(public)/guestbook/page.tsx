import Container from '@/components/layout/Container'
import GuestbookForm from '@/components/guestbook/GuestbookForm'
import GuestbookList from '@/components/guestbook/GuestbookList'
import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Guestbook',
    description: 'Leave a message for Alapakadala.',
}

export default function GuestbookPage() {
    return (
        <Container>
            <h1 className="text-[1.8rem] font-bold mb-2">Guestbook</h1>
            <p className="text-[#666666] mb-8">Leave a message. Say hello.</p>
            <GuestbookForm />
            <div className="mt-10">
                <GuestbookList />
            </div>
        </Container>
    )
}
