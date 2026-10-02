'use client';

import { EditableCell } from './EditableCell';
import { 
    MEMBERSHIP_TYPE_OPTIONS, 
    YES_NO_OPTIONS, 
    CAPACITY_BASIS_OPTIONS,
    ALTERNATE_PATH_OPTIONS,
    RISK_TYPE_OPTIONS,
    FAILURE_LOCATION_OPTIONS,
    CAPACITY_COMPARISON_OPTIONS
} from '../_lib/constants';

/** One row of the Source-to-Sink archetype-role → site-asset mapping table. */
export function AssetMappingRow({ row, onChange, membershipTypes, showTimeMargin }) {
    const set = (field) => (value) => onChange(row.id, field, value);

    return (
        <tr className="bg-surface hover:bg-surface-2/60 transition-colors">
            {/* Read-only flow properties */}
            <td className="p-1.5 whitespace-nowrap px-4 text-text-secondary font-medium">{row.from_equipment}</td>
            <td className="p-1.5 whitespace-nowrap px-4 text-text-secondary">{row.relationship}</td>
            <td className="p-1.5 whitespace-nowrap px-4 text-text-secondary font-medium">{row.to_equipment}</td>
            
            {/* Editable config properties */}
            <td className="p-1.5 whitespace-nowrap"><EditableCell value={row.membership_type} onChange={set('membership_type')} options={membershipTypes?.length > 0 ? membershipTypes : MEMBERSHIP_TYPE_OPTIONS} /></td>
            <td className="p-1.5 whitespace-nowrap"><EditableCell value={row.mandatory} onChange={set('mandatory')} options={YES_NO_OPTIONS} /></td>
            <td className="p-1.5 whitespace-nowrap"><EditableCell value={row.activation_condition} onChange={set('activation_condition')} placeholder="Condition…" className="min-w-40" /></td>
            <td className="p-1.5 whitespace-nowrap"><EditableCell value={row.parallel_group} onChange={set('parallel_group')} placeholder="Group…" /></td>
            <td className="p-1.5 whitespace-nowrap"><EditableCell value={row.capacity_mmscfd} onChange={set('capacity_mmscfd')} placeholder="0.0" className="w-24" /></td>
            <td className="p-1.5 whitespace-nowrap"><EditableCell value={row.capacity_basis} onChange={set('capacity_basis')} options={CAPACITY_BASIS_OPTIONS} /></td>
            <td className="p-1.5 whitespace-nowrap"><EditableCell value={row.running} onChange={set('running')} placeholder="0/1" className="w-16" /></td>
            <td className="p-1.5 whitespace-nowrap"><EditableCell value={row.available} onChange={set('available')} placeholder="0/1" className="w-16" /></td>
            <td className="p-1.5 whitespace-nowrap"><EditableCell value={row.capacity_now_mmscfd} onChange={set('capacity_now_mmscfd')} placeholder="0.0" className="w-24" /></td>
            <td className="p-1.5 whitespace-nowrap"><EditableCell value={row.capacity_post_switchover_mmscfd} onChange={set('capacity_post_switchover_mmscfd')} placeholder="0.0" className="w-24" /></td>
            <td className="p-1.5 whitespace-nowrap"><EditableCell value={row.running_tag} onChange={set('running_tag')} placeholder="Tag…" /></td>
            <td className="p-1.5 whitespace-nowrap"><EditableCell value={row.post_switchover_tag} onChange={set('post_switchover_tag')} placeholder="Tag…" /></td>
            <td className="p-1.5 whitespace-nowrap"><EditableCell value={row.routed_rate_mmscfd} onChange={set('routed_rate_mmscfd')} placeholder="0.0" className="w-24" /></td>
            <td className="p-1.5 whitespace-nowrap"><EditableCell value={row.is_active_path} onChange={set('is_active_path')} options={YES_NO_OPTIONS} /></td>
            <td className="p-1.5 whitespace-nowrap"><EditableCell value={row.failure_location} onChange={set('failure_location')} options={FAILURE_LOCATION_OPTIONS} placeholder="Location…" /></td>
            <td className="p-1.5 whitespace-nowrap"><EditableCell value={row.risk_type} onChange={set('risk_type')} options={RISK_TYPE_OPTIONS} placeholder="Risk…" /></td>
            <td className="p-1.5 whitespace-nowrap"><EditableCell value={row.alternate_path} onChange={set('alternate_path')} options={ALTERNATE_PATH_OPTIONS} placeholder="Path…" /></td>
            <td className="p-1.5 whitespace-nowrap"><EditableCell value={row.work_order_active} onChange={set('work_order_active')} options={YES_NO_OPTIONS} /></td>
            <td className="p-1.5 whitespace-nowrap"><EditableCell value={row.notification_active} onChange={set('notification_active')} options={YES_NO_OPTIONS} /></td>
            <td className="p-1.5 whitespace-nowrap"><EditableCell value={row.capacity_comparison} onChange={set('capacity_comparison')} options={CAPACITY_COMPARISON_OPTIONS} placeholder="Comparison…" /></td>
            <td className="p-1.5 whitespace-nowrap"><EditableCell value={row.time_to_failure} onChange={set('time_to_failure')} placeholder="0" className="w-16" /></td>
            <td className="p-1.5 whitespace-nowrap"><EditableCell value={row.time_for_switchover} onChange={set('time_for_switchover')} placeholder="0" className="w-16" /></td>
            <td className="p-1.5 whitespace-nowrap"><EditableCell value={row.production_risk} onChange={set('production_risk')} placeholder="Risk…" /></td>
            {showTimeMargin && (
                <td className="p-1.5 whitespace-nowrap px-4 text-center align-middle">
                    <span className="inline-flex items-center justify-center px-2.5 py-1 bg-brand/10 text-brand border border-brand/30 rounded-md font-mono text-xs font-bold shadow-xs">
                        {row.time_margin_hrs ?? row["Time Margin (TTF - Switchover) (hrs)"] ?? 0}
                    </span>
                </td>
            )}
        </tr>
    );
}
