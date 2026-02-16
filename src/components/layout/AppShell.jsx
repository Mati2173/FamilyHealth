import TopBar from './TopBar';
import BottomNav from './BottomNav';

export default function AppShell({ title, children }) {
    return (
        <div className="min-h-screen bg-background">
            <TopBar title={title} />
            <main className="max-w-2xl mx-auto px-4 pt-6 pb-24">
                {children}
            </main>
            <BottomNav />
        </div>
    );
}