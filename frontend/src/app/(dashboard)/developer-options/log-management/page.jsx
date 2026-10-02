import { EmptyState } from '@/src/components/ui/EmptyState';
import { ScrollText } from 'lucide-react';

export default function DeveloperLogManagementPage() {
    return (
        <div className="h-full flex items-center justify-center px-6">
            <EmptyState
                icon={<ScrollText className="w-10 h-10" strokeWidth={1.5} />}
                title="Log Management"
                description="System logs and debugging information will be displayed here."
            />
        </div>
    );
}
